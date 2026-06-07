import { ReactNode } from 'react';
import { getPalette } from '@lib/tag-colors';
import type { LiteralUnion } from 'antd/es/_util/type';
import type { PresetColorType } from 'antd/es/_util/colors';

interface OdooTagProps {
  color?: LiteralUnion<PresetColorType>;
  children: ReactNode;
  prefix?: ReactNode;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export function OdooTag({ color = 'default', children, prefix, style, onClick }: OdooTagProps) {
  const p = getPalette(color as string);
  return (
    <span
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '0 8px',
        borderRadius: 12,
        fontSize: 12,
        lineHeight: '20px',
        backgroundColor: p.bg,
        color: p.text,
        cursor: onClick ? 'pointer' : undefined,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      <span
        style={{
          display: 'inline-block',
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: p.dot,
          flexShrink: 0,
        }}
      />
      {prefix}
      {children}
    </span>
  );
}
