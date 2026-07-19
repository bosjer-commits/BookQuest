'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { USERS, type UserProfile } from '@/data/users';

interface UserContextType {
  activeUserId: string | null;
  activeProfile: UserProfile | null;
  viewingProfile: UserProfile | null;
  viewingUserId: string | null;
  canEditProgress: boolean;
  basePath: string;
  login: (userId: string) => void;
  logout: () => void;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('bq:activeUser');
    if (savedUser) setActiveUserId(savedUser);
    setHydrated(true);
  }, []);

  const activeProfile = activeUserId ? (USERS.find((u) => u.id === activeUserId) ?? null) : null;

  // No parent/kid distinction: the logged-in user always views and edits their own data.
  const viewingProfile = activeProfile;
  const viewingUserId = activeProfile?.id ?? null;
  const canEditProgress = true;

  const login = useCallback((userId: string) => {
    const profile = USERS.find((u) => u.id === userId);
    if (!profile) return;
    localStorage.setItem('bq:activeUser', userId);
    setActiveUserId(userId);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('bq:activeUser');
    setActiveUserId(null);
  }, []);

  return (
    <UserContext.Provider
      value={{
        activeUserId,
        activeProfile,
        viewingProfile,
        viewingUserId,
        canEditProgress,
        basePath: '',
        login,
        logout,
      }}
    >
      {hydrated ? children : null}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
