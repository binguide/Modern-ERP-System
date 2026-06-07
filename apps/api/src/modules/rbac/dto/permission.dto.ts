import { IsString, IsIn } from 'class-validator';

export class PermissionDto {
  @IsString()
  resource!: string;

  @IsString()
  @IsIn(['create', 'read', 'update', 'delete', 'manage'])
  action!: string;

  @IsString()
  @IsIn(['company', 'branch', 'own'])
  scope!: string;
}
