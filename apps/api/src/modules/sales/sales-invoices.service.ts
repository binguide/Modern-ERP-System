import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalesInvoice, SalesInvoiceStatus } from './entities/sales-invoice.entity';
import { SalesInvoiceLine } from './entities/sales-invoice-line.entity';
import {
  CreateSalesInvoiceDto,
  UpdateSalesInvoiceDto,
  QuerySalesInvoicesDto,
} from './dto/sales-invoice.dto';

@Injectable()
export class SalesInvoicesService {
  constructor(
    @InjectRepository(SalesInvoice)
    private readonly repo: Repository<SalesInvoice>,
    @InjectRepository(SalesInvoiceLine)
    private readonly lineRepo: Repository<SalesInvoiceLine>,
  ) {}

  async create(dto: CreateSalesInvoiceDto, companyId: string) {
    const count = await this.repo.count({ where: { companyId } as any });
    const invoiceNumber = `SI-${String(count + 1).padStart(5, '0')}`;

    const entity = new SalesInvoice();
    Object.assign(entity, {
      invoiceNumber,
      invoiceDate: dto.invoiceDate,
      customerId: dto.customerId,
      salesOrderId: dto.salesOrderId,
      dueDate: dto.dueDate,
      notes: dto.notes,
      companyId,
    });

    if (dto.lines?.length) {
      entity.lines = dto.lines.map((l) => {
        const line = new SalesInvoiceLine();
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

  async findAll(companyId: string, query?: QuerySalesInvoicesDto) {
    const page = query?.page || 1;
    const limit = query?.limit || 20;
    const skip = (page - 1) * limit;
    const sortBy = query?.sortBy || 'invoiceNumber';
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
    if (!entity) throw new NotFoundException('Sales invoice not found');
    return entity;
  }

  async update(id: string, dto: UpdateSalesInvoiceDto, companyId: string) {
    const entity = await this.findById(id, companyId);
    if (entity.status !== SalesInvoiceStatus.DRAFT) {
      throw new BadRequestException('Only draft invoices can be edited');
    }
    Object.assign(entity, {
      invoiceDate: dto.invoiceDate ?? entity.invoiceDate,
      customerId: dto.customerId ?? entity.customerId,
      salesOrderId: dto.salesOrderId ?? entity.salesOrderId,
      dueDate: dto.dueDate ?? entity.dueDate,
      notes: dto.notes ?? entity.notes,
    });
    if (dto.lines) {
      await this.lineRepo.delete({ salesInvoiceId: id });
      entity.lines = dto.lines.map((l) => {
        const line = new SalesInvoiceLine();
        const amount = l.quantity * l.rate;
        Object.assign(line, {
          salesInvoiceId: id,
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
    if (entity.status !== SalesInvoiceStatus.DRAFT) {
      throw new BadRequestException('Only draft invoices can be submitted');
    }
    entity.status = SalesInvoiceStatus.CONFIRMED;
    return this.repo.save(entity);
  }

  async cancel(id: string, companyId: string) {
    const entity = await this.findById(id, companyId);
    if (entity.status === SalesInvoiceStatus.CANCELLED) {
      throw new BadRequestException('Invoice is already cancelled');
    }
    entity.status = SalesInvoiceStatus.CANCELLED;
    return this.repo.save(entity);
  }

  async remove(id: string, companyId: string) {
    await this.findById(id, companyId);
    await this.repo.softDelete(id);
    return { message: 'Sales invoice deleted successfully' };
  }

  private async recalcAndSave(entity: SalesInvoice) {
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
