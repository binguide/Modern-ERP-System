# 🗺️ Project Roadmap

This document outlines the strategic plan for the Modern ERP System, organized into sprints.

## 🎯 Vision

A multi-tenant, modular ERP system supporting:

- **Sales & POS** — Quotations, orders, invoices, point-of-sale
- **Inventory** — Multi-warehouse stock, batch/serial tracking, transfers
- **Purchasing** — Purchase requests, orders, goods receipts, invoices
- **Accounting** — Chart of accounts, journals, fiscal periods, multi-currency
- **HR** (future) — Employees, payroll
- **Manufacturing** (future) — BOMs, work orders
- **Fixed Assets** (future) — Depreciation, disposal

---

## 📅 Sprint Breakdown

### ✅ Sprint 0: Foundation (Week 1)

**Status:** 🚧 In Progress

**Deliverables:**

- ✅ Monorepo setup (pnpm + Turborepo)
- ✅ TypeScript strict mode
- ✅ Backend skeleton (NestJS 10 + TypeORM)
- ✅ Frontend skeleton (React 18 + Vite + Ant Design)
- ✅ Shared packages (types, schemas, utils)
- ✅ Docker Compose (PostgreSQL + Redis + API + Web)
- ✅ GitHub Actions CI (lint, typecheck, test, build)
- ✅ Code quality tools (ESLint, Prettier, Husky, Commitlint)
- ✅ Documentation (AGENTS.md, SPEC.md, PROGRESS.md, docs/)

---

### 🚧 Sprint 1: Auth + RBAC + Multi-tenancy (Weeks 2-4)

**Status:** 📋 Planned

**Deliverables:**

- [ ] Database schema: `companies`, `branches`, `fiscal_years`, `periods`
- [ ] Database schema: `users`, `roles`, `user_roles`, `role_permissions`
- [ ] Database schema: `audit_logs`
- [ ] **Auth Module**: login, refresh, logout, me, change-password
- [ ] **RBAC Module**: roles, permissions matrix
- [ ] **Multi-tenant Guard**: companyId from JWT
- [ ] **CASL Integration**: ability factory, guards
- [ ] **Seeds**: admin user, 5 default roles, sample company
- [ ] **Frontend**: Login page, ProtectedRoute, `<Can>` component
- [ ] **Frontend**: Users CRUD, Roles management
- [ ] **Frontend**: Sidebar respects permissions

**Definition of Done:**

- ✅ Login as `admin/admin` works
- ✅ Create user, assign role, see only what they have permission for
- ✅ Audit log captures all changes
- ✅ Switch between companies

---

### 📋 Sprint 2: Accounting Core (Weeks 5-7)

**Status:** 🔜 Future

**Deliverables:**

- [ ] Schema: `accounts` (tree), `journals`, `journal_lines`
- [ ] Schema: `cost_centers`, `projects`, `budgets`
- [ ] Schema: `currencies` (with exchange rates history)
- [ ] **Module**: Chart of Accounts (CRUD + tree view)
- [ ] **Module**: Journal Entries (manual entry + auto-posting)
- [ ] **Module**: Vouchers (receipt / payment)
- [ ] **Module**: Fiscal Years & Periods
- [ ] **Reports**: Trial Balance, Income Statement, Balance Sheet, Cash Flow
- [ ] **Reports**: General Ledger
- [ ] **Posting Rules Engine**

**Definition of Done:**

- ✅ Post a journal entry manually
- ✅ Trial balance balances to zero
- ✅ All three financial statements generate correctly

---

### 📋 Sprint 3: Inventory (Weeks 8-10)

**Status:** 🔜 Future

**Deliverables:**

- [ ] Schema: `uom_categories`, `uoms`, `items`, `item_units`
- [ ] Schema: `item_categories`, `warehouses`, `stock_balances`, `stock_transactions`
- [ ] Schema: `batches`, `serials`
- [ ] **Module**: Items CRUD with multi-UoM
- [ ] **Module**: Warehouses
- [ ] **Module**: Stock Transfers
- [ ] **Module**: Stock Reconciliation
- [ ] **Reports**: Stock Ledger, Inventory Valuation, Reorder Alerts

**Definition of Done:**

- ✅ Create item with multiple UoMs and conversion factors
- ✅ Stock movements create immutable transactions log
- ✅ Multi-warehouse stock balances correct

---

### 📋 Sprint 4: Sales (Weeks 11-13)

**Status:** 🔜 Future

**Deliverables:**

