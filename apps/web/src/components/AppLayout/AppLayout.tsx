import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import { AppHeader } from '@components/AppHeader/AppHeader';
import { AppSidebar } from '@components/AppSidebar/AppSidebar';

export function AppLayout() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppHeader />
      <Layout>
        <AppSidebar />
        <Layout.Content style={{ padding: 24 }}>
          <Outlet />
        </Layout.Content>
      </Layout>
    </Layout>
  );
}
