import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { RolePermission } from './entities/role-permission.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { QueryRoleDto } from './dto/query-role.dto';

@Injectable()
export class RbacService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepo: Repository<RolePermission>,
  ) {}

  async create(dto: CreateRoleDto, companyId: string) {
    const existing = await this.roleRepo.findOneBy({ code: dto.code, companyId } as any);
    if (existing) throw new ConflictException('Role code already exists');

    const role = this.roleRepo.create({
      code: dto.code,
      name: dto.name,
      description: dto.description,
      companyId,
    } as any);
    const savedRole = (await this.roleRepo.save(role)) as any;

    if (dto.permissions?.length) {
      await this.rolePermissionRepo.save(
        dto.permissions.map((p) => ({ roleId: savedRole.id, ...p })) as any,
      );
    }

    return this.findById(savedRole.id, companyId);
  }

  async findAll(query: QueryRoleDto, companyId: string) {
    const qb = this.roleRepo
      .createQueryBuilder('role')
      .leftJoinAndSelect('role.permissions', 'permissions')
      .where('role.companyId = :companyId', { companyId });

    const sortMap: Record<string, string> = {
      createdAt: 'role.createdAt',
      updatedAt: 'role.updatedAt',
      code: 'role.code',
      name: 'role.name',
      isSystem: 'role.isSystem',
    };
    const sortBy = sortMap[query.sortBy || 'createdAt'] || 'role.createdAt';
    const sortOrder = query.sortOrder?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await qb
      .orderBy(sortBy, sortOrder)
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async findById(id: string, companyId: string) {
    const role = await this.roleRepo.findOne({
      where: { id, companyId } as any,
      relations: ['permissions'],
    });
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async update(id: string, dto: UpdateRoleDto, companyId: string) {
    const role = await this.findById(id, companyId);

    if (dto.code && dto.code !== role.code) {
      const existing = await this.roleRepo.findOneBy({ code: dto.code, companyId } as any);
      if (existing) throw new ConflictException('Role code already exists');
    }

    if (role.isSystem && (dto.name || dto.code)) {
      throw new ConflictException('Cannot modify system role name or code');
    }

    await this.roleRepo.update(id, dto as any);

    if (dto.permissions) {
      await this.rolePermissionRepo.delete({ roleId: id } as any);
      if (dto.permissions.length) {
        await this.rolePermissionRepo.save(
          dto.permissions.map((p) => ({ roleId: id, ...p })) as any,
        );
      }
    }

    return this.findById(id, companyId);
  }

  async remove(id: string, companyId: string) {
    const role = await this.findById(id, companyId);
    if (role.isSystem) throw new ConflictException('Cannot delete system role');
    await this.roleRepo.softDelete(id);
    return { message: 'Role deleted successfully' };
  }
}
