import { Action, AppAbility, Subject, useAbility } from '@components/Can/Can';

export function useCan(action: Action, subject: Subject): boolean {
  const ability: AppAbility = useAbility();
  return ability.can(action, subject);
}
