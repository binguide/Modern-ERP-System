import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { App } from 'antd';
import type { SorterResult } from 'antd/es/table/interface';
import { useTranslation } from 'react-i18next';
import { useColumnVisibility } from '@lib/hooks/useColumnVisibility';
import { transformToTreeData, GroupConfig, TableRow } from '@lib/table-utils';

export interface DataGridParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  [key: string]: unknown;
}

export interface DataGridResult<T> {
  data: T[];
  total: number;
}

export interface GroupOption {
  value: string;
  label: string;
}

export function useDataGrid<T extends { id: string }>(options: {
  fetchFn: (params: DataGridParams) => Promise<DataGridResult<T>>;
  defaultParams?: Partial<DataGridParams>;
  storageKey: string;
  columnKeys: string[];
  groupOptions?: GroupOption[];
  getGroupConfig?: (field: string) => GroupConfig<T>;
}) {
  const { t } = useTranslation();
  const { message } = App.useApp();

  const fetchFnRef = useRef(options.fetchFn);
  fetchFnRef.current = options.fetchFn;

  const getGroupConfigRef = useRef(options.getGroupConfig);
  getGroupConfigRef.current = options.getGroupConfig;

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [params, setParams] = useState<DataGridParams>({
    page: 1,
    limit: 20,
    ...options.defaultParams,
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [groupBy, setGroupBy] = useState<string[]>([]);

  const { visibleColumns, toggleColumn, resetColumns } = useColumnVisibility(
    options.storageKey,
    options.columnKeys,
  );

  const activeConfigs = useMemo(() => {
    const cfg = getGroupConfigRef.current;
    if (!cfg) return [];
    return groupBy.map((f) => cfg(f)).filter(Boolean) as GroupConfig<T>[];
  }, [groupBy]);

  const isGrouped = activeConfigs.length > 0;

  const groupLabels: Record<string, string> = {};
  if (options.groupOptions) {
    for (const o of options.groupOptions) {
      groupLabels[o.value] = o.label;
    }
  }

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchFnRef.current(params);
      setData(result.data);
      setTotal(result.total);
    } catch {
      message.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [params, message, t]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const tableData: TableRow<T>[] = isGrouped ? transformToTreeData(data, activeConfigs) : data;

  const handleTableChange = useCallback(
    (_pagination: unknown, _filters: unknown, sorter: SorterResult<T> | SorterResult<T>[]) => {
      setSelectedIds([]);
      const single = Array.isArray(sorter) ? sorter[0] : sorter;
      const order =
        single?.order === 'ascend' ? 'ASC' : single?.order === 'descend' ? 'DESC' : undefined;
      setParams((prev) => ({
        ...prev,
        sortBy: order ? (single?.field as string) : undefined,
        sortOrder: order,
        page: 1,
      }));
    },
    [],
  );

  const handleSearch = useCallback((value: string) => {
    setSelectedIds([]);
    setParams((prev) => ({ ...prev, search: value, page: 1 }));
  }, []);

  const toggleGroup = useCallback((field: string) => {
    setGroupBy((prev) =>
      prev.includes(field) ? prev.filter((k) => k !== field) : [...prev, field],
    );
    setSelectedIds([]);
  }, []);

  const clearSelection = useCallback(() => setSelectedIds([]), []);

  const refresh = useCallback(() => {
    setSelectedIds([]);
    setLoading(true);
    fetchFnRef
      .current(params)
      .then((result) => {
        setData(result.data);
        setTotal(result.total);
      })
      .catch(() => message.error(t('common.error')))
      .finally(() => setLoading(false));
  }, [params, message, t]);

  return {
    loading,
    data,
    total,
    params,
    selectedIds,
    groupBy,
    visibleColumns,
    isGrouped,
    tableData,
    groupLabels,
    activeConfigs,
    fetchData,
    handleTableChange,
    handleSearch,
    toggleGroup,
    toggleColumn,
    resetColumns,
    clearSelection,
    refresh,
    setParams,
    setSelectedIds,
    t,
  };
}
