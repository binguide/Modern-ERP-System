import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { TenantEntity } from '../../../common/entities/tenant.entity';
import { Company } from '../../companies/entities/company.entity';
import { FiscalYear } from './fiscal-year.entity';

@Entity('periods')
@Index('idx_period_company', ['companyId'])
@Index('idx_period_year', ['fiscalYearId'])
export class Period extends TenantEntity {
  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company?: Company;

  @Column({ name: 'fiscal_year_id', type: 'uuid' })
  fiscalYearId!: string;

  @ManyToOne(() => FiscalYear, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fiscal_year_id' })
  fiscalYear?: FiscalYear;

  @Column({ type: 'varchar', length: 50 })
  name!: string;

  @Column({ name: 'start_date', type: 'date' })
  startDate!: Date;

  @Column({ name: 'end_date', type: 'date' })
  endDate!: Date;

  @Column({ name: 'is_closed', type: 'boolean', default: false })
  isClosed!: boolean;

  @Column({ type: 'integer' })
  order!: number;
}
