'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import BottomNav from '@/components/BottomNav';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useCurrentBook } from '@/contexts/CurrentBookContext';

type BookItem = {
  book: {
    title: string;
    author: string;
  };
  coverUrl?: string;
};

function SectionTitle({ title }: { title: string }) {
  return (
    <h2
      className="text-center text-[22px] font-bold brawl-text"
      style={{
        color: '#F6D58A',
        textShadow:
          '-2px 0 #5A3C12, 2px 0 #5A3C12, 0 -2px #5A3C12, 0 2px #5A3C12',
      }}
    >
      {title}
    </h2>
  );
}

function EmptyFrame({ text, compact }: { text: string; compact?: boolean }) {
  return (
    <div
      className={`relative w-full mx-auto ${compact ? 'max-w-[320px]' : 'max-w-[320px]'}`}
      style={compact ? { height: '180px', overflow: 'hidden' } : undefined}
    >
      {compact ? (
        <Image
          src="/assets/chestframe.png"
          alt=""
          width={420}
          height={200}
          className="absolute left-1/2 top-1/2 h-[200px] w-[420px] -translate-x-1/2 -translate-y-1/2 object-contain"
        />
      ) : (
        <Image
          src="/assets/chestframe.png"
          alt=""
          width={320}
          height={200}
          className="w-full h-auto"
        />
      )}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="text-center font-bold brawl-text px-4 text-[18px]"
          style={{
            color: '#F6D58A',
            textShadow:
              '-2px 0 #5A3C12, 2px 0 #5A3C12, 0 -2px #5A3C12, 0 2px #5A3C12',
          }}
        >
          {text}
        </div>
      </div>
    </div>
  );
}

function BookFrame({
  coverUrl,
  onClick,
}: {
  coverUrl?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative w-[120px] h-[180px] cursor-pointer"
    >
      <div className="absolute inset-[8%] z-[1]">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt=""
            className="w-full h-full object-cover rounded block"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center rounded bg-[#2B4E6E]">
            <span className="text-[28px] font-bold text-[#F6D58A]">+</span>
          </div>
        )}
      </div>
      <img
        src="/assets/bookframe.png"
        alt=""
        className="absolute inset-0 w-full h-full block pointer-events-none"
      />
    </button>
  );
}

function SectionGrid({
  items,
  onSelect,
}: {
  items: BookItem[];
  onSelect: (item: BookItem) => void;
}) {
  const [startIndex, setStartIndex] = useState(0);
  const visible = items.slice(startIndex, startIndex + 3);
  const showArrow = items.length > 3;
  const canGoNext = startIndex + 3 < items.length;
  const canGoPrev = startIndex > 0;

  return (
    <div className="relative">
      <div className="grid grid-cols-3 gap-3 justify-items-center">
        {visible.map((item, index) => (
          <div
            key={index}
            style={{
              transform: index === 0 ? 'translateX(-20px)' : index === 2 ? 'translateX(20px)' : 'none'
            }}
          >
            <BookFrame coverUrl={item.coverUrl} onClick={() => onSelect(item)} />
          </div>
        ))}
        {visible.length < 3 &&
          Array.from({ length: 3 - visible.length }).map((_, index) => (
            <div key={`empty-${index}`} className="w-[120px] h-[180px]" />
          ))}
      </div>

      {showArrow && (
        <>
          <button
            type="button"
            onClick={() => {
              if (!canGoPrev) return;
              setStartIndex((prev) => Math.max(prev - 3, 0));
            }}
            className="absolute left-[-36px] top-1/2 -translate-y-1/2"
            aria-label="Previous books"
            disabled={!canGoPrev}
            style={{ opacity: canGoPrev ? 1 : 0.5 }}
          >
            <Image src="/assets/blueleft.png" alt="" width={36} height={36} />
          </button>
          <button
            type="button"
            onClick={() => {
              if (!canGoNext) return;
              setStartIndex((prev) => Math.min(prev + 3, items.length - 3));
            }}
            className="absolute right-[-36px] top-1/2 -translate-y-1/2"
            aria-label="Next books"
            disabled={!canGoNext}
            style={{ opacity: canGoNext ? 1 : 0.5 }}
          >
            <Image src="/assets/blueright.png" alt="" width={36} height={36} />
          </button>
        </>
      )}
    </div>
  );
}

export default function FavoritesPage() {
  const router = useRouter();
  const { favorites } = useFavorites();
  const { inProgressBooks, finishedBooks } = useCurrentBook();

  const isAllEmpty =
    favorites.length === 0 && inProgressBooks.length === 0 && finishedBooks.length === 0;
  const emptySectionClass = isAllEmpty ? 'space-y-4' : 'space-y-6';

  const handleSelect = (item: BookItem) => {
    const title = encodeURIComponent(item.book.title);
    const author = encodeURIComponent(item.book.author);
    router.push(`/library?title=${title}&author=${author}`);
  };

  return (
    <div className="min-h-full flex flex-col">
      <main className={`flex-1 px-6 pt-4 pb-0 ${emptySectionClass}`}>
        <SectionTitle title="Favorites" />
        {isAllEmpty ? (
          <EmptyFrame text="No favourites yet" compact />
        ) : (
          <SectionGrid items={favorites} onSelect={handleSelect} />
        )}

        <SectionTitle title="In Progress" />
        {inProgressBooks.length === 0 ? (
          <EmptyFrame text="No books in progress" compact={isAllEmpty} />
        ) : (
          <SectionGrid items={inProgressBooks} onSelect={handleSelect} />
        )}

        <SectionTitle title="Finished" />
        {finishedBooks.length === 0 ? (
          <EmptyFrame text="No books finished" compact={isAllEmpty} />
        ) : (
          <SectionGrid items={finishedBooks} onSelect={handleSelect} />
        )}
      </main>

      <BottomNav active="favorites" />
    </div>
  );
}
