import { Action, Subject, useAbility } from '@lib/permissions/ability';

export function useCan(action: Action, subject: Subject): boolean {
  const ability = useAbility();
  return ability.can(action, subject);
}
