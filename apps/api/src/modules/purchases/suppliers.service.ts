import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Supplier } from './entities/supplier.entity';
import { CreateSupplierDto, UpdateSupplierDto, QuerySuppliersDto } from './dto/supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private readonly repo: Repository<Supplier>,
  ) {}

  async create(dto: CreateSupplierDto, companyId: string) {
    const existing = await this.repo.findOneBy({ code: dto.code, companyId } as any);
    if (existing) throw new ConflictException('Supplier code already exists');

    const entity = new Supplier();
    Object.assign(entity, { ...dto, companyId });
    return this.repo.save(entity);
  }

  async findAll(companyId: string, query?: QuerySuppliersDto) {
    const page = query?.page || 1;
    const limit = query?.limit || 20;
    const skip = (page - 1) * limit;
    const sortBy = query?.sortBy || 'code';
    const sortOrder = query?.sortOrder || 'ASC';

    const where: any = { companyId };
    if (query?.isActive !== undefined) where.isActive = query.isActive;
    if (query?.search) {
      where.name = ILike(`%${query.search}%`);
    }

    const [data, total] = await this.repo.findAndCount({
      where,
      order: { [sortBy]: sortOrder } as any,
      skip,
      take: limit,
    });

    return { data, total, page, limit };
  }

  async findById(id: string, companyId: string) {
    const entity = await this.repo.findOne({ where: { id, companyId } as any });
    if (!entity) throw new NotFoundException('Supplier not found');
    return entity;
  }

  async update(id: string, dto: UpdateSupplierDto, companyId: string) {
    const entity = await this.findById(id, companyId);
    if (dto.code && dto.code !== entity.code) {
      const existing = await this.repo.findOneBy({ code: dto.code, companyId } as any);
      if (existing) throw new ConflictException('Supplier code already exists');
    }
    await this.repo.update(id, dto as any);
    return this.findById(id, companyId);
  }

  async remove(id: string, companyId: string) {
    await this.findById(id, companyId);
    await this.repo.softDelete(id);
    return { message: 'Supplier deleted successfully' };
  }
}
