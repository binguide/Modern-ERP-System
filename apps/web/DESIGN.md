# DESIGN.md — Modern ERP System

> Technical design spec for component structure, states, responsive behavior, and accessibility.
> Complements PRODUCT.md with implementation-level design decisions.

---

## 1. Page Types & Layouts

### 1.1 Login Page (`/login`)

| Aspect         | Spec                                                                                     |
| -------------- | ---------------------------------------------------------------------------------------- |
| **Layout**     | Centered card (max 440px) on full-viewport dark gradient with decorative orbs            |
| **States**     | idle → submitting → error (inline validation) → redirect on success                      |
| **Responsive** | Card goes full-width (padding 24px) below 480px; background gradient simplifies          |
| **RTL**        | Form layout flips; icon left-of-text becomes right                                       |
| **A11y**       | `autoFocus` on email field; enter-to-submit; `aria-label` on inputs; error announcements |

**Elements in order:**

1. Logo icon (64×64, blue gradient, rounded 16px)
2. App title "Modern ERP" (h3)
3. Subtitle "Sign in to your account"
4. Email input with MailOutlined icon
5. Password input with LockOutlined icon
6. "Sign in" gradient button (full-width, 44px height)
7. Copyright footer text

### 1.2 Dashboard Page (`/`)

| Aspect         | Spec                                                                                |
| -------------- | ----------------------------------------------------------------------------------- |
| **Layout**     | Page header (title + date) → stat cards row (4 cards) → charts section (2 columns)  |
| **States**     | loading (PageSkeleton) → data → error (ErrorBoundary/Result)                        |
| **Responsive** | Stat cards: 4 col → 2 col at 992px → 1 col at 576px. Charts: 2 col → 1 col at 768px |
| **RTL**        | Cards in reverse order; charts mirror                                               |

### 1.3 List Pages (`/branches`, `/users`, `/items`, etc.)

| Aspect         | Spec                                                                                      |
| -------------- | ----------------------------------------------------------------------------------------- |
| **Layout**     | Page header (title + "Create" button) → search bar → DataGrid                             |
| **States**     | loading (skeleton rows) → empty (Result illustration + "Create first" CTA) → data → error |
| **Responsive** | Below 768px: search bar stacks below title; table becomes horizontally scrollable         |
| **RTL**        | Columns reverse; pagination controls flip                                                 |
| **A11y**       | `aria-sort` on column headers; skip-link to table body; keyboard-navigable rows           |

### 1.4 Form Pages (`/branches/new`, `/items/:id/edit`, etc.)

| Aspect         | Spec                                                                                                                       |
| -------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Layout**     | Breadcrumb → ActionBar (title + buttons) → Card → Tabs (each tab = section of fields)                                      |
| **States**     | loading (skeleton for edit mode) → form → submitting (buttons loading) → validation error → success (redirect) → API error |
| **Responsive** | Tabs → stacked accordion below 768px; ActionBar buttons collapse to "More" menu at 576px                                   |
| **RTL**        | Tabs reverse order; form field label+input swap sides                                                                      |
| **A11y**       | `aria-current="page"` on last breadcrumb; tab roles correct; first invalid field auto-focused on submit                    |

---

## 2. Component Specifications

### 2.1 AppLayout (Shell)

| Variant             | Behavior                                                            |
| ------------------- | ------------------------------------------------------------------- |
| Desktop (≥1200px)   | Sidebar visible (240px) + header (56px) + content with padding 24px |
| Tablet (768–1199px) | Sidebar collapsed to icons (64px); expandable on hover/click        |
| Mobile (<768px)     | Sidebar hidden; hamburger button in header opens drawer             |

- Header: sticky top, z-index 100, white bg light / `#13131a` bg dark
- Sidebar: sticky top, `#0f172a`, border-right, z-index 99

### 2.2 DataGrid (Generic Table)

| State       | Render                                                 |
| ----------- | ------------------------------------------------------ |
| **Loading** | 10 skeleton rows with pulse animation                  |
| **Empty**   | AntD Empty with i18n message + "Create" action button  |
| **Error**   | AntD Result with error message + retry button          |
| **Data**    | Table with sortable headers, pagination, row selection |

| Feature           | Spec                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------ |
| Table style       | Compact (`size="small"`), header bg `#f8fafc` light / `#1a1a26` dark, zebra striping |
| Row height        | 48px (compact)                                                                       |
| Action column     | Fixed right column — view/edit/delete icons visible on row hover                     |
| Pagination        | Bottom-right, showSizeChanger, pageSizeOptions [10, 20, 50, 100]                     |
| Column visibility | TableMenu dropdown with checkboxes                                                   |
| Group-by          | TableMenu → column picker → grouped rows with expand/collapse                        |
| Batch actions     | Checkbox column → action bar appears on selection (delete, export)                   |
| Search            | Debounced input (300ms), clears on escape                                            |
| Sort              | Multi-column sort via shift+click headers                                            |
| Selection         | Preserved across pages (TanStack Query + Zustand)                                    |

