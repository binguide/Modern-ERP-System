import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Spin } from 'antd';
import { AppLayout } from '@components/AppLayout/AppLayout';
import { ProtectedRoute } from '@components/ProtectedRoute/ProtectedRoute';

const LoginPage = lazy(() => import('@pages/auth/Login'));
const DashboardPage = lazy(() => import('@pages/Dashboard'));
const NotFoundPage = lazy(() => import('@pages/NotFound'));

const PageLoader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
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
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
