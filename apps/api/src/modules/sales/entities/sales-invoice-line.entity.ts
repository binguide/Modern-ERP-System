import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { SalesInvoice } from './sales-invoice.entity';

@Entity('sales_invoice_lines')
export class SalesInvoiceLine extends BaseEntity {
  @Column({ name: 'sales_invoice_id', type: 'uuid' })
  salesInvoiceId!: string;

  @ManyToOne(() => SalesInvoice, (si) => si.lines, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sales_invoice_id' })
  salesInvoice?: SalesInvoice;

  @Column({ name: 'item_id', type: 'uuid', nullable: true })
  itemId?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  quantity!: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  unit?: string;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  rate!: number;

  @Column({ name: 'discount_pct', type: 'decimal', precision: 5, scale: 2, default: 0 })
  discountPct!: number;

  @Column({ name: 'tax_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  taxRate!: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  amount!: number;
}
