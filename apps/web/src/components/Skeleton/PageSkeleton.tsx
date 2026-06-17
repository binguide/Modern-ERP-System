import { Card, Skeleton, Space } from 'antd';

interface PageSkeletonProps {
  rows?: number;
  withFilters?: boolean;
}

export function PageSkeleton({ rows = 5, withFilters = false }: PageSkeletonProps) {
  return (
    <div style={{ padding: 24 }}>
      {withFilters && (
        <Card style={{ marginBottom: 16 }}>
          <Space direction="horizontal" style={{ width: '100%' }}>
            <Skeleton.Input active style={{ width: 200 }} />
            <Skeleton.Input active style={{ width: 120 }} />
            <Skeleton.Input active style={{ width: 120 }} />
          </Space>
        </Card>
      )}
      <Card>
        <Skeleton active paragraph={{ rows }} title={{ width: '40%' }} />
      </Card>
    </div>
  );
}
