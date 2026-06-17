import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { AssetCategory } from './entities/asset-category.entity';
import {
  CreateAssetCategoryDto,
  UpdateAssetCategoryDto,
  QueryAssetCategoriesDto,
} from './dto/asset-category.dto';

@Injectable()
export class AssetCategoriesService {
  constructor(
    @InjectRepository(AssetCategory)
    private readonly repo: Repository<AssetCategory>,
  ) {}

  async create(dto: CreateAssetCategoryDto, companyId: string) {
    const existing = await this.repo.findOneBy({ code: dto.code, companyId } as any);
    if (existing) throw new ConflictException('Asset category code already exists');
    const entity = new AssetCategory();
    Object.assign(entity, { ...dto, companyId });
    return this.repo.save(entity);
  }

  async findAll(companyId: string, query?: QueryAssetCategoriesDto) {
    const page = query?.page || 1;
    const limit = query?.limit || 20;
    const skip = (page - 1) * limit;
    const where: any = { companyId };
    if (query?.search) where.name = ILike(`%${query.search}%`);
    const [data, total] = await this.repo.findAndCount({
      where,
      order: { code: 'ASC' } as any,
      skip,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async findById(id: string, companyId: string) {
    const entity = await this.repo.findOne({ where: { id, companyId } as any });
    if (!entity) throw new NotFoundException('Asset category not found');
    return entity;
  }

  async update(id: string, dto: UpdateAssetCategoryDto, companyId: string) {
    await this.findById(id, companyId);
    if (dto.code) {
      const existing = await this.repo.findOneBy({ code: dto.code, companyId } as any);
      if (existing && existing.id !== id)
        throw new ConflictException('Asset category code already exists');
    }
    await this.repo.update(id, dto as any);
    return this.findById(id, companyId);
  }

  async remove(id: string, companyId: string) {
    await this.findById(id, companyId);
    await this.repo.softDelete(id);
    return { message: 'Asset category deleted successfully' };
  }
}
