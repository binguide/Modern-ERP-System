# PRODUCT.md — Modern ERP System

> This file defines the strategic product identity for the Modern ERP System.
> It guides all UI/UX decisions, design direction, and brand expression.

---

## 1. Product Overview

A **multi-tenant, modular ERP** for small-to-medium Arabic-speaking businesses. Covers sales, inventory, purchasing, accounting, POS, and fixed assets — as a modern single-page application accessible from any browser.

## 2. Register

**Mixed — Product UI + Brand Surface.**

The app is primarily a data-dense enterprise admin panel (tables, forms, dashboards, CRUD), but the **login page** and **branding surfaces** (logo, favicon, app name, color identity) carry marketing weight. They set the first impression of trustworthiness and modernity for business owners evaluating the system.

## 3. Target Users

**ERP power users** — daily, intensive use:

- **Accountants** — journal entries, chart of accounts, fiscal years, taxes, financial reports
- **Inventory / warehouse managers** — items, stock movements, units of measure, item groups
- **Sales teams** — customers, quotations, sales orders, pricing
- **Purchasing teams** — purchase orders, suppliers
- **Administrators** — users, roles, permissions, branches, audit logs
- **Business owners** — dashboards, approvals, oversight (less frequent but high impact)

Primary language: **Arabic** (RTL). Secondary: **English** (LTR).

## 4. Brand Personality

| Axis                | Position                                         |
| ------------------- | ------------------------------------------------ |
| **Tone**            | Modern & Efficient                               |
| **Feeling**         | Sleek, fast, data-dense                          |
| **Vibe**            | ERPNext / Odoo / Zoho — but cleaner, more modern |
| **Energy**          | Professional, no-nonsense, confident             |
| **Color direction** | Blue-primary, clean whites, subtle grays         |

The interface should feel **fast and capable** — never bloated, never distracting. Every pixel serves data or an action.

## 5. Design Principles

1. **Data density done right** — users need to see a lot of information at once without feeling overwhelmed. Compact tables, tight spacing, clear hierarchy.
2. **Efficiency over delight** — animations and visual polish are welcome but must never slow down the user. Form autofocus, keyboard navigation, bulk actions matter more.
3. **ERPNext-inspired familiarity** — users migrating from ERPNext/Odoo should feel at home. Same patterns: tabs on forms, Many2One search fields, status tags, compact tables with action buttons on hover.
4. **Bilingual by default** — Arabic RTL is the primary layout. English LTR must work perfectly too. Nothing should break in either direction.
5. **Dark mode is not an afterthought** — both themes must feel equally polished. Dark mode isn't just inverted colors; it's a separate design that respects the same information hierarchy.
6. **Multi-tenant everywhere** — every screen, every query, every form must respect the current tenant (companyId). Never show data from another company.
7. **Trust through transparency** — audit logs on sensitive actions, clear error messages, no silent failures. The user should always know what happened.

## 6. Visual Identity

**Already established (to be respected and evolved):**

- **Primary:** `#2563eb` (blue-600) light, `#3b82f6` (blue-500) dark
- **Background:** `#f0f4f8` light, `#0a0a0f` dark
- **Surface:** white light, `#13131a` dark
- **Sidebar:** `#0f172a` (slate-900) — always dark
- **Border radius:** 10px default, 14px large, 8px small
- **Font stack:** Tajawal (Arabic) + Plus Jakarta Sans (English), loaded from Google Fonts
- **Border radius:** Pill-shaped tags, rounded cards, subtle shadows
- **Login page:** Dark gradient background with glass-morphism card, blue gradient icon, blue gradient CTA

**Open questions (to decide in DESIGN.md if needed):**

- Custom logo / favicon beyond the current `SafetyCertificateOutlined` + Vite default?
- Illustration style for empty states?

## 7. Competitive Landscape

| System           | Strengths                                                     | Weaknesses vs Us                        |
| ---------------- | ------------------------------------------------------------- | --------------------------------------- |
| **ERPNext**      | Comprehensive, open-source, Arabic support                    | Dated UI, complex setup, slow           |
| **Odoo**         | Beautiful UI, modular apps                                    | Expensive, Python stack, limited Arabic |
| **Zoho**         | Modern, reliable                                              | Proprietary, not customizable           |
| **Tally**        | Accounting depth                                              | Desktop-only, old UI                    |
| **Our position** | Modern SPA, TypeScript end-to-end, Arabic-first, multi-tenant | Less mature, smaller ecosystem          |

## 8. Accessibility & UX Requirements

- WCAG 2.1 AA compliance target
- Keyboard-navigable forms and tables
- Screen reader support for Arabic
- Color contrast meets 4.5:1 for text in both themes
- All icons have `aria-label` where needed
- Form validation errors are clear and actionable
- Loading states (skeleton screens) for all async operations

## 9. Scope Boundaries (What We Are Not)

- Not a marketing site or landing page
- Not a mobile app (responsive but desktop-first)
- Not a no-code/low-code builder
- Not a social or collaborative platform
- Not a design system for external consumption (this is one application)

## 10. User Goals (Jobs to Be Done)

| User              | Job                                                                |
| ----------------- | ------------------------------------------------------------------ |
| Accountant        | "I want to post a journal entry and see the GL impact immediately" |
| Warehouse manager | "I want to find an item and check its stock in all warehouses"     |
| Sales agent       | "I want to create a quotation for a customer in under 30 seconds"  |
| Admin             | "I want to create a role with specific permissions and assign it"  |
| Business owner    | "I want a dashboard that shows me the health of my business today" |

Every UI decision should ask: _does this make the user's job faster or clearer?_
