import { Column, Entity, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Item } from './item.entity';
import { UnitOfMeasure } from './unit-of-measure.entity';

@Entity('item_units')
@Index('idx_item_units_item', ['itemId'])
export class ItemUnit extends BaseEntity {
  @ManyToOne(() => Item, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_id' })
  item?: Item;

  @Column({ name: 'item_id', type: 'uuid' })
  itemId!: string;

  @ManyToOne(() => UnitOfMeasure, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'unit_id' })
  unit?: UnitOfMeasure;

  @Column({ name: 'unit_id', type: 'uuid' })
  unitId!: string;

  @Column({ name: 'conversion_rate', type: 'decimal', precision: 12, scale: 4, default: 1 })
  conversionRate!: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  barcode?: string;

  @Column({ name: 'cost_price', type: 'decimal', precision: 12, scale: 2, default: 0 })
  costPrice!: number;

  @Column({ name: 'selling_price', type: 'decimal', precision: 12, scale: 2, default: 0 })
  sellingPrice!: number;

  @Column({ name: 'is_default', type: 'boolean', default: false })
  isDefault!: boolean;
}
