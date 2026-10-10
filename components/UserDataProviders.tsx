'use client';

import { ReactNode, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { CHEST_TIERS } from '@/data/skins';
import { CurrentBookProvider, useCurrentBook } from '@/contexts/CurrentBookContext';
import { FavoritesProvider, useFavorites } from '@/contexts/FavoritesContext';
import { ChestProvider, useChest } from '@/contexts/ChestContext';
import ProfileSelector from '@/components/ProfileSelector';
import ChestOpeningModal from '@/components/ChestOpeningModal';
import { createClient } from '@/lib/supabase/client';

type WelcomeStep = 'checking' | 'welcome' | 'chest' | 'done' | 'offline';

// Shown when saved data can't be loaded, so kids don't think their progress is gone
// (and aren't offered their first chest again).
function OfflineScreen() {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 px-6 text-center"
      style={{ background: '#162544' }}
    >
      <div className="text-2xl font-bold brawl-text" style={{ color: '#F6D58A' }}>
        Can&apos;t reach Book Quest right now
      </div>
      <div className="text-base text-white max-w-[340px]">
        Don&apos;t worry, your books and chests are safe. Please try again in a little while.
      </div>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="px-6 py-3 rounded-xl text-lg font-bold brawl-text text-white"
        style={{ background: '#74B9FF' }}
      >
        Try again
      </button>
    </div>
  );
}

function WelcomeFlow({ userId, children }: { userId: string; children: ReactNode }) {
  const [step, setStep] = useState<WelcomeStep>('checking');
  const supabase = createClient();
  const booksLoadError = useCurrentBook().loadError;
  const favoritesLoadError = useFavorites().loadError;
  const chestsLoadError = useChest().loadError;

  useEffect(() => {
    async function check() {
      // maybeSingle: a kid with no row yet is a new user (data null, no error);
      // a real error means the database is unreachable, not that they're new.
      const { data, error } = await supabase
        .from('user_state')
        .select('welcomed')
        .eq('user_id', userId)
        .maybeSingle();
      if (error) {
        console.error('Failed to load welcomed state:', error);
        setStep('offline');
        return;
      }
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

  if (step === 'offline' || booksLoadError || favoritesLoadError || chestsLoadError) {
    return <OfflineScreen />;
  }

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
        {/* Background image */}
        <img
          src="/assets/openfirstchest.webp"
          alt="Welcome to Book Quest"
          className="w-full h-full object-contain"
        />
        {/* Chest in the center */}
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

export default function UserDataProviders({ children }: { children: ReactNode }) {
  const { activeUserId, viewingUserId } = useUser();
  const pathname = usePathname();

  if (pathname.startsWith('/test')) return <>{children}</>;

  if (!activeUserId || !viewingUserId) return <ProfileSelector />;

  return (
    <CurrentBookProvider key={viewingUserId} userId={viewingUserId}>
      <FavoritesProvider key={viewingUserId} userId={viewingUserId}>
        <ChestProvider key={viewingUserId} userId={viewingUserId}>
          <WelcomeFlow key={viewingUserId} userId={viewingUserId}>
            {children}
          </WelcomeFlow>
        </ChestProvider>
      </FavoritesProvider>
    </CurrentBookProvider>
  );
}
