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

const KID_IDS = ['elliott', 'robin', 'simon', 'oliver', 'lucas'];

type BookItem = {
  book: { title: string; author: string };
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
  return skin?.asset ?? '/assets/Skins/Elliot/Legendary/Spike.png';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function loadLocalBooks(userId: string): any[] {
  try {
    return JSON.parse(localStorage.getItem(`bq:demo:${userId}:books`) ?? '[]');
  } catch {
    return [];
  }
}

function loadLocalSkins(userId: string): string[] {
  try {
    return JSON.parse(localStorage.getItem(`bq:demo:${userId}:skins`) ?? '[]');
  } catch {
    return [];
  }
}

export default function DemoFriendsPage() {
  const router = useRouter();
  const { viewingUserId, viewingProfile, basePath } = useUser();
  const { unlockedSkins } = useChest();

  const [kidsData, setKidsData] = useState<KidData[]>([]);
  const [activeFriendIndex, setActiveFriendIndex] = useState(0);
  const [ownSkinIndex, setOwnSkinIndex] = useState(0);

  const ownCatalogSkins = viewingProfile
    ? SKIN_CATALOG.filter(
        (s) =>
          s.owner.toLowerCase() === viewingProfile.name.toLowerCase() &&
          unlockedSkins.includes(s.id)
      )
    : [];
  const ownSkinAssets = ownCatalogSkins.map((s) => s.asset);

  // Load own selected skin index from localStorage
  useEffect(() => {
    if (!viewingUserId || ownCatalogSkins.length === 0) return;
    const savedSkinId = localStorage.getItem(`bq:demo:${viewingUserId}:selectedSkin`);
    if (savedSkinId) {
      const idx = ownCatalogSkins.findIndex((s) => s.id === savedSkinId);
      if (idx !== -1) setOwnSkinIndex(idx);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewingUserId]);

  // Load all kids' data from localStorage
  useEffect(() => {
    const data: KidData[] = KID_IDS.map((id) => {
      const user = USERS.find((u) => u.id === id)!;
      const allBooks = loadLocalBooks(id);
      const finishedBooks = allBooks
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((b: any) => b.reading_status === 'finished')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .sort((a: any, b: any) => (b.rating ?? 0) - (a.rating ?? 0));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const books: BookItem[] = finishedBooks.slice(0, 3).map((b: any) => ({
        book: { title: b.title, author: b.author },
        coverUrl: b.cover_url ?? undefined,
      }));

      const friendUnlockedIds = loadLocalSkins(id);
      const selectedSkinId = localStorage.getItem(`bq:demo:${id}:selectedSkin`);
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

    data.sort(
      (a, b) => b.finishedCount - a.finishedCount || a.name.localeCompare(b.name)
    );
    setKidsData(data);
  }, [viewingUserId]);

  const handleOwnSkinChange = (index: number) => {
    setOwnSkinIndex(index);
    if (viewingUserId && ownCatalogSkins[index]) {
      localStorage.setItem(
        `bq:demo:${viewingUserId}:selectedSkin`,
        ownCatalogSkins[index].id
      );
    }
  };

  const handleSelectBook = (item: BookItem) => {
    const title = encodeURIComponent(item.book.title);
    const author = encodeURIComponent(item.book.author);
    router.push(`${basePath}/library?title=${title}&author=${author}`);
  };

  const friendsList = kidsData.filter((k) => k.id !== viewingUserId);
  const safeIndex = friendsList.length > 0 ? activeFriendIndex % friendsList.length : 0;
  const currentFriend = friendsList[safeIndex];

  const ownRank = kidsData.findIndex((k) => k.id === viewingUserId) + 1;
  const ownData = kidsData.find((k) => k.id === viewingUserId);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <main
        className="flex-1 px-4 pt-0 pb-0 flex flex-col gap-1 overflow-hidden min-h-0"
        style={{ marginTop: '-12px', paddingBottom: 'var(--nav-height)' }}
      >
        {/* Own character showcase */}
        <div className="relative">
          <CharacterShowcase
            skins={
              ownSkinAssets.length > 0
                ? ownSkinAssets
                : [getDefaultSkinAsset(viewingProfile?.name ?? 'Elliot')]
            }
            name={viewingProfile?.name ?? ''}
            activeIndex={ownSkinIndex}
            onIndexChange={handleOwnSkinChange}
          />
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
            <Image
              src="/assets/yellowleft.png"
              alt=""
              width={44}
              height={44}
              className="w-11 h-11 object-contain"
            />
          </button>

          <div className="relative flex-1" style={{ height: '52px' }}>
            <svg
              width="100%"
              height="52"
              viewBox="0 0 220 52"
              style={{ display: 'block', filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.5))' }}
            >
              <defs>
                <linearGradient id="fr-gold-fill" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FDCB6E" />
                  <stop offset="40%" stopColor="#F0A500" />
                  <stop offset="100%" stopColor="#C47D00" />
                </linearGradient>
                <linearGradient id="fr-gold-stroke" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFE9A0" />
                  <stop offset="100%" stopColor="#D4900A" />
                </linearGradient>
                <linearGradient id="fr-shine" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFF5CC" stopOpacity="0.5" />
                  <stop offset="50%" stopColor="#FFF5CC" stopOpacity="0" />
                </linearGradient>
              </defs>

              <path
                d="M 22 10 L 6 26 L 22 42 Z"
                fill="url(#fr-gold-fill)"
                stroke="url(#fr-gold-stroke)"
                strokeWidth="1.5"
              />
              <path
                d="M 198 10 L 214 26 L 198 42 Z"
                fill="url(#fr-gold-fill)"
                stroke="url(#fr-gold-stroke)"
                strokeWidth="1.5"
              />
              <rect
                x="22"
                y="10"
                width="176"
                height="32"
                rx="3"
                fill="url(#fr-gold-fill)"
                stroke="url(#fr-gold-stroke)"
                strokeWidth="1.5"
              />
              <rect x="24" y="10" width="172" height="16" rx="3" fill="url(#fr-shine)" />
              <rect
                x="26"
                y="14"
                width="168"
                height="24"
                rx="2"
                fill="none"
                stroke="#FFE9A0"
                strokeWidth="1"
                opacity="0.5"
              />
              <circle cx="33" cy="26" r="2.5" fill="#FFF5CC" opacity="0.8" />
              <circle cx="187" cy="26" r="2.5" fill="#FFF5CC" opacity="0.8" />

              <text
                x="110"
                y="31"
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

            {currentFriend && (
              <span
                className="absolute left-1/2 -translate-x-1/2 text-[10px] brawl-text whitespace-nowrap"
                style={{ top: '100%', marginTop: '3px', color: 'rgba(253,203,110,0.8)' }}
              >
                #{kidsData.findIndex((k) => k.id === currentFriend.id) + 1}
                {' · '}
                {currentFriend.finishedCount}{' '}
                {currentFriend.finishedCount === 1 ? 'book' : 'books'} read
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() =>
              setActiveFriendIndex((prev) => (prev + 1) % Math.max(1, friendsList.length))
            }
            aria-label="Next friend"
            disabled={friendsList.length === 0}
            style={{ opacity: friendsList.length === 0 ? 0.4 : 1 }}
          >
            <Image
              src="/assets/yellowright.png"
              alt=""
              width={44}
              height={44}
              className="w-11 h-11 object-contain"
            />
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
          <div
            className="text-center text-sm brawl-text"
            style={{ color: 'rgba(116,185,255,0.5)' }}
          >
            No friends yet
          </div>
        )}
      </main>

      <BottomNav active="friends" />
    </div>
  );
}
