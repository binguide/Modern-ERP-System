# AGENTS.md — Rules & Conventions

This file defines the rules, conventions, and behavioral guidelines for AI agents (and human contributors) working on the **Modern ERP System** codebase.

> **Note for AI Agents:** Read this file FIRST before making any changes. Follow these rules strictly.

---

## 🤖 AI Agent Rules

### 1. **Read Before You Write**
- Always read the relevant files (or sections) before editing.
- Use search tools (Grep, Glob) to understand existing patterns.
- Check `PROGRESS.md` to see what's already done.

### 2. **Follow Existing Conventions**
- Mimic the style, structure, and patterns of existing code.
- Don't introduce new libraries without justification.
- If a library is needed, check if it's already in `package.json` first.

### 3. **Type Safety First**
- TypeScript strict mode is ON. All code must compile without errors.
- Use explicit types, avoid `any` (use `unknown` if truly needed).
- Leverage Zod schemas for runtime validation.

### 4. **No Comments in Code (unless asked)**
- Code should be self-explanatory through naming and structure.
- Only add JSDoc/TSDoc for public APIs.
- Do NOT add inline comments like `// increment counter`.

### 5. **Multi-Tenancy Always**
- Every entity in the database that is tenant-scoped MUST have a `companyId` column.
- Every query MUST be scoped to the current tenant (via guard/interceptor).
- Tests MUST verify cross-tenant isolation.

### 6. **Soft Delete**
- Use `@DeleteDateColumn` in TypeORM entities.
- Never hard-delete business data.
- Unique indexes must consider `deleted_at` (partial indexes in migrations).

### 7. **Audit Sensitive Changes**
- All writes to financial/personal tables must be logged in `audit_logs`.
- Include `userId`, `companyId`, `action`, `oldValue`, `newValue`, `ip`, `userAgent`.

### 8. **Validation Everywhere**
- Backend: Use class-validator on DTOs + Zod for shared schemas.
- Frontend: Use React Hook Form + Zod resolver.
- Never trust client input; always validate server-side.

### 9. **Error Handling**
- Throw `HttpException` (or subclasses) in services.
- Use the global `HttpExceptionFilter` to format responses.
- Never leak stack traces in production (handled by `NODE_ENV` check).

### 10. **Security**
- Never log secrets, passwords, tokens, or PII.
- Use parameterized queries (TypeORM does this automatically).
- Use `bcrypt` for passwords (cost 12).
- Set secure HTTP headers via Helmet.
- httpOnly cookies for refresh tokens.

---

## 📝 Coding Conventions

### File Naming
- **Files**: `kebab-case.ts` (`user.service.ts`, `auth.controller.ts`)
- **Classes**: `PascalCase` (`UserService`, `AuthController`)
- **Functions/Variables**: `camelCase` (`getUserById`, `firstName`)
- **Constants**: `UPPER_SNAKE_CASE` (`MAX_LOGIN_ATTEMPTS`)
- **Types/Interfaces**: `PascalCase`, prefix with `T`/`I` is optional (`User` or `TUser`)
- **Enums**: `PascalCase` for enum, `UPPER_SNAKE_CASE` for values (`UserStatus.ACTIVE`)

### Folder Structure
```
src/
├── modules/
│   └── {feature}/
│       ├── dto/              # Data Transfer Objects
│       ├── entities/         # TypeORM entities
│       ├── guards/           # Feature-specific guards
│       ├── strategies/       # Passport strategies
│       ├── {feature}.module.ts
│       ├── {feature}.controller.ts
│       ├── {feature}.service.ts
│       └── {feature}.service.spec.ts
└── common/
    ├── decorators/
    ├── filters/
    ├── interceptors/
    ├── pipes/
    └── guards/
```

### Imports
- Group imports: external libs, then internal (`@/`, `../`).
- Use `import type` for type-only imports.
- Avoid deep relative imports (`../../../`); use path aliases (`@/modules/...`).

### Error Messages
- Use `i18n` keys for user-facing errors.
- For developers, use descriptive English messages.
- Always include context: "User not found" → "User with id '123' not found".

### Git Commits
- Follow **Conventional Commits**:
  - `feat: add quotation versioning`
  - `fix: resolve race condition in stock balance update`
  - `refactor: extract posting rules engine`
  - `docs: update ARCHITECTURE.md`
  - `test: add unit tests for auth service`
  - `chore: update dependencies`
- Subject line ≤ 72 chars.
- Use body to explain **why**, not **what**.

### Branch Naming
- `feature/{sprint}-{short-desc}` (e.g., `feature/sprint-1-auth-rbac`)
- `fix/{issue}-{short-desc}` (e.g., `fix/123-login-redirect`)
- `chore/{short-desc}` (e.g., `chore/update-deps`)

---

## 🚫 Prohibited Actions