### 2.3 PageFormView (Form Wrapper)

| Aspect   | Spec                                                         |
| -------- | ------------------------------------------------------------ |
| Width    | Max 960px, centered with `mx-auto`                           |
| Card     | No border, shadow on hover, border-radius 14px               |
| Title    | Page title (h3), bold                                        |
| Children | Rendered as-is inside Card — typically Tabs or direct fields |

### 2.4 ActionBar (Form Action Bar)

| State          | Render                                                                   |
| -------------- | ------------------------------------------------------------------------ |
| **Default**    | Left: Cancel (link). Right: Save/Update (primary). Always: Print (ghost) |
| **Editing**    | Also shows Delete (danger ghost) on left                                 |
| **Submitting** | Save/Update shows loading spinner; all other buttons disabled            |
| **Error**      | Save enabled again; error displayed inline or via message.error()        |

**Responsive:** Below 480px, secondary buttons (Print, Delete) collapse into a "..." dropdown.

### 2.5 Breadcrumb

| Aspect    | Spec                                                |
| --------- | --------------------------------------------------- |
| Items     | Array of `{label, path?}` — last item bold, no link |
| Icons     | First item: HomeOutlined; subsequent items: no icon |
| Separator | AntD default (`>`) — flips in RTL                   |

### 2.6 FormField (RHF ↔ AntD Bridge)

| Aspect   | Spec                                                                             |
| -------- | -------------------------------------------------------------------------------- |
| Props    | `name`, `label`, `control`, `errors`, `required?`, `children` (AntD Input clone) |
| Error    | Shows field error below input via AntD `Form.Item` validateStatus                |
| Label    | `#475569` light / `#94a3b8` dark, 13px, font-medium                              |
| Required | Red asterisk via AntD `required` prop                                            |

Supported child types: Input, InputNumber, Select, DatePicker, Switch, TextArea, Password.

### 2.7 Many2OneField (Odoo-style Search)

| State          | Behavior                                                           |
| -------------- | ------------------------------------------------------------------ |
| **Idle**       | Placeholder text + dropdown arrow                                  |
| **Typing**     | Local debounce (300ms) → calls `onSearch(query)` → options updated |
| **Loading**    | Options show spinner in dropdown                                   |
| **No results** | "No results found" + "Create new" button                           |
| **Selected**   | Shows label in select box; X to clear                              |
| **Error**      | Border turns red; error text below                                 |

**Props:** `value`, `onChange`, `onSearch`, `onCreateNew`, `placeholder`, `loading`, `options`, `error`.

**Accessibility:** `aria-expanded` on select; `aria-activedescendant` for options.

### 2.8 TagField (Multi-Select Tags)

| State         | Behavior                                               |
| ------------- | ------------------------------------------------------ |
| **Idle**      | Placeholder; values shown as colored tags with X       |
| **Searching** | Dropdown with filtered options; each has a colored dot |
| **Creating**  | If `allowCreate`, type + Enter creates new tag         |
| **Error**     | Border turns red; error text below                     |

**Color system:** 12-color palette defined in `tag-colors.ts`. Each tag gets a consistent color based on its textual hash.

### 2.9 OdooTag (Status Tag)

| Variant         | Color        |
| --------------- | ------------ |
| Draft           | Gray         |
| Active/Approved | Green        |
| Cancelled       | Red          |
| Completed       | Blue         |
| Pending/Void    | Orange/Amber |
| Archived        | Slate        |

Single inline-flex with colored dot (10px) + label. Pill-shaped (border-radius 999px).

### 2.10 Can (Permission Gate)

Renders children only if user's CASL ability allows `action` on `subject`:

```tsx
<Can I="create" a="Branch">
  <Button>New Branch</Button>
</Can>
```

### 2.11 Brand Surface (Login Page)

| Element    | Spec                                                                      |
| ---------- | ------------------------------------------------------------------------- |
| Logo       | 64×64 rounded box, blue gradient bg, white SafetyCertificateOutlined icon |
| Background | `linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #0f172a 100%)`          |
| Card       | `rgba(255,255,255,0.04)` bg, blur(20px), border `rgba(255,255,255,0.08)`  |
| CTA        | Gradient button `linear-gradient(135deg, #2563eb, #3b82f6)`               |
| Footer     | "© Modern ERP System" in muted white                                      |

---

## 3. Interaction Patterns

### 3.1 Navigation

- Sidebar: inline menu, current route highlighted, permission-gated items hidden
- Breadcrumb click navigates up the hierarchy
- "Create" button on list pages navigates to `/resource/new`
- Row click on list → navigate to `/resource/:id/edit`
- Form cancel → navigate back (browser history or fallback to list)

