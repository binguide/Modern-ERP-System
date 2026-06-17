import type { ReactNode } from 'react';

interface ErpFormProps {
  sidebar?: ReactNode;
  sidebarOpen: boolean;
  children: ReactNode;
}

export function ErpForm({ sidebar, sidebarOpen, children }: ErpFormProps) {
  return (
    <div className="erp-form-body" style={{ minHeight: 'calc(100vh - 140px)' }}>
      <div className="erp-form-main">{children}</div>
      {sidebar && (
        <div className={`erp-form-sidebar${sidebarOpen ? '' : ' collapsed'}`}>{sidebar}</div>
      )}
    </div>
  );
}
