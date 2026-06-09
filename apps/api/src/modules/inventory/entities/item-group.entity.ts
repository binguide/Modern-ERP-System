import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { TenantEntity } from '../../../common/entities/tenant.entity';
import { Company } from '../../companies/entities/company.entity';

@Entity('item_groups')
@Index('idx_item_groups_company', ['companyId'])
@Index('idx_item_groups_code_company', ['code', 'companyId'], {
  unique: true,
  where: '"deleted_at" IS NULL',
})
export class ItemGroup extends TenantEntity {
  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company?: Company;

  @Column({ type: 'varchar', length: 20 })
  code!: string;

  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description?: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;
}
