import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DashboardService } from './dashboard.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get('stats')
  getStats(@CurrentUser('companyId') companyId: string) {
    return this.service.getStats(companyId);
  }

  @Get('monthly-sales')
  getMonthlySales(@CurrentUser('companyId') companyId: string, @Query('year') year?: number) {
    return this.service.getMonthlySales(companyId, year);
  }

  @Get('top-customers')
  getTopCustomers(@CurrentUser('companyId') companyId: string, @Query('limit') limit?: number) {
    return this.service.getTopCustomers(companyId, limit);
  }

  @Get('recent-orders')
  getRecentOrders(@CurrentUser('companyId') companyId: string, @Query('limit') limit?: number) {
    return this.service.getRecentOrders(companyId, limit);
  }
}
