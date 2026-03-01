'use client';

import { useState, useEffect, useCallback, ReactNode } from 'react';
import { ChestContext } from '@/contexts/ChestContext';

function skinsKey(userId: string) {
  return `bq:demo:${userId}:skins`;
}

function chestsKey(userId: string) {
  return `bq:demo:${userId}:chests`;
}

function loadSkins(userId: string): string[] {
  try {
    return JSON.parse(localStorage.getItem(skinsKey(userId)) ?? '[]');
  } catch {
    return [];
  }
}

function loadChests(userId: string): number[] {
  try {
    return JSON.parse(localStorage.getItem(chestsKey(userId)) ?? '[]');
  } catch {
    return [];
  }
}

export function DemoChestProvider({
  children,
  userId,
}: {
  children: ReactNode;
  userId: string;
}) {
  const [unlockedSkins, setUnlockedSkins] = useState<string[]>([]);
  const [collectedChests, setCollectedChests] = useState<number[]>([]);

  // Load from localStorage when userId changes
  useEffect(() => {
    setUnlockedSkins(loadSkins(userId));
    setCollectedChests(loadChests(userId));
  }, [userId]);

  const unlockSkin = useCallback(
    (skinId: string) => {
      setUnlockedSkins((prev) => {
        if (prev.includes(skinId)) return prev;
        const next = [...prev, skinId];
        localStorage.setItem(skinsKey(userId), JSON.stringify(next));
        return next;
      });
    },
    [userId]
  );

  const markChestCollected = useCallback(
    (goal: number) => {
      setCollectedChests((prev) => {
        if (prev.includes(goal)) return prev;
        const next = [...prev, goal];
        localStorage.setItem(chestsKey(userId), JSON.stringify(next));
        return next;
      });
    },
    [userId]
  );

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
