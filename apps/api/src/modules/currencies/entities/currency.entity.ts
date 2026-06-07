import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { TenantEntity } from '../../../common/entities/tenant.entity';
import { Company } from '../../companies/entities/company.entity';

@Entity('currencies')
@Index('idx_currencies_code', ['code', 'companyId'], {
  unique: true,
  where: '"deleted_at" IS NULL',
})
export class Currency extends TenantEntity {
  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company?: Company;

  @Column({ type: 'varchar', length: 3 })
  code!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ name: 'exchange_rate', type: 'decimal', precision: 18, scale: 6, default: 1 })
  exchangeRate!: number;

  @Column({ name: 'is_base', type: 'boolean', default: false })
  isBase!: boolean;

  @Column({ type: 'varchar', length: 10, default: '2' })
  decimalPlaces!: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;
}
