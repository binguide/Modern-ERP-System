import { Pie } from '@ant-design/charts';

interface SalesPieChartProps {
  data: { type: string; value: number }[];
}

export default function SalesPieChart({ data }: SalesPieChartProps) {
  return (
    <Pie
      data={data}
      angleField="value"
      colorField="type"
      radius={0.8}
      label={{
        type: 'outer',
        content: '{name} ({percentage})',
      }}
      height={300}
    />
  );
}
