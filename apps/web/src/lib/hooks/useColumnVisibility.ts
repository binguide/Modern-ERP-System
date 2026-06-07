import { useState, useEffect, useCallback } from 'react';

export function useColumnVisibility(storageKey: string, defaultKeys: string[]) {
  const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : defaultKeys;
    } catch {
      return defaultKeys;
    }
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(visibleColumns));
  }, [storageKey, visibleColumns]);

  const toggleColumn = useCallback((key: string) => {
    setVisibleColumns((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  }, []);

  const resetColumns = useCallback(() => {
    setVisibleColumns(defaultKeys);
  }, [defaultKeys]);

  return { visibleColumns, toggleColumn, resetColumns };
}
