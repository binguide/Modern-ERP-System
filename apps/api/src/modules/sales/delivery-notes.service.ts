import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeliveryNote, DeliveryNoteStatus } from './entities/delivery-note.entity';
import { DeliveryNoteLine } from './entities/delivery-note-line.entity';
import {
  CreateDeliveryNoteDto,
  UpdateDeliveryNoteDto,
  QueryDeliveryNotesDto,
} from './dto/delivery-note.dto';

@Injectable()
export class DeliveryNotesService {
  constructor(
    @InjectRepository(DeliveryNote)
    private readonly repo: Repository<DeliveryNote>,
    @InjectRepository(DeliveryNoteLine)
    private readonly lineRepo: Repository<DeliveryNoteLine>,
  ) {}

  async create(dto: CreateDeliveryNoteDto, companyId: string) {
    const count = await this.repo.count({ where: { companyId } as any });
    const deliveryNumber = `DN-${String(count + 1).padStart(5, '0')}`;

    const entity = new DeliveryNote();
    Object.assign(entity, {
      deliveryNumber,
      deliveryDate: dto.deliveryDate,
      customerId: dto.customerId,
      salesOrderId: dto.salesOrderId,
      notes: dto.notes,
      companyId,
    });

    if (dto.lines?.length) {
      entity.lines = dto.lines.map((l) => {
        const line = new DeliveryNoteLine();
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

  async findAll(companyId: string, query?: QueryDeliveryNotesDto) {
    const page = query?.page || 1;
    const limit = query?.limit || 20;
    const skip = (page - 1) * limit;
    const sortBy = query?.sortBy || 'deliveryNumber';
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
    if (!entity) throw new NotFoundException('Delivery note not found');
    return entity;
  }

  async update(id: string, dto: UpdateDeliveryNoteDto, companyId: string) {
    const entity = await this.findById(id, companyId);
    if (entity.status !== DeliveryNoteStatus.DRAFT) {
      throw new BadRequestException('Only draft delivery notes can be edited');
    }
    Object.assign(entity, {
      deliveryDate: dto.deliveryDate ?? entity.deliveryDate,
      customerId: dto.customerId ?? entity.customerId,
      salesOrderId: dto.salesOrderId ?? entity.salesOrderId,
      notes: dto.notes ?? entity.notes,
    });
    if (dto.lines) {
      await this.lineRepo.delete({ deliveryNoteId: id });
      entity.lines = dto.lines.map((l) => {
        const line = new DeliveryNoteLine();
        Object.assign(line, {
          deliveryNoteId: id,
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
    if (entity.status !== DeliveryNoteStatus.DRAFT) {
      throw new BadRequestException('Only draft delivery notes can be submitted');
    }
    entity.status = DeliveryNoteStatus.CONFIRMED;
    return this.repo.save(entity);
  }

  async cancel(id: string, companyId: string) {
    const entity = await this.findById(id, companyId);
    if (entity.status === DeliveryNoteStatus.CANCELLED) {
      throw new BadRequestException('Delivery note is already cancelled');
    }
    entity.status = DeliveryNoteStatus.CANCELLED;
    return this.repo.save(entity);
  }

  async remove(id: string, companyId: string) {
    await this.findById(id, companyId);
    await this.repo.softDelete(id);
    return { message: 'Delivery note deleted successfully' };
  }
}
