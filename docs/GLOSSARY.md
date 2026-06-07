# 📖 Glossary

This document defines business and technical terms used in the Modern ERP System, in both English and Arabic.

## 🏢 Business Terms (أعمال)

### Sales (المبيعات)

| Term (EN)            | المصطلح (AR)  | Definition                                                                                                |
| -------------------- | ------------- | --------------------------------------------------------------------------------------------------------- |
| **Quotation**        | عرض سعر       | A formal price offer sent to a customer. Can be revised or rejected. Becomes a Sales Order when accepted. |
| **Sales Order (SO)** | أمر بيع       | Confirmed order from a customer. Triggers warehouse reservation and, eventually, invoicing.               |
| **Sales Invoice**    | فاتورة مبيعات | Financial document requesting payment for goods/services delivered.                                       |
| **Customer**         | عميل          | A buyer of goods/services.                                                                                |
| **Price List**       | قائمة أسعار   | A list of item prices, often with conditions (date range, customer group, currency).                      |
| **Discount**         | خصم           | Reduction from the list price. Can be percentage or fixed amount.                                         |
| **Tax**              | ضريبة         | Government-mandated levy (e.g., VAT).                                                                     |
| **Payment**          | دفعة          | Money received from a customer.                                                                           |
| **Receipt**          | إيصال استلام  | Acknowledgment of payment received.                                                                       |

### Purchases (المشتريات)

| Term (EN)                 | المصطلح (AR)   | Definition                                                                                     |
| ------------------------- | -------------- | ---------------------------------------------------------------------------------------------- |
| **Supplier**              | مورد           | A seller of goods/services.                                                                    |
| **Purchase Request (PR)** | طلب شراء       | Internal request to buy something.                                                             |
| **Purchase Order (PO)**   | أمر شراء       | Formal order sent to a supplier.                                                               |
| **Goods Receipt (GR)**    | استلام بضاعة   | Acknowledgment that goods were received from a supplier.                                       |
| **Purchase Invoice**      | فاتورة مشتريات | Bill received from a supplier.                                                                 |
| **Landed Cost**           | تكلفة landed   | Additional costs beyond the item price (shipping, customs, insurance). Allocated to the items. |

### Inventory (المخزون)

| Term (EN)                 | المصطلح (AR)   | Definition                                                          |
| ------------------------- | -------------- | ------------------------------------------------------------------- |
| **Item / Product**        | صنف / منتج     | A sellable or purchasable good.                                     |
| **Unit of Measure (UoM)** | وحدة قياس      | The unit in which an item is measured (kg, liter, box, pallet).     |
| **Warehouse**             | مستودع         | Physical location where items are stored.                           |
| **Stock Balance**         | رصيد المخزون   | Current quantity of an item in a warehouse.                         |
| **Stock Transaction**     | حركة مخزون     | Immutable record of a stock change (in, out, transfer, adjustment). |
| **Batch / Lot**           | دفعة           | A group of items produced together (used for expiry tracking).      |
| **Serial Number**         | الرقم التسلسلي | Unique identifier for a single item instance.                       |
| **Stock Transfer**        | تحويل مخزون    | Moving items between warehouses.                                    |
| **Stock Adjustment**      | تسوية مخزون    | Correcting stock count (shrinkage, damage, count error).            |
| **Reorder Point**         | حد إعادة الطلب | Minimum stock level that triggers a purchase.                       |

### Accounting (المحاسبة)

| Term (EN)                   | المصطلح (AR)           | Definition                                                               |
| --------------------------- | ---------------------- | ------------------------------------------------------------------------ |
| **Chart of Accounts (CoA)** | دليل الحسابات          | The list of all accounts used by a company. Tree structure.              |
| **Account**                 | حساب                   | A ledger account (asset, liability, equity, revenue, expense).           |
| **Journal Entry (JV)**      | قيد يومية              | A financial transaction recorded with debits and credits.                |
| **Debit**                   | مدين                   | Left side of an accounting entry.                                        |
| **Credit**                  | دائن                   | Right side of an accounting entry.                                       |
| **Fiscal Year**             | سنة مالية              | A 12-month period used for accounting. May not align with calendar year. |
| **Accounting Period**       | فترة محاسبية           | A subdivision of a fiscal year (usually a month).                        |
| **Trial Balance**           | ميزان مراجعة           | A report listing all account balances; debits must equal credits.        |
| **Income Statement**        | قائمة الدخل            | Report of revenues and expenses over a period.                           |
| **Balance Sheet**           | الميزانية العمومية     | Snapshot of assets, liabilities, and equity at a point in time.          |
| **Cash Flow Statement**     | قائمة التدفقات النقدية | Report of cash inflows and outflows.                                     |
| **General Ledger (GL)**     | دفتر الأستاذ العام     | All journal entries for all accounts.                                    |
| **Posting**                 | ترحيل                  | The act of moving a transaction into the general ledger.                 |
| **Cost Center**             | مركز تكلفة             | A department or project for cost tracking.                               |
| **Currency**                | عملة                   | A monetary unit.                                                         |
| **Exchange Rate**           | سعر الصرف              | Value of one currency in terms of another.                               |

