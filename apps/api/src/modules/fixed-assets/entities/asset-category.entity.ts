import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { TenantEntity } from '../../../common/entities/tenant.entity';
import { Company } from '../../companies/entities/company.entity';

@Entity('asset_categories')
@Index('idx_asset_cat_company', ['companyId'])
@Index('idx_asset_cat_code_company', ['code', 'companyId'], {
  unique: true,
  where: '"deleted_at" IS NULL',
})
export class AssetCategory extends TenantEntity {
  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company?: Company;

  @Column({ type: 'varchar', length: 50 })
  code!: string;

  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description?: string;

  @Column({ name: 'depreciation_method', type: 'varchar', length: 50, default: 'straight-line' })
  depreciationMethod!: string;

  @Column({ name: 'useful_life_years', type: 'int', default: 5 })
  usefulLifeYears!: number;

  @Column({ name: 'salvage_value_pct', type: 'decimal', precision: 5, scale: 2, default: 0 })
  salvageValuePct!: number;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;
}
