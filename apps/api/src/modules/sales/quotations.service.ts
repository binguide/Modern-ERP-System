import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quotation, QuotationStatus } from './entities/quotation.entity';
import { QuotationLine } from './entities/quotation-line.entity';
import { CreateQuotationDto, UpdateQuotationDto, QueryQuotationsDto } from './dto/quotation.dto';

@Injectable()
export class QuotationsService {
  constructor(
    @InjectRepository(Quotation)
    private readonly repo: Repository<Quotation>,
    @InjectRepository(QuotationLine)
    private readonly lineRepo: Repository<QuotationLine>,
  ) {}

  async create(dto: CreateQuotationDto, companyId: string) {
    const count = await this.repo.count({ where: { companyId } as any });
    const quotationNumber = `QTN-${String(count + 1).padStart(5, '0')}`;

    const entity = new Quotation();
    Object.assign(entity, {
      quotationNumber,
      quotationDate: dto.quotationDate,
      validUntil: dto.validUntil,
      customerId: dto.customerId,
      notes: dto.notes,
      companyId,
    });

    if (dto.lines?.length) {
      entity.lines = dto.lines.map((l) => {
        const line = new QuotationLine();
        const amount = l.quantity * l.rate;
        Object.assign(line, {
          itemId: l.itemId,
          description: l.description,
          quantity: l.quantity,
          unit: l.unit,
          rate: l.rate,
          discountPct: l.discountPct || 0,
          taxRate: l.taxRate || 0,
          amount,
        });
        return line;
      });
    }
    return this.recalcAndSave(entity);
  }

  async findAll(companyId: string, query?: QueryQuotationsDto) {
    const page = query?.page || 1;
    const limit = query?.limit || 20;
    const skip = (page - 1) * limit;
    const sortBy = query?.sortBy || 'quotationNumber';
    const sortOrder = query?.sortOrder || 'DESC';

    const where: any = { companyId };
    if (query?.status) where.status = query.status;
    if (query?.customerId) where.customerId = query.customerId;

    const [data, total] = await this.repo.findAndCount({
      where,
      relations: ['customer'],
      order: { [sortBy]: sortOrder } as any,
      skip,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async findById(id: string, companyId: string) {
    const entity = await this.repo.findOne({
      where: { id, companyId } as any,
      relations: ['customer', 'lines'],
    });
    if (!entity) throw new NotFoundException('Quotation not found');
    return entity;
  }

  async update(id: string, dto: UpdateQuotationDto, companyId: string) {
    const entity = await this.findById(id, companyId);
    if (entity.status !== QuotationStatus.DRAFT) {
      throw new BadRequestException('Only draft quotations can be edited');
    }
    Object.assign(entity, {
      quotationDate: dto.quotationDate ?? entity.quotationDate,
      validUntil: dto.validUntil ?? entity.validUntil,
      customerId: dto.customerId ?? entity.customerId,
      notes: dto.notes ?? entity.notes,
    });
    if (dto.lines) {
      await this.lineRepo.delete({ quotationId: id });
      entity.lines = dto.lines.map((l) => {
        const line = new QuotationLine();
        const amount = l.quantity * l.rate;
        Object.assign(line, {
          quotationId: id,
          itemId: l.itemId,
          description: l.description,
          quantity: l.quantity,
          unit: l.unit,
          rate: l.rate,
          discountPct: l.discountPct || 0,
          taxRate: l.taxRate || 0,
          amount,
        });
        return line;
      });
    }
    return this.recalcAndSave(entity);
  }

  async submit(id: string, companyId: string) {
    const entity = await this.findById(id, companyId);
    if (entity.status !== QuotationStatus.DRAFT) {
      throw new BadRequestException('Only draft quotations can be submitted');
    }
    entity.status = QuotationStatus.CONFIRMED;
    return this.repo.save(entity);
  }

  async cancel(id: string, companyId: string) {
    const entity = await this.findById(id, companyId);
    if (entity.status === QuotationStatus.CANCELLED) {
      throw new BadRequestException('Quotation is already cancelled');
    }
    entity.status = QuotationStatus.CANCELLED;
    return this.repo.save(entity);
  }

  async remove(id: string, companyId: string) {
    await this.findById(id, companyId);
    await this.repo.softDelete(id);
    return { message: 'Quotation deleted successfully' };
  }

  private async recalcAndSave(entity: Quotation) {
    const lines = entity.lines || [];
    const subtotal = lines.reduce((s, l) => s + Number(l.amount || 0), 0);
    const discountTotal = lines.reduce(
      (s, l) => s + (Number(l.amount || 0) * Number(l.discountPct || 0)) / 100,
      0,
    );
    const taxTotal = lines.reduce((s, l) => {
      const amt = Number(l.amount || 0);
      const discAmt = (amt * Number(l.discountPct || 0)) / 100;
      return s + (amt - discAmt) * (Number(l.taxRate || 0) / 100);
    }, 0);
    entity.subtotal = subtotal;
    entity.discountTotal = discountTotal;
    entity.taxTotal = taxTotal;
    entity.total = subtotal - discountTotal + taxTotal;
    return this.repo.save(entity);
  }
}
