# Modern ERP System

A **multi-tenant, modular Enterprise Resource Planning (ERP) system** for managing sales, inventory, purchasing, accounting, POS, and fixed assets.

Built with modern web technologies, fully typed end-to-end, and designed for extensibility.

---

## ✨ Features

- **Multi-tenant**: One deployment, many companies
- **Sales & Quotation Workflow**: Versioning, multi-currency, auto SO creation
- **Inventory**: Multi-warehouse, multi-UoM, batch/serial tracking (planned)
- **Purchasing**: Full PR → PO → GR → Invoice cycle (planned)
- **Accounting**: Chart of accounts, journals, financial reports (planned)
- **POS**: Touch-optimized, cash sessions, receipt printing (planned)
- **Fixed Assets**: Depreciation, disposal (planned)
- **RBAC + ABAC**: Fine-grained permissions via CASL
- **Bilingual**: Arabic (primary) + English with full RTL support
- **Audit Log**: Complete change history for compliance

---

## 🛠️ Tech Stack

| Layer          | Technology                                          |
| -------------- | --------------------------------------------------- |
| **Frontend**   | React 18 + Vite 5 + Ant Design 5 + TypeScript 5     |
| **Backend**    | NestJS 10 + TypeORM + PostgreSQL 16 + Redis 7       |
| **Auth**       | JWT (access + refresh) + Passport + CASL            |
| **Validation** | Zod (shared) + class-validator (backend)            |
| **State**      | TanStack Query (server) + Zustand (client)          |
| **i18n**       | i18next with nested JSON keys                       |
| **Monorepo**   | pnpm + Turborepo                                    |
| **CI/CD**      | GitHub Actions + Docker                             |
| **Testing**    | Jest (BE) + Vitest (FE) + Playwright (E2E, planned) |

For the full stack and architectural decisions, see [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) and [docs/DECISIONS.md](./docs/DECISIONS.md).

---

## 📁 Project Structure

```
Modern Erp System/
├── apps/
│   ├── api/                  # NestJS backend
│   └── web/                  # React + Vite frontend
├── packages/                 # Shared libraries
│   ├── shared-types/
│   ├── shared-schemas/
│   ├── shared-utils/
│   └── eslint-config/
├── docker/                   # Dockerfiles + nginx config
├── docs/                     # Project documentation
│   ├── ROADMAP.md
│   ├── ARCHITECTURE.md
│   ├── DECISIONS.md
│   └── GLOSSARY.md
├── .github/                  # CI/CD workflows
├── docker-compose.yml
├── package.json              # Root (monorepo)
├── pnpm-workspace.yaml
├── turbo.json
├── tsconfig.base.json
├── AGENTS.md                 # Rules for AI agents
├── SPEC.md                   # Architectural standards
├── PROGRESS.md               # Sprint progress
└── README.md                 # ← You are here
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 20.x ([nvm](https://github.com/nvm-sh/nvm) recommended)
- **pnpm** ≥ 9.x (`npm install -g pnpm`)
- **Docker** + **Docker Compose** (for local stack)
- **Git**

### Installation

```bash
# Clone the repository
git clone https://github.com/binguide/Modern-ERP-System.git
cd Modern-ERP-System

# Install dependencies
pnpm install
```

### Development (with Docker)

```bash
# Start all services (PostgreSQL, Redis, API, Web, Nginx)
docker compose up -d

# Watch logs
docker compose logs -f

# Stop
docker compose down
```

Access:

- **Web**: http://localhost:8080 (via Nginx) or http://localhost:5173 (Vite dev)
- **API**: http://localhost:8080/api or http://localhost:3000/api
- **API Docs (Swagger)**: http://localhost:3000/api/docs
- **PostgreSQL**: localhost:5432 (user: `erp`, pass: `erp_dev_password`, db: `modern_erp`)
- **Redis**: localhost:6379

### Development (without Docker)

```bash
# Terminal 1: Start databases
docker compose up postgres redis -d

# Terminal 2: Start API
pnpm --filter @modern-erp/api dev

# Terminal 3: Start Web
pnpm --filter @modern-erp/web dev
```

### First-time Setup

After starting the stack, run database migrations and seeds:

```bash
# Run migrations
pnpm --filter @modern-erp/api migration:run

# Run seeds (creates default roles, admin user, sample company)
pnpm --filter @modern-erp/api seed
```

**Default admin credentials** (development only):

- Email: `admin@modern-erp.com`
- Password: `admin123`

---

## 📜 Available Scripts

Run from the **root** of the monorepo:

| Command             | Description                           |
| ------------------- | ------------------------------------- |
| `pnpm install`      | Install all dependencies (workspaces) |
| `pnpm dev`          | Start all apps in dev mode (parallel) |
| `pnpm build`        | Build all apps and packages           |
| `pnpm lint`         | Lint all code (ESLint)                |
| `pnpm typecheck`    | TypeScript type-check all code        |
| `pnpm test`         | Run all tests                         |
| `pnpm test:watch`   | Run tests in watch mode               |
| `pnpm clean`        | Clean all build outputs and caches    |
| `pnpm format`       | Format all code (Prettier)            |
| `pnpm format:check` | Check code formatting                 |
| `pnpm docker:dev`   | Start full stack with Docker Compose  |
| `pnpm docker:down`  | Stop Docker Compose stack             |
| `pnpm docker:logs`  | Tail Docker Compose logs              |

### Per-app scripts

```bash
# API-specific
pnpm --filter @modern-erp/api dev
pnpm --filter @modern-erp/api build
pnpm --filter @modern-erp/api test
pnpm --filter @modern-erp/api migration:run
pnpm --filter @modern-erp/api migration:revert
pnpm --filter @modern-erp/api seed
pnpm --filter @modern-erp/api lint
pnpm --filter @modern-erp/api typecheck

