'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import UserMenu from '@/components/UserMenu';
import ChestShelf from '@/components/ChestShelf';
import ProgressEditModal from '@/components/ProgressEditModal';
import ChestOpeningModal from '@/components/ChestOpeningModal';
import { useCurrentBook } from '@/contexts/CurrentBookContext';
import { useUser } from '@/contexts/UserContext';

export default function Home() {
  const router = useRouter();
  const { currentBook, finishedBooks } = useCurrentBook();
  const { canEditProgress, basePath } = useUser();
  const [showProgressEdit, setShowProgressEdit] = useState(false);
  const [openingChestGoal, setOpeningChestGoal] = useState<number | null>(null);

  const percent = currentBook?.progress ?? 0;
  const hasCurrentBook = Boolean(currentBook);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <UserMenu />

      <main
        className="flex-1 flex flex-col items-center px-4 pt-4 pb-0 gap-2 overflow-hidden min-h-0"
        style={{ paddingBottom: 'var(--nav-height)' }}
      >
        {/* Book Frame */}
        <div className="w-full flex justify-center flex-1 min-h-0" style={{ marginTop: '-5px' }}>
          <div className="relative h-full flex items-center justify-center">
            <div className="relative mx-auto" style={{ aspectRatio: '280 / 400', maxWidth: '280px', maxHeight: '400px', height: '100%' }}>
            {hasCurrentBook ? (
              <button
                onClick={() => router.push(`${basePath}/library`)}
                className="absolute cursor-pointer"
                style={{ top: '8%', right: '8%', bottom: '6%', left: '8%', zIndex: 1, padding: 0, background: 'none', border: 'none' }}
                aria-label="Go to library"
              >
                {currentBook?.coverUrl ? (
                  <img
                    src={currentBook.coverUrl}
                    alt={currentBook.book.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    className="rounded block"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center p-2 rounded">
                    <p className="text-white text-sm font-bold text-center">{currentBook?.book.title}</p>
                  </div>
                )}
              </button>
            ) : (
              <button
                onClick={() => router.push(`${basePath}/library`)}
                className="absolute inset-[10%] z-[1] flex items-center justify-center rounded bg-white/10 border-2 border-white/40"
                aria-label="Add a book"
              >
                <span className="text-white text-6xl font-bold leading-none">+</span>
              </button>
            )}

            <img
              src="/assets/bookframe.png"
              alt=""
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 2
              }}
              className="block"
            />
          </div>

          <div className="mt-2 text-center text-white font-semibold brawl-text" />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative w-full max-w-[320px] flex items-center justify-center shrink-0" style={{ marginTop: '-4px' }}>
          <div className="w-full max-w-[240px] sm:max-w-[260px]">
            <div className="progress-bar-container relative">
              <div className="progress-bar-fill" style={{ width: `${percent}%` }} />
              <span className="absolute inset-0 flex items-center justify-center text-[10px] text-white brawl-text leading-none" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                {currentBook?.currentPage && currentBook?.totalPages
                  ? `${currentBook.currentPage} / ${currentBook.totalPages}`
                  : `${percent}%`}
              </span>
            </div>
          </div>
          {canEditProgress && (
            <button
              onClick={() => setShowProgressEdit(true)}
              className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 border-gold flex items-center justify-center bg-navy"
              aria-label="Edit progress"
              disabled={!hasCurrentBook}
              style={{
                opacity: hasCurrentBook ? 1 : 0.5,
                marginRight: '-8px',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M3 17.25V21h3.75l11.06-11.06-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z"
                  fill="#FFD93D"
                />
              </svg>
            </button>
          )}
        </div>

        <ChestShelf finishedCount={finishedBooks.length} onOpenChest={setOpeningChestGoal} />
      </main>

      <BottomNav active="home" />

      {showProgressEdit && canEditProgress && (
        <ProgressEditModal onClose={() => setShowProgressEdit(false)} />
      )}

      <ChestOpeningModal
        isOpen={openingChestGoal !== null}
        onClose={() => setOpeningChestGoal(null)}
        chestGoal={openingChestGoal ?? 0}
      />
    </div>
  );
}