- ❌ Don't add new dependencies without explicit approval.
- ❌ Don't modify `package.json` versions manually (use `pnpm add/remove`).
- ❌ Don't commit `.env` files or secrets.
- ❌ Don't disable ESLint or TypeScript checks with `// eslint-disable` or `// @ts-ignore` (use proper types instead).
- ❌ Don't write `console.log` for production code (use a logger).
- ❌ Don't hard-delete business data (use soft delete).
- ❌ Don't bypass the global guards (auth, tenant, permissions).
- ❌ Don't commit code that fails `pnpm lint`, `pnpm typecheck`, or `pnpm test`.
- ❌ Don't add code comments unless explicitly asked.

---

## ✅ Required Actions

- ✅ Run `pnpm lint` before committing.
- ✅ Run `pnpm typecheck` before committing.
- ✅ Run `pnpm test` before committing (when tests exist).
- ✅ Update `PROGRESS.md` when completing a task.
- ✅ Add a `package.json` script for any new tooling.
- ✅ Add tests for new business logic (unit + integration).
- ✅ Update `docs/` when changing architecture or adding major features.
- ✅ Use `import type` for type-only imports.
- ✅ Use path aliases (`@/`) for deep imports.

---

## 🧪 Testing Guidelines

### Unit Tests
- One test file per source file: `user.service.ts` → `user.service.spec.ts`.
- Use **Jest** (NestJS default).
- Test public methods only.
- Mock external dependencies (DB, HTTP, etc.).

### Integration Tests
- Use **Supertest** for HTTP endpoints.
- Test full request/response cycle.
- Use a separate test database.

### E2E Tests (Sprint 8)
- Use **Playwright**.
- Cover critical user flows: login, create sale, generate report.
- Run against a fully containerized stack.

---

## 🌍 Internationalization (i18n)

- **Primary language**: Arabic (`ar`)
- **Secondary language**: English (`en`)
- **Translation files**: `apps/web/src/locales/{ar,en}.json`
- **Structure**: Nested by feature module:
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
- **Backend errors** also use i18n keys; resolved by frontend if needed.
- **Never** hardcode user-facing strings in components or services.

---

## 🎨 Frontend Conventions

### Component Structure
- **Functional components** with hooks.
- **Props interface** defined above the component:
  ```tsx
  interface UserListProps {
    companyId: string;
  }
  
  export function UserList({ companyId }: UserListProps) {
    // ...
  }
  ```
- **Default export** for pages, **named export** for components.

### Styling
- Use **Ant Design** components first.
- Use **Tailwind CSS** for custom layouts (configured alongside AntD).
- **Avoid** inline styles (use CSS modules or Tailwind classes).

### State Management
- **Server state**: TanStack Query (`useQuery`, `useMutation`).
- **Client state**: Zustand stores.
- **Form state**: React Hook Form.
- **URL state**: React Router `useSearchParams`.

### Routing
- **Public routes**: `/login`, `/forgot-password`
- **Protected routes**: wrapped in `<ProtectedRoute>`
- **Permission-gated routes**: wrapped in `<Can I="read" a="User">`
- **Lazy loading**: `React.lazy` for page components.

---

## 🗄️ Database Conventions

### Schema
- **Tables**: `snake_case`, plural (`users`, `journal_entries`).
- **Columns**: `snake_case` (`created_at`, `company_id`).
- **Primary keys**: `id` (`uuid` or `int`).
- **Foreign keys**: `{table_singular}_id` (e.g., `user_id`, `company_id`).
- **Timestamps**: `created_at`, `updated_at`, `deleted_at`.
- **Booleans**: `is_` prefix (`is_active`, `is_leaf`).
- **Indexes**: `idx_{table}_{columns}` (e.g., `idx_users_company_id`).
- **Unique constraints**: `uq_{table}_{columns}` (e.g., `uq_users_email`).

### Migrations
- One migration per change (or related set of changes).
- **Never** edit a committed migration; create a new one to fix.
- **Always** test migration on a copy of production data.
- Migration file: `{TIMESTAMP}-{description}.ts` (e.g., `1704067200000-AddUsersTable.ts`).

### Seeds
- Idempotent: can be run multiple times without duplicates.
- Use `INSERT ... ON CONFLICT DO NOTHING` or check-then-insert.
- Default roles, admin user, sample company, sample data.

---

## 🔐 Security Checklist

Before committing code, verify:
- [ ] All endpoints require authentication (except explicitly public).
- [ ] All queries are scoped to `companyId`.
- [ ] No PII or secrets in logs.
- [ ] No hardcoded credentials.
- [ ] Input is validated (DTO + Zod).
- [ ] Output is sanitized (no raw error messages to user).
- [ ] Sensitive actions are audit-logged.
- [ ] Authorization is checked (CASL `@Can` or guard).

---

## 📚 Reference Documentation

- **Project root**: [README.md](../README.md)
- **Architecture**: [docs/ARCHITECTURE.md](./ARCHITECTURE.md)
- **Roadmap**: [docs/ROADMAP.md](./ROADMAP.md)
- **Decisions**: [docs/DECISIONS.md](./DECISIONS.md)
- **Glossary**: [docs/GLOSSARY.md](./GLOSSARY.md)
- **Sprint progress**: [PROGRESS.md](../PROGRESS.md)
- **API spec**: [SPEC.md](../SPEC.md)

---

**Last Updated:** 2026-01-XX
**Maintained by:** Modern ERP Team
