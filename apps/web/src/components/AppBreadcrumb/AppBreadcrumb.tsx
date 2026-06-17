import { useMemo } from 'react';
import { Breadcrumb } from 'antd';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

interface BreadcrumbConfig {
  path: string;
  labelKey: string;
}

const breadcrumbMap: BreadcrumbConfig[] = [
  { path: 'dashboard', labelKey: 'menu.dashboard' },
  { path: 'users', labelKey: 'menu.users' },
  { path: 'roles', labelKey: 'menu.roles' },
  { path: 'branches', labelKey: 'menu.branches' },
  { path: 'audit-logs', labelKey: 'menu.auditLogs' },
  { path: 'settings', labelKey: 'menu.settings' },
  { path: 'profile', labelKey: 'menu.profile' },
  { path: 'new', labelKey: 'common.create' },
  { path: 'edit', labelKey: 'common.edit' },
];

export function AppBreadcrumb() {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  const items = useMemo(() => {
    if (pathname === '/') return [];

    if (pathname.includes('/new') || pathname.includes('/edit')) return [];

    const segments = pathname.split('/').filter(Boolean);
    const crumbItems: { title: string }[] = [];

    for (const seg of segments) {
      const config = breadcrumbMap.find((b) => b.path === seg);
      if (config) {
        crumbItems.push({ title: t(config.labelKey) });
      }
    }

    if (crumbItems.length === 0) {
      return [{ title: t('menu.dashboard') }];
    }

    return crumbItems;
  }, [pathname, t]);

  if (items.length <= 1) return null;

  return <Breadcrumb items={items} style={{ marginBottom: 16 }} />;
}
