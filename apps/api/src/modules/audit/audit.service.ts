import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  async log(params: {
    companyId?: string | null;
    userId?: string | null;
    action: string;
    resource: string;
    resourceId?: string | null;
    oldValues?: Record<string, unknown> | null;
    newValues?: Record<string, unknown> | null;
    ipAddress?: string | null;
    userAgent?: string | null;
  }) {
    const entry = this.auditRepo.create({
      companyId: params.companyId ?? null,
      userId: params.userId ?? null,
      action: params.action,
      resource: params.resource,
      resourceId: params.resourceId ?? null,
      oldValues: params.oldValues ?? null,
      newValues: params.newValues ?? null,
      ipAddress: params.ipAddress ?? null,
      userAgent: params.userAgent ?? null,
    });
    return this.auditRepo.save(entry);
  }

  async findAll(query: {
    companyId?: string;
    userId?: string;
    resource?: string;
    action?: string;
    page?: number;
    limit?: number;
  }) {
    const qb = this.auditRepo.createQueryBuilder('audit');

    if (query.companyId) {
      qb.andWhere('audit.companyId = :companyId', { companyId: query.companyId });
    }
    if (query.userId) {
      qb.andWhere('audit.userId = :userId', { userId: query.userId });
    }
    if (query.resource) {
      qb.andWhere('audit.resource = :resource', { resource: query.resource });
    }
    if (query.action) {
      qb.andWhere('audit.action = :action', { action: query.action });
    }

    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = (page - 1) * limit;

    const [data, total] = await qb
      .orderBy('audit.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }
}
