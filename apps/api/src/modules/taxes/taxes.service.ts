import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Tax } from './entities/tax.entity';
import { CreateTaxDto, UpdateTaxDto, QueryTaxesDto } from './dto/tax.dto';

@Injectable()
export class TaxesService {
  constructor(
    @InjectRepository(Tax)
    private readonly taxRepo: Repository<Tax>,
  ) {}

  async create(dto: CreateTaxDto, companyId: string) {
    const existing = await this.taxRepo.findOneBy({ code: dto.code, companyId } as any);
    if (existing) throw new ConflictException('Tax code already exists');

    if (dto.isDefault) {
      await this.taxRepo.update({ companyId, isDefault: true } as any, { isDefault: false });
    }

    const tax = this.taxRepo.create({ ...dto, companyId } as any);
    return this.taxRepo.save(tax);
  }

  async findAll(companyId: string, query?: QueryTaxesDto) {
    const page = query?.page || 1;
    const limit = query?.limit || 20;
    const skip = (page - 1) * limit;
    const sortBy = query?.sortBy || 'code';
    const sortOrder = query?.sortOrder || 'ASC';

    const where: any = { companyId };
    if (query?.isActive !== undefined) where.isActive = query.isActive;
    if (query?.search) where.name = ILike(`%${query.search}%`);

    const [data, total] = await this.taxRepo.findAndCount({
      where,
      order: { [sortBy]: sortOrder } as any,
      skip,
      take: limit,
    });

    return { data, total, page, limit };
  }

  async findById(id: string, companyId: string) {
    const tax = await this.taxRepo.findOne({ where: { id, companyId } as any });
    if (!tax) throw new NotFoundException('Tax not found');
    return tax;
  }

  async update(id: string, dto: UpdateTaxDto, companyId: string) {
    const tax = await this.findById(id, companyId);
    if (dto.code && dto.code !== tax.code) {
      const existing = await this.taxRepo.findOneBy({ code: dto.code, companyId } as any);
      if (existing) throw new ConflictException('Tax code already exists');
    }
    if (dto.isDefault) {
      await this.taxRepo.update({ companyId, isDefault: true } as any, { isDefault: false });
    }

    await this.taxRepo.update(id, dto as any);
    return this.findById(id, companyId);
  }

  async remove(id: string, companyId: string) {
    await this.findById(id, companyId);
    await this.taxRepo.softDelete(id);
    return { message: 'Tax deleted successfully' };
  }
}
