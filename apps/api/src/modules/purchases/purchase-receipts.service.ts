import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PurchaseReceipt, PurchaseReceiptStatus } from './entities/purchase-receipt.entity';
import { PurchaseReceiptLine } from './entities/purchase-receipt-line.entity';
import {
  CreatePurchaseReceiptDto,
  UpdatePurchaseReceiptDto,
  QueryPurchaseReceiptsDto,
} from './dto/purchase-receipt.dto';

@Injectable()
export class PurchaseReceiptsService {
  constructor(
    @InjectRepository(PurchaseReceipt)
    private readonly repo: Repository<PurchaseReceipt>,
    @InjectRepository(PurchaseReceiptLine)
    private readonly lineRepo: Repository<PurchaseReceiptLine>,
  ) {}

  async create(dto: CreatePurchaseReceiptDto, companyId: string) {
    const count = await this.repo.count({ where: { companyId } as any });
    const receiptNumber = `PR-${String(count + 1).padStart(5, '0')}`;

    const entity = new PurchaseReceipt();
    Object.assign(entity, {
      receiptNumber,
      receiptDate: dto.receiptDate,
      supplierId: dto.supplierId,
      purchaseOrderId: dto.purchaseOrderId,
      notes: dto.notes,
      companyId,
    });

    if (dto.lines?.length) {
      entity.lines = dto.lines.map((l) => {
        const line = new PurchaseReceiptLine();
        Object.assign(line, {
          itemId: l.itemId,
          description: l.description,
          quantity: l.quantity,
          unit: l.unit,
          rate: l.rate,
          amount: l.quantity * l.rate,
        });
        return line;
      });
    }

    entity.total = (entity.lines || []).reduce((s, l) => s + Number(l.amount || 0), 0);
    return this.repo.save(entity);
  }

  async findAll(companyId: string, query?: QueryPurchaseReceiptsDto) {
    const page = query?.page || 1;
    const limit = query?.limit || 20;
    const skip = (page - 1) * limit;
    const sortBy = query?.sortBy || 'receiptNumber';
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
    if (!entity) throw new NotFoundException('Purchase receipt not found');
    return entity;
  }

  async update(id: string, dto: UpdatePurchaseReceiptDto, companyId: string) {
    const entity = await this.findById(id, companyId);
    if (entity.status !== PurchaseReceiptStatus.DRAFT) {
      throw new BadRequestException('Only draft receipts can be edited');
    }
    Object.assign(entity, {
      receiptDate: dto.receiptDate ?? entity.receiptDate,
      supplierId: dto.supplierId ?? entity.supplierId,
      purchaseOrderId: dto.purchaseOrderId ?? entity.purchaseOrderId,
      notes: dto.notes ?? entity.notes,
    });
    if (dto.lines) {
      await this.lineRepo.delete({ purchaseReceiptId: id });
      entity.lines = dto.lines.map((l) => {
        const line = new PurchaseReceiptLine();
        Object.assign(line, {
          purchaseReceiptId: id,
          itemId: l.itemId,
          description: l.description,
          quantity: l.quantity,
          unit: l.unit,
          rate: l.rate,
          amount: l.quantity * l.rate,
        });
        return line;
      });
    }
    entity.total = (entity.lines || []).reduce((s, l) => s + Number(l.amount || 0), 0);
    return this.repo.save(entity);
  }

  async submit(id: string, companyId: string) {
    const entity = await this.findById(id, companyId);
    if (entity.status !== PurchaseReceiptStatus.DRAFT) {
      throw new BadRequestException('Only draft receipts can be submitted');
    }
    entity.status = PurchaseReceiptStatus.CONFIRMED;
    return this.repo.save(entity);
  }

  async cancel(id: string, companyId: string) {
    const entity = await this.findById(id, companyId);
    if (entity.status === PurchaseReceiptStatus.CANCELLED) {
      throw new BadRequestException('Receipt is already cancelled');
    }
    entity.status = PurchaseReceiptStatus.CANCELLED;
    return this.repo.save(entity);
  }

  async remove(id: string, companyId: string) {
    await this.findById(id, companyId);
    await this.repo.softDelete(id);
    return { message: 'Purchase receipt deleted successfully' };
  }
}
