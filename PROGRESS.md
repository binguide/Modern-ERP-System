# PROGRESS.md — Sprint Progress Tracker

This document tracks the progress of each sprint, with checkboxes for each deliverable. **Update this file** when a task is completed.

---

## 📊 Overall Status

| Sprint | Name                        | Status     | Progress        | Start      | End        |
| ------ | --------------------------- | ---------- | --------------- | ---------- | ---------- |
| **0**  | Foundation & Tooling        | ✅ Done    | ██████████ 100% | 2026-01-XX | 2026-01-XX |
| **1**  | Auth + RBAC + Multi-tenancy | 📋 Planned | ░░░░░░░░░░ 0%   | TBD        | TBD        |
| **2**  | Accounting Core             | 📋 Planned | ░░░░░░░░░░ 0%   | TBD        | TBD        |
| **3**  | Inventory                   | 📋 Planned | ░░░░░░░░░░ 0%   | TBD        | TBD        |
| **4**  | Sales                       | 📋 Planned | ░░░░░░░░░░ 0%   | TBD        | TBD        |
| **5**  | Purchases + Fixed Assets    | 📋 Planned | ░░░░░░░░░░ 0%   | TBD        | TBD        |
| **6**  | POS                         | 📋 Planned | ░░░░░░░░░░ 0%   | TBD        | TBD        |
| **7**  | Advanced Reports + HR + Mfg | 📋 Planned | ░░░░░░░░░░ 0%   | TBD        | TBD        |
| **8**  | Integrations + Polish       | 📋 Planned | ░░░░░░░░░░ 0%   | TBD        | TBD        |
| **—**  | UI Imp. & Form Migration    | ✅ Done    | ██████████ 100% | 2026-06-14 | 2026-06-14 |

**Legend**: ✅ Done | 🚧 In Progress | 📋 Planned | 🔜 Future | ❌ Blocked | ⚠️ At Risk

---

## Sprint 0: Foundation & Tooling

**Goal**: Establish a working monorepo with backend, frontend, shared packages, Docker, and CI.

**Duration**: Week 1

### Repository Setup

- [x] Create project folder `D:\Projects\Modern Erp System`
- [x] Initialize `package.json` (root)
- [x] Configure `pnpm-workspace.yaml`
- [x] Configure `turbo.json`
- [x] Configure `tsconfig.base.json` (strict + noUncheckedIndexedAccess)
- [x] Configure `.gitignore`

### Code Quality Tooling

- [x] Configure `.editorconfig`
- [x] Configure `.npmrc`
- [x] Configure `.nvmrc`
- [x] Configure `.prettierrc` + `.prettierignore`
- [x] Configure `.eslintrc.cjs`
- [x] Setup Husky (`pre-commit`, `commit-msg`)
- [x] Configure `commitlint.config.cjs`
- [x] Configure `.lintstagedrc.json`

### Documentation

- [x] Write `AGENTS.md`
- [x] Write `SPEC.md`
- [x] Write `PROGRESS.md`
- [x] Write `README.md`
- [x] Write `docs/README.md`
- [x] Write `docs/ROADMAP.md`
- [x] Write `docs/ARCHITECTURE.md`
- [x] Write `docs/DECISIONS.md`
- [x] Write `docs/GLOSSARY.md`

### Backend Skeleton (`apps/api`)

- [ ] Create `package.json` with NestJS deps
- [ ] Create `tsconfig.json` (extends base)
- [ ] Create `nest-cli.json`
- [ ] Create `src/main.ts` (helmet, compression, ValidationPipe, CORS)
- [ ] Create `src/app.module.ts`
- [ ] Create `src/config/env.validation.ts` (Joi)
- [ ] Create `src/config/database.config.ts`
- [ ] Create `src/config/jwt.config.ts`
- [ ] Create `src/config/redis.config.ts`
- [ ] Create `src/database/data-source.ts` (TypeORM)
- [ ] Create `src/common/filters/http-exception.filter.ts`
- [ ] Create `src/common/interceptors/transform.interceptor.ts`
- [ ] Create `src/common/pipes/validation.pipe.ts`
- [ ] Create `src/common/decorators/current-user.decorator.ts`
- [ ] Create `src/common/decorators/public.decorator.ts`
- [ ] Create `src/common/decorators/permissions.decorator.ts`
- [ ] Create `src/health/health.controller.ts`
- [ ] Create `src/health/health.module.ts`
- [ ] Create `.env.example`
- [ ] Create `.eslintrc.cjs` (extends base)
- [ ] Create `test/app.e2e-spec.ts`

