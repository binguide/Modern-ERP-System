# 🧭 Architecture Decision Records (ADRs)

This document captures key architectural decisions made for the Modern ERP System, along with their context, consequences, and trade-offs.

Each decision follows the format: **Status** | **Context** | **Decision** | **Consequences**.

---

## ADR-001: Monorepo with pnpm Workspaces + Turborepo

**Status**: ✅ Accepted | **Date**: 2026-01-XX

### Context

Need to manage a full-stack application (API + Web) with shared code (types, schemas, utils) and want to avoid code duplication and synchronization issues.

### Decision

Use **pnpm workspaces** for monorepo management and **Turborepo** for build orchestration.

### Consequences

- ✅ Single source of truth for shared types
- ✅ Faster installs and builds with pnpm and Turborepo cache
- ✅ Easy to add new apps (mobile, admin tools) later
- ⚠️ More complex CI/CD (must build in dependency order)
- ⚠️ Tooling has a learning curve

### Alternatives Considered

- **Nx**: More features but heavier and has its own conventions
- **Lerna**: Older, slower, less maintained
- **Separate repos**: Code duplication nightmare

---

## ADR-002: TypeScript Strict Mode + noUncheckedIndexedAccess

**Status**: ✅ Accepted | **Date**: 2026-01-XX

### Context

TypeScript can be configured with varying strictness levels. Want maximum type safety for an ERP system where data integrity is critical.

### Decision

Enable **full strict mode** including:

- `strict: true`
- `noUncheckedIndexedAccess: true`
- `noImplicitAny: true`
- `strictNullChecks: true`
- `strictFunctionTypes: true`
- `strictBindCallApply: true`
- `strictPropertyInitialization: true`
- `noImplicitThis: true`
- `alwaysStrict: true`
- `noFallthroughCasesInSwitch: true`
- `noImplicitReturns: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`

### Consequences

- ✅ Catches bugs at compile time
- ✅ Better IDE autocomplete and refactoring
- ⚠️ More verbose code (must handle `undefined` from array access)
- ⚠️ Steeper learning curve for junior developers

### Alternatives Considered

- **Loose mode**: Faster to write but error-prone
- **JavaScript + JSDoc**: Less tooling support

---

## ADR-003: NestJS for Backend

**Status**: ✅ Accepted | **Date**: 2026-01-XX

### Context

Need a structured, opinionated Node.js framework for a complex ERP backend with clear layering (controllers, services, repositories).

### Decision

Use **NestJS 10** as the backend framework.

### Consequences

- ✅ Built-in DI, modular architecture
- ✅ First-class TypeScript support
- ✅ Rich ecosystem (Passport, TypeORM, Swagger, Bull)
- ✅ Good documentation and large community
- ⚠️ More boilerplate than Express
- ⚠️ Opinionated structure (less flexible than Express)

### Alternatives Considered

- **Express**: Too unopinionated for an ERP
- **Fastify**: Faster but less mature ecosystem
- **AdonisJS**: Good but smaller community

---

## ADR-004: React 18 + Vite + Ant Design

**Status**: ✅ Accepted | **Date**: 2026-01-XX

### Context

Need a productive, modern frontend stack with a comprehensive component library for an admin-heavy ERP application.

### Decision

- **React 18** (UI library)
- **Vite 5** (build tool, dev server)
- **Ant Design 5** (component library)

### Consequences

- ✅ Vite is fast (HMR, instant start)
- ✅ AntD has 100+ ready-to-use components (tables, forms, modals)
- ✅ Strong TypeScript support
- ✅ RTL support (important for Arabic)
- ⚠️ AntD is heavy (bundle size)
- ⚠️ Customizing AntD theme can be tricky

### Alternatives Considered

- **Next.js**: SSR not needed for admin panel
- **Material-UI**: Less ERP-oriented
- **Chakra UI**: Fewer enterprise components
- **Tailwind + headless**: Too low-level for ERP

---

## ADR-005: TypeORM vs Prisma