# Web-specific
pnpm --filter @modern-erp/web dev
pnpm --filter @modern-erp/web build
pnpm --filter @modern-erp/web preview
pnpm --filter @modern-erp/web test
pnpm --filter @modern-erp/web lint
pnpm --filter @modern-erp/web typecheck

# Package-specific
pnpm --filter @modern-erp/shared-types build
pnpm --filter @modern-erp/shared-schemas build
```

---

## 🧪 Testing

```bash
# Unit tests (all)
pnpm test

# API tests
pnpm --filter @modern-erp/api test

# API tests in watch mode
pnpm --filter @modern-erp/api test:watch

# API E2E tests
pnpm --filter @modern-erp/api test:e2e

# Web tests
pnpm --filter @modern-erp/web test

# Coverage
pnpm --filter @modern-erp/api test:cov
```

---

## 🌐 Internationalization

The app is bilingual:

- **Arabic** (ar) — primary, default
- **English** (en) — secondary

Translation files:

- `apps/web/src/locales/ar.json`
- `apps/web/src/locales/en.json`

Add new translations:

```json
{
  "sales": {
    "quotation": {
      "title": "عرض سعر",
      "create": "إنشاء عرض سعر"
    }
  }
}
```

Use in components:

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  return <h1>{t('sales.quotation.title')}</h1>;
}
```

---

## 🗄️ Database

- **Engine**: PostgreSQL 16
- **ORM**: TypeORM 0.3
- **Migrations**: `apps/api/src/database/migrations/`
- **Seeds**: `apps/api/src/database/seeds/`

Commands:

```bash
# Generate a new migration (after entity changes)
pnpm --filter @modern-erp/api migration:generate src/database/migrations/MyChange

# Run all pending migrations
pnpm --filter @modern-erp/api migration:run

# Revert last migration
pnpm --filter @modern-erp/api migration:revert

# Run seeds
pnpm --filter @modern-erp/api seed
```

---

## 🐳 Docker

The project uses Docker Compose for local development. Services:

| Service    | Port | Description                     |
| ---------- | ---- | ------------------------------- |
| `postgres` | 5432 | PostgreSQL 16                   |
| `redis`    | 6379 | Redis 7                         |
| `api`      | 3000 | NestJS backend (with HMR)       |
| `web`      | 5173 | Vite dev server (with HMR)      |
| `nginx`    | 8080 | Reverse proxy (production-like) |

Dockerfiles:

- `docker/api.Dockerfile` — API (multi-stage, production-ready)
- `docker/web.Dockerfile` — Web (production build + Nginx)
- `docker/web.Dockerfile.dev` — Web (dev with HMR)
- `docker/nginx.conf` — Reverse proxy config

---

## 🔄 CI/CD

GitHub Actions workflows (in `.github/workflows/`):

- **lint.yml** — ESLint check on every PR
- **typecheck.yml** — TypeScript compile check
- **test.yml** — Run all tests
- **build.yml** — Build all packages

Dependabot (`.github/dependabot.yml`) keeps dependencies up to date.

---

## 📚 Documentation

| Document                                       | Purpose                                              |
| ---------------------------------------------- | ---------------------------------------------------- |
| [AGENTS.md](./AGENTS.md)                       | Rules and conventions for AI agents and contributors |
| [SPEC.md](./SPEC.md)                           | Architectural standards and tech stack decisions     |
| [PROGRESS.md](./PROGRESS.md)                   | Sprint progress tracker                              |
| [docs/ROADMAP.md](./docs/ROADMAP.md)           | Strategic plan: sprints, modules, milestones         |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | High-level architecture and patterns                 |
| [docs/DECISIONS.md](./docs/DECISIONS.md)       | Architecture Decision Records (ADRs)                 |
| [docs/GLOSSARY.md](./docs/GLOSSARY.md)         | Business and technical terms (AR/EN)                 |

---

## 🤝 Contributing

1. Read [AGENTS.md](./AGENTS.md) and [SPEC.md](./SPEC.md) first.
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes following the conventions.
4. Ensure all checks pass: `pnpm lint && pnpm typecheck && pnpm test`
5. Commit using [Conventional Commits](https://www.conventionalcommits.org/): `feat: add ...`
6. Push and open a Pull Request.

---

## 📄 License

Private / Proprietary. All rights reserved.

---

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/binguide/Modern-ERP-System/issues)
- **Documentation**: [docs/](./docs/)

---

**Built with ❤️ using modern web technologies**
