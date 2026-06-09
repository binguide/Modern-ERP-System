import {
  Column,
  Entity,
  Index,
  ManyToOne,
  JoinColumn,
  Tree,
  TreeChildren,
  TreeParent,
} from 'typeorm';
import { TenantEntity } from '../../../common/entities/tenant.entity';
import { Company } from '../../companies/entities/company.entity';

export enum AccountType {
  ASSET = 'asset',
  LIABILITY = 'liability',
  EQUITY = 'equity',
  INCOME = 'income',
  EXPENSE = 'expense',
}

@Entity('accounts')
@Index('idx_accounts_company', ['companyId'])
@Index('idx_accounts_code_company', ['code', 'companyId'], {
  unique: true,
  where: '"deleted_at" IS NULL',
})
@Tree('materialized-path')
export class Account extends TenantEntity {
  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company?: Company;

  @Column({ type: 'varchar', length: 20 })
  code!: string;

  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @Column({ name: 'name_en', type: 'varchar', length: 200, nullable: true })
  nameEn?: string | null;

  @Column({ type: 'enum', enum: AccountType })
  type!: AccountType;

  @Column({ name: 'parent_id', type: 'uuid', nullable: true })
  parentId?: string | null;

  @TreeParent()
  @JoinColumn({ name: 'parent_id' })
  parent?: Account;

  @TreeChildren()
  children?: Account[];

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'opening_balance', type: 'decimal', precision: 15, scale: 2, default: 0 })
  openingBalance!: number;

  @Column({ name: 'current_balance', type: 'decimal', precision: 15, scale: 2, default: 0 })
  currentBalance!: number;
}
