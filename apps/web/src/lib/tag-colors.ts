import type { PresetColorType } from 'antd/es/_util/colors';
import type { LiteralUnion } from 'antd/es/_util/type';

export const roleColorMap: Record<string, LiteralUnion<PresetColorType>> = {
  admin: 'red',
  accountant: 'blue',
  manager: 'orange',
  cashier: 'green',
  viewer: 'default',
};

export const actionColorMap: Record<string, LiteralUnion<PresetColorType>> = {
  manage: 'red',
  create: 'green',
  read: 'blue',
  update: 'orange',
  delete: 'red',
  approve: 'purple',
  export: 'cyan',
};

export function getRoleColor(code: string): LiteralUnion<PresetColorType> {
  return roleColorMap[code] ?? 'default';
}

export function getActionColor(action: string): LiteralUnion<PresetColorType> {
  return actionColorMap[action] ?? 'default';
}

export const odooPalette: Record<string, { bg: string; text: string; dot: string }> = {
  red: { bg: '#fff1f0', text: '#cf1322', dot: '#f5222d' },
  volcano: { bg: '#fff2e8', text: '#d4380d', dot: '#fa541c' },
  orange: { bg: '#fff7e6', text: '#d46b08', dot: '#fa8c16' },
  gold: { bg: '#fffbe6', text: '#d48806', dot: '#fadb14' },
  yellow: { bg: '#feffe6', text: '#b8860b', dot: '#ffec3d' },
  lime: { bg: '#fcffe6', text: '#7cb305', dot: '#a0d911' },
  green: { bg: '#f6ffed', text: '#389e0d', dot: '#52c41a' },
  cyan: { bg: '#e6fffb', text: '#08979c', dot: '#13c2c2' },
  blue: { bg: '#e6f4ff', text: '#0958d9', dot: '#1677ff' },
  geekblue: { bg: '#f0f5ff', text: '#1d39c4', dot: '#2f54eb' },
  purple: { bg: '#f9f0ff', text: '#722ed1', dot: '#722ed1' },
  magenta: { bg: '#fff0f6', text: '#c41d7f', dot: '#eb2f96' },
  default: { bg: '#fafafa', text: '#595959', dot: '#8c8c8c' },
};

export function getPalette(color: string): { bg: string; text: string; dot: string } {
  return odooPalette[color] ?? odooPalette['default']!;
}
