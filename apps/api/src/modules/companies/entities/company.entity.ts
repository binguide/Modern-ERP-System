import { Column, DeleteDateColumn, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('companies')
@Index('idx_companies_code', ['code'], { unique: true, where: '"deleted_at" IS NULL' })
export class Company extends BaseEntity {
  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @Column({ type: 'varchar', length: 50 })
  code!: string;

  @Column({ name: 'base_currency', type: 'varchar', length: 3, default: 'SAR' })
  baseCurrency!: string;

  @Column({ name: 'default_locale', type: 'varchar', length: 5, default: 'ar' })
  defaultLocale!: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'logo_url', type: 'varchar', length: 500, nullable: true })
  logoUrl?: string | null;

  @Column({ name: 'tax_id', type: 'varchar', length: 50, nullable: true })
  taxId?: string | null;

  @Column({ name: 'phone', type: 'varchar', length: 30, nullable: true })
  phone?: string | null;

  @Column({ name: 'email', type: 'varchar', length: 200, nullable: true })
  email?: string | null;

  @Column({ name: 'address', type: 'text', nullable: true })
  address?: string | null;

  @Column({ name: 'settings', type: 'jsonb', nullable: true })
  settings?: Record<string, unknown> | null;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt?: Date;
}
