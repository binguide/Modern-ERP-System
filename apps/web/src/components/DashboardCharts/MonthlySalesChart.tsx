import { Column } from '@ant-design/charts';
export default function MonthlySalesChart({ data }: { data: { month: string; total: number }[] }) {
  return (
    <Column
      data={data}
      xField="month"
      yField="total"
      color="#2563eb"
      columnStyle={{ radius: [6, 6, 0, 0] }}
      height={300}
    />
  );
}
