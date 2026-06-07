import { ReactNode } from 'react';
import { useAbility, type Action, type Subject } from '@lib/permissions/ability';

export function Can({
  I,
  a,
  children,
  fallback = null,
}: {
  I: Action;
  a: Subject;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const ability = useAbility();
  return ability.can(I, a) ? <>{children}</> : <>{fallback}</>;
}
