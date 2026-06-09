import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Item } from './entities/item.entity';
import { ItemUnit } from './entities/item-unit.entity';
import { CreateItemDto, UpdateItemDto, QueryItemsDto } from './dto/item.dto';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly repo: Repository<Item>,
    @InjectRepository(ItemUnit)
    private readonly unitRepo: Repository<ItemUnit>,
  ) {}

  async create(dto: CreateItemDto, companyId: string) {
    const existing = await this.repo.findOneBy({ sku: dto.sku, companyId } as any);
    if (existing) throw new ConflictException('Item SKU already exists');

    const { units, ...itemData } = dto;
    const entity = new Item();
    Object.assign(entity, { ...itemData, companyId });

    if (units?.length) {
      entity.units = units.map((u) => {
        const iu = new ItemUnit();
        Object.assign(iu, u);
        return iu;
      });
    }

    return this.repo.save(entity);
  }

  async findAll(companyId: string, query?: QueryItemsDto) {
    const page = query?.page || 1;
    const limit = query?.limit || 20;
    const skip = (page - 1) * limit;
    const sortBy = query?.sortBy || 'sku';
    const sortOrder = query?.sortOrder || 'ASC';

    const where: any = { companyId };
    if (query?.isActive !== undefined) where.isActive = query.isActive;
    if (query?.itemGroupId) where.itemGroupId = query.itemGroupId;
    if (query?.search) {
      where.name = ILike(`%${query.search}%`);
    }

    const [data, total] = await this.repo.findAndCount({
      where,
      order: { [sortBy]: sortOrder } as any,
      skip,
      take: limit,
      relations: ['defaultWarehouse', 'itemGroup', 'units', 'units.unit'],
    });

    return { data, total, page, limit };
  }

  async findById(id: string, companyId: string) {
    const entity = await this.repo.findOne({
      where: { id, companyId } as any,
      relations: ['defaultWarehouse', 'itemGroup', 'units', 'units.unit'],
    });
    if (!entity) throw new NotFoundException('Item not found');
    return entity;
  }

  async update(id: string, dto: UpdateItemDto, companyId: string) {
    const entity = await this.findById(id, companyId);
    if (dto.sku && dto.sku !== entity.sku) {
      const existing = await this.repo.findOneBy({ sku: dto.sku, companyId } as any);
      if (existing) throw new ConflictException('Item SKU already exists');
    }

    const { units, ...itemData } = dto;

    await this.repo.update(id, itemData as any);

    if (units) {
      await this.unitRepo.delete({ itemId: id });
      if (units.length) {
        const newUnits = units.map((u) => {
          const iu = new ItemUnit();
          Object.assign(iu, { ...u, itemId: id });
          return iu;
        });
        await this.unitRepo.save(newUnits);
      }
    }

    return this.findById(id, companyId);
  }

  async remove(id: string, companyId: string) {
    await this.findById(id, companyId);
    await this.repo.softDelete(id);
    return { message: 'Item deleted successfully' };
  }
}
