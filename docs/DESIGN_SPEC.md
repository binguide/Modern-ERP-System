# Handoff: Master-Detail Form (ERPNext-style)

## Overview

A full-page, desktop ERP form for creating and managing Forms. It includes a master section (header fields), a detail child table (line items), section tabs, a collapsible right sidebar (Activity / Comments / Files), and a complete document workflow (Draft → Saved → Submitted → Cancelled → Amended).

Two visual variations were designed. **Variation 1 (Classic ERPNext v16)** is the primary target — it closely matches ERPNext v16's visual language. **Variation 2 (Modern/Refined)** is an optional modernised interpretation of the same layout.

---

## About the Design Files

The file `Sales Order.dc.html` in this bundle is an **HTML design prototype** — a high-fidelity reference showing intended look, layout, and interactive behavior. It is **not** production code. Your task is to **recreate this design inside the target codebase** using its existing framework (React, Vue, Django templates, etc.) and component library. Do not ship the HTML file directly.

## Fidelity

**High-fidelity.** All colors, spacing, typography, border radii, and shadows are final. Recreate pixel-accurately using the codebase's existing libraries and patterns.

---

## Layout Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  App Navbar (46px tall, white, bottom border)                   │
├─────────────────────────────────────────────────────────────────┤
│  Document Title Bar (auto height, white, bottom border)         │
│  [Doc ID]  [Status Badge]  [Unsaved indicator?]  [★ star]       │
├─────────────────────────────────────────────────────────────────┤
│  Toolbar (auto height, white, bottom border)                    │
│  [Save] [Discard] [Submit] [Cancel] [Amend] | [Print] [Email]   │
├──────────────────────────────────────┬──────────────────────────┤
│  Main Form Area (flex:1, scrollable) │  Sidebar (272px, fixed)  │
│                                      │                          │
│  [Section Tabs]                      │  [Activity|Comments|     │
│  [Tab Body — 2-col grid fields]      │   Files]                 │
│                                      │                          │
│  [Items Section]                     │  [Content per tab]       │
│  [Table: thead + tbody rows]         │                          │
│  [Add Row button]                    │                          │
│  [Totals: Subtotal, Tax, Grand]      │                          │
└──────────────────────────────────────┴──────────────────────────┘
```

Full height: `100vh`. The main form and sidebar each scroll independently (overflow-y: auto).

---

## Design Tokens

### Colors (Variation 1 — Classic ERPNext v16)

| Token             | Value                    | Usage                                      |
| ----------------- | ------------------------ | ------------------------------------------ |
| Primary           | `#2490ef`                | Buttons, active tabs, links, focus outline |
| Page Background   | `#f0f4f9`                | Body background                            |
| Surface           | `#ffffff`                | Cards, toolbar, sidebar                    |
| Section Header BG | `#f8f9fa`                | Table thead, section header strip          |
| Text Primary      | `#36414c`                | Body text, field values                    |
| Text Muted        | `#8d99a6`                | Field labels, helper text                  |
| Text Faint        | `#adb5bd`                | Timestamps, secondary info                 |
| Border            | `#e8ecf0`                | All dividers and card borders              |
| Border Input      | `#d1d8dd`                | Input/select borders                       |
| Status: Draft     | `#f59e0b` / bg `#fffbeb` | Draft badge                                |
| Status: Saved     | `#2490ef` / bg `#eff6ff` | Saved badge                                |
| Status: Submitted | `#10b981` / bg `#ecfdf5` | Submitted badge                            |
| Status: Cancelled | `#ef4444` / bg `#fef2f2` | Cancelled badge                            |
| Danger            | `#ef4444`                | Required asterisks, cancel button          |
| Success           | `#10b981`                | Submit button                              |
| Amend             | `#8b5cf6`                | Amend button                               |

### Typography

- **Font family:** `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **Base size:** 13px
- **Field labels:** 11px, `font-weight: 500`, `text-transform: uppercase`, `letter-spacing: 0.5px`, color `#8d99a6`
- **Doc title:** 18px, `font-weight: 700`, color `#1a1a1a`
- **Section heading:** 13px, `font-weight: 600`, color `#36414c`
- **Button text:** 13px, `font-weight: 600`
- **Table header:** 11px, `font-weight: 600`, color `#8d99a6`
- **Table cell:** 13px, color `#36414c`
- **Sidebar tab:** 12px
- **Comment/activity text:** 12px