**Status**: ✅ Accepted | **Date**: 2026-01-XX

### Context

Need to choose an ORM for PostgreSQL with TypeScript support and migration tooling.

### Decision

Use **TypeORM 0.3** with the `DataSource` API.

### Consequences

- ✅ Native NestJS integration
- ✅ Decorator-based entities (familiar to NestJS users)
- ✅ Repository pattern + QueryBuilder for complex queries
- ✅ Migrations included
- ⚠️ Generated types can be loose (must use explicit returns)
- ⚠️ Active Record vs Data Mapper confusion
- ⚠️ Some performance overhead

### Alternatives Considered

- **Prisma**: Better DX, generated types, but requires separate schema file and code generation step
- **Drizzle**: Newer, lighter, but smaller ecosystem
- **Knex + Objection**: More manual work

---

## ADR-006: Multi-Tenancy via Shared Schema + companyId

**Status**: ✅ Accepted | **Date**: 2026-01-XX

### Context

Need to support multiple companies (tenants) in one deployment. Common patterns:

1. Database per tenant (best isolation, expensive)
2. Schema per tenant (medium isolation, complex migrations)
3. Shared schema + `tenant_id` column (cheapest, requires careful app logic)

### Decision

Use **shared schema + `company_id` column** in all tenant-scoped tables, enforced via global guard.

### Consequences

- ✅ Cheapest (one database, one connection pool)
- ✅ Easiest to maintain (one migration)
- ✅ Easy to scale (add read replicas)
- ⚠️ Must enforce `company_id` filter everywhere (guard + interceptor)
- ⚠️ Risk of cross-tenant data leak if guard is bypassed
- ⚠️ Database-level isolation is weaker

### Mitigations

- **Global TenantGuard** on all routes
- **Interceptor** adds `where: { companyId }` to queries
- **Tests** verify no cross-tenant access
- **DB constraints** on `company_id NOT NULL` for all tenant tables

### Alternatives Considered

- **Schema per tenant**: Rejected due to migration complexity
- **DB per tenant**: Rejected due to cost (startup phase)

---

## ADR-007: JWT with Access + Refresh Tokens

**Status**: ✅ Accepted | **Date**: 2026-01-XX

### Context

Need stateless authentication that works for SPA + mobile clients.

### Decision

- **Access token**: JWT, 15 min, in `Authorization: Bearer` header
- **Refresh token**: JWT, 7 days, in httpOnly cookie
- **Rotation**: Refresh token rotated on each use

### Consequences

- ✅ Stateless (no server-side session storage)
- ✅ Can revoke via blacklist in Redis (for compromised tokens)
- ✅ httpOnly cookie prevents XSS theft of refresh token
- ⚠️ Token theft before expiry is possible (mitigated by short expiry)
- ⚠️ Logout requires server-side action (delete refresh from DB)

### Alternatives Considered

- **Session cookies**: Not suitable for mobile apps
- **Long-lived JWTs**: Security risk if compromised
- **OAuth (Google, etc.)**: Deferred to future sprint (enterprise SSO)

---

## ADR-008: CASL for Authorization

**Status**: ✅ Accepted | **Date**: 2026-01-XX

### Context

Need a flexible authorization library that supports both RBAC (role-based) and ABAC (attribute-based) rules.

### Decision

Use **CASL** with custom `AbilityFactory` that builds `AppAbility` from user's roles and permissions.

### Consequences

- ✅ Declarative rules (`can('read', 'Sale', { createdBy: user.id })`)
- ✅ Works on both backend (NestJS guards) and frontend (`<Can>` component)
- ✅ Supports field-level and row-level permissions
- ⚠️ Learning curve (subject/action/conditions pattern)
- ⚠️ Custom serialization needed for JWT embedding

### Alternatives Considered

- **AccessControl**: Simpler but no ABAC
- **Casbin**: More powerful but more complex setup
- **Custom RBAC**: Reinventing the wheel

---

## ADR-009: Multi-Currency with Frozen Exchange Rate

**Status**: ✅ Accepted | **Date**: 2026-01-XX

