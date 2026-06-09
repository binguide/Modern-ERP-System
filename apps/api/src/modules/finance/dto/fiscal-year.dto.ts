import { IsOptional, IsString, IsBoolean, IsDateString, IsNumber, IsUUID } from 'class-validator';

export class CreateFiscalYearDto {
  @IsString()
  code!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsBoolean()
  isClosed?: boolean;
}

export class UpdateFiscalYearDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsBoolean()
  isClosed?: boolean;
}

export class CreatePeriodDto {
  @IsUUID()
  fiscalYearId!: string;

  @IsString()
  name!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsNumber()
  order!: number;

  @IsOptional()
  @IsBoolean()
  isClosed?: boolean;
}

export class UpdatePeriodDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  order?: number;

  @IsOptional()
  @IsBoolean()
  isClosed?: boolean;
}

export class QueryFiscalYearsDto {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC';
}

export class QueryPeriodsDto {
  @IsOptional()
  @IsUUID()
  fiscalYearId?: string;

  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;
}
