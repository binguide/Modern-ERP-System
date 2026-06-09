import { Column, Entity, Index, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { TenantEntity } from '../../../common/entities/tenant.entity';
import { Company } from '../../companies/entities/company.entity';
import { Item } from './item.entity';

@Entity('warehouses')
@Index('idx_warehouses_company', ['companyId'])
@Index('idx_warehouses_code_company', ['code', 'companyId'], {
  unique: true,
  where: '"deleted_at" IS NULL',
})
export class Warehouse extends TenantEntity {
  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company?: Company;

  @Column({ type: 'varchar', length: 20 })
  code!: string;

  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  address?: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @OneToMany(() => Item, (item) => item.defaultWarehouse)
  items?: Item[];
}
