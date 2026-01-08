'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import { useCurrentBook } from '@/contexts/CurrentBookContext';

export default function Home() {
  const router = useRouter();
  const { currentBook, finishedBooks, updateReadingProgress, updateRating, finishCurrentBook } = useCurrentBook();
  const [showProgressEdit, setShowProgressEdit] = useState(false);
  const [currentPage, setCurrentPage] = useState('');
  const [totalPages, setTotalPages] = useState('');

  const percent = currentBook?.progress ?? 0;
  const hasCurrentBook = Boolean(currentBook);
  const rating = currentBook?.rating ?? 0;
  const finishedCount = finishedBooks.length;
  const chestGoals = useMemo(() => [1, 2, 3], []);

  const openProgressEdit = () => {
    setCurrentPage(currentBook?.currentPage?.toString() || '');
    setTotalPages(currentBook?.totalPages?.toString() || '');
    setShowProgressEdit(true);
  };

  return (
    <div className="min-h-full flex flex-col">
      <main
        className="flex-1 flex flex-col items-center justify-start px-4 pt-4 pb-0 space-y-6"
        style={{ paddingBottom: '72px' }}
      >
        {/* Book Frame */}
        <div className="w-full flex justify-center" style={{ marginTop: '-5px' }}>
          <div className="relative">
            <div className="relative mx-auto" style={{ width: '280px', height: '400px' }}>
            {hasCurrentBook ? (
              <div className="absolute" style={{ top: '8%', right: '8%', bottom: '6%', left: '8%', zIndex: 1 }}>
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
              </div>
            ) : (
              <button
                onClick={() => router.push('/library')}
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
        <div className="relative w-full max-w-[320px] flex items-center justify-center" style={{ marginTop: '-13px' }}>
          <div className="w-full max-w-[240px] sm:max-w-[260px]">
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${percent}%` }} />
            </div>
            <div className="text-center text-xs text-white mt-1 brawl-text">
              {currentBook?.currentPage && currentBook?.totalPages
                ? `${currentBook.currentPage} / ${currentBook.totalPages}`
                : `${percent}%`}
            </div>
          </div>
          <button
            onClick={openProgressEdit}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border-2 border-gold flex items-center justify-center bg-navy"
            aria-label="Edit progress"
            disabled={!hasCurrentBook}
            style={{
              opacity: hasCurrentBook ? 1 : 0.5,
              marginRight: '-18px',
              marginTop: '-8px'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M3 17.25V21h3.75l11.06-11.06-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z"
                fill="#FFD93D"
              />
            </svg>
          </button>
        </div>

        {/* Chest Frame */}
        <div
          className="relative w-[calc(100%+64px)] -mx-8 mt-auto z-30"
          style={{ marginTop: '-16px' }}
        >
          <Image
            src="/assets/chestframe.png"
            alt=""
            width={420}
            height={300}
            className="w-full h-auto"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center px-3">
            <div className="flex items-end justify-between w-full gap-0 mt-6">
              {chestGoals.map((goal) => {
                const unlocked = finishedCount >= goal;
                return (
                  <div key={goal} className="flex flex-col items-center gap-2">
                    <Image
                      src="/assets/chest.png"
                      alt=""
                      width={152}
                      height={128}
                      className="w-[152px] h-auto"
                    />
                    <div className="text-[10px] text-white brawl-text text-center -mt-2">
                      Read {goal} book{goal > 1 ? 's' : ''}
                    </div>
                    <button
                      className="px-3 py-1 text-[10px] font-bold text-navy rounded-full border-2 border-white shadow-[0_2px_0_rgba(0,0,0,0.35)]"
                      disabled={!unlocked}
                      style={{
                        background: 'linear-gradient(to bottom, #FDCB6E 0%, #FFA502 100%)',
                        opacity: unlocked ? 1 : 0.5
                      }}
                    >
                      Collect
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            className="absolute right-[-8px] top-1/2 -translate-y-1/2 w-10 h-10"
            aria-label="Next chests"
          >
            <Image src="/assets/blueright.png" alt="" width={40} height={40} />
          </button>
        </div>
      </main>

      <BottomNav active="home" />

      {/* Progress Edit Modal */}
      {showProgressEdit && (
        <div
          className="fixed inset-0 bg-[var(--navy)] flex items-center justify-center z-50 p-4"
          onClick={() => setShowProgressEdit(false)}
        >
          <div
            className="relative w-[320px] h-[520px]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src="/assets/progressbg.png"
              alt=""
              fill
              className="object-fill scale-[1.1]"
              sizes="320px"
            />

            <div className="absolute inset-0 px-6 py-10 flex flex-col items-center text-center">
              <h3
                className="text-[26px] font-bold"
                style={{
                  color: '#F6D58A',
                  textShadow:
                    '-2px 0 #5A3C12, 2px 0 #5A3C12, 0 -2px #5A3C12, 0 2px #5A3C12',
                }}
              >
                Book Progress
              </h3>

              <div className="mt-3 h-4" />

              <div className="mt-6 w-full space-y-6">
                <div className="space-y-2">
                  <div className="text-[18px] font-bold text-[#F1D08A] brawl-text">
                    Current Page
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1 h-[52px]">
                      <Image
                        src="/assets/bar2.png"
                        alt=""
                        fill
                        className="object-contain"
                        sizes="260px"
                      />
                      <input
                        type="number"
                        min="0"
                        value={currentPage}
                        onChange={(e) => setCurrentPage(e.target.value)}
                        className="progress-input absolute inset-0 w-full bg-transparent text-center text-[18px] text-[#F6D58A] outline-none"
                        placeholder="0"
                        autoFocus
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-[18px] font-bold text-[#F1D08A] brawl-text">
                    Total Pages
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1 h-[52px]">
                      <Image
                        src="/assets/bar2.png"
                        alt=""
                        fill
                        className="object-contain"
                        sizes="260px"
                      />
                      <input
                        type="number"
                        min="1"
                        value={totalPages}
                        onChange={(e) => setTotalPages(e.target.value)}
                        className="progress-input absolute inset-0 w-full bg-transparent text-center text-[18px] text-[#F6D58A] outline-none"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 w-full flex gap-4">
                <button
                  onClick={() => setShowProgressEdit(false)}
                  className="flex-1"
                >
                  <Image
                    src="/assets/cancel.png"
                    alt="Cancel"
                    width={370}
                    height={133}
                    className="w-full h-auto"
                  />
                </button>
                <button
                  onClick={() => {
                    const current = parseInt(currentPage, 10);
                    const total = parseInt(totalPages, 10);
                    if (!Number.isNaN(current) && !Number.isNaN(total) && total > 0) {
                      updateReadingProgress(current, total);
                    }
                    setShowProgressEdit(false);
                  }}
                  className="flex-1"
                >
                  <Image
                    src="/assets/save.png"
                    alt="Save"
                    width={370}
                    height={133}
                    className="w-full h-auto"
                  />
                </button>
              </div>

              <div className="mt-4 star-rating justify-center">
                {Array.from({ length: 5 }).map((_, index) => {
                  const value = index + 1;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => updateRating(value)}
                      className="p-0 bg-transparent border-0 cursor-pointer"
                      aria-label={`Rate ${value} star${value > 1 ? 's' : ''}`}
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        className={`star ${rating >= value ? 'filled' : ''}`}
                        aria-hidden="true"
                      >
                        <path d="M12 3l2.9 6 6.6.5-5 4.2 1.6 6.4-6.1-3.6-6.1 3.6 1.6-6.4-5-4.2 6.6-.5L12 3z" />
                      </svg>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => {
                  const current = parseInt(currentPage, 10);
                  const total = parseInt(totalPages, 10);
                  finishCurrentBook(
                    Number.isNaN(current) ? undefined : current,
                    Number.isNaN(total) ? undefined : total,
                    rating
                  );
                  setShowProgressEdit(false);
                }}
                className="mt-4 w-[180px]"
                disabled={rating < 1}
                style={{ opacity: rating < 1 ? 0.5 : 1 }}
              >
                <Image
                  src="/assets/finished.png"
                  alt="Finished"
                  width={474}
                  height={156}
                  className="w-full h-auto"
                />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