### 3.2 Form Submission

1. User clicks Save/Update
2. ActionBar shows loading on submit button, disables others
3. RHF validates all fields
4. Invalid: first error field is focused, scroll to top
5. Valid: API call made
6. Success: `message.success()` → redirect to list page
7. Error: `message.error()` / inline field errors; submit button re-enabled

### 3.3 Delete

1. User clicks Delete
2. AntD `Modal.confirm()` with "Are you sure?" + item name
3. Confirmed: API delete call → redirect to list
4. Success: `message.success("Deleted successfully")`

### 3.4 Many2One Search

1. User types 3+ characters
2. 300ms debounce
3. `onSearch(query)` called → parent fetches options
4. Dropdown renders filtered results
5. Selection calls `onChange(value)`

### 3.5 Cross-Tenant Isolation (UX)

- User never sees "company switcher" — they are always scoped to their company
- DataGrid queries automatically include `companyId` via interceptor
- Error: "Item not found" (not "Item not found for this company" — never leak existence)

---

## 4. Responsive Breakpoints

| Breakpoint | Width      | Behavior                                                                      |
| ---------- | ---------- | ----------------------------------------------------------------------------- |
| Desktop XL | ≥1200px    | Full sidebar, max-width content (960px forms), full DataGrid                  |
| Desktop    | 992–1199px | Full sidebar, normal content                                                  |
| Tablet     | 768–991px  | Collapsed sidebar, smaller padding (16px)                                     |
| Mobile L   | 576–767px  | Hidden sidebar (drawer), 1-col layouts, stacked tables                        |
| Mobile S   | <576px     | Compact padding (12px), inline form labels → top labels, action bars collapse |

---

## 5. Accessibility Annotations

| Component   | Role             | Keyboard                                       | Screen Reader                                            |
| ----------- | ---------------- | ---------------------------------------------- | -------------------------------------------------------- |
| Sidebar     | `navigation`     | Arrow keys between items; Enter to follow      | `aria-label="Main navigation"`                           |
| DataGrid    | `table` / `grid` | Tab to table → Arrow keys between rows/cells   | `aria-sort` on headers, `aria-rowcount`/`aria-colcount`  |
| ActionBar   | `toolbar`        | Tab between buttons; Enter to activate         | `aria-label="Form actions"`                              |
| Tabs        | `tablist`        | Arrow keys between tabs                        | `aria-selected` on active tab                            |
| Many2One    | `combobox`       | Type → Arrow down/up in list → Enter to select | `aria-expanded`, `aria-activedescendant`                 |
| Modal       | `dialog`         | Focus trap; Escape to close                    | `aria-modal="true"`, `aria-labelledby`                   |
| Form errors | —                | Tab lands on errored field                     | `aria-invalid`, `aria-describedby` linking to error text |

---

## 6. Motion & Animation

| Element         | Animation             | Duration | Easing               |
| --------------- | --------------------- | -------- | -------------------- |
| Page transition | Fade + slide (8px up) | 200ms    | ease-in-out          |
| Sidebar expand  | Width transition      | 200ms    | ease                 |
| Dropdown menu   | Fade + scale          | 150ms    | ease-out             |
| Modal           | Fade + scale          | 200ms    | ease-out             |
| Row hover       | Background color      | 150ms    | ease                 |
| Skeleton pulse  | Opacity pulse         | 1.5s     | ease-in-out infinite |
| Button loading  | Spin icon             | 1s       | linear infinite      |

---

## 7. Form Tabs Convention

All form pages with 2+ sections use AntD `Tabs` with `tabBarStyle`:

```ts
tabBarStyle={{
  marginBottom: 24,
  borderBottom: '1px solid #e2e8f0'
}}
```

Tab labels use i18n keys. Form fields within each tab are a flat list of `FormField` + `Many2OneField` + `TagField` components arranged in rows. If a section has a table (e.g., item units), it lives inside the tab.

**Common tab structure for forms:**

1. Basic Information (name, code, dates, active toggle)
2. Details / Configuration (feature-specific fields, Many2One relations)
3. (Optional) Items / Lines (editable table of line items)
4. (Optional) Settings / Advanced (toogles, default values)

---

## 8. Future-Proofing Notes

- **Saved filters** (Sprint 7+): DataGrid should support saving filter presets per user+resource. State structure: `{ name, filters: { column, operator, value }[], shared }`.
- **Export to PDF/Excel** (Sprint 7+): DataGrid rows should be exportable. Use AntD Table's built-in CSV or a library like `exceljs`.
- **Inline editing** (Sprint 4+): Some tables (e.g., journal entry lines) should support inline editing within the table cells, similar to ERPNext's grid.
- **Kanban view** (Sprint 7+): Sales pipeline could benefit from a Kanban view toggle on the DataGrid.
