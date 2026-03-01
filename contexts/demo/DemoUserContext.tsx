'use client';

import { useState, useEffect, useCallback, ReactNode } from 'react';
import { UserContext } from '@/contexts/UserContext';
import { USERS } from '@/data/users';

const DEMO_ACTIVE_KEY = 'bq:demo:activeUser';

export function DemoUserProvider({ children }: { children: ReactNode }) {
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(DEMO_ACTIVE_KEY);
    if (saved) setActiveUserId(saved);
    setHydrated(true);
  }, []);

  const login = useCallback((userId: string) => {
    localStorage.setItem(DEMO_ACTIVE_KEY, userId);
    setActiveUserId(userId);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(DEMO_ACTIVE_KEY);
    setActiveUserId(null);
  }, []);

  const activeProfile = activeUserId ? (USERS.find((u) => u.id === activeUserId) ?? null) : null;
  const viewingProfile = activeProfile?.role === 'kid' ? activeProfile : null;
  const viewingUserId = viewingProfile?.id ?? null;

  return (
    <UserContext.Provider
      value={{
        activeUserId,
        selectedKidId: null,
        activeProfile,
        viewingProfile,
        viewingUserId,
        isParentMode: false,
        canEditProgress: true,
        basePath: '/test',
        login,
        logout,
        selectKid: () => {},
        clearKidSelection: () => {},
      }}
    >
      {hydrated ? children : null}
    </UserContext.Provider>
  );
}
