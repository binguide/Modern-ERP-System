# SPEC.md — Architectural Decisions & Standards

This document captures the **architectural decisions and standards** for the Modern ERP System. It is the single source of truth for "how we do things" in this project.

> **For behavioral rules** (e.g., "don't commit secrets"), see [AGENTS.md](../AGENTS.md).
> **For project status and sprint progress**, see [PROGRESS.md](../PROGRESS.md).
> **For strategic roadmap**, see [docs/ROADMAP.md](./ROADMAP.md).

---

## 1. Tech Stack (Frozen)

| Layer                  | Technology          | Version | Justification                               |
| ---------------------- | ------------------- | ------- | ------------------------------------------- |
| **Frontend Framework** | React               | 18.2    | Industry standard, large ecosystem          |
| **Build Tool**         | Vite                | 5.x     | Fast HMR, instant dev server                |
| **UI Library**         | Ant Design          | 5.x     | Enterprise-ready, RTL support, ERP-friendly |
| **State (Server)**     | TanStack Query      | 5.x     | Powerful caching, optimistic updates        |
| **State (Client)**     | Zustand             | 4.x     | Tiny, fast, no boilerplate                  |
| **Forms**              | React Hook Form     | 7.x     | Performant, minimal re-renders              |
| **Validation**         | Zod                 | 3.x     | TS-first, shared FE+BE                      |
| **i18n**               | i18next             | 23.x    | Mature, plugin system                       |
| **Charts**             | Recharts            | 2.x     | React-native, declarative                   |
| **PDF**                | @react-pdf/renderer | 3.x     | Pure React, no headless browser             |
| **Routing**            | React Router        | 6.x     | De facto standard                           |
| **Date**               | Day.js              | 1.x     | 2KB, immutable, locale-aware                |
| **HTTP**               | Axios               | 1.x     | Interceptors, easy to mock                  |
| **Styling (utility)**  | Tailwind CSS        | 3.x     | Layout-only, alongside AntD                 |
| **Backend Framework**  | NestJS              | 10.x    | Modular, DI, great TS support               |
| **ORM**                | TypeORM             | 0.3.x   | Native NestJS integration                   |
| **Database**           | PostgreSQL          | 16      | Robust, JSON support, FTS                   |
| **Cache / Queue**      | Redis               | 7       | Multi-purpose                               |
| **Auth**               | Passport JWT        | latest  | De facto standard                           |
| **Authorization**      | CASL                | 6.x     | RBAC + ABAC, FE + BE                        |
| **Validation (BE)**    | class-validator     | 0.14    | NestJS convention                           |
| **Env Validation**     | Joi                 | 17      | Strict, declarative                         |
| **Job Queue**          | Bull                | 4.x     | Redis-backed, NestJS integration            |
| **API Docs**           | @nestjs/swagger     | 7.x     | OpenAPI from decorators                     |
| **Security**           | Helmet, bcrypt      | latest  | Standard hardening                          |
| **Monorepo**           | pnpm + Turborepo    | 9 / 2   | Fast, cached, simple                        |
| **TypeScript**         | TypeScript          | 5.4     | strict + noUncheckedIndexedAccess           |
| **Container**          | Docker + Compose    | latest  | Standard                                    |
| **CI/CD**              | GitHub Actions      | n/a     | Integrated                                  |
| **Lint**               | ESLint              | 8       | With Prettier integration                   |
| **Format**             | Prettier            | 3       | Standard                                    |
| **Git Hooks**          | Husky + lint-staged | 9 / 15  | Standard                                    |
| **Commits**            | Commitlint          | 18      | Conventional Commits                        |
| **Testing (BE)**       | Jest                | 29      | NestJS default                              |
| **Testing (FE)**       | Vitest + RTL        | latest  | Fast, Vite-native                           |
| **E2E (Future)**       | Playwright          | latest  | Cross-browser                               |

> ⚠️ **Do not add libraries without updating this table and adding an ADR in [docs/DECISIONS.md](./DECISIONS.md).**

---

## 2. Repository Structure

