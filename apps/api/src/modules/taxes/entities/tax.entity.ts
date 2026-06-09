import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { TenantEntity } from '../../../common/entities/tenant.entity';
import { Company } from '../../companies/entities/company.entity';

export enum TaxType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

@Entity('taxes')
@Index('idx_taxes_company', ['companyId'])
@Index('idx_taxes_code_company', ['code', 'companyId'], {
  unique: true,
  where: '"deleted_at" IS NULL',
})
export class Tax extends TenantEntity {
  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company?: Company;

  @Column({ type: 'varchar', length: 20 })
  code!: string;

  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  rate!: number;

  @Column({ type: 'enum', enum: TaxType, default: TaxType.PERCENTAGE })
  type!: TaxType;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'is_default', type: 'boolean', default: false })
  isDefault!: boolean;
}
