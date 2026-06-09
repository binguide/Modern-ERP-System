import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Branch } from './entities/branch.entity';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

interface QueryOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
}

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

  async findAll(companyId: string, options?: QueryOptions) {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;
    const sortBy = options?.sortBy || 'name';
    const sortOrder = options?.sortOrder || 'ASC';

    const where: any = { companyId };
    if (options?.search) {
      where.name = ILike(`%${options.search}%`);
    }

    const [data, total] = await this.branchRepo.findAndCount({
      where,
      order: { [sortBy]: sortOrder } as any,
      skip,
      take: limit,
    });

    return { data, total, page, limit };
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
    if (dto.isDefault) {
      await this.branchRepo.update({ companyId, isDefault: true } as any, { isDefault: false });
    }

    await this.branchRepo.update(id, dto as any);

    return this.findById(id, companyId);
  }

  async remove(id: string, companyId: string) {
    await this.findById(id, companyId);
    await this.branchRepo.softDelete(id);
    return { message: 'Branch deleted successfully' };
  }
}
