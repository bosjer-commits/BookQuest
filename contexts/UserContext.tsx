'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { USERS, type UserProfile } from '@/data/users';

interface UserContextType {
  activeUserId: string | null;
  selectedKidId: string | null;
  activeProfile: UserProfile | null;
  viewingProfile: UserProfile | null;
  viewingUserId: string | null;
  isParentMode: boolean;
  canEditProgress: boolean;
  basePath: string;
  login: (userId: string) => void;
  logout: () => void;
  selectKid: (kidId: string) => void;
  clearKidSelection: () => void;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [selectedKidId, setSelectedKidId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('bq:activeUser');
    const savedKid = localStorage.getItem('bq:selectedKid');
    if (savedUser) setActiveUserId(savedUser);
    if (savedKid) setSelectedKidId(savedKid);
    setHydrated(true);
  }, []);

  const activeProfile = activeUserId ? (USERS.find((u) => u.id === activeUserId) ?? null) : null;

  const isParentMode = activeProfile?.role === 'parent' && selectedKidId !== null;

  const viewingProfile = (() => {
    if (isParentMode && selectedKidId) {
      return USERS.find((u) => u.id === selectedKidId) ?? null;
    }
    if (activeProfile?.role === 'kid') {
      return activeProfile;
    }
    return null;
  })();

  const viewingUserId = viewingProfile?.id ?? null;
  const canEditProgress = isParentMode;

  const login = useCallback((userId: string) => {
    const profile = USERS.find((u) => u.id === userId);
    if (!profile) return;

    localStorage.setItem('bq:activeUser', userId);
    setActiveUserId(userId);

    if (profile.role === 'parent') {
      if (profile.kids?.length === 1) {
        const kidId = profile.kids[0];
        localStorage.setItem('bq:selectedKid', kidId);
        setSelectedKidId(kidId);
      } else {
        localStorage.removeItem('bq:selectedKid');
        setSelectedKidId(null);
      }
    } else {
      localStorage.removeItem('bq:selectedKid');
      setSelectedKidId(null);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('bq:activeUser');
    localStorage.removeItem('bq:selectedKid');
    setActiveUserId(null);
    setSelectedKidId(null);
  }, []);

  const selectKid = useCallback((kidId: string) => {
    localStorage.setItem('bq:selectedKid', kidId);
    setSelectedKidId(kidId);
  }, []);

  const clearKidSelection = useCallback(() => {
    localStorage.removeItem('bq:selectedKid');
    setSelectedKidId(null);
  }, []);

  return (
    <UserContext.Provider
      value={{
        activeUserId,
        selectedKidId,
        activeProfile,
        viewingProfile,
        viewingUserId,
        isParentMode,
        canEditProgress,
        basePath: '',
        login,
        logout,
        selectKid,
        clearKidSelection,
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
