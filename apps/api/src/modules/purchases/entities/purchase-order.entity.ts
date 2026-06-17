import { Column, Entity, Index, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { TenantEntity } from '../../../common/entities/tenant.entity';
import { Company } from '../../companies/entities/company.entity';
import { Supplier } from './supplier.entity';
import { PurchaseOrderLine } from './purchase-order-line.entity';

export enum PurchaseOrderStatus {
  DRAFT = 'draft',
  SAVED = 'saved',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
}

@Entity('purchase_orders')
@Index('idx_po_company', ['companyId'])
@Index('idx_po_number_company', ['orderNumber', 'companyId'], {
  unique: true,
  where: '"deleted_at" IS NULL',
})
export class PurchaseOrder extends TenantEntity {
  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company?: Company;

  @Column({ name: 'order_number', type: 'varchar', length: 50 })
  orderNumber!: string;

  @Column({ name: 'order_date', type: 'date' })
  orderDate!: string;

  @Column({ name: 'supplier_id', type: 'uuid' })
  supplierId!: string;

  @ManyToOne(() => Supplier, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'supplier_id' })
  supplier?: Supplier;

  @Column({ type: 'enum', enum: PurchaseOrderStatus, default: PurchaseOrderStatus.DRAFT })
  status!: PurchaseOrderStatus;

  @Column({ name: 'expected_date', type: 'date', nullable: true })
  expectedDate?: string;

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

  @OneToMany(() => PurchaseOrderLine, (line) => line.purchaseOrder, { cascade: true })
  lines?: PurchaseOrderLine[];
}
