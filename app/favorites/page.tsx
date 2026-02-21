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

function BookSlot({
  item,
  onClick,
}: {
  item?: BookItem;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={item ? onClick : undefined}
      className="relative w-[90px] h-[130px]"
      style={{ cursor: item ? 'pointer' : 'default' }}
    >
      <div className="absolute inset-[8%] z-[1]">
        {item?.coverUrl ? (
          <img
            src={item.coverUrl}
            alt={item.book.title}
            className="w-full h-full object-cover rounded block"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center rounded"
            style={{
              background: 'rgba(43, 78, 110, 0.5)',
              border: '2px dashed rgba(246, 213, 138, 0.3)',
            }}
          >
            {item && !item.coverUrl ? (
              <span className="text-[10px] text-center text-[#F6D58A] font-bold px-1 leading-tight">
                {item.book.title}
              </span>
            ) : null}
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

function Section({
  title,
  items,
  onSelect,
}: {
  title: string;
  items: BookItem[];
  onSelect: (item: BookItem) => void;
}) {
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(items.length / 3));
  const canPrev = page > 0;
  const canNext = page < totalPages - 1;
  const visible = items.slice(page * 3, page * 3 + 3);

  // Always show 3 slots
  const slots: (BookItem | undefined)[] = [
    visible[0],
    visible[1],
    visible[2],
  ];

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Title with arrows */}
      <div className="flex items-center gap-3">
        {items.length > 3 ? (
          <button
            type="button"
            onClick={() => canPrev && setPage((p) => p - 1)}
            style={{ opacity: canPrev ? 1 : 0.3 }}
            aria-label={`Previous ${title}`}
          >
            <Image src="/assets/yellowleft.png" alt="" width={28} height={28} className="w-7 h-7 object-contain" />
          </button>
        ) : (
          <div className="w-7" />
        )}
        <h2
          className="text-center text-[18px] font-bold brawl-text"
          style={{
            color: '#F6D58A',
            textShadow:
              '-2px 0 #5A3C12, 2px 0 #5A3C12, 0 -2px #5A3C12, 0 2px #5A3C12',
          }}
        >
          {title}
        </h2>
        {items.length > 3 ? (
          <button
            type="button"
            onClick={() => canNext && setPage((p) => p + 1)}
            style={{ opacity: canNext ? 1 : 0.3 }}
            aria-label={`Next ${title}`}
          >
            <Image src="/assets/yellowright.png" alt="" width={28} height={28} className="w-7 h-7 object-contain" />
          </button>
        ) : (
          <div className="w-7" />
        )}
      </div>

      {/* 3 book slots */}
      <div className="flex items-center justify-center gap-2">
        {slots.map((slot, i) => (
          <BookSlot
            key={`${page}-${i}`}
            item={slot}
            onClick={slot ? () => onSelect(slot) : undefined}
          />
        ))}
      </div>
    </div>
  );
}

export default function FavoritesPage() {
  const router = useRouter();
  const { favorites } = useFavorites();
  const { inProgressBooks, finishedBooks } = useCurrentBook();

  const handleSelect = (item: BookItem) => {
    const title = encodeURIComponent(item.book.title);
    const author = encodeURIComponent(item.book.author);
    router.push(`/library?title=${title}&author=${author}`);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <main
        className="flex-1 flex flex-col items-center justify-evenly px-4 pt-1 overflow-hidden min-h-0"
        style={{ paddingBottom: 'var(--nav-height)' }}
      >
        <Section title="Favorites" items={favorites} onSelect={handleSelect} />
        <Section title="In Progress" items={inProgressBooks} onSelect={handleSelect} />
        <Section title="Finished" items={finishedBooks} onSelect={handleSelect} />
      </main>

      <BottomNav active="favorites" />
    </div>
  );
}
