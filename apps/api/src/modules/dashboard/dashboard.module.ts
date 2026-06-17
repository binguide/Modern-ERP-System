import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesOrder } from '../sales/entities/sales-order.entity';
import { Customer } from '../sales/entities/customer.entity';
import { User } from '../users/entities/user.entity';
import { Item } from '../inventory/entities/item.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [TypeOrmModule.forFeature([SalesOrder, Customer, User, Item])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
