import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FiscalYear } from './entities/fiscal-year.entity';
import { Period } from './entities/period.entity';
import { Account } from './entities/account.entity';
import { JournalEntry } from './entities/journal-entry.entity';
import { JournalEntryLine } from './entities/journal-entry-line.entity';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { JournalEntriesController } from './journal-entries.controller';
import { JournalEntriesService } from './journal-entries.service';
import { FiscalYearsController } from './fiscal-years.controller';
import { FiscalYearsService } from './fiscal-years.service';
import { PeriodsController } from './periods.controller';
import { PeriodsService } from './periods.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([FiscalYear, Period, Account, JournalEntry, JournalEntryLine]),
  ],
  controllers: [
    AccountsController,
    JournalEntriesController,
    FiscalYearsController,
    PeriodsController,
  ],
  providers: [AccountsService, JournalEntriesService, FiscalYearsService, PeriodsService],
  exports: [TypeOrmModule],
})
export class FinanceModule {}
