'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface ChestContextType {
  unlockedSkins: string[];
  collectedChests: number[];
  unlockSkin: (skinId: string) => void;
  markChestCollected: (goal: number) => void;
  isChestCollected: (goal: number) => boolean;
  isSkinUnlocked: (skinId: string) => boolean;
}

const ChestContext = createContext<ChestContextType | undefined>(undefined);

export function ChestProvider({ children }: { children: ReactNode }) {
  const [unlockedSkins, setUnlockedSkins] = useState<string[]>([]);
  const [collectedChests, setCollectedChests] = useState<number[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedSkins = localStorage.getItem('unlockedSkins');
    const savedChests = localStorage.getItem('collectedChests');

    if (savedSkins) {
      try {
        setUnlockedSkins(JSON.parse(savedSkins));
      } catch (e) {
        console.error('Failed to parse unlocked skins:', e);
      }
    }

    if (savedChests) {
      try {
        setCollectedChests(JSON.parse(savedChests));
      } catch (e) {
        console.error('Failed to parse collected chests:', e);
      }
    }
  }, []);

  // Persist unlocked skins
  useEffect(() => {
    localStorage.setItem('unlockedSkins', JSON.stringify(unlockedSkins));
  }, [unlockedSkins]);

  // Persist collected chests
  useEffect(() => {
    localStorage.setItem('collectedChests', JSON.stringify(collectedChests));
  }, [collectedChests]);

  const unlockSkin = useCallback((skinId: string) => {
    setUnlockedSkins((prev) => {
      if (prev.includes(skinId)) return prev;
      return [...prev, skinId];
    });
  }, []);

  const markChestCollected = useCallback((goal: number) => {
    setCollectedChests((prev) => {
      if (prev.includes(goal)) return prev;
      return [...prev, goal];
    });
  }, []);

  const isChestCollected = useCallback(
    (goal: number) => collectedChests.includes(goal),
    [collectedChests]
  );

  const isSkinUnlocked = useCallback(
    (skinId: string) => unlockedSkins.includes(skinId),
    [unlockedSkins]
  );

  return (
    <ChestContext.Provider
      value={{
        unlockedSkins,
        collectedChests,
        unlockSkin,
        markChestCollected,
        isChestCollected,
        isSkinUnlocked,
      }}
    >
      {children}
    </ChestContext.Provider>
  );
}

export function useChest() {
  const context = useContext(ChestContext);
  if (context === undefined) {
    throw new Error('useChest must be used within a ChestProvider');
  }
  return context;
}