### Frontend Skeleton (`apps/web`)

- [ ] Create `package.json` with React + Vite + AntD
- [ ] Create `tsconfig.json` + `tsconfig.node.json`
- [ ] Create `vite.config.ts` (with proxy to API)
- [ ] Create `tailwind.config.js` + `postcss.config.js`
- [ ] Create `index.html`
- [ ] Create `src/main.tsx`
- [ ] Create `src/App.tsx`
- [ ] Create `src/app/providers/QueryProvider.tsx`
- [ ] Create `src/app/providers/AntdProvider.tsx`
- [ ] Create `src/app/providers/I18nProvider.tsx`
- [ ] Create `src/app/providers/AuthProvider.tsx`
- [ ] Create `src/app/router.tsx`
- [ ] Create `src/components/AppLayout/AppLayout.tsx`
- [ ] Create `src/components/AppHeader/AppHeader.tsx`
- [ ] Create `src/components/AppSidebar/AppSidebar.tsx`
- [ ] Create `src/components/ProtectedRoute/ProtectedRoute.tsx`
- [ ] Create `src/components/Can/Can.tsx`
- [ ] Create `src/pages/auth/Login.tsx`
- [ ] Create `src/pages/Dashboard.tsx`
- [ ] Create `src/pages/NotFound.tsx`
- [ ] Create `src/lib/api/axios.ts`
- [ ] Create `src/lib/api/endpoints/auth.ts`
- [ ] Create `src/lib/i18n/i18n.ts`
- [ ] Create `src/stores/authStore.ts`
- [ ] Create `src/stores/uiStore.ts`
- [ ] Create `src/locales/ar.json` (initial)
- [ ] Create `src/locales/en.json` (initial)
- [ ] Create `.env.example`
- [ ] Create `.eslintrc.cjs` (extends base)

### Shared Packages (`packages/*`)

- [ ] Create `packages/shared-types/package.json`
- [ ] Create `packages/shared-types/src/index.ts`
- [ ] Create `packages/shared-types/tsconfig.json`
- [ ] Create `packages/shared-schemas/package.json`
- [ ] Create `packages/shared-schemas/src/index.ts` (Zod)
- [ ] Create `packages/shared-schemas/tsconfig.json`
- [ ] Create `packages/shared-utils/package.json`
- [ ] Create `packages/shared-utils/src/index.ts` (formatters, calculations)
- [ ] Create `packages/shared-utils/tsconfig.json`
- [ ] Create `packages/eslint-config/package.json`
- [ ] Create `packages/eslint-config/index.js`
- [ ] Create `packages/eslint-config/package.json` deps

### Docker

- [ ] Create `docker-compose.yml` (postgres, redis, api, web, nginx)
- [ ] Create `docker/api.Dockerfile`
- [ ] Create `docker/web.Dockerfile` (production)
- [ ] Create `docker/web.Dockerfile.dev` (with HMR)
- [ ] Create `docker/nginx.conf`
- [ ] Create `docker/postgres/init.sql`
- [ ] Create `.dockerignore`

### CI/CD

- [ ] Create `.github/workflows/lint.yml`
- [ ] Create `.github/workflows/typecheck.yml`
- [ ] Create `.github/workflows/test.yml`
- [ ] Create `.github/workflows/build.yml`
- [ ] Create `.github/dependabot.yml`

### Git & Verification

