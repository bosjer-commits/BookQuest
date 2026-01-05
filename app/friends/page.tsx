'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import CharacterShowcase from '@/components/CharacterShowcase';
import FriendRow from '@/components/FriendRow';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useCurrentBook } from '@/contexts/CurrentBookContext';

type BookItem = {
  book: {
    title: string;
    author: string;
  };
  coverUrl?: string;
};

type Friend = {
  id: string;
  name: string;
  skin: string;
};

const friends: Friend[] = [
  {
    id: 'robin',
    name: 'Robin',
    skin: '/assets/Skins/Robin/Bibi.png',
  },
  {
    id: 'lucas',
    name: 'Lucas',
    skin: '/assets/Skins/Lucas/Broock.png',
  },
];

const oliverSkins = [
  '/assets/Skins/Oliver/Crow.png',
  '/assets/Skins/Oliver/Angelo.png',
];

export default function FriendsPage() {
  const router = useRouter();
  const { favorites } = useFavorites();
  const { inProgressBooks, finishedBooks } = useCurrentBook();
  const [activeFriendIndex, setActiveFriendIndex] = useState(0);

  const currentFriend = friends[activeFriendIndex];

  const handleSelectBook = (item: BookItem) => {
    const title = encodeURIComponent(item.book.title);
    const author = encodeURIComponent(item.book.author);
    router.push(`/library?title=${title}&author=${author}`);
  };

  const getBooksForFriend = (friend: Friend): BookItem[] => {
    if (friend.id === 'robin') return favorites;
    if (friend.id === 'lucas') return inProgressBooks;
    return finishedBooks;
  };

  return (
    <div className="min-h-full flex flex-col">
      <main className="flex-1 px-4 pt-4 pb-0 space-y-6">
        {/* Oliver's character showcase with skin cycling */}
        <CharacterShowcase skins={oliverSkins} name="Oliver" />

        {/* Friends header with navigation arrows */}
        <div className="flex justify-center items-center gap-3">
          {/* Left yellow arrow */}
          <button
            type="button"
            onClick={() => setActiveFriendIndex((prev) => (prev - 1 + friends.length) % friends.length)}
            aria-label="Previous friend"
          >
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{
                background: 'linear-gradient(to bottom, #FDCB6E 0%, #FFA502 100%)',
                border: '3px solid #FFF',
                boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
              }}
            >
              <Image
                src="/assets/blueleft.png"
                alt=""
                width={32}
                height={32}
                className="w-8 h-8 object-contain"
              />
            </div>
          </button>

          <div className="px-4 py-2 rounded border-2 border-[#6CB5FF] text-[#7EC3FF] brawl-text">
            Friends
          </div>

          {/* Right yellow arrow */}
          <button
            type="button"
            onClick={() => setActiveFriendIndex((prev) => (prev + 1) % friends.length)}
            aria-label="Next friend"
          >
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{
                background: 'linear-gradient(to bottom, #FDCB6E 0%, #FFA502 100%)',
                border: '3px solid #FFF',
                boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
              }}
            >
              <Image
                src="/assets/blueright.png"
                alt=""
                width={32}
                height={32}
                className="w-8 h-8 object-contain"
              />
            </div>
          </button>
        </div>

        {/* Friends section - Robin and Lucas only */}
        <FriendRow
          friend={currentFriend}
          books={getBooksForFriend(currentFriend)}
          onSelectBook={handleSelectBook}
        />
      </main>

      <BottomNav active="friends" />
    </div>
  );
}
