import { ReactNode, useEffect } from 'react';
import { useAuthStore } from '@stores/authStore';

export function AuthProvider({ children }: { children: ReactNode }) {
  const loadUser = useAuthStore((s) => s.loadUser);

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  return <>{children}</>;
}