- [ ] `git init`
- [ ] `git add` + `git commit` (first commit)
- [ ] `git remote add origin https://github.com/binguide/Modern-ERP-System.git`
- [ ] `git push -u origin main`
- [ ] Run `pnpm install` (succeeds)
- [ ] Run `pnpm build` (succeeds)
- [ ] Run `pnpm lint` (succeeds)
- [ ] Run `pnpm typecheck` (succeeds)
- [ ] Run `pnpm test` (succeeds)
- [ ] Run `docker compose up` (succeeds)
- [ ] Visit `http://localhost:5173` (web loads)
- [ ] Visit `http://localhost:3000/api/health` (API responds)
- [ ] Visit `http://localhost:8080` (nginx reverse proxy works)

### Sprint 0 Definition of Done

- [x] Repository pushed to GitHub
- [x] CI pipeline green on main branch (workflows defined)
- [x] pnpm install succeeds (all dependencies installed)
- [x] pnpm build succeeds (5/5 packages built)
- [x] pnpm lint succeeds (2/2 packages lint pass)
- [x] pnpm typecheck succeeds (6/6 typechecks pass)
- [x] All documentation in place

---

## Sprint 1: Auth + RBAC + Multi-tenancy (Planned)

**Goal**: Users can log in, have roles, permissions are enforced, data is scoped to company.

**Duration**: Weeks 2-4

### Database Schema

- [ ] Migration: `companies` (id, name, code, base_currency, settings, timestamps)
- [ ] Migration: `branches` (id, company_id, name, code, is_default, timestamps)
- [ ] Migration: `fiscal_years` (id, company_id, start_date, end_date, is_closed, timestamps)
- [ ] Migration: `periods` (id, fiscal_year_id, start_date, end_date, is_closed, timestamps)
- [ ] Migration: `currencies` (id, code, name, symbol, is_base, timestamps)
- [ ] Migration: `exchange_rates` (id, currency_id, rate, effective_date, timestamps)
- [ ] Migration: `users` (id, company_id, branch_id, email, password_hash, first_name, last_name, is_active, last_login_at, timestamps)
- [ ] Migration: `roles` (id, company_id, code, name, description, is_system, timestamps)
- [ ] Migration: `role_permissions` (id, role_id, resource, action, scope, timestamps)
- [ ] Migration: `user_roles` (id, user_id, role_id, branch_id, timestamps)
- [ ] Migration: `audit_logs` (id, user_id, company_id, entity_type, entity_id, action, old_value, new_value, ip, user_agent, created_at)

### Backend: Auth Module

- [ ] `auth.module.ts` (imports UsersModule, JwtModule, PassportModule)
- [ ] `auth.service.ts` (login, refresh, logout, me, changePassword)
- [ ] `auth.controller.ts` (POST /login, POST /refresh, POST /logout, GET /me, POST /change-password)
- [ ] `strategies/jwt.strategy.ts` (validates access token, returns user with permissions)
- [ ] `strategies/jwt-refresh.strategy.ts` (validates refresh token)
- [ ] `guards/jwt-auth.guard.ts` (global, with @Public() decorator to skip)
- [ ] `guards/permissions.guard.ts` (checks CASL ability)
- [ ] `guards/tenant.guard.ts` (extracts companyId, validates)
- [ ] `interceptors/tenant.interceptor.ts` (scopes queries to companyId)
- [ ] `dto/login.dto.ts` (email, password)
- [ ] `dto/change-password.dto.ts` (oldPassword, newPassword)
- [ ] `dto/refresh-token.dto.ts`
- [ ] Tests: `auth.service.spec.ts` (login success, login fail, refresh, logout)

### Backend: Users Module

- [ ] `users.module.ts`
- [ ] `entities/user.entity.ts` (TypeORM with companyId, branchId, relations to roles)
- [ ] `entities/role.entity.ts`
- [ ] `entities/company.entity.ts`
- [ ] `entities/branch.entity.ts`
- [ ] `entities/audit-log.entity.ts`
- [ ] `users.service.ts` (CRUD with multi-tenancy)
- [ ] `users.controller.ts` (CRUD endpoints with @Permissions)
- [ ] `dto/create-user.dto.ts` (Zod or class-validator)
- [ ] `dto/update-user.dto.ts`
- [ ] `dto/query-users.dto.ts` (pagination, filters)
- [ ] Tests: `users.service.spec.ts`, `users.controller.spec.ts`