```
Modern Erp System/
├── apps/
│   ├── api/                       # NestJS backend
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── common/            # decorators, filters, guards, interceptors, pipes
│   │   │   ├── config/            # env validation, app/database/jwt/redis configs
│   │   │   ├── database/          # data-source, migrations, seeds
│   │   │   ├── modules/           # feature modules
│   │   │   │   ├── auth/
│   │   │   │   ├── users/
│   │   │   │   ├── rbac/
│   │   │   │   ├── companies/
│   │   │   │   ├── branches/
│   │   │   │   ├── accounting/
│   │   │   │   ├── inventory/
│   │   │   │   ├── sales/
│   │   │   │   ├── purchases/
│   │   │   │   ├── pos/
│   │   │   │   ├── reports/
│   │   │   │   ├── audit/
│   │   │   │   └── notifications/
│   │   │   ├── queues/            # Bull processors
│   │   │   └── health/
│   │   ├── test/                  # E2E tests
│   │   ├── .env.example
│   │   ├── nest-cli.json
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── web/                       # React frontend
│       ├── src/
│       │   ├── main.tsx
│       │   ├── App.tsx
│       │   ├── app/               # providers, router
│       │   ├── components/        # shared UI
│       │   ├── pages/             # route pages
│       │   ├── lib/               # api, i18n, auth, utils
│       │   ├── stores/            # Zustand stores
│       │   ├── locales/           # ar.json, en.json
│       │   ├── types/
│       │   ├── styles/
│       │   └── vite-env.d.ts
│       ├── public/
│       ├── index.html
│       ├── package.json
│       ├── vite.config.ts
│       ├── tailwind.config.js
│       ├── postcss.config.js
│       └── tsconfig.json
├── packages/
│   ├── shared-types/              # TS types/enums used in FE+BE
│   ├── shared-schemas/            # Zod schemas used in FE+BE
│   ├── shared-utils/              # Pure functions
│   └── eslint-config/             # Shared ESLint config
├── docker/
│   ├── api.Dockerfile
│   ├── web.Dockerfile
│   ├── web.Dockerfile.dev
│   └── nginx.conf
├── docs/
│   ├── README.md                  # Docs index
│   ├── ROADMAP.md
│   ├── ARCHITECTURE.md
│   ├── DECISIONS.md               # ADRs
│   └── GLOSSARY.md
├── .github/
│   ├── workflows/
│   │   ├── lint.yml
│   │   ├── typecheck.yml
│   │   ├── test.yml
│   │   └── build.yml
│   └── dependabot.yml
├── .husky/
│   ├── pre-commit
│   └── commit-msg
├── .vscode/                       # Recommended settings
├── docker-compose.yml
├── package.json                   # Root
├── pnpm-workspace.yaml
├── turbo.json
├── tsconfig.base.json
├── .eslintrc.cjs
├── .prettierrc
├── .prettierignore
├── .editorconfig
├── .npmrc
├── .nvmrc
├── .gitignore
├── .env.example
├── AGENTS.md
├── SPEC.md                        # ← You are here
├── PROGRESS.md
└── README.md
```

---

## 3. API Standards

### URL Conventions

- Base path: `/api/v1/{resource}`
- Resource names: plural, kebab-case
  - `GET /api/v1/users` — list
  - `GET /api/v1/users/:id` — read
  - `POST /api/v1/users` — create
  - `PATCH /api/v1/users/:id` — partial update
  - `PUT /api/v1/users/:id` — full update
  - `DELETE /api/v1/users/:id` — delete
- Sub-resources:
  - `GET /api/v1/users/:id/roles` — user's roles
  - `POST /api/v1/users/:id/roles` — assign role
- Actions:
  - `POST /api/v1/quotations/:id/send` — business action
  - `POST /api/v1/quotations/:id/accept`
  - `POST /api/v1/quotations/:id/reject`

### Request/Response Shape

**Standard success:**

```json
{
  "data": { ... },
  "meta": { "page": 1, "limit": 20, "total": 100 }
}
```

