import { IsString, IsOptional, IsBoolean, IsNumber, MaxLength, MinLength } from 'class-validator';

export class CreateCurrencyDto {
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  code!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsNumber()
  exchangeRate?: number;

  @IsOptional()
  @IsBoolean()
  isBase?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
