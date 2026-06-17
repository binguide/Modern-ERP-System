import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { TenantEntity } from '../../../common/entities/tenant.entity';
import { Company } from '../../companies/entities/company.entity';
import { AssetCategory } from './asset-category.entity';

export enum FixedAssetStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  DISPOSED = 'disposed',
  SCRAPPED = 'scrapped',
}

@Entity('fixed_assets')
@Index('idx_fa_company', ['companyId'])
@Index('idx_fa_code_company', ['assetCode', 'companyId'], {
  unique: true,
  where: '"deleted_at" IS NULL',
})
export class FixedAsset extends TenantEntity {
  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company?: Company;

  @Column({ name: 'asset_code', type: 'varchar', length: 50 })
  assetCode!: string;

  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @Column({ name: 'category_id', type: 'uuid' })
  categoryId!: string;

  @ManyToOne(() => AssetCategory, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'category_id' })
  category?: AssetCategory;

  @Column({ name: 'purchase_date', type: 'date' })
  purchaseDate!: string;

  @Column({ name: 'purchase_cost', type: 'decimal', precision: 14, scale: 2 })
  purchaseCost!: number;

  @Column({ name: 'salvage_value', type: 'decimal', precision: 14, scale: 2, default: 0 })
  salvageValue!: number;

  @Column({ name: 'useful_life_years', type: 'int', default: 5 })
  usefulLifeYears!: number;

  @Column({ name: 'depreciation_method', type: 'varchar', length: 50, default: 'straight-line' })
  depreciationMethod!: string;

  @Column({
    name: 'accumulated_depreciation',
    type: 'decimal',
    precision: 14,
    scale: 2,
    default: 0,
  })
  accumulatedDepreciation!: number;

  @Column({ name: 'book_value', type: 'decimal', precision: 14, scale: 2 })
  bookValue!: number;

  @Column({ type: 'enum', enum: FixedAssetStatus, default: FixedAssetStatus.DRAFT })
  status!: FixedAssetStatus;

  @Column({ type: 'varchar', length: 500, nullable: true })
  location?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;
}