### Spacing

- Toolbar & title bar padding: `7px 20px`
- Form content padding: `16px 20px`
- Form grid gap: `16px 28px`
- Tab button padding: `9px 16px`
- Table cell padding: `8px 10px`
- Sidebar padding: `14px`
- Card/section border-radius: `5px`

### Inputs & Controls

```css
input,
select {
  width: 100%;
  border: 1px solid #d1d8dd;
  border-radius: 4px;
  padding: 5px 8px;
  font-size: 13px;
  color: #36414c;
  background: #fff;
  font-family: inherit;
}
/* Locked/read-only state */
input[readonly],
input.locked {
  background: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
}
```

### Buttons

```css
/* Primary (Save) */
background: #2490ef;
color: #fff;
border: none;
border-radius: 4px;
padding: 6px 16px;

/* Secondary (Discard, Print, Email) */
background: none;
color: #6c757d;
border: 1px solid #d1d8dd;
border-radius: 4px;
padding: 6px 14px;

/* Submit */
background: #10b981;
color: #fff;
border: none;

/* Cancel */
background: none;
color: #ef4444;
border: 1px solid #ef4444;

/* Amend */
background: #8b5cf6;
color: #fff;
border: none;

/* Add Row (dashed) */
background: none;
border: 1px dashed #2490ef;
color: #2490ef;
border-radius: 4px;
padding: 5px 14px;
```

---

## Screens / Views

### 1. App Navbar

- **Height:** 46px, `background: #fff`, `border-bottom: 1px solid #e8ecf0`
- **Left:** hamburger icon (3 horizontal lines, `#8d99a6`) → ERPNext logo text (`font-size: 17px, font-weight: 700, color: #2490ef`) → breadcrumb: `Selling › Sales Order › SAL-ORD-2026-00001` (first two items are blue links)
- **Right:** search icon, notification bell (with red dot badge `#ef4444`), user avatar circle (28px, `background: #2490ef`, white initials `AD`)

### 2. Document Title Bar

- **Background:** `#fff`, `border-bottom: 1px solid #e8ecf0`, padding `10px 20px`
- **Left:**
  - Document name: `SAL-ORD-2026-00001` — 18px, weight 700
  - Subtitle: `Sales Order · {customer}` — 12px, color `#8d99a6`
- **Status badge** (pill): colored dot + status text, `border-radius: 100px`, `padding: 3px 10px`, border + background tinted to status color
- **Unsaved indicator** (conditional): amber pill `● Unsaved`, only shown when `isDirty === true`
- **Right:** ☆ star icon (favoriting)

### 3. Toolbar

- **Background:** `#fff`, `border-bottom: 1px solid #e8ecf0`, `padding: 7px 20px`
- **Button visibility rules (mutually exclusive states):**

| Condition                                   | Visible Buttons              |
| ------------------------------------------- | ---------------------------- |
| `isDirty && status !== Submitted/Cancelled` | **Save** (primary) + Discard |
| `!isDirty && status === Saved`              | **Submit** (green)           |
| `status === Submitted`                      | **Cancel** (red outline)     |
| `status === Cancelled`                      | **Amend** (purple)           |

- **Always visible:** Print, Email, ⋮ more-actions, ⇄ sidebar toggle (right-aligned)

### 4. Section Tabs

- Tab bar: `background: #fff`, `border: 1px solid #e8ecf0`, `border-radius: 5px 5px 0 0`
- Tabs: **Details**, **Pricing**, **Accounting**, **More Info**
- Active tab: `border-bottom: 2px solid #2490ef`, `color: #2490ef`, `font-weight: 600`
- Inactive tab: `border-bottom: 2px solid transparent`, `color: #8d99a6`, `font-weight: 400`
- Tab body: `background: #fff`, `border: 1px solid #e8ecf0`, `border-radius: 0 0 5px 5px`, `padding: 20px 22px`

### 5. Form Fields (Details Tab)

2-column CSS grid, `gap: 16px 28px`:

| Field             | Type       | Required | Notes                                           |
| ----------------- | ---------- | -------- | ----------------------------------------------- |
| Customer          | text input | ✓        |                                                 |
| Date              | date input | ✓        |                                                 |
| Customer's PO No. | text input |          |                                                 |
| Delivery Date     | date input |          |                                                 |
| Company           | select     | ✓        | Options: Frappe Technologies, ERPNext Solutions |
| Order Type        | select     |          | Options: Sales, Maintenance, Shopping Cart      |
| Shipping Address  | text input |          | Full width (`grid-column: 1 / -1`)              |

