import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PurchaseInvoice, PurchaseInvoiceStatus } from './entities/purchase-invoice.entity';
import { PurchaseInvoiceLine } from './entities/purchase-invoice-line.entity';
import {
  CreatePurchaseInvoiceDto,
  UpdatePurchaseInvoiceDto,
  QueryPurchaseInvoicesDto,
} from './dto/purchase-invoice.dto';

@Injectable()
export class PurchaseInvoicesService {
  constructor(
    @InjectRepository(PurchaseInvoice)
    private readonly repo: Repository<PurchaseInvoice>,
    @InjectRepository(PurchaseInvoiceLine)
    private readonly lineRepo: Repository<PurchaseInvoiceLine>,
  ) {}

  async create(dto: CreatePurchaseInvoiceDto, companyId: string) {
    const count = await this.repo.count({ where: { companyId } as any });
    const invoiceNumber = `PI-${String(count + 1).padStart(5, '0')}`;

    const entity = new PurchaseInvoice();
    Object.assign(entity, {
      invoiceNumber,
      invoiceDate: dto.invoiceDate,
      supplierId: dto.supplierId,
      purchaseOrderId: dto.purchaseOrderId,
      dueDate: dto.dueDate,
      notes: dto.notes,
      companyId,
    });

    if (dto.lines?.length) {
      entity.lines = dto.lines.map((l) => {
        const line = new PurchaseInvoiceLine();
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

  async findAll(companyId: string, query?: QueryPurchaseInvoicesDto) {
    const page = query?.page || 1;
    const limit = query?.limit || 20;
    const skip = (page - 1) * limit;
    const sortBy = query?.sortBy || 'invoiceNumber';
    const sortOrder = query?.sortOrder || 'DESC';

    const where: any = { companyId };
    if (query?.status) where.status = query.status;
    if (query?.supplierId) where.supplierId = query.supplierId;

    const [data, total] = await this.repo.findAndCount({
      where,
      relations: ['supplier'],
      order: { [sortBy]: sortOrder } as any,
      skip,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async findById(id: string, companyId: string) {
    const entity = await this.repo.findOne({
      where: { id, companyId } as any,
      relations: ['supplier', 'lines'],
    });
    if (!entity) throw new NotFoundException('Purchase invoice not found');
    return entity;
  }

  async update(id: string, dto: UpdatePurchaseInvoiceDto, companyId: string) {
    const entity = await this.findById(id, companyId);
    if (entity.status !== PurchaseInvoiceStatus.DRAFT) {
      throw new BadRequestException('Only draft invoices can be edited');
    }
    Object.assign(entity, {
      invoiceDate: dto.invoiceDate ?? entity.invoiceDate,
      supplierId: dto.supplierId ?? entity.supplierId,
      purchaseOrderId: dto.purchaseOrderId ?? entity.purchaseOrderId,
      dueDate: dto.dueDate ?? entity.dueDate,
      notes: dto.notes ?? entity.notes,
    });
    if (dto.lines) {
      await this.lineRepo.delete({ purchaseInvoiceId: id });
      entity.lines = dto.lines.map((l) => {
        const line = new PurchaseInvoiceLine();
        const amount = l.quantity * l.rate;
        Object.assign(line, {
          purchaseInvoiceId: id,
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
    if (entity.status !== PurchaseInvoiceStatus.DRAFT) {
      throw new BadRequestException('Only draft invoices can be submitted');
    }
    entity.status = PurchaseInvoiceStatus.CONFIRMED;
    return this.repo.save(entity);
  }

  async cancel(id: string, companyId: string) {
    const entity = await this.findById(id, companyId);
    if (entity.status === PurchaseInvoiceStatus.CANCELLED) {
      throw new BadRequestException('Invoice is already cancelled');
    }
    entity.status = PurchaseInvoiceStatus.CANCELLED;
    return this.repo.save(entity);
  }

  async remove(id: string, companyId: string) {
    await this.findById(id, companyId);
    await this.repo.softDelete(id);
    return { message: 'Purchase invoice deleted successfully' };
  }

  private async recalcAndSave(entity: PurchaseInvoice) {
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
