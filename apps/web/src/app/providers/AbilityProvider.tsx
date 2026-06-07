import { ReactNode, useMemo } from 'react';
import { abilityContext, buildAbility, AppAbility, Action } from '@lib/permissions/ability';
import { useAuthStore } from '@stores/authStore';
import { RawRuleOf } from '@casl/ability';

const resourceMap: Record<string, string> = {
  companies: 'Company',
  branches: 'Branch',
  users: 'User',
  roles: 'Role',
  currencies: 'Currency',
  'fiscal-years': 'FiscalYear',
  periods: 'Period',
  transactions: 'Transaction',
  accounts: 'Account',
  'journal-entries': 'JournalEntry',
  reports: 'Report',
  'audit-logs': 'AuditLog',
  settings: 'Settings',
};

export function AbilityProvider({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);

  const ability = useMemo<AppAbility>(() => {
    if (!user) return buildAbility([]);

    const rules: RawRuleOf<AppAbility>[] = [];

    if (user.isSuperAdmin) {
      rules.push({ action: 'manage', subject: 'all' });
      return buildAbility(rules);
    }

    for (const role of user.roles) {
      for (const perm of role.permissions) {
        const subject = resourceMap[perm.resource] ?? perm.resource;
        const action = perm.action === 'manage' ? 'manage' : (perm.action as Action);
        rules.push({ action, subject });
      }
    }

    return buildAbility(rules);
  }, [user]);

  return <abilityContext.Provider value={ability}>{children}</abilityContext.Provider>;
}
