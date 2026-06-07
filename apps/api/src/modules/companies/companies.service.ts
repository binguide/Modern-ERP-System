import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
  ) {}

  async create(dto: CreateCompanyDto) {
    const existing = await this.companyRepo.findOneBy({ code: dto.code } as any);
    if (existing) throw new NotFoundException('Company code already exists');
    const company = this.companyRepo.create(dto as any);
    return this.companyRepo.save(company);
  }

  async findAll() {
    return this.companyRepo.find({ order: { name: 'ASC' } });
  }

  async findById(id: string) {
    const company = await this.companyRepo.findOne({ where: { id } as any });
    if (!company) throw new NotFoundException('Company not found');
    return company;
  }

  async update(id: string, dto: UpdateCompanyDto) {
    await this.findById(id);
    await this.companyRepo.update(id, dto as any);
    return this.findById(id);
  }

  async remove(id: string) {
    await this.findById(id);
    await this.companyRepo.softDelete(id);
    return { message: 'Company deleted successfully' };
  }
}
