'use client';

import Image from 'next/image';
import BookFrame from './BookFrame';

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

type FriendRowProps = {
  friend: Friend;
  books: BookItem[];
  onSelectBook: (item: BookItem) => void;
};

export default function FriendRow({ friend, books, onSelectBook }: FriendRowProps) {
  // Always show first 3 books
  const displayBooks = books.slice(0, 3);

  return (
    <div className="flex items-center justify-center gap-3">
      {/* Friend avatar with shimmer and glow */}
      <div className="relative flex flex-col items-center flex-shrink-0" style={{ width: '128px' }}>
        {/* Shimmer pulse background */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at center, rgba(253,203,110,0.2) 0%, transparent 60%)',
            animation: 'shimmer-pulse 3s ease-in-out infinite',
            borderRadius: '50%',
          }}
        />

        {/* Character with glow aura */}
        <div
          style={{
            filter: 'drop-shadow(0 0 20px rgba(255,211,61,0.5)) drop-shadow(0 0 40px rgba(255,165,2,0.3))',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Image
            src={friend.skin}
            alt={friend.name}
            width={256}
            height={256}
            style={{ width: '128px', height: 'auto' }}
          />
        </div>
        <div className="text-[16px] text-[#7EC3FF] brawl-text mt-2" style={{ position: 'relative', zIndex: 1 }}>
          {friend.name}
        </div>

        <style jsx>{`
          @keyframes shimmer-pulse {
            0%, 100% {
              opacity: 0.3;
              transform: scale(1);
            }
            50% {
              opacity: 0.5;
              transform: scale(1.1);
            }
          }
        `}</style>
      </div>

      {/* Three book frames */}
      <div className="flex items-center gap-1">
        {displayBooks.map((item, index) => (
          <BookFrame key={index} coverUrl={item.coverUrl} onSelect={() => onSelectBook(item)} />
        ))}
        {/* Fill empty slots with placeholder frames */}
        {displayBooks.length < 3 &&
          Array.from({ length: 3 - displayBooks.length }).map((_, index) => (
            <BookFrame key={`empty-${index}`} />
          ))}
      </div>
    </div>
  );
}
