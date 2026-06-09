import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Period } from './entities/period.entity';
import { CreatePeriodDto, UpdatePeriodDto, QueryPeriodsDto } from './dto/fiscal-year.dto';

@Injectable()
export class PeriodsService {
  constructor(
    @InjectRepository(Period)
    private readonly periodRepo: Repository<Period>,
  ) {}

  async create(dto: CreatePeriodDto, companyId: string) {
    const period = this.periodRepo.create({ ...dto, companyId } as any);
    return this.periodRepo.save(period);
  }

  async findAll(companyId: string, query?: QueryPeriodsDto) {
    const page = query?.page || 1;
    const limit = query?.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = { companyId };
    if (query?.fiscalYearId) {
      where.fiscalYearId = query.fiscalYearId;
    }

    const [data, total] = await this.periodRepo.findAndCount({
      where,
      order: { fiscalYearId: 'ASC', order: 'ASC' },
      skip,
      take: limit,
      relations: ['fiscalYear'],
    });

    return { data, total, page, limit };
  }

  async findById(id: string, companyId: string) {
    const period = await this.periodRepo.findOne({
      where: { id, companyId } as any,
      relations: ['fiscalYear'],
    });
    if (!period) throw new NotFoundException('Period not found');
    return period;
  }

  async update(id: string, dto: UpdatePeriodDto, companyId: string) {
    await this.findById(id, companyId);
    await this.periodRepo.update(id, dto as any);
    return this.findById(id, companyId);
  }

  async remove(id: string, companyId: string) {
    await this.findById(id, companyId);
    await this.periodRepo.softDelete(id);
    return { message: 'Period deleted successfully' };
  }
}
