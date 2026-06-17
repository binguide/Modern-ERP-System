import { IsString, IsOptional, IsBoolean, IsNumber, Min } from 'class-validator';

export class CreateAssetCategoryDto {
  @IsString()
  code!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  depreciationMethod?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  usefulLifeYears?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  salvageValuePct?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateAssetCategoryDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  depreciationMethod?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  usefulLifeYears?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  salvageValuePct?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class QueryAssetCategoriesDto {
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

  @IsOptional()
  @IsString()
  search?: string;
}
