import { Column, Entity, Index, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { TenantEntity } from '../../../common/entities/tenant.entity';
import { Company } from '../../companies/entities/company.entity';
import { Customer } from './customer.entity';
import { SalesOrderLine } from './sales-order-line.entity';

export enum SalesOrderStatus {
  DRAFT = 'draft',
  SAVED = 'saved',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
}

@Entity('sales_orders')
@Index('idx_sales_orders_company', ['companyId'])
@Index('idx_sales_orders_number_company', ['orderNumber', 'companyId'], {
  unique: true,
  where: '"deleted_at" IS NULL',
})
export class SalesOrder extends TenantEntity {
  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company?: Company;

  @Column({ name: 'order_number', type: 'varchar', length: 50 })
  orderNumber!: string;

  @Column({ name: 'order_date', type: 'date' })
  orderDate!: string;

  @Column({ name: 'po_no', type: 'varchar', length: 100, nullable: true })
  poNo?: string;

  @Column({ name: 'delivery_date', type: 'date', nullable: true })
  deliveryDate?: string;

  @Column({ name: 'order_type', type: 'varchar', length: 50, nullable: true })
  orderType?: string;

  @Column({ name: 'shipping_address', type: 'text', nullable: true })
  shippingAddress?: string;

  @Column({ type: 'varchar', length: 10, default: 'USD' })
  currency!: string;

  @Column({ name: 'exchange_rate', type: 'decimal', precision: 12, scale: 6, default: 1 })
  exchangeRate!: number;

  @Column({ name: 'price_list', type: 'varchar', length: 100, nullable: true })
  priceList?: string;

  @Column({ name: 'payment_terms', type: 'varchar', length: 100, nullable: true })
  paymentTerms?: string;

  @Column({ name: 'tax_template', type: 'varchar', length: 100, nullable: true })
  taxTemplate?: string;

  @Column({ name: 'debit_to', type: 'varchar', length: 100, nullable: true })
  debitTo?: string;

  @Column({ name: 'income_account', type: 'varchar', length: 100, nullable: true })
  incomeAccount?: string;

  @Column({ name: 'cost_center', type: 'varchar', length: 100, nullable: true })
  costCenter?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  project?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  territory?: string;

  @Column({ name: 'sales_person', type: 'varchar', length: 100, nullable: true })
  salesPerson?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  source?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  campaign?: string;

  @Column({ name: 'customer_id', type: 'uuid' })
  customerId!: string;

  @ManyToOne(() => Customer, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'customer_id' })
  customer?: Customer;

  @Column({ type: 'enum', enum: SalesOrderStatus, default: SalesOrderStatus.DRAFT })
  status!: SalesOrderStatus;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  subtotal!: number;

  @Column({ name: 'tax_total', type: 'decimal', precision: 14, scale: 2, default: 0 })
  taxTotal!: number;

  @Column({ name: 'discount_total', type: 'decimal', precision: 14, scale: 2, default: 0 })
  discountTotal!: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  total!: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @OneToMany(() => SalesOrderLine, (line) => line.salesOrder, { cascade: true })
  lines?: SalesOrderLine[];
}
