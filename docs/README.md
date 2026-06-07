# Modern ERP System — Documentation Index

Welcome to the Modern ERP System documentation. This is a multi-tenant ERP platform built with modern web technologies.

## 📚 Available Documents

| Document | Purpose |
|---|---|
| [ROADMAP.md](./ROADMAP.md) | Strategic plan: sprints, modules, milestones |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Technical architecture: stack, layers, patterns |
| [DECISIONS.md](./DECISIONS.md) | Architecture Decision Records (ADRs) |
| [GLOSSARY.md](./GLOSSARY.md) | Business and technical terms (AR/EN) |

## 🏠 Root-level Documents

- [AGENTS.md](../AGENTS.md) — Rules and conventions for AI agents
- [SPEC.md](../SPEC.md) — Architectural decisions and standards
- [PROGRESS.md](../PROGRESS.md) — Sprint progress tracking
- [README.md](../README.md) — Getting started, installation, and usage

## 🏗️ Project Structure

```
Modern Erp System/
├── apps/
│   ├── api/          # NestJS backend
│   └── web/          # React + Vite frontend
├── packages/         # Shared libraries
│   ├── shared-types/
│   ├── shared-schemas/
│   ├── shared-utils/
│   └── eslint-config/
├── docker/           # Docker configurations
├── .github/          # CI/CD workflows
├── docs/             # ← You are here
└── ...
```

## 🚀 Quick Links

- **Sprint 0**: [Foundation & Tooling](../PROGRESS.md#sprint-0-foundation)
- **Sprint 1**: [Auth + RBAC + Multi-tenancy](../PROGRESS.md#sprint-1-auth--rbac)
- **Tech Stack**: [Architecture → Tech Stack](./ARCHITECTURE.md#tech-stack)

---

**Last Updated:** 2026-01-XX (Auto-tracked by PROGRESS.md)