- [ ] Schema: `customers`, `price_lists`, `price_list_lines`
- [ ] Schema: `quotations`, `quotation_lines`, `quotation_versions`
- [ ] Schema: `quotation_terms`, `quotation_activities`
- [ ] Schema: `sales_orders`, `so_lines`, `sales_invoices`, `invoice_lines`
- [ ] Schema: `payments`
- [ ] **Module**: Customers CRUD
- [ ] **Module**: Price Lists
- [ ] **Module**: Quotations (with versioning on rejection-revise)
- [ ] **Module**: Sales Orders
- [ ] **Module**: Sales Invoices
- [ ] **Module**: Payments
- [ ] **State Machine**: quotation workflow (Draft → Sent → Reviewing → Accepted/Rejected → SO)
- [ ] **Multi-currency**: freeze exchange rate at send time

**Definition of Done:**

- ✅ Create quotation, send, accept → auto-creates SO 1:1
- ✅ Reject + revise creates new version snapshot
- ✅ Multi-currency works with locked rates

---

### 📋 Sprint 5: Purchases + Fixed Assets (Weeks 14-16)

**Status:** 🔜 Future

**Deliverables:**

- [ ] Schema: `suppliers`, `purchase_requests`, `purchase_orders`, `po_lines`
- [ ] Schema: `purchase_receipts`, `receipt_lines`, `purchase_invoices`
- [ ] Schema: `landed_costs`
- [ ] Schema: `asset_categories`, `fixed_assets`, `asset_depreciation_*`, `asset_disposals`
- [ ] **Module**: Suppliers
- [ ] **Module**: Purchase flow (PR → PO → GR → Invoice)
- [ ] **Module**: Landed Costs (distribute to items)
- [ ] **Module**: Fixed Assets
- [ ] **Module**: Depreciation (Straight-line + Declining balance)

**Definition of Done:**

- ✅ Full purchase cycle from PR to Invoice
- ✅ Depreciation schedule generates correctly
- ✅ Asset disposal creates gain/loss journal

---

### 📋 Sprint 6: POS (Weeks 17-18)

**Status:** 🔜 Future

**Deliverables:**

- [ ] Schema: `pos_terminals`, `pos_sessions`, `pos_transactions`, `pos_trans_lines`
- [ ] **Module**: POS Terminal Setup
- [ ] **Module**: POS Session Management (open/close, cash drawer)
- [ ] **Module**: Touch-Optimized Sales UI
- [ ] **Module**: Receipt Printing (thermal + A4)
- [ ] **Module**: Held Sales / Resume

**Definition of Done:**

- ✅ Open session, perform sales, close session with expected vs actual cash
- ✅ Receipt prints correctly
- ✅ Held sales resume correctly

---

### 📋 Sprint 7: Advanced Reports + HR + Manufacturing (Weeks 19-21)

**Status:** 🔜 Future

**Deliverables:**

- [ ] Reports: Aged Receivables/Payables
- [ ] Reports: Customer/Product Profitability
- [ ] Reports: ABC Analysis
- [ ] Reports: Cash Forecast
- [ ] Reports: Budget vs Actual
- [ ] Module: Employees
- [ ] Module: BOMs + Work Orders (basic)

---

### 📋 Sprint 8: Integrations + Polish (Weeks 22-24)

**Status:** 🔜 Future

**Deliverables:**

- [ ] **State Machine Engine** (generic, configurable via UI)
- [ ] **Email Notifications** (Nodemailer + templates)
- [ ] **File Uploads** (S3-compatible)
- [ ] **Approval Workflows**
- [ ] **ZATCA E-Invoicing** (Saudi Arabia)
- [ ] **E2E Tests** (Playwright)
- [ ] **Performance Optimization**
- [ ] **Production Deployment** (Docker, CI/CD, monitoring)

---

## 📊 Milestones

| Milestone                                  | Sprint   | Status         |
| ------------------------------------------ | -------- | -------------- |
| **M1: Foundation Ready**                   | Sprint 0 | 🚧 In Progress |
| **M2: Login Works + Permissions Enforced** | Sprint 1 | 📋 Planned     |
| **M3: Full Accounting Cycle**              | Sprint 2 | 📋 Planned     |
| **M4: Inventory Tracked**                  | Sprint 3 | 📋 Planned     |
| **M5: Sales Flow Complete**                | Sprint 4 | 📋 Planned     |
| **M6: Purchasing + Assets**                | Sprint 5 | 📋 Planned     |
| **M7: POS Production-Ready**               | Sprint 6 | 📋 Planned     |
| **M8: ERP Feature-Complete**               | Sprint 8 | 🔮 Future      |

---

## 🎯 North Star Metrics

- **Time to first sale**: < 2 minutes from login
- **Report generation**: < 5 seconds for 1 year of data
- **Concurrent users**: 50+ supported
- **Uptime**: 99.5%
- **Data integrity**: zero accounting discrepancies

---

**Last Updated:** 2026-01-XX
**Status:** 🚧 Sprint 0 in progress
