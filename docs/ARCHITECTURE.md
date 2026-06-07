# 🏗️ Architecture

This document describes the technical architecture of the Modern ERP System.

## 🎯 Goals

1. **Multi-tenant**: Single database, shared schema, company-scoped data
2. **Type-safe end-to-end**: TypeScript everywhere, Zod for validation
3. **Modular**: Feature-based, loosely coupled, independently testable
4. **Performant**: Caching, optimistic updates, lazy loading
5. **Secure**: RBAC + ABAC via CASL, JWT auth, audit log
6. **Observable**: Structured logging, error tracking, metrics

---

## 🛠️ Tech Stack

### Frontend (`apps/web`)

- **React 18** — UI library
- **Vite 5** — Build tool, dev server
- **TypeScript 5** (strict) — Type safety
- **Ant Design 5** — UI component library
- **TanStack Query 5** — Server state management
- **Zustand 4** — Client state management
- **React Router 6** — Routing
- **React Hook Form 7** — Form management
- **Zod 3** — Schema validation
- **i18next 23** — Internationalization
- **Recharts 2** — Charts and graphs
- **@react-pdf/renderer 3** — PDF generation
- **Day.js 1** — Date utilities
- **Axios 1** — HTTP client

### Backend (`apps/api`)

- **NestJS 10** — Framework
- **TypeScript 5** (strict)
- **TypeORM 0.3** — ORM
- **PostgreSQL 16** — Database
- **Redis 7** — Cache, sessions, queues
- **Passport.js + JWT** — Authentication
- **CASL** — Authorization (RBAC + ABAC)
- **class-validator + class-transformer** — DTO validation
- **Bull** — Job queue
- **Joi** — Environment validation
- **Helmet** — Security headers
- **Compression** — Response compression
- **@nestjs/swagger** — API documentation

### Shared (`packages/*`)

- **shared-types** — TypeScript types
- **shared-schemas** — Zod schemas (used FE+BE)
- **shared-utils** — Pure functions (formatters, calculations)
- **eslint-config** — Shared ESLint config

### Infrastructure

- **Docker + Docker Compose** — Containerization
- **Nginx** — Reverse proxy
- **GitHub Actions** — CI/CD
- **pnpm + Turborepo** — Monorepo management

---

## 📐 High-Level Architecture

```
┌─────────────────────────────────────────┐
│   Browser (React SPA + Ant Design)      │
└──────────────┬──────────────────────────┘
               │ HTTPS (JWT in headers)
               │
┌──────────────▼──────────────────────────┐
│   Nginx (Reverse Proxy + SSL + gzip)    │
└──────────────┬──────────────────────────┘
               │
       ┌───────┴────────┐
       │                │
┌──────▼──────┐  ┌──────▼──────┐
│ Web (Vite)  │  │  API (Nest) │
│ :5173 dev   │  │  :3000      │
└─────────────┘  └──────┬──────┘
                        │
              ┌─────────┼─────────┐
              │         │         │
        ┌─────▼───┐ ┌───▼────┐ ┌──▼─────┐
        │Postgres │ │ Redis  │ │  Bull  │
        │  :5432  │ │ :6379  │ │  Queue │
        └─────────┘ └────────┘ └────────┘
```

---

## 🏛️ Backend Architecture (NestJS)

### Module Structure

```
src/
├── main.ts                          # Entry point
├── app.module.ts                    # Root module
├── common/                          # Shared code
│   ├── decorators/                  # @CurrentUser, @Public, @Permissions
│   ├── filters/                     # HttpExceptionFilter (global)
│   ├── interceptors/                # TransformInterceptor, LoggingInterceptor
│   ├── pipes/                       # ValidationPipe (global)
│   ├── guards/                      # JwtAuthGuard, PermissionsGuard, TenantGuard
│   └── middleware/                  # TenantMiddleware, AuditMiddleware
├── config/                          # Configuration
│   ├── env.validation.ts            # Joi schema for env vars
│   ├── database.config.ts
│   ├── jwt.config.ts
│   └── redis.config.ts
├── database/
│   ├── data-source.ts               # TypeORM DataSource
│   ├── migrations/                  # DB migrations
│   └── seeds/                       # Initial data
├── modules/                         # Feature modules
│   ├── auth/                        # Authentication
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── strategies/              # JwtStrategy, RefreshStrategy
│   │   ├── dto/
│   │   └── guards/
│   ├── users/                       # User management
│   ├── rbac/                        # Roles, permissions, CASL
│   ├── companies/                   # Multi-tenant companies
│   ├── branches/                    # Company branches
│   ├── accounting/                  # Future: charts of accounts, journals
│   ├── inventory/                   # Future: items, stock
│   ├── sales/                       # Future: quotations, orders, invoices
│   ├── purchases/                   # Future
│   ├── pos/                         # Future
│   ├── reports/                     # Future
│   ├── audit/                       # Audit logging
│   └── notifications/               # Future: email
├── queues/                          # Bull queue processors
│   └── email.processor.ts           # Future
└── health/                          # Health check endpoint
```

