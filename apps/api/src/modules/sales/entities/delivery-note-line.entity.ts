import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { DeliveryNote } from './delivery-note.entity';

@Entity('delivery_note_lines')
export class DeliveryNoteLine extends BaseEntity {
  @Column({ name: 'delivery_note_id', type: 'uuid' })
  deliveryNoteId!: string;

  @ManyToOne(() => DeliveryNote, (dn) => dn.lines, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'delivery_note_id' })
  deliveryNote?: DeliveryNote;

  @Column({ name: 'item_id', type: 'uuid', nullable: true })
  itemId?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  quantity!: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  unit?: string;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  rate!: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  amount!: number;
}