### Context

ERP system must support transactions in multiple currencies (e.g., SAR, USD, EUR). Exchange rates fluctuate, so we need to handle this carefully.

### Decision

- **Document-level** rate: When a document (quotation, invoice, journal) is created, capture the exchange rate at that moment and **freeze it**.
- **Base currency** per company, all reporting in base.
- **Journal lines** store both `amount` (transaction currency) and `debit_base/credit_base` (base currency).
- **Realized gain/loss** on payments when rate differs.

### Consequences

- ✅ Historical accuracy (back-dated reports reflect actual rates)
- ✅ No floating-point errors in long-running documents
- ✅ Easy audit (which rate was used when)
- ⚠️ More columns on each document
- ⚠️ Exchange rate update is a separate concern

### Alternatives Considered

- **Rate at posting time only**: Simpler but historical reports drift
- **Spot rate for all reports**: Distorts historical comparison

---

## ADR-010: Quotation Versioning on Reject-Revise

**Status**: ✅ Accepted | **Date**: 2026-01-XX

### Context

Quotations can be rejected by customers and revised by sales. Need to track history and avoid mutating "sent" documents.

### Decision

- **Quotation has versions** (1:1.5 in ERD): `quotation_versions` table.
- On **Reject → Revise**:
  1. Mark current version as `superseded`.
  2. Snapshot current state into `quotation_versions` (immutable).
  3. Create new draft version with editable fields.
- On **Accept**: Create `sales_order` (1:1) and freeze quotation.
- **Negotiation** allowed (revise without reject) — creates new version.
- **Expiry** always set, auto-calculated as `valid_until = issue_date + company.default_quote_validity_days` (overridable).

### Consequences

- ✅ Complete audit trail of all negotiations
- ✅ Customer can reference old versions
- ✅ Easy to compare versions side-by-side
- ✅ No data loss on revisions
- ⚠️ More complex UI (version selector)
- ⚠️ Storage grows with revisions (acceptable for ERP)

### Alternatives Considered

- **Edit in place with history log**: Loses the "what was sent" snapshot
- **Clone-and-replace**: Loses version history

---

## ADR-011: Soft Delete for All Entities

**Status**: ✅ Accepted | **Date**: 2026-01-XX

### Context

ERPs must never lose data (audit, financial history). Hard deletes are dangerous.

### Decision

- All entities have `deleted_at TIMESTAMP NULL`.
- TypeORM `@DeleteDateColumn` decorator enables automatic filtering.
- Default queries exclude soft-deleted rows.
- Restoration possible by clearing `deleted_at`.

### Consequences

- ✅ Data is never lost (audit-safe)
- ✅ Cascades work correctly
- ✅ Restorable
- ⚠️ Unique constraints must consider `deleted_at` (use partial indexes)
- ⚠️ Developers must remember to filter (TypeORM does this automatically with `find`)

### Alternatives Considered

- **Hard delete + audit log**: Loses referential integrity
- **"Active" flag**: Same effect but manual filtering everywhere

---

## ADR-012: Audit Log Middleware for Sensitive Tables

**Status**: ✅ Accepted | **Date**: 2026-01-XX

### Context

Financial and personal data must be tracked: who changed what, when, and from which value to which.

### Decision

- **Audit log middleware** intercepts all writes (INSERT, UPDATE, DELETE) to sensitive tables.
- Captures: `user_id`, `company_id`, `action`, `entity_type`, `entity_id`, `old_value`, `new_value`, `ip`, `user_agent`, `timestamp`.
- Stored in `audit_logs` table, **immutable** (no UPDATE/DELETE permissions for users).
- Exposed in admin UI for review.

### Consequences

- ✅ Full change history
- ✅ Compliance-ready (GDPR, SOX, ZATCA)
- ✅ Easy debugging ("who changed this price?")
- ⚠️ Storage grows fast (mitigate with retention policy in future sprint)
- ⚠️ Slight performance overhead on writes

### Alternatives Considered

