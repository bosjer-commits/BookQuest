'use client';

import { ReactNode, useState, useEffect } from 'react';
import Image from 'next/image';
import { useUser } from '@/contexts/UserContext';
import { USERS } from '@/data/users';
import { CHEST_TIERS } from '@/data/skins';
import { DemoCurrentBookProvider } from '@/contexts/demo/DemoCurrentBookContext';
import { DemoFavoritesProvider } from '@/contexts/demo/DemoFavoritesContext';
import { DemoChestProvider } from '@/contexts/demo/DemoChestContext';
import ChestOpeningModal from '@/components/ChestOpeningModal';

function getKidAvatar(name: string): string {
  return `/assets/Skins/${name}_profile.png`;
}

function resetKidData(kidId: string) {
  localStorage.removeItem(`bq:demo:${kidId}:books`);
  localStorage.removeItem(`bq:demo:${kidId}:skins`);
  localStorage.removeItem(`bq:demo:${kidId}:chests`);
  localStorage.removeItem(`bq:demo:${kidId}:welcomed`);
  localStorage.removeItem(`bq:demo:${kidId}:selectedSkin`);
}

function DemoKidPicker() {
  const { login, logout, activeUserId } = useUser();
  const kids = USERS.filter((u) => u.role === 'kid');

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

      <h2
        className="text-2xl font-black brawl-text mb-8"
        style={{
          color: '#F6D58A',
          textShadow: '-2px 0 #5A3C12, 2px 0 #5A3C12, 0 -2px #5A3C12, 0 2px #5A3C12',
        }}
      >
        Who&apos;s reading today?
      </h2>

      <div className="flex flex-wrap justify-center gap-5 max-w-[360px]">
        {kids.map((kid) => (
          <div key={kid.id} className="flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={() => login(kid.id)}
              className="flex flex-col items-center gap-2 focus:outline-none"
            >
              <div
                className="relative rounded-2xl overflow-hidden"
                style={{
                  width: '100px',
                  height: '100px',
                  background: 'radial-gradient(ellipse at center, #3d8ba8 0%, #1a3a52 100%)',
                  border: '3px solid #74B9FF',
                  boxShadow: '0 0 20px rgba(116,185,255,0.5)',
                }}
              >
                <Image
                  src={getKidAvatar(kid.name)}
                  alt={kid.name}
                  width={100}
                  height={100}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-base font-bold brawl-text" style={{ color: '#7EC3FF' }}>
                {kid.name}
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                resetKidData(kid.id);
                if (activeUserId === kid.id) logout();
              }}
              className="text-xs px-3 py-0.5 rounded-full"
              style={{
                color: 'rgba(255,107,107,0.7)',
                border: '1px solid rgba(255,107,107,0.3)',
              }}
            >
              Reset
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

type WelcomeStep = 'checking' | 'welcome' | 'chest' | 'done';

function DemoWelcomeFlow({ userId, children }: { userId: string; children: ReactNode }) {
  const [step, setStep] = useState<WelcomeStep>('checking');

  useEffect(() => {
    const welcomed = localStorage.getItem(`bq:demo:${userId}:welcomed`);
    setStep(welcomed === 'true' ? 'done' : 'welcome');
  }, [userId]);

  const handleChestClose = () => {
    localStorage.setItem(`bq:demo:${userId}:welcomed`, 'true');
    setStep('done');
  };

  if (step === 'checking') return null;
  if (step === 'done') return <>{children}</>;

  if (step === 'chest') {
    return (
      <ChestOpeningModal isOpen={true} onClose={handleChestClose} chestGoal={-1} />
    );
  }

  // step === 'welcome'
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{ background: '#162544' }}
    >
      <button
        type="button"
        onClick={() => setStep('chest')}
        className="relative w-full h-full max-w-[500px] mx-auto"
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        aria-label="Open your first chest"
      >
        <img
          src="/assets/openfirstchest.webp"
          alt="Welcome to Book Quest"
          className="w-full h-full object-contain"
        />
        <img
          src={CHEST_TIERS.brawl.swirlAnimation}
          alt="Chest"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ width: '55%' }}
        />
      </button>
    </div>
  );
}

export default function DemoUserDataProviders({ children }: { children: ReactNode }) {
  const { activeUserId, viewingUserId } = useUser();

  if (!activeUserId || !viewingUserId) return <DemoKidPicker />;

  return (
    <DemoCurrentBookProvider key={viewingUserId} userId={viewingUserId}>
      <DemoFavoritesProvider key={viewingUserId} userId={viewingUserId}>
        <DemoChestProvider key={viewingUserId} userId={viewingUserId}>
          <DemoWelcomeFlow key={viewingUserId} userId={viewingUserId}>
            {children}
          </DemoWelcomeFlow>
        </DemoChestProvider>
      </DemoFavoritesProvider>
    </DemoCurrentBookProvider>
  );
}
