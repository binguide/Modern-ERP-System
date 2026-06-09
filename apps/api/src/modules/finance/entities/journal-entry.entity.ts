import { Column, Entity, Index, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { TenantEntity } from '../../../common/entities/tenant.entity';
import { Company } from '../../companies/entities/company.entity';
import { FiscalYear } from './fiscal-year.entity';
import { Period } from './period.entity';
import { JournalEntryLine } from './journal-entry-line.entity';

export enum JournalEntryStatus {
  DRAFT = 'draft',
  POSTED = 'posted',
  CANCELLED = 'cancelled',
}

@Entity('journal_entries')
@Index('idx_je_company', ['companyId'])
@Index('idx_je_number_company', ['number', 'companyId'], {
  unique: true,
  where: '"deleted_at" IS NULL',
})
export class JournalEntry extends TenantEntity {
  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company?: Company;

  @Column({ type: 'int' })
  number!: number;

  @Column({ type: 'date' })
  date!: Date;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description?: string | null;

  @Column({ name: 'fiscal_year_id', type: 'uuid' })
  fiscalYearId!: string;

  @ManyToOne(() => FiscalYear, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'fiscal_year_id' })
  fiscalYear?: FiscalYear;

  @Column({ name: 'period_id', type: 'uuid' })
  periodId!: string;

  @ManyToOne(() => Period, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'period_id' })
  period?: Period;

  @Column({ type: 'enum', enum: JournalEntryStatus, default: JournalEntryStatus.DRAFT })
  status!: JournalEntryStatus;

  @Column({ name: 'posted_at', type: 'timestamptz', nullable: true })
  postedAt?: Date | null;

  @Column({ name: 'posted_by', type: 'uuid', nullable: true })
  postedBy?: string | null;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy?: string | null;

  @Column({ name: 'reference', type: 'varchar', length: 100, nullable: true })
  reference?: string | null;

  @OneToMany(() => JournalEntryLine, (line) => line.journalEntry, { cascade: true })
  lines?: JournalEntryLine[];

  @Column({ name: 'total_debit', type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalDebit!: number;

  @Column({ name: 'total_credit', type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalCredit!: number;
}
