import { Column, Entity, Index, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { TenantEntity } from '../../../common/entities/tenant.entity';
import { Company } from '../../companies/entities/company.entity';
import { Customer } from './customer.entity';
import { DeliveryNoteLine } from './delivery-note-line.entity';

export enum DeliveryNoteStatus {
  DRAFT = 'draft',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
}

@Entity('delivery_notes')
@Index('idx_dn_company', ['companyId'])
export class DeliveryNote extends TenantEntity {
  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company?: Company;

  @Column({ name: 'delivery_number', type: 'varchar', length: 50 })
  deliveryNumber!: string;

  @Column({ name: 'delivery_date', type: 'date' })
  deliveryDate!: string;

  @Column({ name: 'customer_id', type: 'uuid' })
  customerId!: string;

  @ManyToOne(() => Customer, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'customer_id' })
  customer?: Customer;

  @Column({ name: 'sales_order_id', type: 'uuid', nullable: true })
  salesOrderId?: string;

  @Column({ type: 'enum', enum: DeliveryNoteStatus, default: DeliveryNoteStatus.DRAFT })
  status!: DeliveryNoteStatus;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  total!: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @OneToMany(() => DeliveryNoteLine, (line) => line.deliveryNote, { cascade: true })
  lines?: DeliveryNoteLine[];
}
