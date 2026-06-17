/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@components/AppLayout/AppLayout';
import { ProtectedRoute } from '@components/ProtectedRoute/ProtectedRoute';
import { PageSkeleton } from '@components/Skeleton';

const LoginPage = lazy(() => import('@pages/auth/Login'));
const DashboardPage = lazy(() => import('@pages/Dashboard'));
const UsersPage = lazy(() => import('@pages/Users'));
const UserFormPage = lazy(() => import('@pages/UserForm'));
const RolesPage = lazy(() => import('@pages/Roles'));
const RoleFormPage = lazy(() => import('@pages/RoleForm'));
const ProfilePage = lazy(() => import('@pages/Profile'));
const AuditLogsPage = lazy(() => import('@pages/AuditLogs'));
const BranchesPage = lazy(() => import('@pages/Branches'));
const BranchFormPage = lazy(() => import('@pages/BranchForm'));
const FiscalYearsPage = lazy(() => import('@pages/FiscalYears'));
const TaxesPage = lazy(() => import('@pages/Taxes'));
const ChartOfAccountsPage = lazy(() => import('@pages/ChartOfAccounts'));
const JournalEntriesPage = lazy(() => import('@pages/JournalEntries'));
const JournalEntryFormPage = lazy(() => import('@pages/JournalEntryForm'));
const WarehousesPage = lazy(() => import('@pages/Warehouses'));
const ItemsPage = lazy(() => import('@pages/Items'));
const ItemFormPage = lazy(() => import('@pages/ItemForm'));
const UnitsOfMeasurePage = lazy(() => import('@pages/UnitsOfMeasure'));
const ItemGroupsPage = lazy(() => import('@pages/ItemGroups'));
const CustomersPage = lazy(() => import('@pages/Customers'));
const SalesOrdersPage = lazy(() => import('@pages/SalesOrders'));
const SalesOrderFormPage = lazy(() => import('@pages/SalesOrderForm'));
const SalesInvoicesPage = lazy(() => import('@pages/SalesInvoices'));
const SalesInvoiceFormPage = lazy(() => import('@pages/SalesInvoiceForm'));
const DeliveryNotesPage = lazy(() => import('@pages/DeliveryNotes'));
const DeliveryNoteFormPage = lazy(() => import('@pages/DeliveryNoteForm'));
const QuotationsPage = lazy(() => import('@pages/Quotations'));
const QuotationFormPage = lazy(() => import('@pages/QuotationForm'));
const SuppliersPage = lazy(() => import('@pages/Suppliers'));
const PurchaseOrdersPage = lazy(() => import('@pages/PurchaseOrders'));
const PurchaseOrderFormPage = lazy(() => import('@pages/PurchaseOrderForm'));
const PurchaseReceiptsPage = lazy(() => import('@pages/PurchaseReceipts'));
const PurchaseReceiptFormPage = lazy(() => import('@pages/PurchaseReceiptForm'));
const PurchaseInvoicesPage = lazy(() => import('@pages/PurchaseInvoices'));
const PurchaseInvoiceFormPage = lazy(() => import('@pages/PurchaseInvoiceForm'));
const AssetCategoriesPage = lazy(() => import('@pages/AssetCategories'));
const FixedAssetsPage = lazy(() => import('@pages/FixedAssets'));
const NotFoundPage = lazy(() => import('@pages/NotFound'));

const PageLoader = () => <PageSkeleton rows={8} withFilters />;

