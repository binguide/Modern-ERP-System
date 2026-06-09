import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { TenantEntity } from '../../../common/entities/tenant.entity';
import { Company } from '../../companies/entities/company.entity';

@Entity('units_of_measure')
@Index('idx_uom_company', ['companyId'])
@Index('idx_uom_code_company', ['code', 'companyId'], {
  unique: true,
  where: '"deleted_at" IS NULL',
})
export class UnitOfMeasure extends TenantEntity {
  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company?: Company;

  @Column({ type: 'varchar', length: 20 })
  code!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;
}
