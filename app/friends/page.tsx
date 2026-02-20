'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import CharacterShowcase from '@/components/CharacterShowcase';
import FriendRow from '@/components/FriendRow';
import { useUser } from '@/contexts/UserContext';
import { useChest } from '@/contexts/ChestContext';
import { SKIN_CATALOG } from '@/data/skins';
import { USERS } from '@/data/users';
import { createClient } from '@/lib/supabase/client';

const KID_IDS = ['elliott', 'robin', 'simon', 'oliver', 'lucas'];

type BookItem = {
  book: {
    title: string;
    author: string;
  };
  coverUrl?: string;
};

type KidData = {
  id: string;
  name: string;
  finishedCount: number;
  selectedSkinAsset: string;
  books: BookItem[];
};

function getDefaultSkinAsset(ownerName: string): string {
  const skin = SKIN_CATALOG.find(
    (s) => s.owner.toLowerCase() === ownerName.toLowerCase()
  );
  return skin?.asset ?? '/assets/Skins/Elliott/Spike.png';
}

export default function FriendsPage() {
  const router = useRouter();
  const { viewingUserId, viewingProfile } = useUser();
  const { unlockedSkins } = useChest();
  const supabase = createClient();

  const [kidsData, setKidsData] = useState<KidData[]>([]);
  const [activeFriendIndex, setActiveFriendIndex] = useState(0);
  const [ownSkinIndex, setOwnSkinIndex] = useState(0);

  // Only unlocked skins for the viewing user (for own showcase)
  const ownCatalogSkins = viewingProfile
    ? SKIN_CATALOG.filter(
        (s) =>
          s.owner.toLowerCase() === viewingProfile.name.toLowerCase() &&
          unlockedSkins.includes(s.id)
      )
    : [];
  const ownSkinAssets = ownCatalogSkins.map((s) => s.asset);

  // Load all kids' data from Supabase
  useEffect(() => {
    async function loadFriends() {
      const [booksRes, skinsRes, stateRes] = await Promise.all([
        supabase
          .from('user_books')
          .select('user_id, title, author, cover_url, reading_status, rating, favorited_at, is_favorite')
          .in('user_id', KID_IDS),
        supabase
          .from('unlocked_skins')
          .select('user_id, skin_id')
          .in('user_id', KID_IDS),
        supabase
          .from('user_state')
          .select('user_id, selected_skin_id')
          .in('user_id', KID_IDS),
      ]);

      if (booksRes.error) console.error('Failed to load books:', booksRes.error);
      if (skinsRes.error) console.error('Failed to load skins:', skinsRes.error);
      if (stateRes.error) console.error('Failed to load state:', stateRes.error);

      const allBooks = booksRes.data ?? [];
      const allSkins = skinsRes.data ?? [];
      const allState = stateRes.data ?? [];

      const data: KidData[] = KID_IDS.map((id) => {
        const user = USERS.find((u) => u.id === id)!;

        const userBooks = allBooks.filter((b) => b.user_id === id);
        const finishedBooks = userBooks
          .filter((b) => b.reading_status === 'finished')
          .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        const inProgressBooks = userBooks.filter((b) => b.reading_status === 'in_progress');
        const favorites = userBooks
          .filter((b) => b.is_favorite && !b.reading_status)
          .sort((a, b) => (b.favorited_at ?? 0) - (a.favorited_at ?? 0));

        // Build display books: highest-rated finished → in-progress → favorites, max 3
        const seen = new Set<string>();
        const books: BookItem[] = [];
        for (const item of [...finishedBooks, ...inProgressBooks, ...favorites]) {
          if (!seen.has(item.title)) {
            seen.add(item.title);
            books.push({
              book: { title: item.title, author: item.author },
              coverUrl: item.cover_url ?? undefined,
            });
            if (books.length === 3) break;
          }
        }

        // Resolve active skin for this friend
        const friendUnlockedIds = allSkins
          .filter((s) => s.user_id === id)
          .map((s) => s.skin_id);
        const selectedSkinId = allState.find((s) => s.user_id === id)?.selected_skin_id;
        const firstUnlocked = SKIN_CATALOG.find(
          (s) =>
            s.owner.toLowerCase() === user.name.toLowerCase() &&
            friendUnlockedIds.includes(s.id)
        );
        let selectedSkinAsset = firstUnlocked?.asset ?? getDefaultSkinAsset(user.name);
        if (selectedSkinId && friendUnlockedIds.includes(selectedSkinId)) {
          const skinDef = SKIN_CATALOG.find((s) => s.id === selectedSkinId);
          if (skinDef) selectedSkinAsset = skinDef.asset;
        }

        return {
          id,
          name: user.name,
          finishedCount: finishedBooks.length,
          selectedSkinAsset,
          books,
        };
      });

      // Sort by finished count desc, then alphabetically
      data.sort(
        (a, b) =>
          b.finishedCount - a.finishedCount ||
          a.name.localeCompare(b.name)
      );

      setKidsData(data);
    }
    loadFriends();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewingUserId]);

  // Load own selected skin index on mount
  useEffect(() => {
    if (!viewingUserId || ownCatalogSkins.length === 0) return;
    async function loadSelectedSkin() {
      const { data } = await supabase
        .from('user_state')
        .select('selected_skin_id')
        .eq('user_id', viewingUserId)
        .single();
      if (data?.selected_skin_id) {
        const idx = ownCatalogSkins.findIndex((s) => s.id === data.selected_skin_id);
        if (idx !== -1) setOwnSkinIndex(idx);
      }
    }
    loadSelectedSkin();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewingUserId]);

  const handleOwnSkinChange = (index: number) => {
    setOwnSkinIndex(index);
    if (viewingUserId && ownCatalogSkins[index]) {
      supabase
        .from('user_state')
        .upsert(
          { user_id: viewingUserId, selected_skin_id: ownCatalogSkins[index].id },
          { onConflict: 'user_id' }
        )
        .then(({ error }) => { if (error) console.error(error); });
    }
  };

  // Friends list: all kids in leaderboard order, excluding self
  const friendsList = kidsData.filter((k) => k.id !== viewingUserId);
  const safeIndex = friendsList.length > 0 ? activeFriendIndex % friendsList.length : 0;
  const currentFriend = friendsList[safeIndex];

  const handleSelectBook = (item: BookItem) => {
    const title = encodeURIComponent(item.book.title);
    const author = encodeURIComponent(item.book.author);
    router.push(`/library?title=${title}&author=${author}`);
  };

  // Leaderboard rank for viewing user
  const ownRank = kidsData.findIndex((k) => k.id === viewingUserId) + 1;
  const ownData = kidsData.find((k) => k.id === viewingUserId);

  return (
    <div className="min-h-full flex flex-col">
      <main className="flex-1 px-4 pt-4 pb-0 space-y-6">
        {/* Own character showcase */}
        <div className="relative">
          <CharacterShowcase
            skins={ownSkinAssets.length > 0 ? ownSkinAssets : ['/assets/Skins/Elliott/Spike.png']}
            name={viewingProfile?.name ?? ''}
            activeIndex={ownSkinIndex}
            onIndexChange={handleOwnSkinChange}
          />
          {/* Rank + finished count badge */}
          {ownData !== undefined && (
            <div
              className="absolute top-3 right-3 flex flex-col items-center px-3 py-1 rounded-xl"
              style={{
                background: 'rgba(22,37,68,0.85)',
                border: '2px solid rgba(253,203,110,0.5)',
              }}
            >
              <span className="text-[10px] font-bold brawl-text" style={{ color: '#FDCB6E' }}>
                #{ownRank}
              </span>
              <span className="text-[10px] brawl-text" style={{ color: '#7EC3FF' }}>
                {ownData.finishedCount} books
              </span>
            </div>
          )}
        </div>

        {/* Friends header with navigation arrows */}
        <div className="flex justify-center items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setActiveFriendIndex((prev) =>
                (prev - 1 + Math.max(1, friendsList.length)) % Math.max(1, friendsList.length)
              )
            }
            aria-label="Previous friend"
            disabled={friendsList.length === 0}
            style={{ opacity: friendsList.length === 0 ? 0.4 : 1 }}
          >
            <Image src="/assets/yellowleft.png" alt="" width={44} height={44} className="w-11 h-11 object-contain" />
          </button>

          {/* Ornate gold ribbon banner — fixed height so rank text below doesn't misalign arrows */}
          <div className="relative flex-1" style={{ height: '52px' }}>
            <svg
              width="100%"
              height="52"
              viewBox="0 0 220 52"
              style={{ display: 'block', filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.5))' }}
            >
              <defs>
                <linearGradient id="fr-gold-fill" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%"   stopColor="#FDCB6E" />
                  <stop offset="40%"  stopColor="#F0A500" />
                  <stop offset="100%" stopColor="#C47D00" />
                </linearGradient>
                <linearGradient id="fr-gold-stroke" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%"   stopColor="#FFE9A0" />
                  <stop offset="100%" stopColor="#D4900A" />
                </linearGradient>
                <linearGradient id="fr-shine" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%"   stopColor="#FFF5CC" stopOpacity="0.5" />
                  <stop offset="50%"  stopColor="#FFF5CC" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Left notch tail */}
              <path d="M 22 10 L 6 26 L 22 42 Z"
                fill="url(#fr-gold-fill)" stroke="url(#fr-gold-stroke)" strokeWidth="1.5" />
              {/* Right notch tail */}
              <path d="M 198 10 L 214 26 L 198 42 Z"
                fill="url(#fr-gold-fill)" stroke="url(#fr-gold-stroke)" strokeWidth="1.5" />
              {/* Main ribbon body */}
              <rect x="22" y="10" width="176" height="32" rx="3"
                fill="url(#fr-gold-fill)" stroke="url(#fr-gold-stroke)" strokeWidth="1.5" />
              {/* Shine highlight */}
              <rect x="24" y="10" width="172" height="16" rx="3"
                fill="url(#fr-shine)" />
              {/* Inner border line */}
              <rect x="26" y="14" width="168" height="24" rx="2"
                fill="none" stroke="#FFE9A0" strokeWidth="1" opacity="0.5" />
              {/* Corner gems */}
              <circle cx="33" cy="26" r="2.5" fill="#FFF5CC" opacity="0.8" />
              <circle cx="187" cy="26" r="2.5" fill="#FFF5CC" opacity="0.8" />

              {/* Friend name — blue with dark navy outline for legibility on gold */}
              <text
                x="110" y="31"
                textAnchor="middle"
                fontSize={currentFriend && currentFriend.name.length > 7 ? '15' : '17'}
                fontWeight="900"
                fontFamily="var(--font-geist-sans), sans-serif"
                letterSpacing="1.5"
                fill="#7EC3FF"
                paintOrder="stroke"
                stroke="#162544"
                strokeWidth="3"
              >
                {currentFriend ? currentFriend.name.toUpperCase() : 'FRIENDS'}
              </text>
            </svg>

            {/* Rank + book count — absolutely positioned so it doesn't affect row height */}
            {currentFriend && (
              <span
                className="absolute left-1/2 -translate-x-1/2 text-[10px] brawl-text whitespace-nowrap"
                style={{ top: '100%', marginTop: '3px', color: 'rgba(253,203,110,0.8)' }}
              >
                #{kidsData.findIndex((k) => k.id === currentFriend.id) + 1}
                {' · '}
                {currentFriend.finishedCount} {currentFriend.finishedCount === 1 ? 'book' : 'books'} read
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() =>
              setActiveFriendIndex((prev) =>
                (prev + 1) % Math.max(1, friendsList.length)
              )
            }
            aria-label="Next friend"
            disabled={friendsList.length === 0}
            style={{ opacity: friendsList.length === 0 ? 0.4 : 1 }}
          >
            <Image src="/assets/yellowright.png" alt="" width={44} height={44} className="w-11 h-11 object-contain" />
          </button>
        </div>

        {/* Friend row */}
        {currentFriend ? (
          <FriendRow
            friend={{
              id: currentFriend.id,
              name: currentFriend.name,
              skin: currentFriend.selectedSkinAsset,
            }}
            books={currentFriend.books}
            onSelectBook={handleSelectBook}
          />
        ) : (
          <div className="text-center text-sm brawl-text" style={{ color: 'rgba(116,185,255,0.5)' }}>
            No friends yet
          </div>
        )}
      </main>

      <BottomNav active="friends" />
    </div>
  );
}