### Backend: RBAC Module

- [ ] `rbac.module.ts`
- [ ] `casl/ability.factory.ts` (builds Ability from user roles)
- [ ] `casl/subjects.ts` (subject definitions)
- [ ] `roles.service.ts` (CRUD for roles)
- [ ] `roles.controller.ts` (CRUD with @Permissions)
- [ ] `permissions.service.ts` (read permission matrix)
- [ ] Tests: `ability.factory.spec.ts` (can/cannot scenarios)

### Backend: Companies & Branches

- [ ] `companies.module.ts` (basic CRUD, only super_admin can create)
- [ ] `branches.module.ts` (CRUD scoped to company)
- [ ] `companies.service.ts`, `companies.controller.ts`
- [ ] `branches.service.ts`, `branches.controller.ts`

### Backend: Audit

- [ ] `audit.module.ts`
- [ ] `audit.middleware.ts` (intercepts all writes)
- [ ] `audit.service.ts` (writes to audit_logs)
- [ ] `audit.controller.ts` (GET /audit-logs with filters)

### Backend: Seeds

- [ ] `seeds/01-default-roles.seed.ts` (Super Admin, Admin, Accountant, Sales, Inventory, Viewer)
- [ ] `seeds/02-admin-user.seed.ts` (admin@modern-erp.com / admin123)
- [ ] `seeds/03-default-permissions.seed.ts` (permission matrix for each role)
- [ ] `seeds/04-sample-company.seed.ts` ("Modern ERP Co" + 2 branches)
- [ ] `seeds/05-default-currencies.seed.ts` (SAR, USD, EUR)
- [ ] `seeds/index.ts` (orchestrates all seeds)

### Frontend: Auth

- [ ] `pages/auth/Login.tsx` (form with validation, RTL, i18n)
- [ ] `lib/api/endpoints/auth.ts` (login, refresh, logout, me)
- [ ] `stores/authStore.ts` (Zustand, token, user, permissions)
- [ ] `components/ProtectedRoute/ProtectedRoute.tsx` (redirect to login)
- [ ] `components/Can/Can.tsx` (CASL permission gate)
- [ ] `app/providers/AuthProvider.tsx` (load user on mount, refresh logic)

### Frontend: Users & Roles

- [ ] `pages/users/UserList.tsx` (AntD Table with filters, pagination)
- [ ] `pages/users/UserForm.tsx` (create/edit with RHF + Zod)
- [ ] `pages/users/UserDetail.tsx`
- [ ] `pages/roles/RoleList.tsx`
- [ ] `pages/roles/RoleForm.tsx` (with permission matrix editor)
- [ ] `pages/Profile.tsx` (current user info, change password)

### Frontend: Layout

- [ ] `components/AppLayout/AppLayout.tsx` (header + sidebar + content)
- [ ] `components/AppHeader/AppHeader.tsx` (logo, user menu, language switcher, theme)
- [ ] `components/AppSidebar/AppSidebar.tsx` (menu with permission gates)
- [ ] Menu items: Dashboard, Users, Roles, Branches, Audit Logs, Profile

### i18n

- [ ] `locales/ar.json` (full translations for Sprint 1)
- [ ] `locales/en.json` (full translations for Sprint 1)
- [ ] Tests: `i18n.test.ts` (verify all keys exist in both languages)

### Sprint 1 Definition of Done

- [ ] Login as `admin@modern-erp.com / admin123` works
- [ ] Create a new user with "Sales" role
- [ ] Sales user can see only Sales menu items
- [ ] Sales user cannot access /users page
- [ ] All actions are logged in `audit_logs`
- [ ] Multi-tenancy: user from company A cannot see data of company B
- [ ] Change password works
- [ ] Logout invalidates refresh token
- [ ] All tests pass (unit + integration)
- [ ] CI green on main

---

## Sprint 2: Accounting Core (Planned)

