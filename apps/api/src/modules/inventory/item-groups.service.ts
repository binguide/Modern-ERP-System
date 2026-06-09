import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { ItemGroup } from './entities/item-group.entity';
import { CreateItemGroupDto, UpdateItemGroupDto, QueryItemGroupsDto } from './dto/item-group.dto';

@Injectable()
export class ItemGroupsService {
  constructor(
    @InjectRepository(ItemGroup)
    private readonly repo: Repository<ItemGroup>,
  ) {}

  async create(dto: CreateItemGroupDto, companyId: string) {
    const existing = await this.repo.findOneBy({ code: dto.code, companyId } as any);
    if (existing) throw new ConflictException('Item group code already exists');

    const entity = this.repo.create({ ...dto, companyId } as any);
    return this.repo.save(entity);
  }

  async findAll(companyId: string, query?: QueryItemGroupsDto) {
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
    if (!entity) throw new NotFoundException('Item group not found');
    return entity;
  }

  async update(id: string, dto: UpdateItemGroupDto, companyId: string) {
    const entity = await this.findById(id, companyId);
    if (dto.code && dto.code !== entity.code) {
      const existing = await this.repo.findOneBy({ code: dto.code, companyId } as any);
      if (existing) throw new ConflictException('Item group code already exists');
    }

    await this.repo.update(id, dto as any);
    return this.findById(id, companyId);
  }

  async remove(id: string, companyId: string) {
    await this.findById(id, companyId);
    await this.repo.softDelete(id);
    return { message: 'Item group deleted successfully' };
  }
}
