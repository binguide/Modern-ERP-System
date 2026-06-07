import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from './entities/branch.entity';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@Injectable()
export class BranchesService {
  constructor(
    @InjectRepository(Branch)
    private readonly branchRepo: Repository<Branch>,
  ) {}

  async create(dto: CreateBranchDto, companyId: string) {
    const existing = await this.branchRepo.findOneBy({ code: dto.code, companyId } as any);
    if (existing) throw new NotFoundException('Branch code already exists');

    const branch = this.branchRepo.create({ ...dto, companyId } as any);
    await this.branchRepo.save(branch);

    if (dto.isDefault) {
      await this.branchRepo.update({ companyId, isDefault: true } as any, { isDefault: false });
    }

    return branch;
  }

  async findAll(companyId: string) {
    return this.branchRepo.find({
      where: { companyId } as any,
      order: { name: 'ASC' },
    });
  }

  async findById(id: string, companyId: string) {
    const branch = await this.branchRepo.findOne({ where: { id, companyId } as any });
    if (!branch) throw new NotFoundException('Branch not found');
    return branch;
  }

  async update(id: string, dto: UpdateBranchDto, companyId: string) {
    const branch = await this.findById(id, companyId);
    if (dto.code && dto.code !== branch.code) {
      const existing = await this.branchRepo.findOneBy({ code: dto.code, companyId } as any);
      if (existing) throw new NotFoundException('Branch code already exists');
    }
    await this.branchRepo.update(id, dto as any);

    if (dto.isDefault) {
      await this.branchRepo.update({ companyId, isDefault: true } as any, { isDefault: false });
    }

    return this.findById(id, companyId);
  }

  async remove(id: string, companyId: string) {
    await this.findById(id, companyId);
    await this.branchRepo.softDelete(id);
    return { message: 'Branch deleted successfully' };
  }
}
