import type { ReactNode } from 'react';

interface ErpFieldGridProps {
  children: ReactNode;
  columns?: number;
}

export function ErpFieldGrid({ children, columns }: ErpFieldGridProps) {
  return (
    <div
      className="erp-field-grid"
      style={columns ? { gridTemplateColumns: `repeat(${columns}, 1fr)` } : undefined}
    >
      {children}
    </div>
  );
}

interface ErpFieldProps {
  label: string;
  required?: boolean;
  children: ReactNode;
  fullWidth?: boolean;
}

export function ErpField({ label, required, children, fullWidth }: ErpFieldProps) {
  return (
    <div className={fullWidth ? 'erp-field-full' : undefined}>
      <div className="ant-form-item">
        <div className="ant-form-item-label">
          <label>
            {label}
            {required && <span style={{ color: '#ef4444', marginInlineStart: 2 }}>*</span>}
          </label>
        </div>
        {children}
      </div>
    </div>
  );
}
