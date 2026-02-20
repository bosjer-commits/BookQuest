'use client';

import { ReactNode, useState, useEffect } from 'react';
import Image from 'next/image';
import { useUser } from '@/contexts/UserContext';
import { USERS } from '@/data/users';
import { SKIN_CATALOG, CHEST_TIERS } from '@/data/skins';
import { CurrentBookProvider } from '@/contexts/CurrentBookContext';
import { FavoritesProvider } from '@/contexts/FavoritesContext';
import { ChestProvider } from '@/contexts/ChestContext';
import ProfileSelector from '@/components/ProfileSelector';
import ChestOpeningModal from '@/components/ChestOpeningModal';
import { createClient } from '@/lib/supabase/client';

function getKidAvatar(name: string): string {
  const skin = SKIN_CATALOG.find(
    (s) => s.owner.toLowerCase() === name.toLowerCase()
  );
  return skin?.asset ?? '/assets/Skins/Elliott/Spike.png';
}

function KidPicker() {
  const { activeProfile, selectKid, logout } = useUser();
  const kidProfiles = (activeProfile?.kids ?? []).map(
    (id) => USERS.find((u) => u.id === id)!
  );

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center z-50"
      style={{ background: 'var(--navy)' }}
    >
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center top, rgba(162,155,254,0.15) 0%, transparent 70%)',
        }}
      />

      <p
        className="text-base font-bold brawl-text mb-2"
        style={{ color: '#C8B4FF' }}
      >
        Welcome, {activeProfile?.name}!
      </p>
      <h2
        className="text-2xl font-black brawl-text mb-8"
        style={{
          color: '#F6D58A',
          textShadow: '-2px 0 #5A3C12, 2px 0 #5A3C12, 0 -2px #5A3C12, 0 2px #5A3C12',
        }}
      >
        Whose progress?
      </h2>

      <div className="flex justify-center gap-8">
        {kidProfiles.map((kid) => (
          <button
            key={kid.id}
            type="button"
            onClick={() => selectKid(kid.id)}
            className="flex flex-col items-center gap-2 focus:outline-none"
          >
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{
                width: '110px',
                height: '110px',
                background: 'radial-gradient(ellipse at center, #3d8ba8 0%, #1a3a52 100%)',
                border: '3px solid #74B9FF',
                boxShadow: '0 0 20px rgba(116,185,255,0.5)',
              }}
            >
              <Image
                src={getKidAvatar(kid.name)}
                alt={kid.name}
                width={110}
                height={110}
                className="w-full h-full object-cover"
              />
            </div>
            <span
              className="text-base font-bold brawl-text"
              style={{ color: '#7EC3FF' }}
            >
              {kid.name}
            </span>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={logout}
        className="mt-10 px-6 py-2 rounded-full text-sm font-bold"
        style={{
          border: '2px solid rgba(116,185,255,0.4)',
          color: 'rgba(116,185,255,0.7)',
          background: 'transparent',
        }}
      >
        Switch User
      </button>
    </div>
  );
}

type WelcomeStep = 'checking' | 'welcome' | 'chest' | 'done';

function WelcomeFlow({ userId, children }: { userId: string; children: ReactNode }) {
  const [step, setStep] = useState<WelcomeStep>('checking');
  const supabase = createClient();

  useEffect(() => {
    async function check() {
      const { data } = await supabase
        .from('user_state')
        .select('welcomed')
        .eq('user_id', userId)
        .single();
      setStep(data?.welcomed ? 'done' : 'welcome');
    }
    check();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleChestClose = () => {
    supabase
      .from('user_state')
      .upsert({ user_id: userId, welcomed: true }, { onConflict: 'user_id' })
      .then(({ error }) => { if (error) console.error('Failed to save welcomed state:', error); });
    setStep('done');
  };

  if (step === 'checking') return null;

  if (step === 'done') return <>{children}</>;

  if (step === 'chest') {
    return (
      <ChestOpeningModal
        isOpen={true}
        onClose={handleChestClose}
        chestGoal={-1}
      />
    );
  }

  // step === 'welcome'
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: '#162544' }}
    >
      {/* Top glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center top, rgba(116,185,255,0.18) 0%, transparent 65%)',
        }}
      />

      {/* Animated chest */}
      <div className="relative mb-2" style={{ width: 260 }}>
        <img
          src={CHEST_TIERS.brawl.swirlAnimation}
          alt="Chest"
          style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
        />
      </div>

      {/* Welcome text */}
      <h1
        className="text-3xl font-black brawl-text text-center leading-tight mb-2"
        style={{
          color: '#F6D58A',
          textShadow: '-2px 0 #5A3C12, 2px 0 #5A3C12, 0 -2px #5A3C12, 0 2px #5A3C12',
        }}
      >
        Welcome to BookQuest!
      </h1>
      <p
        className="text-base font-bold brawl-text mb-8"
        style={{ color: '#7EC3FF' }}
      >
        Open your first chest.
      </p>

      {/* CTA button */}
      <button
        type="button"
        onClick={() => setStep('chest')}
        className="px-10 py-4 rounded-full font-black text-lg border-2 border-white"
        style={{
          background: 'linear-gradient(to bottom, #FDCB6E 0%, #FFA502 100%)',
          color: '#1A1F3A',
          boxShadow: '0 4px 0 rgba(0,0,0,0.35), 0 6px 16px rgba(0,0,0,0.3)',
        }}
      >
        Open my first chest!
      </button>
    </div>
  );
}

export default function UserDataProviders({ children }: { children: ReactNode }) {
  const { activeUserId, viewingUserId, isParentMode } = useUser();

  if (!activeUserId) return <ProfileSelector />;
  if (!viewingUserId) return <KidPicker />;

  return (
    <CurrentBookProvider key={viewingUserId} userId={viewingUserId}>
      <FavoritesProvider key={viewingUserId} userId={viewingUserId}>
        <ChestProvider key={viewingUserId} userId={viewingUserId}>
          {isParentMode ? (
            children
          ) : (
            <WelcomeFlow key={viewingUserId} userId={viewingUserId}>
              {children}
            </WelcomeFlow>
          )}
        </ChestProvider>
      </FavoritesProvider>
    </CurrentBookProvider>
  );
}
