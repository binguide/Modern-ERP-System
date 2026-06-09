import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuditService } from './audit.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('audit-logs')
@UseGuards(AuthGuard('jwt'))
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  async findAll(
    @CurrentUser('companyId') companyId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
    @Query('resource') resource?: string,
    @Query('action') action?: string,
  ) {
    return this.auditService.findAll({
      companyId,
      page,
      limit,
      sortBy,
      sortOrder,
      resource,
      action,
    });
  }
}
