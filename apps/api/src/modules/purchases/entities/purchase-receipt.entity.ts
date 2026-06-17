import { Column, Entity, Index, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { TenantEntity } from '../../../common/entities/tenant.entity';
import { Company } from '../../companies/entities/company.entity';
import { Supplier } from './supplier.entity';
import { PurchaseReceiptLine } from './purchase-receipt-line.entity';

export enum PurchaseReceiptStatus {
  DRAFT = 'draft',
  SAVED = 'saved',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
}

@Entity('purchase_receipts')
@Index('idx_pr_company', ['companyId'])
export class PurchaseReceipt extends TenantEntity {
  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company?: Company;

  @Column({ name: 'receipt_number', type: 'varchar', length: 50 })
  receiptNumber!: string;

  @Column({ name: 'receipt_date', type: 'date' })
  receiptDate!: string;

  @Column({ name: 'supplier_id', type: 'uuid' })
  supplierId!: string;

  @ManyToOne(() => Supplier, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'supplier_id' })
  supplier?: Supplier;

  @Column({ name: 'purchase_order_id', type: 'uuid', nullable: true })
  purchaseOrderId?: string;

  @Column({ type: 'enum', enum: PurchaseReceiptStatus, default: PurchaseReceiptStatus.DRAFT })
  status!: PurchaseReceiptStatus;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  total!: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @OneToMany(() => PurchaseReceiptLine, (line) => line.purchaseReceipt, { cascade: true })
  lines?: PurchaseReceiptLine[];
}
