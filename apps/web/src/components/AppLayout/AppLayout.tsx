import { Layout, theme } from 'antd';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AppHeader } from '@components/AppHeader/AppHeader';
import { AppSidebar } from '@components/AppSidebar/AppSidebar';
import { AppBreadcrumb } from '@components/AppBreadcrumb/AppBreadcrumb';
import { ErrorBoundary } from '@components/ErrorBoundary';
import { PageTransition } from '@components/PageTransition';

export function AppLayout() {
  const location = useLocation();
  const { token } = theme.useToken();
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppHeader />
      <Layout>
        <AppSidebar />
        <Layout.Content
          style={{ padding: 24, background: token.colorBgLayout, minHeight: 'calc(100vh - 56px)' }}
        >
          <AppBreadcrumb />
          <ErrorBoundary>
            <AnimatePresence mode="wait">
              <PageTransition key={location.pathname}>
                <Outlet />
              </PageTransition>
            </AnimatePresence>
          </ErrorBoundary>
        </Layout.Content>
      </Layout>
    </Layout>
  );
}
