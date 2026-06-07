export interface GroupConfig<T> {
  getGroupValue: (item: T) => string;
  getGroupLabel: (value: string) => string;
}

export interface GroupedRow<T> {
  __isGroup: true;
  __groupLabel: string;
  __groupCount: number;
  __groupLevel: number;
  key: string;
  children: TableRow<T>[];
}

export type TableRow<T> = GroupedRow<T> | T;

export function transformToTreeData<T extends { id: string }>(
  data: T[],
  groupConfigs: GroupConfig<T>[],
  depth = 0,
): TableRow<T>[] {
  if (depth >= groupConfigs.length) return data;

  const config = groupConfigs[depth]!;
  const groups = new Map<string, T[]>();
  for (const item of data) {
    const val = config.getGroupValue(item);
    const existing = groups.get(val);
    if (existing) existing.push(item);
    else groups.set(val, [item]);
  }

  const result: GroupedRow<T>[] = [];
  for (const [val, items] of groups) {
    result.push({
      __isGroup: true,
      __groupLabel: config.getGroupLabel(val),
      __groupCount: items.length,
      __groupLevel: depth,
      key: `__group__${depth}__${val}`,
      children: transformToTreeData(items, groupConfigs, depth + 1),
    });
  }

  result.sort((a, b) => a.__groupLabel.localeCompare(b.__groupLabel));
  return result;
}

export function isGroupRow<T>(row: TableRow<T>): row is GroupedRow<T> {
  return (row as GroupedRow<T>).__isGroup === true;
}

export function countGroupLeaves<T>(rows: TableRow<T>[]): number {
  let count = 0;
  for (const row of rows) {
    if (isGroupRow(row)) {
      count += countGroupLeaves(row.children);
    } else {
      count++;
    }
  }
  return count;
}
