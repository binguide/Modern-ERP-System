import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { PurchaseReceipt } from './purchase-receipt.entity';

@Entity('purchase_receipt_lines')
export class PurchaseReceiptLine extends BaseEntity {
  @Column({ name: 'purchase_receipt_id', type: 'uuid' })
  purchaseReceiptId!: string;

  @ManyToOne(() => PurchaseReceipt, (pr) => pr.lines, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'purchase_receipt_id' })
  purchaseReceipt?: PurchaseReceipt;

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

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  amount!: number;
}
