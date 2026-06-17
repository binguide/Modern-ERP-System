import { Column } from '@ant-design/charts';
import type { TopCustomer } from '@/lib/api/endpoints/dashboard';

export default function TopCustomersChart({ data }: { data: TopCustomer[] }) {
  return (
    <Column
      data={data.map((c: TopCustomer) => ({
        customer: c.customerName,
        total: c.total,
      }))}
      xField="customer"
      yField="total"
      color="#10b981"
      columnStyle={{ radius: [6, 6, 0, 0] }}
      height={280}
    />
  );
}
