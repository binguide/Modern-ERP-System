import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { JournalEntry } from './journal-entry.entity';
import { Account } from './account.entity';

@Entity('journal_entry_lines')
export class JournalEntryLine extends BaseEntity {
  @Column({ name: 'journal_entry_id', type: 'uuid' })
  journalEntryId!: string;

  @ManyToOne(() => JournalEntry, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'journal_entry_id' })
  journalEntry?: JournalEntry;

  @Column({ name: 'account_id', type: 'uuid' })
  accountId!: string;

  @ManyToOne(() => Account, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'account_id' })
  account?: Account;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description?: string | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  debit!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  credit!: number;
}
