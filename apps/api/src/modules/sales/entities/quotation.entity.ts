import { Column, Entity, Index, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { TenantEntity } from '../../../common/entities/tenant.entity';
import { Company } from '../../companies/entities/company.entity';
import { Customer } from './customer.entity';
import { QuotationLine } from './quotation-line.entity';

export enum QuotationStatus {
  DRAFT = 'draft',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
}

@Entity('quotations')
@Index('idx_qtn_company', ['companyId'])
export class Quotation extends TenantEntity {
  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company?: Company;

  @Column({ name: 'quotation_number', type: 'varchar', length: 50 })
  quotationNumber!: string;

  @Column({ name: 'quotation_date', type: 'date' })
  quotationDate!: string;

  @Column({ name: 'valid_until', type: 'date', nullable: true })
  validUntil?: string;

  @Column({ name: 'customer_id', type: 'uuid' })
  customerId!: string;

  @ManyToOne(() => Customer, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'customer_id' })
  customer?: Customer;

  @Column({ type: 'enum', enum: QuotationStatus, default: QuotationStatus.DRAFT })
  status!: QuotationStatus;

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

  @OneToMany(() => QuotationLine, (line) => line.quotation, { cascade: true })
  lines?: QuotationLine[];
}