- **Triggers in DB**: Less portable, harder to test
- **Event sourcing**: Overkill for ERP

---

## ADR-013: Zod for Frontend + Backend Validation

**Status**: ✅ Accepted | **Date**: 2026-01-XX

### Context

Need consistent validation rules between frontend (forms) and backend (DTOs).

### Decision

- **Zod schemas** in `packages/shared-schemas`.
- Used by:
  - **Frontend**: React Hook Form + `@hookform/resolvers/zod`
  - **Backend**: Custom pipe or manual validation in services
- **class-validator** still used for NestJS DTOs (per NestJS convention), with Zod as the source of truth in shared package.

### Consequences

- ✅ Single source of truth for validation rules
- ✅ TypeScript types inferred from schemas
- ✅ Composable and reusable
- ⚠️ Two validation systems (class-validator + Zod) — minor overhead

### Alternatives Considered

- **Joi**: Backend only, no TypeScript inference
- **Yup**: Older, less TypeScript-friendly
- **class-validator only**: No frontend reuse

---

## ADR-014: i18n with JSON Keys (Nested)

**Status**: ✅ Accepted | **Date**: 2026-01-XX

### Context

Application is bilingual (Arabic primary + English). Need a clean translation structure.

### Decision

- **i18next** with **nested JSON** structure.
- Example:
  ```json
  {
    "sales": {
      "quotation": {
        "title": "Quotation",
        "create": "Create Quotation"
      }
    }
  }
  ```
- **Arabic** is primary (`ar`), **English** secondary (`en`).
- **RTL** support via `dir="rtl"` on root for Arabic.

### Consequences

- ✅ Organized by feature module
- ✅ Easy to add new languages
- ✅ TypeScript autocomplete with type augmentation
- ⚠️ Larger files (mitigated by splitting per feature)
- ⚠️ Translation management is manual (could use Crowdin in future)

### Alternatives Considered

- **Flat keys with dots**: Less organized
- **Per-language files**: Loses the nesting structure

---

## ADR-015: State Machine Engine (Generic + Specific)

**Status**: 🔜 Planned (Sprint 8) | **Date**: 2026-01-XX

### Context

Documents have workflows (e.g., quotation: Draft → Sent → Reviewing → Accepted/Rejected). Some are simple, some are complex with approval steps.

### Decision

- **Specific** state machines: hardcoded for each document type (e.g., `QuotationStateMachine`).
- **Generic** state machine engine: configurable via UI, for custom workflows (e.g., approval flows).
- Defer generic engine to **Sprint 8** (Integrations + Polish).
- Implement **specific** state machines as needed in each feature sprint.

### Consequences

- ✅ Ship features faster (specific machines are simple)
- ✅ Flexibility for custom workflows later
- ⚠️ Refactoring needed if we want all workflows to use the engine (acceptable for later)

---

## ADR-016: Document Numbering Convention

**Status**: ✅ Accepted | **Date**: 2026-01-XX

### Context

Documents need sequential, year-based numbers (e.g., `INV-2026-0001`).

### Decision

- **Format**: `{PREFIX}-{YEAR}-{SEQUENCE:4}`
- **Prefixes**:
  - `INV` — Sales Invoice
  - `BILL` — Purchase Invoice
  - `PO` — Purchase Order
  - `SO` — Sales Order
  - `QUO` — Quotation
  - `JV` — Journal Voucher
  - `RCT` — Receipt
  - `PAY` — Payment
  - `GR` — Goods Receipt
  - `PR` — Purchase Request
  - `ADJ` — Stock Adjustment
  - `TRF` — Stock Transfer
- **Sequence resets per year per company per prefix**.
- **Atomic increment** via DB function or service to avoid race conditions.

### Consequences

- ✅ Human-readable, sortable
- ✅ Year-based grouping for reports
- ✅ Unique within company
- ⚠️ Sequence tracking requires a settings table

### Alternatives Considered

- **Random UUIDs**: Not human-friendly
- **Continuous sequence**: Doesn't group by year

---

