import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { FixedAsset, FixedAssetStatus } from './entities/fixed-asset.entity';
import {
  CreateFixedAssetDto,
  UpdateFixedAssetDto,
  QueryFixedAssetsDto,
} from './dto/fixed-asset.dto';

@Injectable()
export class FixedAssetsService {
  constructor(
    @InjectRepository(FixedAsset)
    private readonly repo: Repository<FixedAsset>,
  ) {}

  async create(dto: CreateFixedAssetDto, companyId: string) {
    const salvageValue = dto.salvageValue ?? 0;
    const usefulLifeYears = dto.usefulLifeYears ?? 5;
    const entity = new FixedAsset();
    Object.assign(entity, {
      ...dto,
      salvageValue,
      usefulLifeYears,
      accumulatedDepreciation: 0,
      bookValue: dto.purchaseCost - salvageValue,
      companyId,
    });
    return this.repo.save(entity);
  }

  async findAll(companyId: string, query?: QueryFixedAssetsDto) {
    const page = query?.page || 1;
    const limit = query?.limit || 20;
    const skip = (page - 1) * limit;
    const where: any = { companyId };
    if (query?.status) where.status = query.status;
    if (query?.search) {
      where.name = ILike(`%${query.search}%`);
    }
    const [data, total] = await this.repo.findAndCount({
      where,
      relations: ['category'],
      order: { assetCode: 'ASC' } as any,
      skip,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async findById(id: string, companyId: string) {
    const entity = await this.repo.findOne({
      where: { id, companyId } as any,
      relations: ['category'],
    });
    if (!entity) throw new NotFoundException('Fixed asset not found');
    return entity;
  }

  async update(id: string, dto: UpdateFixedAssetDto, companyId: string) {
    const entity = await this.findById(id, companyId);
    Object.assign(entity, dto);
    if (dto.purchaseCost !== undefined || dto.salvageValue !== undefined) {
      entity.bookValue =
        (dto.purchaseCost ?? entity.purchaseCost) - (dto.salvageValue ?? entity.salvageValue);
    }
    await this.repo.save(entity);
    return this.findById(id, companyId);
  }

  async dispose(id: string, companyId: string) {
    const entity = await this.findById(id, companyId);
    entity.status = FixedAssetStatus.DISPOSED;
    entity.isActive = false;
    return this.repo.save(entity);
  }

  async remove(id: string, companyId: string) {
    await this.findById(id, companyId);
    await this.repo.softDelete(id);
    return { message: 'Fixed asset deleted successfully' };
  }
}