**Pricing Tab** (2-col grid):
Currency (select), Exchange Rate (number), Selling Price List (select), Payment Terms (select), Taxes Template (select — full width)

**Accounting Tab** (2-col grid):
Debit To (read-only), Income Account (read-only), Cost Center, Project

**More Info Tab** (2-col grid):
Territory (select), Sales Person (text), Source (select), Campaign (text)

### 6. Items Child Table (Detail section)

**Section header strip:** `background: #f8f9fa`, `border-bottom: 1px solid #e8ecf0`, `padding: 10px 16px`

- Left: "Items" label (13px, weight 600)
- Right: "{n} rows · click cell to edit" (12px, muted)

**Table columns:**

| #   | Column         | Width | Align  |
| --- | -------------- | ----- | ------ |
| 1   | # (row number) | 40px  | center |
| 2   | Item Code      | 130px | left   |
| 3   | Item Name      | flex  | left   |
| 4   | Qty            | 70px  | right  |
| 5   | UOM            | 70px  | center |
| 6   | Rate (USD)     | 110px | right  |
| 7   | Amount (USD)   | 120px | right  |
| 8   | Delete (×)     | 36px  | center |

**Row styling:**

- Even rows: `#fff`, Odd rows: `#fafafa`
- Editing row background: `#f0f6ff`
- Cell padding: `8px 10px`, `border-bottom: 1px solid #f0f0f0`

**Inline cell editing:** Clicking a cell in an editable row switches it to an `<input>` with `outline: 2px solid #2490ef`. Pressing Enter/Tab/Escape confirms. Amount column (`rate × qty`) auto-recalculates on every keystroke in rate or qty.

**Add Row button:** `border: 1px dashed #2490ef`, only visible when doc is not Submitted/Cancelled.

**Totals block** (right-aligned, 290px wide):

```
Subtotal          $XX,XXX.00
Tax 10%           $X,XXX.00
────────────────────────────
Grand Total (USD) $XX,XXX.00   ← #2490ef, weight 700, font-size 15px
```

### 7. Right Sidebar

- **Width:** 272px, `background: #fff`, `border-left: 1px solid #e8ecf0`
- **Collapsible** via toolbar ⇄ button (toggle `sidebarOpen` state)
- **Tab bar:** Activity | Comments | Files (same underline-active style as section tabs, 12px)

**Activity tab:**

- List of activity events, newest first
- Each item: colored avatar circle (26px, initials, background = activity type color) + user name + action text + timestamp
- Activity type colors: create `#10b981`, save `#2490ef`, submit `#10b981`, cancel `#ef4444`, comment `#f59e0b`, amend `#8b5cf6`

**Comments tab:**

- Textarea (3 rows) + "Post Comment" button (`#2490ef`)
- Comment list: left border `2px solid #e8ecf0`, avatar + user + timestamp + body text

**Files tab:**

- "Attach Files" dashed button
- File list: icon + filename (blue link) + size + date

---

## State Management

### Document Status FSM

```
Draft  →[Save]→  Saved  →[Submit]→  Submitted  →[Cancel]→  Cancelled
                                                              ↓[Amend]
                                                            Draft (new)
```

### Key State Variables

```ts
interface SalesOrderState {
  docStatus: 'Draft' | 'Saved' | 'Submitted' | 'Cancelled';
  isDirty: boolean; // true when any field has been changed since last save
  tab: 'details' | 'pricing' | 'accounting' | 'more';
  sidebarOpen: boolean;
  sidebarTab: 'activity' | 'comments' | 'attachments';
  editingCell: { row: number; col: string } | null; // for inline table editing

  // Master fields
  customer: string;
  poNo: string;
  date: string; // ISO date
  deliveryDate: string;
  company: string;
  currency: string;
  conversionRate: string;
  priceList: string;
  paymentTerms: string;
  territory: string;
  salesPerson: string;
  orderType: string;
  taxTemplate: string;
  shippingAddress: string;

  // Detail rows
  items: Array<{
    id: number;
    itemCode: string;
    itemName: string;
    qty: number;
    uom: string;
    rate: number;
    amount: number; // always = qty × rate
  }>;

  activities: Activity[];
  comments: Comment[];
  attachments: Attachment[];
  newComment: string;
}
```

