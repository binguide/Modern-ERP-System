import {
  IsString,
  IsOptional,
  IsDateString,
  IsUUID,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class JournalEntryLineDto {
  @IsUUID()
  accountId!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  debit!: number;

  @IsNumber()
  @Min(0)
  credit!: number;
}

export class CreateJournalEntryDto {
  @IsDateString()
  date!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsUUID()
  fiscalYearId!: string;

  @IsUUID()
  periodId!: string;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JournalEntryLineDto)
  lines!: JournalEntryLineDto[];
}

export class UpdateJournalEntryDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  fiscalYearId?: string;

  @IsOptional()
  @IsUUID()
  periodId?: string;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JournalEntryLineDto)
  lines?: JournalEntryLineDto[];
}

export class QueryJournalEntryDto {
  @IsOptional()
  @IsUUID()
  fiscalYearId?: string;

  @IsOptional()
  @IsUUID()
  periodId?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;
}