### Layered Architecture

Each feature module follows this pattern:

```
Controller (HTTP layer)
    ↓
Service (Business logic)
    ↓
Repository (Data access via TypeORM)
    ↓
Entity (Database model)
```

### Cross-Cutting Concerns

- **Authentication**: JWT-based, all requests require valid token (except `/auth/login`, `/health`)
- **Multi-tenancy**: JWT contains `companyId`, all queries scoped via global guard
- **Authorization**: CASL Ability built from user roles, `@Permissions()` decorator
- **Validation**: class-validator on DTOs, ValidationPipe global
- **Error handling**: Global HttpExceptionFilter, uniform response shape
- **Logging**: Structured (pino), includes request ID, user ID, tenant ID
- **Audit**: Middleware captures all writes to audit_log table

---

## 🎨 Frontend Architecture (React)

### Directory Structure

```
src/
├── main.tsx                         # Entry point
├── App.tsx                          # Root component
├── app/
│   ├── providers/                   # Context providers
│   │   ├── QueryProvider.tsx        # TanStack Query
│   │   ├── AntdProvider.tsx         # Ant Design ConfigProvider
│   │   ├── I18nProvider.tsx         # i18next
│   │   └── AuthProvider.tsx         # Auth context
│   └── router.tsx                   # React Router config
├── components/                      # Shared UI components
│   ├── AppLayout/
│   ├── AppHeader/
│   ├── AppSidebar/
│   ├── ProtectedRoute/
│   ├── Can/                         # CASL permission gate
│   └── DataTable/                   # Reusable table
├── pages/                           # Route pages
│   ├── auth/
│   │   └── Login.tsx
│   ├── Dashboard.tsx
│   ├── users/
│   ├── roles/
│   └── ...
├── lib/                             # Utilities
│   ├── api/                         # Axios instance, endpoints
│   ├── i18n/                        # i18next config
│   ├── auth/                        # useAuth hook
│   ├── permissions/                 # useCan, Can component
│   └── utils/                       # formatters, validators
├── stores/                          # Zustand stores
│   ├── authStore.ts                 # Current user, token
│   ├── uiStore.ts                   # Sidebar collapse, theme, locale
│   └── ...
├── locales/                         # Translations
│   ├── ar.json                      # Primary
│   └── en.json
├── types/                           # TypeScript types
├── styles/                          # Global styles
└── vite-env.d.ts
```

### State Management Strategy

- **Server state**: TanStack Query (queries, mutations, cache)
- **Client state**: Zustand (auth, UI preferences, modals)
- **Form state**: React Hook Form + Zod
- **URL state**: React Router search params
- **No Redux** (overkill for this use case)

### Routing & Permissions

- `/login` — public
- `/dashboard` — requires authentication
- `/users`, `/roles` — requires specific permissions
- Wrapped in `<ProtectedRoute>` and `<Can>` components

### API Communication

- **Axios instance** with interceptors:
  - Request: attach JWT token
  - Response: handle 401 (refresh token), 403 (redirect), errors
- **TanStack Query** for all server data:
  - `useQuery` for reads
  - `useMutation` for writes
  - Optimistic updates where applicable
  - Cache invalidation on mutations

---

## 🗄️ Database Architecture

### Multi-Tenancy