**Standard error:**

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [{ "field": "email", "message": "Invalid email" }],
  "path": "/api/v1/users",
  "timestamp": "2026-01-15T10:00:00Z",
  "requestId": "abc-123"
}
```

### Pagination

- Query params: `?page=1&limit=20&sort=createdAt&order=desc`
- Response `meta`: `{ page, limit, total, totalPages }`
- Default `limit`: 20, max: 100

### Filtering

- Query params: `?field=value` or `?field[op]=value`
- Operators: `eq`, `ne`, `gt`, `gte`, `lt`, `lte`, `in`, `like`, `between`
- Example: `?status[eq]=active&createdAt[gte]=2026-01-01`

### Versioning

- All endpoints under `/api/v1`
- Future major changes → `/api/v2`
- Sunset old versions with notice

### Documentation

- **OpenAPI** via `@nestjs/swagger`.
- All endpoints documented with `@ApiOperation`, `@ApiResponse`, `@ApiProperty`.
- Swagger UI at `/api/docs` (dev only).
- Generated client types via `openapi-typescript` (optional, future).

---

## 4. Database Standards

### Multi-Tenancy

- **Pattern**: Shared schema, `company_id` in every tenant-scoped table.
- **Enforcement**: `TenantGuard` + `TenantInterceptor`.
- **Indexing**: All `company_id` columns indexed.

### Naming

- Tables: `snake_case`, plural (`journal_entries`, `purchase_orders`)
- Columns: `snake_case` (`created_at`, `is_active`, `exchange_rate`)
- Primary key: `id` (UUID v4 for entities, bigint for high-volume tables)
- Foreign keys: `{singular_table}_id` (`user_id`, `company_id`)
- Timestamps: `created_at`, `updated_at`, `deleted_at`
- Booleans: `is_` prefix
- Enums: stored as VARCHAR with CHECK constraint
- Money: `DECIMAL(20, 4)` (4 decimal places to handle exchange rates)
- Quantities: `DECIMAL(20, 4)`
- Dates: `DATE` (no time)
- DateTime: `TIMESTAMPTZ` (timezone-aware)

### Constraints

- Primary key on `id`
- Foreign key with `ON DELETE RESTRICT` (default) or `ON DELETE CASCADE` (when safe)
- Unique constraints consider `deleted_at` (partial index: `WHERE deleted_at IS NULL`)
- Check constraints for enums and positive numbers

### Indexes

- All FKs indexed
- All `company_id` columns indexed
- Composite indexes for common query patterns
- `EXPLAIN ANALYZE` for slow queries

### Soft Delete

- `@DeleteDateColumn` in TypeORM
- All queries automatically exclude soft-deleted rows
- Restoration supported

### Audit Fields

- `created_at`, `created_by` (always)
- `updated_at`, `updated_by` (always)
- `deleted_at`, `deleted_by` (optional, for traceability)

### Migrations

- TypeORM CLI for migrations
- One migration per change (or related set)
- Never edit committed migrations
- Always write **down** migrations

### Seeds

- Idempotent
- Default roles, admin user, sample company
- Use `INSERT ... ON CONFLICT DO NOTHING`

---

## 5. Authentication & Authorization

### Authentication

- **JWT** with access (15 min) + refresh (7 days)
- Access token: `Authorization: Bearer <token>`
- Refresh token: `httpOnly`, `Secure`, `SameSite=Strict` cookie
- **bcrypt** for passwords (cost 12)
- **Rate limiting** on `/auth/login` (5 attempts / 15 min / IP)

### Authorization

- **CASL Ability Factory** builds `AppAbility` from user roles
- **Subjects**: `User`, `Role`, `Company`, `Item`, `Sale`, etc. (mirrors entities)
- **Actions**: `create`, `read`, `update`, `delete`, `approve`, `export`
- **Conditions**: ABAC (e.g., `{ createdBy: user.id }`)
- **Scope**: `own` (created by user), `branch` (user's branch), `company` (user's company), `all`
- **Guards**: `@UseGuards(JwtAuthGuard, PermissionsGuard)`, `@Permissions('read', 'User')`

### Multi-Tenancy

- `TenantGuard` extracts `companyId` from JWT
- All queries scoped via interceptor
- `super_admin` role can switch companies (not in MVP)

---

## 6. Frontend Standards

### Component Patterns

- Functional components, hooks
- Props interface above component
- Default export for pages, named for components
- Co-locate styles (CSS modules) if needed

### State

- **Server**: TanStack Query (`useQuery`, `useMutation`, `useInfiniteQuery`)
- **Client**: Zustand stores (one per domain)
- **Forms**: React Hook Form + Zod
- **URL**: React Router `useSearchParams`
- **Theme/Locale**: AntD ConfigProvider

### i18n

- Nested JSON keys: `sales.quotation.create`
- `useTranslation()` hook in components
- Default: Arabic (`ar`), fallback: English (`en`)
- RTL for Arabic via `dir="rtl"` on root

### Routing

- Public: `/login`, `/forgot-password`
- Protected: `<ProtectedRoute>` wrapper
- Permission-gated: `<Can I="read" a="User">` wrapper
- Lazy load pages with `React.lazy`

### API Layer

- Centralized Axios instance with interceptors
- Endpoints in `lib/api/endpoints/`
- Types from `packages/shared-types`
- Schemas from `packages/shared-schemas`

### Error Handling

- Axios interceptor catches 401 → refresh + retry
- 403 → redirect to /403
- 5xx → toast notification
- Network errors → retry with backoff (TanStack Query)

### Accessibility (a11y)

- Semantic HTML
- ARIA labels where needed
- Keyboard navigation
- AntD has good defaults

---

## 7. Performance Standards

### Frontend

- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Bundle size**: < 500KB gzipped (per route)
- Lazy load routes
- Image optimization (WebP, lazy loading)
- Memoize expensive computations

### Backend

- **API response**: < 200ms (p95) for simple queries
- **Database**: indexes on all FKs and commonly filtered columns
- **Caching**: Redis for hot data (user permissions, exchange rates, fiscal period)
- **N+1 prevention**: eager loading, DataLoader pattern
- **Connection pooling**: 10-20 connections per service instance

### Database

- **Query timeout**: 30s (kill long queries)
- **Slow query log**: > 1s
- **Index usage**: verify with `EXPLAIN ANALYZE`

---

## 8. Security Standards

### Application

- Helmet (security headers)
- CORS configured (allow only frontend origin)
- CSRF protection on state-changing requests (double-submit cookie)
- Rate limiting via `@nestjs/throttler`
- Input validation (DTO + Zod)
- Output sanitization (no raw error messages)

### Data

- Passwords: bcrypt cost 12
- Tokens: random 256-bit, stored hashed in DB
- PII: encrypted at rest (column-level encryption for sensitive fields)
- Backups: daily, encrypted, 30-day retention

### Audit

- All writes to sensitive tables → `audit_logs`
- Immutable log (no UPDATE/DELETE for users)
- Retention: 7 years (financial compliance)

---

## 9. Testing Standards

### Coverage Targets

- **Unit tests**: 80% for services, 70% for controllers
- **Integration tests**: all endpoints
- **E2E tests**: critical user flows

### Naming

- `*.spec.ts` (co-located with source)
- `*.e2e-spec.ts` (in `test/` directory)

### Structure (AAA)

```ts
describe('UserService', () => {
  describe('findById', () => {
    it('should return a user when found', async () => {
      // Arrange
      const id = '123';
      // Act
      const result = await service.findById(id);
      // Assert
      expect(result).toMatchObject({ id });
    });
  });
});
```

### Mocks

- Use Jest mocks for external dependencies
- Use a test database (separate from dev)
- Reset DB state between tests

---

## 10. Deployment Standards (Future)

### Environments

- **local**: docker-compose, full stack
- **staging**: same as prod, separate DB
- **production**: HA, backups, monitoring

### CI/CD Pipeline

1. **PR opened** → lint + typecheck + test
2. **PR merged to main** → build Docker images
3. **Tagged release** → deploy to staging
4. **Manual approval** → deploy to production

### Monitoring (Future)

- Sentry for errors
- Prometheus + Grafana for metrics
- Log aggregation (Loki or ELK)

---

## 11. Documentation Standards

### Code

- TSDoc for public APIs (services, controllers, components)
- No inline comments (self-explanatory code)
- README in each `apps/` and `packages/` directory

### Project

- This file (SPEC.md) — architectural standards
- AGENTS.md — behavioral rules
- PROGRESS.md — sprint progress
- docs/ROADMAP.md — strategic plan
- docs/ARCHITECTURE.md — high-level architecture
- docs/DECISIONS.md — ADRs
- docs/GLOSSARY.md — terms

---

**Last Updated:** 2026-01-XX
**Maintained by:** Modern ERP Team
