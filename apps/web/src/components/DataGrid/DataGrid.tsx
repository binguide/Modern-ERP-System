import type { ReactNode } from 'react';
import { Card, Table, Button, Space, Input, Tag, Modal } from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';
import { PlusOutlined, SyncOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { TableMenu } from '@components/TableMenu/TableMenu';
import { isGroupRow, TableRow } from '@lib/table-utils';
import type { GroupOption, DataGridParams } from './useDataGrid';

export interface ColumnDef {
  key: string;
  label: string;
}

interface DataGridProps<T extends { id: string }> {
  loading: boolean;
  total: number;
  params: DataGridParams;
  selectedIds: string[];
  groupBy: string[];
  visibleColumns: string[];
  isGrouped: boolean;
  tableData: TableRow<T>[];
  groupLabels: Record<string, string>;

  handleTableChange: TableProps<T>['onChange'];
  handleSearch: (value: string) => void;
  toggleGroup: (field: string) => void;
  toggleColumn: (key: string) => void;
  resetColumns: () => void;
  setSelectedIds: (ids: string[]) => void;
  refresh: () => void;
  setParams: (params: DataGridParams | ((prev: DataGridParams) => DataGridParams)) => void;

  title?: ReactNode;
  icon?: ReactNode;
  titleKey?: string;
  columns: ColumnsType<T>;
  columnLabels: ColumnDef[];
  basePath: string;

  groupOptions?: GroupOption[];

  onRowClick?: (record: T) => void;
  onCreate?: () => void;
  onDeleteSelected?: (ids: string[]) => void;

  search?: boolean;
  create?: boolean;
  deleteSelected?: boolean;
  rowClick?: boolean;
  toolbarExtra?: ReactNode;
  emptyCreate?: boolean;
  tableProps?: Partial<TableProps<T>>;
  children?: ReactNode;
}

export function DataGrid<T extends { id: string }>({
  loading,
  total,
  params,
  selectedIds,
  groupBy,
  visibleColumns,
  isGrouped,
  tableData,
  groupLabels,

  handleTableChange,
  handleSearch,
  toggleGroup,
  toggleColumn,
  resetColumns,
  setSelectedIds,
  refresh,
  setParams,

  title,
  icon,
  titleKey,
  columns,
  columnLabels,
  basePath,

  groupOptions,

  onRowClick,
  onCreate,
  onDeleteSelected,

  search = true,
  create = true,
  deleteSelected = true,
  rowClick = true,
  toolbarExtra,
  emptyCreate = true,
  tableProps: extraTableProps,
  children,
}: DataGridProps<T>) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const navigateCreate = onCreate ?? (() => navigate(`/${basePath}/new`));
  const navigateRow = onRowClick ?? ((record: T) => navigate(`/${basePath}/${record.id}/edit`));

  const handleBatchDelete = () => {
    if (!onDeleteSelected) return;
    Modal.confirm({
      title: t('common.confirmDelete'),
      onOk: () => onDeleteSelected(selectedIds),
    });
  };

  const visibleColDefs = columns.filter((col) => {
    const key = (col as unknown as { key?: string }).key;
    return key ? visibleColumns.includes(key) : true;
  });

  const menuColumn = {
    key: '__menu__' as const,
    width: 40,
    fixed: 'right' as const,
    title: (
      <TableMenu
        columns={columnLabels}
        visibleColumns={visibleColumns}
        onToggleColumn={toggleColumn}
        onResetColumns={resetColumns}
        groupOptions={groupOptions}
        groupBy={groupBy}
        onToggleGroup={toggleGroup}
      />
    ),
    onCell: () => ({}) as Record<string, unknown>,
    render: () => null,
  } as never;

  const totalColumns = visibleColDefs.length + 1;

  const finalColumns = [
    ...(visibleColDefs as ColumnsType<TableRow<T>>).map((col, idx) => {
      const c = { ...col } as Record<string, unknown>;

      if (idx === 0) {
        const originalRender = c.render as
          | ((_: unknown, record: TableRow<T>) => ReactNode)
          | undefined;
        c.render = (_: unknown, record: TableRow<T>) => {
          if (isGroupRow(record)) {
            return (
              <div className="odoo-group-label">
                <strong className="group-label-name">{record.__groupLabel}</strong>
                <span className="group-label-count">{record.__groupCount}</span>
              </div>
            );
          }
          return originalRender ? originalRender(_, record) : (_ as ReactNode);
        };
      }

      const existingOnCell = c.onCell as
        | ((record: TableRow<T>) => Record<string, unknown>)
        | undefined;
      c.onCell = (record: TableRow<T>) => {
        if (isGroupRow(record)) {
          return { colSpan: idx === 0 ? totalColumns : 0 };
        }
        return existingOnCell ? existingOnCell(record) : {};
      };

      if (c.sorter) {
        const key = c.key as string;
        c.sortOrder =
          params.sortBy === key
            ? params.sortOrder === 'ASC'
              ? ('ascend' as const)
              : ('descend' as const)
            : undefined;
      }

      return c as never;
    }),
    menuColumn,
  ];

  return (
    <Card
      title={
        <>
          {icon || <UserOutlined style={{ marginInlineEnd: 8 }} />}
          {title || (titleKey ? t(titleKey) : '')}
        </>
      }
      extra={
        <Space>
          {deleteSelected && selectedIds.length > 0 && (
            <Button danger icon={<DeleteOutlined />} onClick={handleBatchDelete}>
              {t('common.deleteSelected', { count: selectedIds.length })}
            </Button>
          )}
          {groupBy.map((field) => (
            <Tag key={field} closable onClose={() => toggleGroup(field)} style={{ marginRight: 0 }}>
              {groupLabels[field] || field}
            </Tag>
          ))}
          {search && (
            <Input.Search
              placeholder={t('common.search')}
              onSearch={handleSearch}
              style={{ width: 200 }}
              allowClear
            />
          )}
          {toolbarExtra}
          <Button icon={<SyncOutlined />} onClick={refresh} />
          {create && (
            <Button type="primary" icon={<PlusOutlined />} onClick={navigateCreate}>
              {t('common.create')}
            </Button>
          )}
        </Space>
      }
    >
      {children || (
        <Table
          key={`table-${groupBy.join(',') || 'none'}`}
          dataSource={tableData as never[]}
          columns={finalColumns}
          rowKey={(record: TableRow<T> & { id?: string }) =>
            isGroupRow(record) ? record.key : record.id!
          }
          loading={loading}
          onChange={handleTableChange}
          scroll={{ x: 'max-content' }}
          showSorterTooltip={false}
          defaultExpandAllRows={isGrouped}
          rowSelection={
            deleteSelected
              ? {
                  selectedRowKeys: selectedIds,
                  onChange: (keys) =>
                    setSelectedIds((keys as string[]).filter((k) => !k.startsWith('__group__'))),
                }
              : undefined
          }
          rowClassName={(record: TableRow<T>) => (isGroupRow(record) ? 'odoo-group-row' : '')}
          onRow={(record: TableRow<T>) => {
            if (isGroupRow(record) || !rowClick) return {};
            return {
              onClick: () => navigateRow(record as T),
              style: { cursor: 'pointer' },
            };
          }}
          pagination={{
            current: params.page,
            pageSize: params.limit,
            total: isGrouped ? (tableData as never[]).length : total,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            onChange: (page, limit) => {
              setSelectedIds([]);
              setParams((prev) => ({ ...prev, page, limit }));
            },
          }}
          locale={
            create && emptyCreate
              ? {
                  emptyText: (
                    <Space direction="vertical" style={{ padding: 24 }}>
                      {t('common.noData')}
                      <Button type="primary" onClick={navigateCreate}>
                        {t('common.create')}
                      </Button>
                    </Space>
                  ),
                }
              : undefined
          }
          {...extraTableProps}
        />
      )}
    </Card>
  );
}
