import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { PurchaseOrder, PurchaseOrderStatus } from './entities/purchase-order.entity';
import { PurchaseOrderLine } from './entities/purchase-order-line.entity';
import {
  CreatePurchaseOrderDto,
  UpdatePurchaseOrderDto,
  QueryPurchaseOrdersDto,
} from './dto/purchase-order.dto';

@Injectable()
export class PurchaseOrdersService {
  constructor(
    @InjectRepository(PurchaseOrder)
    private readonly repo: Repository<PurchaseOrder>,
    @InjectRepository(PurchaseOrderLine)
    private readonly lineRepo: Repository<PurchaseOrderLine>,
  ) {}

  async create(dto: CreatePurchaseOrderDto, companyId: string) {
    const orderNumber = await this.generateOrderNumber(companyId);

    const entity = new PurchaseOrder();
    Object.assign(entity, {
      orderNumber,
      orderDate: dto.orderDate,
      supplierId: dto.supplierId,
      expectedDate: dto.expectedDate,
      notes: dto.notes,
      companyId,
    });

    if (dto.lines?.length) {
      entity.lines = dto.lines.map((l) => {
        const line = new PurchaseOrderLine();
        const amount = l.quantity * l.rate;
        line.itemId = l.itemId;
        line.description = l.description;
        line.quantity = l.quantity;
        line.unit = l.unit;
        line.rate = l.rate;
        line.discountPct = l.discountPct || 0;
        line.taxRate = l.taxRate || 0;
        line.amount = amount;
        return line;
      });
    }

    return this.recalcAndSave(entity);
  }

  async findAll(companyId: string, query?: QueryPurchaseOrdersDto) {
    const page = query?.page || 1;
    const limit = query?.limit || 20;
    const skip = (page - 1) * limit;
    const sortBy = query?.sortBy || 'orderNumber';
    const sortOrder = query?.sortOrder || 'DESC';

    const where: any = { companyId };
    if (query?.status) where.status = query.status;
    if (query?.supplierId) where.supplierId = query.supplierId;
    if (query?.search) {
      where.orderNumber = ILike(`%${query.search}%`);
    }

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
    if (!entity) throw new NotFoundException('Purchase order not found');
    return entity;
  }

  async update(id: string, dto: UpdatePurchaseOrderDto, companyId: string) {
    const entity = await this.findById(id, companyId);
    if (entity.status !== PurchaseOrderStatus.DRAFT) {
      throw new BadRequestException('Only draft orders can be edited');
    }

    Object.assign(entity, {
      orderDate: dto.orderDate ?? entity.orderDate,
      supplierId: dto.supplierId ?? entity.supplierId,
      expectedDate: dto.expectedDate ?? entity.expectedDate,
      notes: dto.notes ?? entity.notes,
    });

    if (dto.lines) {
      await this.lineRepo.delete({ purchaseOrderId: id });
      entity.lines = dto.lines.map((l) => {
        const line = new PurchaseOrderLine();
        const qty = l.quantity ?? 0;
        const rate = l.rate ?? 0;
        line.purchaseOrderId = id;
        line.itemId = l.itemId;
        line.description = l.description;
        line.quantity = qty;
        line.unit = l.unit;
        line.rate = rate;
        line.discountPct = l.discountPct || 0;
        line.taxRate = l.taxRate || 0;
        line.amount = qty * rate;
        return line;
      });
    }

    return this.recalcAndSave(entity);
  }

  async submit(id: string, companyId: string) {
    const entity = await this.findById(id, companyId);
    if (entity.status !== PurchaseOrderStatus.DRAFT) {
      throw new BadRequestException('Only draft orders can be submitted');
    }
    entity.status = PurchaseOrderStatus.CONFIRMED;
    return this.repo.save(entity);
  }

  async cancel(id: string, companyId: string) {
    const entity = await this.findById(id, companyId);
    if (entity.status === PurchaseOrderStatus.CANCELLED) {
      throw new BadRequestException('Order is already cancelled');
    }
    entity.status = PurchaseOrderStatus.CANCELLED;
    return this.repo.save(entity);
  }

  async remove(id: string, companyId: string) {
    await this.findById(id, companyId);
    await this.repo.softDelete(id);
    return { message: 'Purchase order deleted successfully' };
  }

  private async recalcAndSave(entity: PurchaseOrder) {
    const lines = entity.lines || [];
    const subtotal = lines.reduce((s, l) => s + Number(l.amount || 0), 0);
    const discountTotal = lines.reduce(
      (s, l) => s + (Number(l.amount || 0) * Number(l.discountPct || 0)) / 100,
      0,
    );
    const taxableAmount = subtotal - discountTotal;
    const taxTotal = lines.reduce((s, l) => {
      const lineAmt = Number(l.amount || 0);
      const discAmt = (lineAmt * Number(l.discountPct || 0)) / 100;
      return s + (lineAmt - discAmt) * (Number(l.taxRate || 0) / 100);
    }, 0);

    entity.subtotal = subtotal;
    entity.discountTotal = discountTotal;
    entity.taxTotal = taxTotal;
    entity.total = taxableAmount + taxTotal;

    return this.repo.save(entity);
  }

  private async generateOrderNumber(companyId: string): Promise<string> {
    const count = await this.repo.count({ where: { companyId } as any });
    return `PO-${String(count + 1).padStart(5, '0')}`;
  }
}
