export type Locale = 'ar' | 'en';

export type ID = string;

export interface BaseEntity {
  id: ID;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  createdBy?: ID;
  updatedBy?: ID;
}

export interface TenantScoped {
  companyId: ID;
}

export type Action = 'create' | 'read' | 'update' | 'delete' | 'approve' | 'export' | 'manage';

export type Permission = `${Action}:${string}`;

export type Scope = 'own' | 'branch' | 'company' | 'all';

export interface User extends BaseEntity, TenantScoped {
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  isActive: boolean;
  lastLoginAt?: string | null;
  branchId?: ID | null;
  roles: string[];
  permissions: Permission[];
}

export interface Company extends BaseEntity {
  name: string;
  code: string;
  baseCurrency: string;
  defaultLocale: Locale;
  isActive: boolean;
}

export interface Branch extends BaseEntity, TenantScoped {
  name: string;
  code: string;
  isDefault: boolean;
  isActive: boolean;
}

export interface Role extends BaseEntity, TenantScoped {
  code: string;
  name: string;
  description?: string;
  isSystem: boolean;
}

export interface RolePermission {
  id: ID;
  roleId: ID;
  resource: string;
  action: Action;
  scope: Scope;
}

export interface Currency extends BaseEntity {
  code: string;
  name: string;
  symbol: string;
  isBase: boolean;
}

export interface ExchangeRate extends BaseEntity {
  currencyId: ID;
  rate: number;
  effectiveDate: string;
}

export interface AuditLog extends BaseEntity {
  userId: ID;
  companyId: ID;
  entityType: string;
  entityId: ID;
  action: Action;
  oldValue?: Record<string, unknown> | null;
  newValue?: Record<string, unknown> | null;
  ip?: string;
  userAgent?: string;
}

export type QuotationStatus = 'draft' | 'sent' | 'reviewing' | 'accepted' | 'rejected' | 'expired';

export interface Quotation extends BaseEntity, TenantScoped {
  number: string;
  customerId: ID;
  issueDate: string;
  validUntil: string;
  currencyCode: string;
  exchangeRate: number;
  status: QuotationStatus;
  version: number;
  totalAmount: number;
  totalAmountBase: number;
  notes?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiSuccess<T> {
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
  details?: Array<{ field: string; message: string }>;
  path?: string;
  timestamp?: string;
}
