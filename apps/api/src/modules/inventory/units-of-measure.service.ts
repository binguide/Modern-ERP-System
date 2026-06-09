import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { UnitOfMeasure } from './entities/unit-of-measure.entity';
import {
  CreateUnitOfMeasureDto,
  UpdateUnitOfMeasureDto,
  QueryUnitsOfMeasureDto,
} from './dto/unit-of-measure.dto';

@Injectable()
export class UnitsOfMeasureService {
  constructor(
    @InjectRepository(UnitOfMeasure)
    private readonly repo: Repository<UnitOfMeasure>,
  ) {}

  async create(dto: CreateUnitOfMeasureDto, companyId: string) {
    const existing = await this.repo.findOneBy({ code: dto.code, companyId } as any);
    if (existing) throw new ConflictException('Unit code already exists');

    const entity = this.repo.create({ ...dto, companyId } as any);
    return this.repo.save(entity);
  }

  async findAll(companyId: string, query?: QueryUnitsOfMeasureDto) {
    const page = query?.page || 1;
    const limit = query?.limit || 20;
    const skip = (page - 1) * limit;
    const sortBy = query?.sortBy || 'code';
    const sortOrder = query?.sortOrder || 'ASC';

    const where: any = { companyId };
    if (query?.isActive !== undefined) where.isActive = query.isActive;
    if (query?.search) where.name = ILike(`%${query.search}%`);

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
    if (!entity) throw new NotFoundException('Unit not found');
    return entity;
  }

  async update(id: string, dto: UpdateUnitOfMeasureDto, companyId: string) {
    const entity = await this.findById(id, companyId);
    if (dto.code && dto.code !== entity.code) {
      const existing = await this.repo.findOneBy({ code: dto.code, companyId } as any);
      if (existing) throw new ConflictException('Unit code already exists');
    }

    await this.repo.update(id, dto as any);
    return this.findById(id, companyId);
  }

  async remove(id: string, companyId: string) {
    await this.findById(id, companyId);
    await this.repo.softDelete(id);
    return { message: 'Unit deleted successfully' };
  }
}