- **Pattern**: Shared database, shared schema, `company_id` in every tenant-scoped table
- **Enforcement**: Global guard filters all queries by `companyId` from JWT
- **Isolation**: Indexes on `company_id` for performance

### Naming Conventions

- **Tables**: `snake_case`, plural (`users`, `journal_entries`)
- **Columns**: `snake_case` (`created_at`, `company_id`)
- **Primary keys**: `id` (integer or UUID based on entity)
- **Foreign keys**: `{table_singular}_id` (e.g., `user_id`, `company_id`)
- **Timestamps**: `created_at`, `updated_at`, `deleted_at` (soft delete)
- **Booleans**: `is_` prefix (`is_active`, `is_leaf`)
- **Enums**: stored as strings, validated in app

### Key Patterns

- **Soft delete**: `deleted_at TIMESTAMP NULL` for all entities
- **Audit fields**: `created_by`, `created_at`, `updated_by`, `updated_at`
- **Multi-currency**: `currency_code` + `exchange_rate` on documents, `debit_base/credit_base` on journal lines
- **Period locking**: documents linked to `period_id`, closed periods reject new entries
- **Stock separation**: `stock_balances` (current state) + `stock_transactions` (immutable log)
- **Tree structures**: `parent_id` self-reference + `level` denormalized

### Migrations

- Managed by TypeORM CLI
- One migration per schema change
- Seeded data in `seeds/` directory, separate from migrations

---

## 🔐 Security Architecture

### Authentication

- **JWT** with access + refresh tokens
- **Access token**: 15 min, contains `userId`, `companyId`, `roles`, `permissions`
- **Refresh token**: 7 days, httpOnly cookie, rotated on use
- **Password hashing**: bcrypt (cost factor 12)

### Authorization (RBAC + ABAC)

- **CASL Ability Factory** generates `Ability` from user roles + permissions
- **Resource-based**: `users`, `roles`, `items`, `sales_invoices`, etc.
- **Action-based**: `create`, `read`, `update`, `delete`, `approve`
- **Conditions**: ABAC, e.g., `user can read Sale where { createdBy: user.id }` (own only)
- **Scope**: `own`, `branch`, `company`, `all`

### Multi-Tenancy

- **TenantGuard** extracts `companyId` from JWT
- **Interceptor** adds `where: { companyId }` to all queries
- **Super admin** role can switch companies

### Security Headers

- **Helmet** middleware
- **CORS** configured for frontend origin
- **Rate limiting** via `@nestjs/throttler`
- **Input validation** on all endpoints via DTOs
- **SQL injection prevention** via TypeORM parameterized queries

---

## 📊 Observability

### Logging

- **pino** structured logging
- Request ID, user ID, company ID in context
- Different levels per environment (debug in dev, info in prod)

### Error Tracking (Future)

- **Sentry** integration (planned for Sprint 8)

### Metrics (Future)

- **Prometheus** endpoint (planned)
- **Grafana** dashboards (planned)

---

## 🧪 Testing Strategy

### Unit Tests

- **Backend**: Jest, per service/controller
- **Frontend**: Vitest + React Testing Library, per component/hook

### Integration Tests

- **Backend**: Jest + Supertest, full HTTP flow
- **Frontend**: Vitest with mocked API

### E2E Tests (Future, Sprint 8)

- **Playwright** for full user flows
- Critical paths: login, create sale, generate report

---

## 🚀 Deployment (Future)

### Local Dev

- `docker compose up` starts all services
- Hot reload for both API and Web

### Production (Future)

- **Frontend**: Vite build → static files → Nginx or CDN
- **Backend**: Node.js → Docker container → Kubernetes/ECS
- **Database**: Managed PostgreSQL (RDS, Cloud SQL)
- **Redis**: Managed Redis (ElastiCache, MemoryStore)
- **Monitoring**: Sentry + Prometheus + Grafana

---

## 📦 Package Dependencies Strategy

- **Lockfile committed** (`pnpm-lock.yaml`)
- **Renovate** or **Dependabot** for auto-updates
- **Major version upgrades** require explicit approval
- **No `*` or `latest`** in package.json (use `^` for compatible updates)

---

**Last Updated:** 2026-01-XX
**Status:** 🚧 Sprint 0 — Foundation in progress
