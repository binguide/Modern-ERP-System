import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Spin } from 'antd';
import { AppLayout } from '@components/AppLayout/AppLayout';
import { ProtectedRoute } from '@components/ProtectedRoute/ProtectedRoute';

const LoginPage = lazy(() => import('@pages/auth/Login'));
const DashboardPage = lazy(() => import('@pages/Dashboard'));
const UsersPage = lazy(() => import('@pages/Users'));
const UserFormPage = lazy(() => import('@pages/UserForm'));
const RolesPage = lazy(() => import('@pages/Roles'));
const RoleFormPage = lazy(() => import('@pages/RoleForm'));
const ProfilePage = lazy(() => import('@pages/Profile'));
const AuditLogsPage = lazy(() => import('@pages/AuditLogs'));
const BranchesPage = lazy(() => import('@pages/Branches'));
const FiscalYearsPage = lazy(() => import('@pages/FiscalYears'));
const TaxesPage = lazy(() => import('@pages/Taxes'));
const ChartOfAccountsPage = lazy(() => import('@pages/ChartOfAccounts'));
const JournalEntriesPage = lazy(() => import('@pages/JournalEntries'));
const WarehousesPage = lazy(() => import('@pages/Warehouses'));
const ItemsPage = lazy(() => import('@pages/Items'));
const ItemFormPage = lazy(() => import('@pages/ItemForm'));
const UnitsOfMeasurePage = lazy(() => import('@pages/UnitsOfMeasure'));
const ItemGroupsPage = lazy(() => import('@pages/ItemGroups'));
const NotFoundPage = lazy(() => import('@pages/NotFound'));

const PageLoader = () => (
  <div
    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}
  >
    <Spin size="large" />
  </div>
);

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="users/new" element={<UserFormPage />} />
            <Route path="users/:id/edit" element={<UserFormPage />} />
            <Route path="roles" element={<RolesPage />} />
            <Route path="roles/new" element={<RoleFormPage />} />
            <Route path="roles/:id/edit" element={<RoleFormPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="audit-logs" element={<AuditLogsPage />} />
            <Route path="branches" element={<BranchesPage />} />
            <Route path="fiscal-years" element={<FiscalYearsPage />} />
            <Route path="taxes" element={<TaxesPage />} />
            <Route path="chart-of-accounts" element={<ChartOfAccountsPage />} />
            <Route path="journal-entries" element={<JournalEntriesPage />} />
            <Route path="warehouses" element={<WarehousesPage />} />
            <Route path="items" element={<ItemsPage />} />
            <Route path="items/new" element={<ItemFormPage />} />
            <Route path="items/:id/edit" element={<ItemFormPage />} />
            <Route path="units-of-measure" element={<UnitsOfMeasurePage />} />
            <Route path="item-groups" element={<ItemGroupsPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
