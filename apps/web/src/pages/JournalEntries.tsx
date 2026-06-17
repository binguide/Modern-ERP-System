import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, App, Space, Modal } from 'antd';
import {
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { journalEntriesApi, JournalEntryItem } from '@lib/api/endpoints/journal-entries';
import { OdooTag } from '@components/OdooTag/OdooTag';
import { DataGrid, useDataGrid } from '@components/DataGrid';
import dayjs from 'dayjs';

export default function JournalEntriesPage() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const navigate = useNavigate();

  const grid = useDataGrid<JournalEntryItem>({
    fetchFn: (params) => journalEntriesApi.findAll(params as Record<string, unknown>),
    storageKey: 'journal-entries-list-columns',
    columnKeys: ['number', 'date', 'description', 'status', 'totalDebit', 'totalCredit'],
    defaultParams: { sortBy: 'createdAt', sortOrder: 'DESC' },
  });

  const handleDeleteSelected = useCallback(
    async (ids: string[]) => {
      Modal.confirm({
        title: t('common.confirmDelete'),
        onOk: async () => {
          for (const id of ids) {
            await journalEntriesApi.remove(id);
          }
          message.success(t('common.deleted'));
          grid.clearSelection();
          grid.refresh();
        },
      });
    },
    [message, t, grid],
  );

  const handlePost = useCallback(
    async (id: string) => {
      Modal.confirm({
        title: t('journalEntries.confirmPost'),
        onOk: async () => {
          try {
            await journalEntriesApi.post(id);
            message.success(t('journalEntries.posted'));
            grid.refresh();
          } catch {
            message.error(t('common.error'));
          }
        },
      });
    },
    [message, t, grid],
  );

  const handleCancelEntry = useCallback(
    async (id: string) => {
      Modal.confirm({
        title: t('journalEntries.confirmCancel'),
        onOk: async () => {
          try {
            await journalEntriesApi.cancel(id);
            message.success(t('journalEntries.cancelled'));
            grid.refresh();
          } catch {
            message.error(t('common.error'));
          }
        },
      });
    },
    [message, t, grid],
  );

  const statusColors: Record<string, string> = {
    draft: 'orange',
    posted: 'green',
    cancelled: 'red',
  };

  const columns = [
    {
      title: t('journalEntries.number'),
      key: 'number',
      dataIndex: 'number',
      sorter: true,
      width: 100,
    },
    {
      title: t('journalEntries.date'),
      key: 'date',
      dataIndex: 'date',
      sorter: true,
      width: 120,
      render: (v: string) => dayjs(v).format('YYYY-MM-DD'),
    },
    {
      title: t('journalEntries.description'),
      key: 'description',
      dataIndex: 'description',
      ellipsis: true,
    },
    { title: t('journalEntries.reference'), key: 'reference', dataIndex: 'reference', width: 120 },
    {
      title: t('journalEntries.status'),
      key: 'status',
      dataIndex: 'status',
      width: 100,
      render: (v: string) => (
        <OdooTag color={statusColors[v] || 'default'}>{t(`journalEntries.${v}`)}</OdooTag>
      ),
    },
    {
      title: t('journalEntries.totalDebit'),
      key: 'totalDebit',
      dataIndex: 'totalDebit',
      width: 120,
      render: (v: number) => Number(v).toLocaleString(),
    },
    {
      title: t('journalEntries.totalCredit'),
      key: 'totalCredit',
      dataIndex: 'totalCredit',
      width: 120,
      render: (v: number) => Number(v).toLocaleString(),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 120,
      render: (_: unknown, record: JournalEntryItem) => (
        <Space>
          {record.status === 'draft' && (
            <>
              <Button
                type="link"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePost(record.id);
                }}
              />
              <Button
                type="link"
                size="small"
                icon={<FileTextOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/journal-entries/${record.id}/edit`);
                }}
              />
              <Button
                type="link"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  Modal.confirm({
                    title: t('common.confirmDelete'),
                    onOk: () => journalEntriesApi.remove(record.id).then(() => grid.refresh()),
                  });
                }}
              />
            </>
          )}
          {record.status === 'posted' && (
            <Button
              type="link"
              size="small"
              icon={<CloseCircleOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleCancelEntry(record.id);
              }}
            />
          )}
          {(record.status === 'draft' || record.status === 'posted') && (
            <Button
              type="link"
              size="small"
              icon={<FileTextOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/journal-entries/${record.id}/edit`);
              }}
            />
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="erpnext-list">
      <DataGrid<JournalEntryItem>
        {...grid}
        title={t('menu.journalEntries')}
        icon={<FileTextOutlined />}
        columns={columns}
        columnLabels={[
          { key: 'number', label: t('journalEntries.number') },
          { key: 'date', label: t('journalEntries.date') },
          { key: 'description', label: t('journalEntries.description') },
          { key: 'reference', label: t('journalEntries.reference') },
          { key: 'status', label: t('journalEntries.status') },
          { key: 'totalDebit', label: t('journalEntries.totalDebit') },
          { key: 'totalCredit', label: t('journalEntries.totalCredit') },
        ]}
        basePath="journal-entries"
        onRowClick={(record) => navigate(`/journal-entries/${record.id}/edit`)}
        onCreate={() => navigate('/journal-entries/new')}
        onDeleteSelected={handleDeleteSelected}
      />
    </div>
  );
}
