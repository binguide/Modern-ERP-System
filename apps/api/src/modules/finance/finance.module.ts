import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FiscalYear } from './entities/fiscal-year.entity';
import { Period } from './entities/period.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FiscalYear, Period])],
  exports: [TypeOrmModule],
})
export class FinanceModule {}
