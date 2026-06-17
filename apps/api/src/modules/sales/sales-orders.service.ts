import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalesOrder, SalesOrderStatus } from './entities/sales-order.entity';
import { SalesOrderLine } from './entities/sales-order-line.entity';
import {
  CreateSalesOrderDto,
  UpdateSalesOrderDto,
  QuerySalesOrdersDto,
} from './dto/sales-order.dto';

@Injectable()
export class SalesOrdersService {
  constructor(
    @InjectRepository(SalesOrder)
    private readonly repo: Repository<SalesOrder>,
    @InjectRepository(SalesOrderLine)
    private readonly lineRepo: Repository<SalesOrderLine>,
  ) {}

  private async generateOrderNumber(companyId: string): Promise<string> {
    const count = await this.repo.count({ where: { companyId } as any });
    const seq = (count + 1).toString().padStart(5, '0');
    return `SO-${seq}`;
  }

  private calculateLineTotal(quantity: number, price: number, discount: number, taxRate: number) {
    const lineTotal = quantity * price;
    const discountAmount = lineTotal * (discount / 100);
    const taxableAmount = lineTotal - discountAmount;
    const taxAmount = taxableAmount * (taxRate / 100);
    return {
      total: Math.round((taxableAmount + taxAmount) * 100) / 100,
      lineSubtotal: Math.round(lineTotal * 100) / 100,
      lineDiscount: Math.round(discountAmount * 100) / 100,
      lineTax: Math.round(taxAmount * 100) / 100,
    };
  }

  async create(dto: CreateSalesOrderDto, companyId: string) {
    const orderNumber = await this.generateOrderNumber(companyId);
    const { lines, ...orderData } = dto;

    let subtotal = 0;
    let taxTotal = 0;
    let discountTotal = 0;

    const lineEntities = (lines || []).map((line) => {
      const calc = this.calculateLineTotal(
        line.quantity,
        line.price,
        line.discount || 0,
        line.taxRate || 0,
      );
      subtotal += calc.lineSubtotal;
      discountTotal += calc.lineDiscount;
      taxTotal += calc.lineTax;

      const le = new SalesOrderLine();
      Object.assign(le, { ...line, total: calc.total });
      return le;
    });

    const total = Math.round((subtotal - discountTotal + taxTotal) * 100) / 100;

    const entity = new SalesOrder();
    Object.assign(entity, {
      ...orderData,
      companyId,
      orderNumber,
      subtotal: Math.round(subtotal * 100) / 100,
      discountTotal: Math.round(discountTotal * 100) / 100,
      taxTotal: Math.round(taxTotal * 100) / 100,
      total,
      status: SalesOrderStatus.DRAFT,
      lines: lineEntities,
    });

    return this.repo.save(entity);
  }

  async findAll(companyId: string, query?: QuerySalesOrdersDto) {
    const page = query?.page || 1;
    const limit = query?.limit || 20;
    const skip = (page - 1) * limit;
    const sortBy = query?.sortBy || 'orderDate';
    const sortOrder = query?.sortOrder || 'DESC';

    const where: any = { companyId };
    if (query?.status) where.status = query.status;
    if (query?.customerId) where.customerId = query.customerId;

    const [data, total] = await this.repo.findAndCount({
      where,
      order: { [sortBy]: sortOrder } as any,
      skip,
      take: limit,
      relations: ['customer'],
    });

    return { data, total, page, limit };
  }

  async findById(id: string, companyId: string) {
    const entity = await this.repo.findOne({
      where: { id, companyId } as any,
      relations: ['customer', 'lines'],
    });
    if (!entity) throw new NotFoundException('Sales order not found');
    return entity;
  }

  async update(id: string, dto: UpdateSalesOrderDto, companyId: string) {
    await this.findById(id, companyId);
    const { lines, ...orderData } = dto;

    if (lines) {
      await this.lineRepo.delete({ salesOrderId: id });

      if (lines.length) {
        let subtotal = 0;
        let taxTotal = 0;
        let discountTotal = 0;

        const newLines = lines.map((line) => {
          const calc = this.calculateLineTotal(
            line.quantity!,
            line.price!,
            line.discount || 0,
            line.taxRate || 0,
          );
          subtotal += calc.lineSubtotal;
          discountTotal += calc.lineDiscount;
          taxTotal += calc.lineTax;

          const le = new SalesOrderLine();
          Object.assign(le, { ...line, salesOrderId: id, total: calc.total });
          return le;
        });

        const total = Math.round((subtotal - discountTotal + taxTotal) * 100) / 100;

        await this.lineRepo.save(newLines);
        await this.repo.update(id, {
          ...orderData,
          subtotal: Math.round(subtotal * 100) / 100,
          discountTotal: Math.round(discountTotal * 100) / 100,
          taxTotal: Math.round(taxTotal * 100) / 100,
          total,
        } as any);
      }
    } else {
      await this.repo.update(id, orderData as any);
    }

    return this.findById(id, companyId);
  }

  async remove(id: string, companyId: string) {
    await this.findById(id, companyId);
    await this.repo.softDelete(id);
    return { message: 'Sales order deleted successfully' };
  }

  async submit(id: string, companyId: string) {
    const entity = await this.findById(id, companyId);
    if (entity.status !== SalesOrderStatus.DRAFT && entity.status !== SalesOrderStatus.SAVED) {
      throw new BadRequestException('Only draft/saved orders can be submitted');
    }
    await this.repo.update(id, { status: SalesOrderStatus.CONFIRMED } as any);
    return this.findById(id, companyId);
  }

  async cancel(id: string, companyId: string) {
    const entity = await this.findById(id, companyId);
    if (entity.status !== SalesOrderStatus.CONFIRMED) {
      throw new BadRequestException('Only confirmed orders can be cancelled');
    }
    await this.repo.update(id, { status: SalesOrderStatus.CANCELLED } as any);
    return this.findById(id, companyId);
  }

  async amend(id: string, companyId: string) {
    const entity = await this.findById(id, companyId);
    if (entity.status !== SalesOrderStatus.CANCELLED) {
      throw new BadRequestException('Only cancelled orders can be amended');
    }
    const {
      id: _oldId,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      deletedAt: _deletedAt,
      orderNumber: _orderNumber,
      ...rest
    } = entity;
    const newOrder = this.repo.create({
      ...rest,
      companyId,
      status: SalesOrderStatus.DRAFT,
      orderNumber: `SO-${Date.now()}`,
    } as any);
    return this.repo.save(newOrder);
  }
}