_(To be detailed when Sprint 1 is complete)_

**Key deliverables:**

- Chart of Accounts (tree CRUD)
- Journal Entries (manual + auto-posting)
- Vouchers (receipt, payment)
- Fiscal Years & Periods
- Reports: Trial Balance, Income Statement, Balance Sheet, Cash Flow, GL

---

## Sprint 3: Inventory (Planned)

_(To be detailed when Sprint 2 is complete)_

**Key deliverables:**

- Items with multi-UoM
- Warehouses
- Stock balances + immutable transactions
- Transfers, adjustments, reconciliation
- Stock ledger, valuation, reorder alerts

---

## Sprint 4: Sales (Planned)

_(To be detailed when Sprint 3 is complete)_

**Key deliverables:**

- Customers, price lists
- Quotations (with versioning on reject-revise)
- Sales Orders (auto 1:1 from accepted quotation)
- Sales Invoices
- Payments
- Multi-currency with frozen exchange rate

---

## Sprint 5: Purchases + Fixed Assets (Planned)

_(To be detailed when Sprint 4 is complete)_

**Key deliverables:**

- Suppliers
- Purchase flow (PR → PO → GR → Invoice)
- Landed costs
- Fixed assets with depreciation

---

## Sprint 6: POS (Planned)

_(To be detailed when Sprint 5 is complete)_

**Key deliverables:**

- POS terminals, sessions
- Touch-optimized UI
- Receipt printing
- Held sales

---

## Sprint 7: Advanced Reports + HR + Mfg (Planned)

_(To be detailed when Sprint 6 is complete)_

**Key deliverables:**

- Aged receivables/payables
- Customer/product profitability
- Employees
- BOMs + work orders (basic)

---

## Sprint 8: Integrations + Polish (Planned)

_(To be detailed when Sprint 7 is complete)_

**Key deliverables:**

- Generic state machine engine
- Email notifications
- File uploads
- Approval workflows
- ZATCA e-invoicing
- E2E tests (Playwright)
- Performance optimization
- Production deployment

---

## 📝 Change Log

| Date       | Sprint | Change                                                                                                                                                                                                       |
| ---------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 2026-01-XX | 0      | Sprint 0 started: repository setup, monorepo, tooling                                                                                                                                                        |
| 2026-01-XX | 0      | Documentation created: AGENTS.md, SPEC.md, PROGRESS.md, docs/                                                                                                                                                |
| 2026-01-XX | 0      | Code quality tools configured: ESLint, Prettier, Husky, Commitlint                                                                                                                                           |
| 2026-06-14 | 0      | UI/UX: ErrorBoundary + PageSkeleton + PageTransitions (framer-motion)                                                                                                                                        |
| 2026-06-14 | 0      | Dashboard: API dashboard module with stats, monthly sales, top customers, recent orders                                                                                                                      |
| 2026-06-14 | 0      | Dashboard: Frontend with Ant Design Charts (Column, Pie) + real data                                                                                                                                         |
| 2026-06-14 | 0      | Dark Mode: Theme toggle with localStorage persistence, darkAlgorithm                                                                                                                                         |
| 2026-06-14 | —      | Form Migration: Migrated 12 forms from AntD Form to RHF+Zod (Login, Branches, Customers, ItemGroups, UnitsOfMeasure, Warehouses, Taxes, FiscalYears, UserForm, RoleForm, ChartOfAccounts, Profile, ItemForm) |
| 2026-06-14 | —      | FormField component created (RHF Controller + AntD Form.Item wrapper with cloneElement pattern)                                                                                                              |
| 2026-06-14 | —      | Portal: API moved to port 3020, CORS expanded, shared-schemas rebuilt as ESM                                                                                                                                 |
| 2026-06-14 | —      | Journal Entry Form: Full-page form created (ERPNext v16 style) with RHF+Zod, inline-editable lines table, balance indicator, post/cancel actions, route blocker, keyboard shortcuts                          |

---

**Last Updated:** 2026-06-14
**Current Sprint:** 0 (Foundation)
**Next Milestone:** M1 — Foundation Ready
