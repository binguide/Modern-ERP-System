import type { ReactNode } from 'react';
import { Breadcrumb as AntBreadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: ReactNode;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  const breadcrumbItems = [
    {
      title: (
        <Link to="/">
          <HomeOutlined style={{ fontSize: 14 }} />
        </Link>
      ),
    },
    ...items.map((item, index) => {
      const isLast = index === items.length - 1;
      return {
        title: isLast ? (
          <span style={{ fontWeight: 600, color: '#1e293b' }}>{item.label}</span>
        ) : item.path ? (
          <Link to={item.path} style={{ color: '#6b7280' }}>
            {item.icon} {item.label}
          </Link>
        ) : (
          <span style={{ color: '#6b7280' }}>{item.label}</span>
        ),
      };
    }),
  ];

  return (
    <AntBreadcrumb
      className="erp-breadcrumb"
      items={breadcrumbItems}
      style={{ marginBottom: 16 }}
    />
  );
}
