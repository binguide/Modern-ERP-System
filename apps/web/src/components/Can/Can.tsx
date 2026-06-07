import { createContext, ReactNode, useContext } from 'react';
import { createMongoAbility, MongoAbility, RawRuleOf } from '@casl/ability';

export type Action = 'create' | 'read' | 'update' | 'delete' | 'approve' | 'export' | 'manage';
export type Subject = 'all' | 'User' | 'Role' | 'Company' | 'Branch' | 'AuditLog' | string;

export type AppAbility = MongoAbility<[Action, Subject]>;

export const abilityContext = createContext<AppAbility>(createMongoAbility<[Action, Subject]>([]));

export function useAbility(): AppAbility {
  return useContext(abilityContext);
}

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

export function buildAbility(rules: RawRuleOf<AppAbility>[]): AppAbility {
  return createMongoAbility<AppAbility>(rules);
}
