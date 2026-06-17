import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { SalesOrder } from '../sales/entities/sales-order.entity';
import { Customer } from '../sales/entities/customer.entity';
import { User } from '../users/entities/user.entity';
import { Item } from '../inventory/entities/item.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(SalesOrder)
    private readonly salesOrderRepo: Repository<SalesOrder>,
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Item)
    private readonly itemRepo: Repository<Item>,
  ) {}

  async getStats(companyId: string) {
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstOfYear = new Date(now.getFullYear(), 0, 1);

    const totalSalesOrders = await this.salesOrderRepo.count({
      where: { companyId, deletedAt: IsNull() },
    });
    const totalCustomers = await this.customerRepo.count({
      where: { companyId, deletedAt: IsNull() },
    });
    const totalUsers = await this.userRepo.count({
      where: { companyId, deletedAt: IsNull() },
    });
    const totalItems = await this.itemRepo.count({
      where: { companyId, deletedAt: IsNull() },
    });

    const monthSalesAgg = await this.salesOrderRepo
      .createQueryBuilder('so')
      .select('COALESCE(SUM(so.total), 0)', 'total')
      .where('so.company_id = :companyId', { companyId })
      .andWhere('so.deleted_at IS NULL')
      .andWhere('so.order_date >= :start', { start: firstOfMonth.toISOString().split('T')[0] })
      .getRawOne();

    const yearSalesAgg = await this.salesOrderRepo
      .createQueryBuilder('so')
      .select('COALESCE(SUM(so.total), 0)', 'total')
      .where('so.company_id = :companyId', { companyId })
      .andWhere('so.deleted_at IS NULL')
      .andWhere('so.order_date >= :start', { start: firstOfYear.toISOString().split('T')[0] })
      .getRawOne();

    const statusCounts = await this.salesOrderRepo
      .createQueryBuilder('so')
      .select('so.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('so.company_id = :companyId', { companyId })
      .andWhere('so.deleted_at IS NULL')
      .groupBy('so.status')
      .getRawMany();

    return {
      totalSalesOrders,
      totalCustomers,
      totalUsers,
      totalItems,
      monthSales: Number(monthSalesAgg?.total ?? 0),
      yearSales: Number(yearSalesAgg?.total ?? 0),
      salesByStatus: statusCounts.map((r) => ({ status: r.status, count: Number(r.count) })),
    };
  }

  async getMonthlySales(companyId: string, year?: number) {
    const targetYear = year ?? new Date().getFullYear();
    const raw = await this.salesOrderRepo
      .createQueryBuilder('so')
      .select("TO_CHAR(so.order_date, 'YYYY-MM')", 'month')
      .addSelect('COALESCE(SUM(so.total), 0)', 'total')
      .addSelect('COUNT(*)', 'count')
      .where('so.company_id = :companyId', { companyId })
      .andWhere('so.deleted_at IS NULL')
      .andWhere('so.order_date >= :start', { start: `${targetYear}-01-01` })
      .andWhere('so.order_date <= :end', { end: `${targetYear}-12-31` })
      .groupBy("TO_CHAR(so.order_date, 'YYYY-MM')")
      .orderBy('month', 'ASC')
      .getRawMany();

    return raw.map((r) => ({
      month: r.month,
      total: Number(r.total),
      count: Number(r.count),
    }));
  }

  async getTopCustomers(companyId: string, limit = 5) {
    const raw = await this.salesOrderRepo
      .createQueryBuilder('so')
      .select('so.customer_id', 'customerId')
      .addSelect('c.name', 'customerName')
      .addSelect('COALESCE(SUM(so.total), 0)', 'total')
      .addSelect('COUNT(*)', 'orderCount')
      .leftJoin('so.customer', 'c')
      .where('so.company_id = :companyId', { companyId })
      .andWhere('so.deleted_at IS NULL')
      .andWhere('c.deleted_at IS NULL')
      .groupBy('so.customer_id')
      .addGroupBy('c.name')
      .orderBy('total', 'DESC')
      .limit(limit)
      .getRawMany();

    return raw.map((r) => ({
      customerId: r.customerId,
      customerName: r.customerName,
      total: Number(r.total),
      orderCount: Number(r.orderCount),
    }));
  }

  async getRecentOrders(companyId: string, limit = 10) {
    return this.salesOrderRepo.find({
      where: { companyId, deletedAt: IsNull() },
      relations: ['customer'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
