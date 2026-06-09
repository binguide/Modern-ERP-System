import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FiscalYear } from './entities/fiscal-year.entity';
import { Period } from './entities/period.entity';
import {
  CreateFiscalYearDto,
  UpdateFiscalYearDto,
  QueryFiscalYearsDto,
} from './dto/fiscal-year.dto';

@Injectable()
export class FiscalYearsService {
  constructor(
    @InjectRepository(FiscalYear)
    private readonly fyRepo: Repository<FiscalYear>,
    @InjectRepository(Period)
    private readonly periodRepo: Repository<Period>,
  ) {}

  async create(dto: CreateFiscalYearDto, companyId: string) {
    const existing = await this.fyRepo.findOneBy({ code: dto.code, companyId } as any);
    if (existing) throw new ConflictException('Fiscal year code already exists');

    if (dto.isDefault) {
      await this.fyRepo.update({ companyId, isDefault: true } as any, { isDefault: false });
    }

    const saved = (await this.fyRepo.save({ ...dto, companyId } as any)) as any;

    // Auto-generate periods (12 months)
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);
    const diffMonths =
      (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    const numPeriods = Math.max(diffMonths, 1);

    const periods: Period[] = [];
    for (let i = 0; i < numPeriods; i++) {
      const ps = new Date(start.getFullYear(), start.getMonth() + i, 1);
      const pe = new Date(start.getFullYear(), start.getMonth() + i + 1, 0);
      periods.push({
        fiscalYearId: saved.id,
        companyId,
        name: `Period ${i + 1}`,
        startDate: ps,
        endDate: i === diffMonths ? end : pe,
        order: i + 1,
      } as any);
    }
    await this.periodRepo.save(periods);

    return saved;
  }

  async findAll(companyId: string, query?: QueryFiscalYearsDto) {
    const page = query?.page || 1;
    const limit = query?.limit || 20;
    const skip = (page - 1) * limit;
    const sortBy = query?.sortBy || 'startDate';
    const sortOrder = query?.sortOrder || 'DESC';

    const where: any = { companyId };
    if (query?.isActive !== undefined) {
      where.isClosed = !query.isActive;
    }

    const [data, total] = await this.fyRepo.findAndCount({
      where,
      order: { [sortBy]: sortOrder } as any,
      skip,
      take: limit,
    });

    return { data, total, page, limit };
  }

  async findById(id: string, companyId: string) {
    const fy = await this.fyRepo.findOne({ where: { id, companyId } as any });
    if (!fy) throw new NotFoundException('Fiscal year not found');
    return fy;
  }

  async update(id: string, dto: UpdateFiscalYearDto, companyId: string) {
    const fy = await this.findById(id, companyId);
    if (dto.code && dto.code !== fy.code) {
      const existing = await this.fyRepo.findOneBy({ code: dto.code, companyId } as any);
      if (existing) throw new ConflictException('Fiscal year code already exists');
    }
    if (dto.isDefault) {
      await this.fyRepo.update({ companyId, isDefault: true } as any, { isDefault: false });
    }

    await this.fyRepo.update(id, dto as any);
    return this.findById(id, companyId);
  }

  async remove(id: string, companyId: string) {
    const fy = await this.findById(id, companyId);
    if (fy.isDefault) throw new ConflictException('Cannot delete default fiscal year');
    if (!fy.isClosed) throw new ConflictException('Close fiscal year before deleting');

    await this.periodRepo.softDelete({ fiscalYearId: id } as any);
    await this.fyRepo.softDelete(id);
    return { message: 'Fiscal year deleted successfully' };
  }
}
