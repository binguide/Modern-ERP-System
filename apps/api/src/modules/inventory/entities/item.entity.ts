import { Column, Entity, Index, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { TenantEntity } from '../../../common/entities/tenant.entity';
import { Company } from '../../companies/entities/company.entity';
import { Warehouse } from './warehouse.entity';
import { ItemGroup } from './item-group.entity';
import { ItemUnit } from './item-unit.entity';

export enum ItemType {
  PRODUCT = 'product',
  SERVICE = 'service',
}

@Entity('items')
@Index('idx_items_company', ['companyId'])
@Index('idx_items_sku_company', ['sku', 'companyId'], {
  unique: true,
  where: '"deleted_at" IS NULL',
})
export class Item extends TenantEntity {
  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company?: Company;

  @Column({ type: 'varchar', length: 50 })
  sku!: string;

  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: ItemType, default: ItemType.PRODUCT })
  type!: ItemType;

  @Column({ name: 'cost_price', type: 'decimal', precision: 12, scale: 2, default: 0 })
  costPrice!: number;

  @Column({ name: 'selling_price', type: 'decimal', precision: 12, scale: 2, default: 0 })
  sellingPrice!: number;

  @Column({ name: 'item_group_id', type: 'uuid', nullable: true })
  itemGroupId?: string;

  @ManyToOne(() => ItemGroup, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'item_group_id' })
  itemGroup?: ItemGroup;

  @Column({ name: 'image_url', type: 'varchar', length: 500, nullable: true })
  imageUrl?: string;

  @Column({ name: 'reorder_point', type: 'decimal', precision: 12, scale: 2, default: 0 })
  reorderPoint!: number;

  @Column({ name: 'reorder_quantity', type: 'decimal', precision: 12, scale: 2, default: 0 })
  reorderQuantity!: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'default_warehouse_id', type: 'uuid', nullable: true })
  defaultWarehouseId?: string;

  @ManyToOne(() => Warehouse, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'default_warehouse_id' })
  defaultWarehouse?: Warehouse;

  @OneToMany(() => ItemUnit, (iu) => iu.item, { cascade: true, eager: true })
  units?: ItemUnit[];
}