### POS (نقطة البيع)

| Term (EN)        | المصطلح (AR)  | Definition                                                 |
| ---------------- | ------------- | ---------------------------------------------------------- |
| **POS Terminal** | جهاز نقطة بيع | The hardware/software used at a checkout.                  |
| **POS Session**  | جلسة بيع      | The time period a terminal is "open" (from open to close). |
| **Cash Drawer**  | درج النقدية   | Physical drawer for cash.                                  |
| **Receipt**      | إيصال         | Printed proof of a POS transaction.                        |
| **Held Sale**    | بيع معلق      | A paused sale that can be resumed.                         |

### Fixed Assets (الأصول الثابتة)

| Term (EN)                          | المصطلح (AR)            | Definition                                             |
| ---------------------------------- | ----------------------- | ------------------------------------------------------ |
| **Fixed Asset**                    | أصل ثابت                | Long-term physical asset (building, machine, vehicle). |
| **Depreciation**                   | إهلاك                   | Allocation of asset cost over its useful life.         |
| **Straight-Line Depreciation**     | إهلاك ثابت              | Equal amount each period.                              |
| **Declining-Balance Depreciation** | إهلاك متناقص            | Larger amount early, smaller later.                    |
| **Disposal**                       | استبعاد                 | Selling or scrapping an asset.                         |
| **Net Book Value (NBV)**           | القيمة الدفترية الصافية | Cost minus accumulated depreciation.                   |

### Multi-Tenancy (متعدد المستأجرين)

| Term (EN)   | المصطلح (AR) | Definition                                      |
| ----------- | ------------ | ----------------------------------------------- |
| **Tenant**  | مستأجر       | A company using the system.                     |
| **Company** | شركة         | The top-level tenant entity.                    |
| **Branch**  | فرع          | A physical or logical subdivision of a company. |

---

## 💻 Technical Terms (تقني)

| Term (EN)             | المصطلح (AR)                | Definition                                                                                                             |
| --------------------- | --------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Monorepo**          | مستودع موحد                 | A single repository containing multiple projects.                                                                      |
| **TypeScript**        | تايب سكربت                  | A typed superset of JavaScript.                                                                                        |
| **NestJS**            | NestJS                      | A progressive Node.js framework for building server-side apps.                                                         |
| **React**             | رياكت                       | A JavaScript library for building user interfaces.                                                                     |
| **Vite**              | فيت                         | A fast frontend build tool.                                                                                            |
| **Ant Design (AntD)** | أنت ديزاين                  | A React UI component library.                                                                                          |
| **TypeORM**           | تايب ORM                    | An ORM for TypeScript and Node.js.                                                                                     |
| **PostgreSQL**        | بوستجري إس كيو إل           | An open-source relational database.                                                                                    |
| **Redis**             | ريديس                       | An in-memory data store used for caching and queues.                                                                   |
| **JWT**               | JWT                         | JSON Web Token — a compact, URL-safe token for authentication.                                                         |
| **RBAC**              | التحكم بالصلاحيات حسب الدور | Role-Based Access Control.                                                                                             |
| **ABAC**              | التحكم بالصلاحيات حسب السمة | Attribute-Based Access Control.                                                                                        |
| **CASL**              | CASL                        | A library for managing permissions in JavaScript.                                                                      |
| **DTO**               | DTO                         | Data Transfer Object — a typed shape for API input/output.                                                             |
| **ORM**               | ORM                         | Object-Relational Mapper — maps database tables to objects.                                                            |
| **Migration**         | ترحيل قاعدة البيانات        | A versioned change to the database schema.                                                                             |
| **Soft Delete**       | حذف منطقي                   | Marking a record as deleted without removing it from the database.                                                     |
| **Audit Log**         | سجل التدقيق                 | A log of all changes to sensitive data.                                                                                |
| **i18n**              | التدويل                     | Internationalization — supporting multiple languages.                                                                  |
| **RTL**               | من اليمين لليسار            | Right-to-Left text direction (used for Arabic, Hebrew).                                                                |
| **CI/CD**             | CI/CD                       | Continuous Integration / Continuous Deployment.                                                                        |
| **Docker**            | داكر                        | A platform for containerized applications.                                                                             |
| **CORS**              | CORS                        | Cross-Origin Resource Sharing — a browser security feature.                                                            |
| **CSRF**              | CSRF                        | Cross-Site Request Forgery — an attack where a malicious site causes the user's browser to perform an unwanted action. |
| **XSS**               | XSS                         | Cross-Site Scripting — injecting malicious scripts into web pages.                                                     |
| **bcrypt**            | bcrypt                      | A password hashing function.                                                                                           |
| **Helmet**            | هيلمت                       | A Node.js library that sets secure HTTP headers.                                                                       |
| **Bull**              | بُل                         | A Node.js library for handling jobs and queues (uses Redis).                                                           |
| **SWR**               | SWR                         | A React data-fetching library.                                                                                         |
| **Zustand**           | زوستاند                     | A small, fast React state-management library.                                                                          |
| **Zod**               | Zod                         | A TypeScript-first schema validation library.                                                                          |
| **React Hook Form**   | رياكت هوك فورم              | A performant form library for React.                                                                                   |
| **TanStack Query**    | تان ستاك كويري              | A powerful data-fetching and caching library (formerly React Query).                                                   |
| **Vite Proxy**        | Vite Proxy                  | A Vite feature for forwarding API requests to a backend during dev.                                                    |
| **Turborepo**         | تيربو ريبو                  | A build system for JavaScript and TypeScript monorepos.                                                                |
| **pnpm**              | pnpm                        | A fast, disk-efficient package manager for Node.js.                                                                    |
| **Husky**             | هوسي                        | A tool for managing Git hooks.                                                                                         |
| **Commitlint**        | كوميت لينت                  | A tool for enforcing commit message conventions.                                                                       |
| **lint-staged**       | لينت ستيجد                  | A tool for running linters on staged Git files.                                                                        |
| **ESLint**            | ESLint                      | A static analysis tool for JavaScript/TypeScript.                                                                      |
| **Prettier**          | بريتيير                     | A code formatter.                                                                                                      |

