import type { ReactNode } from 'react';

export interface ErpTab {
  key: string;
  label: string;
}

interface ErpFormTabsProps {
  tabs: ErpTab[];
  activeKey: string;
  onChange: (key: string) => void;
  children: ReactNode;
}

export function ErpFormTabs({ tabs, activeKey, onChange, children }: ErpFormTabsProps) {
  return (
    <>
      <div className="erp-section-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`erp-tab-btn${activeKey === tab.key ? ' active' : ''}`}
            onClick={() => onChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="erp-section-body">{children}</div>
    </>
  );
}
