import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { UserRole } from './entities/user-role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(UserRole)
    private readonly userRoleRepo: Repository<UserRole>,
  ) {}

  async create(dto: CreateUserDto, companyId: string) {
    const existing = await this.userRepo.findOne({
      where: { email: dto.email.toLowerCase().trim() } as any,
    });
    if (existing) throw new ConflictException('Email already exists');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = this.userRepo.create({
      email: dto.email.toLowerCase().trim(),
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      companyId,
      branchId: dto.branchId || null,
    } as any);
    const savedUser = (await this.userRepo.save(user)) as any;

    if (dto.roleIds?.length) {
      await this.userRoleRepo.save(
        dto.roleIds.map((roleId) => ({ userId: savedUser.id, roleId })) as any,
      );
    }

    return this.findById(savedUser.id, companyId);
  }

  async findAll(query: QueryUserDto, companyId: string) {
    const qb = this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.userRoles', 'userRoles')
      .leftJoinAndSelect('userRoles.role', 'role')
      .leftJoinAndSelect('user.branch', 'branch')
      .where('user.companyId = :companyId', { companyId })
      .andWhere('user.deletedAt IS NULL');

    if (query.search) {
      qb.andWhere(
        '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }
    if (query.isActive !== undefined) {
      qb.andWhere('user.isActive = :isActive', { isActive: query.isActive });
    }
    if (query.roleId) {
      qb.andWhere('role.id = :roleId', { roleId: query.roleId });
    }
    if (query.branchId) {
      qb.andWhere('user.branchId = :branchId', { branchId: query.branchId });
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const sortMap: Record<string, string> = {
      createdAt: 'user.createdAt',
      updatedAt: 'user.updatedAt',
      firstName: 'user.firstName',
      lastName: 'user.lastName',
      email: 'user.email',
      isActive: 'user.isActive',
      lastLoginAt: 'user.lastLoginAt',
    };
    const sortBy = sortMap[query.sortBy || 'createdAt'] || 'user.createdAt';
    const sortOrder = query.sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const [data, total] = await qb
      .orderBy(sortBy, sortOrder)
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return { data: data.map((u) => this.sanitize(u)), total, page, limit };
  }

  async findById(id: string, companyId: string) {
    const user = await this.userRepo.findOne({
      where: { id, companyId } as any,
      relations: ['userRoles', 'userRoles.role', 'userRoles.role.permissions', 'branch'],
    });
    if (!user) throw new NotFoundException('User not found');
    return this.sanitize(user);
  }

  async update(id: string, dto: UpdateUserDto, companyId: string) {
    const user = await this.userRepo.findOne({ where: { id, companyId } as any });
    if (!user) throw new NotFoundException('User not found');

    if (dto.email && dto.email.toLowerCase().trim() !== user.email) {
      const existing = await this.userRepo.findOne({
        where: { email: dto.email.toLowerCase().trim() } as any,
      });
      if (existing) throw new ConflictException('Email already exists');
    }

    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 12);
    }

    await this.userRepo.update(id, {
      ...(dto.email && { email: dto.email.toLowerCase().trim() }),
      ...(dto.firstName && { firstName: dto.firstName }),
      ...(dto.lastName && { lastName: dto.lastName }),
      ...(dto.phone !== undefined && { phone: dto.phone }),
      ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      ...(dto.password && { passwordHash: dto.password }),
      ...(dto.branchId !== undefined && { branchId: dto.branchId }),
    } as any);

    if (dto.roleIds) {
      await this.userRoleRepo.delete({ userId: id } as any);
      if (dto.roleIds.length) {
        await this.userRoleRepo.save(dto.roleIds.map((roleId) => ({ userId: id, roleId })) as any);
      }
    }

    return this.findById(id, companyId);
  }

  async remove(id: string, companyId: string) {
    const user = await this.userRepo.findOne({ where: { id, companyId } as any });
    if (!user) throw new NotFoundException('User not found');
    await this.userRepo.softDelete(id);
    return { message: 'User deleted successfully' };
  }

  private sanitize(user: User) {
    const rest = { ...user };
    delete (rest as any).passwordHash;
    const u = rest as any;
    return {
      ...u,
      roles:
        u.userRoles?.map((ur: any) => ({
          id: ur.role?.id,
          code: ur.role?.code,
          name: ur.role?.name,
        })) || [],
    };
  }
}