---

## 🔤 Acronyms (اختصارات)

| Acronym   | Full Form                                      | الوصف                                    |
| --------- | ---------------------------------------------- | ---------------------------------------- |
| **ERP**   | Enterprise Resource Planning                   | نظام تخطيط موارد المؤسسة                 |
| **CRM**   | Customer Relationship Management               | إدارة علاقات العملاء                     |
| **HR**    | Human Resources                                | الموارد البشرية                          |
| **UI**    | User Interface                                 | واجهة المستخدم                           |
| **UX**    | User Experience                                | تجربة المستخدم                           |
| **API**   | Application Programming Interface              | واجهة برمجة التطبيقات                    |
| **SPA**   | Single Page Application                        | تطبيق صفحة واحدة                         |
| **DB**    | Database                                       | قاعدة البيانات                           |
| **FE**    | Frontend                                       | الواجهة الأمامية                         |
| **BE**    | Backend                                        | الواجهة الخلفية                          |
| **CRUD**  | Create, Read, Update, Delete                   | إنشاء، قراءة، تحديث، حذف                 |
| **VAT**   | Value Added Tax                                | ضريبة القيمة المضافة                     |
| **ZATCA** | Zakat, Tax and Customs Authority (Saudi)       | هيئة الزكاة والضريبة والجمارك (السعودية) |
| **EOD**   | End of Day                                     | نهاية اليوم                              |
| **SKU**   | Stock Keeping Unit                             | وحدة حفظ المخزون                         |
| **UoM**   | Unit of Measure                                | وحدة القياس                              |
| **PO**    | Purchase Order                                 | أمر شراء                                 |
| **SO**    | Sales Order                                    | أمر بيع                                  |
| **PR**    | Purchase Request                               | طلب شراء                                 |
| **GR**    | Goods Receipt                                  | استلام بضاعة                             |
| **JV**    | Journal Voucher                                | سند قيد                                  |
| **CoA**   | Chart of Accounts                              | دليل الحسابات                            |
| **GL**    | General Ledger                                 | دفتر الأستاذ العام                       |
| **NBV**   | Net Book Value                                 | القيمة الدفترية الصافية                  |
| **POS**   | Point of Sale                                  | نقطة بيع                                 |
| **RBAC**  | Role-Based Access Control                      | التحكم بالصلاحيات حسب الدور              |
| **ABAC**  | Attribute-Based Access Control                 | التحكم بالصلاحيات حسب السمة              |
| **CI/CD** | Continuous Integration / Continuous Deployment | التكامل المستمر / النشر المستمر          |
| **CORS**  | Cross-Origin Resource Sharing                  | مشاركة الموارد عبر المصادر               |
| **CSRF**  | Cross-Site Request Forgery                     | تزوير الطلبات عبر المواقع                |
| **XSS**   | Cross-Site Scripting                           | البرمجة عبر المواقع                      |
| **JWT**   | JSON Web Token                                 | رمز ويب JSON                             |
| **ORM**   | Object-Relational Mapper                       | مخطط الكائنات العلائقية                  |
| **i18n**  | Internationalization                           | التدويل                                  |
| **a11y**  | Accessibility                                  | إمكانية الوصول                           |
| **l10n**  | Localization                                   | التوطين                                  |
| **RTL**   | Right-to-Left                                  | من اليمين لليسار                         |
| **LTR**   | Left-to-Right                                  | من اليسار لليمين                         |
| **KPI**   | Key Performance Indicator                      | مؤشر الأداء الرئيسي                      |
| **SLA**   | Service Level Agreement                        | اتفاقية مستوى الخدمة                     |

---

**Last Updated:** 2026-01-XX