### Computed Values

```ts
const subtotal = items.reduce((sum, i) => sum + i.amount, 0);
const taxAmount = subtotal * 0.1; // tax rate from taxTemplate
const grandTotal = subtotal + taxAmount;

// Button visibility
const canSave = isDirty && docStatus !== 'Submitted' && docStatus !== 'Cancelled';
const canDiscard = isDirty;
const canSubmit = !isDirty && docStatus === 'Saved';
const canCancel = docStatus === 'Submitted';
const canAmend = docStatus === 'Cancelled';
const canEdit = docStatus !== 'Submitted' && docStatus !== 'Cancelled';
```

---

## Interactions & Behavior

### Save

1. Set `docStatus = 'Saved'` (if was Draft), `isDirty = false`
2. Append activity entry: type `save`, text "Document saved"
3. Show toast notification "Document Saved" (green left border, 3.5s auto-dismiss)
4. Toast: `position: fixed; top: 16px; right: 20px; z-index: 9999; background: #fff; border-radius: 6px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); border-left: 4px solid #10b981; padding: 12px 18px`

### Submit / Cancel / Amend

Same toast pattern, advance/revert `docStatus`, log activity entry.

### Inline Table Editing

- Clicking a non-locked cell sets `editingCell = { row: idx, col: fieldName }`
- That cell renders an `<input>` with `autoFocus`
- `onChange`: update item, recalculate `amount` if `qty` or `rate` changed
- `onBlur` / Enter / Tab / Escape: clear `editingCell`
- `onClick` on input: `stopPropagation()` to prevent row deselect

### Unsaved Indicator

- Show amber `● Unsaved` pill in the title bar when `isDirty === true`

### Sidebar Toggle

- `sidebarOpen` boolean; the sidebar element is conditionally rendered (or CSS `display:none`)

---

## Variation 2 — Modern/Refined (optional)

All interactions identical to V1. Visual differences:

| Property              | V1 Classic       | V2 Modern                                           |
| --------------------- | ---------------- | --------------------------------------------------- |
| Navbar background     | `#fff`           | `#0f172a` (dark slate)                              |
| Navbar logo color     | `#2490ef`        | `#38bdf8`                                           |
| Page background       | `#f0f4f9`        | `#f1f5f9`                                           |
| Status display        | Pill badge       | Step indicator (1→2→3 circles with connecting line) |
| Input border-radius   | `4px`            | `7px`                                               |
| Input padding         | `5px 8px`        | `7px 10px`                                          |
| Section border-radius | `5px`            | `8px`                                               |
| Field label style     | ALL CAPS, 11px   | Title case, 12px, weight 600, color `#475569`       |
| Button border-radius  | `4px`            | `6px`                                               |
| Comment card style    | Left border only | Rounded card `background: #f8fafc`                  |

**Step indicator (V2 only):**
3 circles connected by lines. Circle `background`:

- Done step → `#10b981`
- Active step → `#2490ef`
- Future step → `#e2e8f0`
  Connecting line color follows the left-side step.

---

## Files in This Bundle

| File                  | Description                                                                 |
| --------------------- | --------------------------------------------------------------------------- |
| `Sales Order.dc.html` | High-fidelity interactive prototype (design reference, not production code) |
| `README.md`           | This document                                                               |

---

## Implementation Notes for the Coding Agent

1. **Recreate in your existing framework** — React, Vue, Django/Jinja, etc. Do not ship the HTML file.
2. **Use your existing component library** for inputs, selects, buttons, tabs, and toasts where possible. Override styles to match the tokens above.
3. **The items table inline editing** is the most complex piece — the core logic is in the `buildTable()` function inside the prototype's logic class (search `buildTable` in the HTML file).
4. **Document status FSM** drives all button visibility. Centralise this in a state machine or a simple `docStatus` field.
5. **Amount auto-calc:** always `amount = qty × rate` — compute on every `qty`/`rate` change, never store separately in a way that can drift.
6. **Toast notifications** should be accessible (role="alert", aria-live="polite").
7. **Sidebar** should be ARIA-labelled and focusable from keyboard.
8. **Locked state:** when `docStatus` is `Submitted` or `Cancelled`, all inputs and the items table must be read-only. Buttons in the table (delete row) must also be hidden.