function Lazy({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <AppLayout />
    </ProtectedRoute>
  );
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <Lazy>
        <LoginPage />
      </Lazy>
    ),
  },
  {
    path: '/',
    element: <ProtectedLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      {
        path: 'dashboard',
        element: (
          <Lazy>
            <DashboardPage />
          </Lazy>
        ),
      },
      {
        path: 'users',
        children: [
          {
            index: true,
            element: (
              <Lazy>
                <UsersPage />
              </Lazy>
            ),
          },
          {
            path: 'new',
            element: (
              <Lazy>
                <UserFormPage />
              </Lazy>
            ),
          },
          {
            path: ':id/edit',
            element: (
              <Lazy>
                <UserFormPage />
              </Lazy>
            ),
          },
        ],
      },
      {
        path: 'roles',
        children: [
          {
            index: true,
            element: (
              <Lazy>
                <RolesPage />
              </Lazy>
            ),
          },
          {
            path: 'new',
            element: (
              <Lazy>
                <RoleFormPage />
              </Lazy>
            ),
          },
          {
            path: ':id/edit',
            element: (
              <Lazy>
                <RoleFormPage />
              </Lazy>
            ),
          },
        ],
      },
      {
        path: 'profile',
        element: (
          <Lazy>
            <ProfilePage />
          </Lazy>
        ),
      },
      {
        path: 'audit-logs',
        element: (
          <Lazy>
            <AuditLogsPage />
          </Lazy>
        ),
      },
      {
        path: 'branches',
        children: [
          {
            index: true,
            element: (
              <Lazy>
                <BranchesPage />
              </Lazy>
            ),
          },
          {
            path: 'new',
            element: (
              <Lazy>
                <BranchFormPage />
              </Lazy>
            ),
          },
          {
            path: ':id/edit',
            element: (
              <Lazy>
                <BranchFormPage />
              </Lazy>
            ),
          },
        ],
      },
      {
        path: 'fiscal-years',
        element: (
          <Lazy>
            <FiscalYearsPage />
          </Lazy>
        ),
      },
      {
        path: 'taxes',
        element: (
          <Lazy>
            <TaxesPage />
          </Lazy>
        ),
      },
      {
        path: 'chart-of-accounts',
        element: (
          <Lazy>
            <ChartOfAccountsPage />
          </Lazy>
        ),
      },
      {
        path: 'journal-entries',
        children: [
          {
            index: true,
            element: (
              <Lazy>
                <JournalEntriesPage />
              </Lazy>
            ),
          },
          {
            path: 'new',
            element: (
              <Lazy>
                <JournalEntryFormPage />
              </Lazy>
            ),
          },
          {
            path: ':id/edit',
            element: (
              <Lazy>
                <JournalEntryFormPage />
              </Lazy>
            ),
          },
        ],
      },
      {
        path: 'warehouses',
        element: (
          <Lazy>
            <WarehousesPage />
          </Lazy>
        ),
      },
      {
        path: 'items',
        children: [
          {
            index: true,
            element: (
              <Lazy>
                <ItemsPage />
              </Lazy>
            ),
          },
          {
            path: 'new',
            element: (
              <Lazy>
                <ItemFormPage />
              </Lazy>
            ),
          },
          {
            path: ':id/edit',
            element: (
              <Lazy>
                <ItemFormPage />
              </Lazy>
            ),
          },
        ],
      },
      {
        path: 'units-of-measure',
        element: (
          <Lazy>
            <UnitsOfMeasurePage />
          </Lazy>
        ),
      },
      {
        path: 'item-groups',
        element: (
          <Lazy>
            <ItemGroupsPage />
          </Lazy>
        ),
      },
      {
        path: 'customers',
        element: (
          <Lazy>
            <CustomersPage />
          </Lazy>
        ),
      },
      {
        path: 'sales-invoices',
        children: [
          {
            index: true,
            element: (
              <Lazy>
                <SalesInvoicesPage />
              </Lazy>
            ),
          },
          {
            path: 'new',
            element: (
              <Lazy>
                <SalesInvoiceFormPage />
              </Lazy>
            ),
          },
          {
            path: ':id/edit',
            element: (
              <Lazy>
                <SalesInvoiceFormPage />
              </Lazy>
            ),
          },
        ],
      },
      {
        path: 'delivery-notes',
        children: [
          {
            index: true,
            element: (
              <Lazy>
                <DeliveryNotesPage />
              </Lazy>
            ),
          },
          {
            path: 'new',
            element: (
              <Lazy>
                <DeliveryNoteFormPage />
              </Lazy>
            ),
          },
          {
            path: ':id/edit',
            element: (
              <Lazy>
                <DeliveryNoteFormPage />
              </Lazy>
            ),
          },
        ],
      },
      {
        path: 'quotations',
        children: [
          {
            index: true,
            element: (
              <Lazy>
                <QuotationsPage />
              </Lazy>
            ),
          },
          {
            path: 'new',
            element: (
              <Lazy>
                <QuotationFormPage />
              </Lazy>
            ),
          },
          {
            path: ':id/edit',
            element: (
              <Lazy>
                <QuotationFormPage />
              </Lazy>
            ),
          },
        ],
      },
      {
        path: 'sales-orders',
        children: [
          {
            index: true,
            element: (
              <Lazy>
                <SalesOrdersPage />
              </Lazy>
            ),
          },
          {
            path: 'new',
            element: (
              <Lazy>
                <SalesOrderFormPage />
              </Lazy>
            ),
          },
          {
            path: ':id/edit',
            element: (
              <Lazy>
                <SalesOrderFormPage />
              </Lazy>
            ),
          },
        ],
      },
      {
        path: 'suppliers',
        element: (
          <Lazy>
            <SuppliersPage />
          </Lazy>
        ),
      },
      {
        path: 'purchase-orders',
        children: [
          {
            index: true,
            element: (
              <Lazy>
                <PurchaseOrdersPage />
              </Lazy>
            ),
          },
          {
            path: 'new',
            element: (
              <Lazy>
                <PurchaseOrderFormPage />
              </Lazy>
            ),
          },
          {
            path: ':id/edit',
            element: (
              <Lazy>
                <PurchaseOrderFormPage />
              </Lazy>
            ),
          },
        ],
      },
      {
        path: 'purchase-receipts',
        children: [
          {
            index: true,
            element: (
              <Lazy>
                <PurchaseReceiptsPage />
              </Lazy>
            ),
          },
          {
            path: 'new',
            element: (
              <Lazy>
                <PurchaseReceiptFormPage />
              </Lazy>
            ),
          },
          {
            path: ':id/edit',
            element: (
              <Lazy>
                <PurchaseReceiptFormPage />
              </Lazy>
            ),
          },
        ],
      },
      {
        path: 'purchase-invoices',
        children: [
          {
            index: true,
            element: (
              <Lazy>
                <PurchaseInvoicesPage />
              </Lazy>
            ),
          },
          {
            path: 'new',
            element: (
              <Lazy>
                <PurchaseInvoiceFormPage />
              </Lazy>
            ),
          },
          {
            path: ':id/edit',
            element: (
              <Lazy>
                <PurchaseInvoiceFormPage />
              </Lazy>
            ),
          },
        ],
      },
      {
        path: 'asset-categories',
        element: (
          <Lazy>
            <AssetCategoriesPage />
          </Lazy>
        ),
      },
      {
        path: 'fixed-assets',
        element: (
          <Lazy>
            <FixedAssetsPage />
          </Lazy>
        ),
      },
    ],
  },
  {
    path: '*',
    element: (
      <Lazy>
        <NotFoundPage />
      </Lazy>
    ),
  },
]);
