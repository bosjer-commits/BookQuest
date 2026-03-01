'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

interface ChestContextType {
  unlockedSkins: string[];
  collectedChests: number[];
  unlockSkin: (skinId: string) => void;
  markChestCollected: (goal: number) => void;
  isChestCollected: (goal: number) => boolean;
  isSkinUnlocked: (skinId: string) => boolean;
}

export const ChestContext = createContext<ChestContextType | undefined>(undefined);

export function ChestProvider({ children, userId }: { children: ReactNode; userId: string }) {
  const [unlockedSkins, setUnlockedSkins] = useState<string[]>([]);
  const [collectedChests, setCollectedChests] = useState<number[]>([]);
  const supabase = createClient();

  // Load from Supabase on mount / userId change
  useEffect(() => {
    async function load() {
      const [skinsRes, chestsRes] = await Promise.all([
        supabase
          .from('unlocked_skins')
          .select('skin_id')
          .eq('user_id', userId),
        supabase
          .from('collected_chests')
          .select('chest_goal')
          .eq('user_id', userId),
      ]);

      if (skinsRes.error) console.error('Failed to load skins:', skinsRes.error);
      if (chestsRes.error) console.error('Failed to load chests:', chestsRes.error);

      setUnlockedSkins(skinsRes.data?.map((r) => r.skin_id) ?? []);
      setCollectedChests(chestsRes.data?.map((r) => r.chest_goal) ?? []);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const unlockSkin = useCallback(
    (skinId: string) => {
      // Optimistic update
      setUnlockedSkins((prev) => {
        if (prev.includes(skinId)) return prev;
        return [...prev, skinId];
      });

      // Sync to Supabase
      supabase
        .from('unlocked_skins')
        .upsert({ user_id: userId, skin_id: skinId }, { onConflict: 'user_id,skin_id' })
        .then(({ error }) => { if (error) console.error('Failed to save skin:', error); });
    },
    [userId, supabase]
  );

  const markChestCollected = useCallback(
    (goal: number) => {
      // Optimistic update
      setCollectedChests((prev) => {
        if (prev.includes(goal)) return prev;
        return [...prev, goal];
      });

      // Sync to Supabase
      supabase
        .from('collected_chests')
        .upsert({ user_id: userId, chest_goal: goal }, { onConflict: 'user_id,chest_goal' })
        .then(({ error }) => { if (error) console.error('Failed to save chest:', error); });
    },
    [userId, supabase]
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

export function useChest() {
  const context = useContext(ChestContext);
  if (context === undefined) {
    throw new Error('useChest must be used within a ChestProvider');
  }
  return context;
}