## ADR-017: TanStack Query for Server State

**Status**: ✅ Accepted | **Date**: 2026-01-XX

### Context

Need to manage server data (caching, refetching, optimistic updates) in a React app.

### Decision

Use **TanStack Query v5** (formerly React Query).

### Consequences

- ✅ Automatic caching and background refetch
- ✅ Optimistic updates built-in
- ✅ Devtools for debugging
- ✅ Handles loading/error states cleanly
- ⚠️ Another concept to learn (queries, mutations, keys)

### Alternatives Considered

- **SWR**: Good but less feature-rich
- **Apollo Client**: Overkill (no GraphQL)
- **Custom hooks**: Reinventing the wheel

---

## ADR-018: Zustand for Client State

**Status**: ✅ Accepted | **Date**: 2026-01-XX

### Context

Need to manage client-only state (auth, UI preferences, modals).

### Decision

Use **Zustand 4** (small, fast, no boilerplate).

### Consequences

- ✅ 1KB, no Provider hell
- ✅ Easy to test (pure functions)
- ✅ TypeScript-friendly
- ⚠️ Less structured than Redux (for very large apps)

### Alternatives Considered

- **Redux Toolkit**: Too heavy for our needs
- **Context API**: Re-render issues
- **Recoil**: Smaller community

---

## ADR-019: Docker for Local Development

**Status**: ✅ Accepted | **Date**: 2026-01-XX

### Context

Developers need a consistent local environment (PostgreSQL, Redis, API, Web) without manual installation.

### Decision

- **Docker Compose** orchestrates all services.
- **Hot reload** for both API and Web (volume mounts).
- **Production-like** setup (real Postgres, not SQLite).

### Consequences

- ✅ "Works on my machine" solved
- ✅ Easy onboarding (`docker compose up` and done)
- ✅ Mirrors production
- ⚠️ Slower on macOS/Windows (Docker Desktop overhead)
- ⚠️ Docker required to develop

### Alternatives Considered

- **Native install**: Different per OS, hard to maintain
- **Dev containers (VS Code)**: Could be added later

---

## ADR-020: GitHub Actions for CI/CD

**Status**: ✅ Accepted | **Date**: 2026-01-XX

### Context

Need automated checks on every PR (lint, typecheck, test, build).

### Decision

Use **GitHub Actions** with separate workflows:

- `lint.yml` — ESLint + Prettier check
- `typecheck.yml` — TypeScript compile check
- `test.yml` — Run tests
- `build.yml` — Build all packages

### Consequences

- ✅ Free for public repos
- ✅ Integrated with GitHub
- ✅ Easy to add deployment later
- ⚠️ Limited minutes on free tier (fine for now)

### Alternatives Considered

- **GitLab CI**: Not on GitHub
- **CircleCI**: More complex setup
- **Jenkins**: Self-hosted, maintenance burden

---

## Summary

| ADR | Decision                    | Status      |
| --- | --------------------------- | ----------- |
| 001 | pnpm + Turborepo            | ✅          |
| 002 | TypeScript strict           | ✅          |
| 003 | NestJS                      | ✅          |
| 004 | React + Vite + AntD         | ✅          |
| 005 | TypeORM                     | ✅          |
| 006 | Shared schema multi-tenancy | ✅          |
| 007 | JWT (access + refresh)      | ✅          |
| 008 | CASL                        | ✅          |
| 009 | Multi-currency frozen rate  | ✅          |
| 010 | Quotation versioning        | ✅          |
| 011 | Soft delete                 | ✅          |
| 012 | Audit log middleware        | ✅          |
| 013 | Zod for validation          | ✅          |
| 014 | i18n nested JSON            | ✅          |
| 015 | State machine engine        | 🔜 Sprint 8 |
| 016 | Document numbering          | ✅          |
| 017 | TanStack Query              | ✅          |
| 018 | Zustand                     | ✅          |
| 019 | Docker Compose              | ✅          |
| 020 | GitHub Actions              | ✅          |

---

**Last Updated:** 2026-01-XX
