import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Company } from '../../modules/companies/entities/company.entity';
import { Branch } from '../../modules/branches/entities/branch.entity';
import { User } from '../../modules/users/entities/user.entity';
import { UserRole } from '../../modules/users/entities/user-role.entity';
import { Role } from '../../modules/rbac/entities/role.entity';
import { RolePermission } from '../../modules/rbac/entities/role-permission.entity';
import { Currency } from '../../modules/currencies/entities/currency.entity';

const DEFAULT_PERMISSIONS = [
  { resource: 'companies', action: 'manage', scope: 'company' },
  { resource: 'branches', action: 'manage', scope: 'company' },
  { resource: 'users', action: 'manage', scope: 'company' },
  { resource: 'roles', action: 'manage', scope: 'company' },
  { resource: 'currencies', action: 'manage', scope: 'company' },
  { resource: 'fiscal-years', action: 'manage', scope: 'company' },
  { resource: 'periods', action: 'manage', scope: 'company' },
  { resource: 'transactions', action: 'manage', scope: 'company' },
  { resource: 'accounts', action: 'manage', scope: 'company' },
  { resource: 'journal-entries', action: 'manage', scope: 'company' },
  { resource: 'reports', action: 'manage', scope: 'company' },
  { resource: 'audit-logs', action: 'read', scope: 'company' },
  { resource: 'settings', action: 'manage', scope: 'company' },
];

const ROLE_DEFINITIONS: Array<{
  code: string;
  name: string;
  description: string;
  permissions: typeof DEFAULT_PERMISSIONS;
}> = [
  {
    code: 'admin',
    name: 'مدير النظام',
    description: 'Full system administrator with all permissions',
    permissions: DEFAULT_PERMISSIONS,
  },
  {
    code: 'accountant',
    name: 'محاسب',
    description: 'Accountant with finance-related permissions',
    permissions: DEFAULT_PERMISSIONS.filter((p) =>
      [
        'currencies',
        'fiscal-years',
        'periods',
        'transactions',
        'accounts',
        'journal-entries',
        'reports',
      ].includes(p.resource),
    ),
  },
  {
    code: 'manager',
    name: 'مدير',
    description: 'Manager with read access and report viewing',
    permissions: DEFAULT_PERMISSIONS.filter(
      (p) => ['reports', 'audit-logs'].includes(p.resource) || p.action === 'read',
    ),
  },
  {
    code: 'cashier',
    name: 'أمين صندوق',
    description: 'Cashier with transaction creation permissions',
    permissions: DEFAULT_PERMISSIONS.filter(
      (p) => ['transactions', 'accounts'].includes(p.resource) && p.action !== 'delete',
    ).map((p) => ({ ...p, scope: 'branch' as const })),
  },
  {
    code: 'viewer',
    name: 'مشاهد',
    description: 'Read-only access to permitted resources',
    permissions: DEFAULT_PERMISSIONS.filter((p) => p.action === 'read' || p.action === 'manage'),
  },
];

export async function seedDatabase(dataSource: DataSource) {
  const companyRepo = dataSource.getRepository(Company);
  const branchRepo = dataSource.getRepository(Branch);
  const roleRepo = dataSource.getRepository(Role);
  const rolePermissionRepo = dataSource.getRepository(RolePermission);
  const userRepo = dataSource.getRepository(User);
  const userRoleRepo = dataSource.getRepository(UserRole);
  const currencyRepo = dataSource.getRepository(Currency);

  const existingCompany = await companyRepo.findOneBy({ code: 'DEFAULT' } as any);
  if (existingCompany) {
    console.log('Database already seeded, skipping...');
    return;
  }

  console.log('Seeding database...');

  const company = (await companyRepo.save(
    companyRepo.create({
      name: 'الشركة الافتراضية',
      code: 'DEFAULT',
      baseCurrency: 'SAR',
      defaultLocale: 'ar',
      isActive: true,
    } as any),
  )) as unknown as Company;

  const branch = (await branchRepo.save(
    branchRepo.create({
      name: 'الفرع الرئيسي',
      code: 'HQ',
      companyId: company.id,
      isDefault: true,
      isActive: true,
    } as any),
  )) as unknown as Branch;

  const roles: Role[] = [];
  for (const def of ROLE_DEFINITIONS) {
    const role = (await roleRepo.save(
      roleRepo.create({
        code: def.code,
        name: def.name,
        description: def.description,
        companyId: company.id,
        isSystem: true,
      } as any),
    )) as unknown as Role;

    if (def.permissions.length) {
      const permEntities = def.permissions.map((p) =>
        rolePermissionRepo.create({
          roleId: role.id,
          resource: p.resource,
          action: p.action,
          scope: p.scope,
        } as any),
      );
      await rolePermissionRepo.save(permEntities as any);
    }
    roles.push(role);
  }

  const adminUser = (await userRepo.save(
    userRepo.create({
      email: 'admin@modern-erp.com',
      passwordHash: await bcrypt.hash('admin123', 12),
      firstName: 'مدير',
      lastName: 'النظام',
      companyId: company.id,
      branchId: branch.id,
      isActive: true,
      isSuperAdmin: true,
    } as any),
  )) as unknown as User;

  await userRoleRepo.save({ userId: adminUser.id, roleId: roles[0].id } as any);

  const currencyData = [
    { code: 'SAR', name: 'ريال سعودي', isBase: true, exchangeRate: 1, companyId: company.id },
    { code: 'USD', name: 'دولار أمريكي', isBase: false, exchangeRate: 3.75, companyId: company.id },
    { code: 'EUR', name: 'يورو', isBase: false, exchangeRate: 4.1, companyId: company.id },
  ];

  for (const c of currencyData) {
    await currencyRepo.save(currencyRepo.create(c as any));
  }

  console.log('Seeding complete!');
}
