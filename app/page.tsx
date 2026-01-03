'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import { useCurrentBook } from '@/contexts/CurrentBookContext';

export default function Home() {
  const router = useRouter();
  const { currentBook, finishedBooks, updateReadingProgress } = useCurrentBook();
  const [showProgressEdit, setShowProgressEdit] = useState(false);
  const [currentPage, setCurrentPage] = useState('');
  const [totalPages, setTotalPages] = useState('');

  const percent = currentBook?.progress ?? 0;
  const hasCurrentBook = Boolean(currentBook);
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
        <div className="flex items-center gap-3 w-full max-w-[320px] justify-center" style={{ marginTop: '-29px' }}>
          <div className="w-full max-w-[260px]">
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
            className="w-10 h-10 rounded-full border-2 border-gold flex items-center justify-center bg-navy"
            aria-label="Edit progress"
            disabled={!hasCurrentBook}
            style={{ opacity: hasCurrentBook ? 1 : 0.5 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M4 20h4l10.5-10.5-4-4L4 16v4z"
                stroke="#FFD93D"
                strokeWidth="2"
                fill="none"
              />
              <path d="M14.5 5.5l4 4" stroke="#FFD93D" strokeWidth="2" />
            </svg>
          </button>
        </div>

        {/* Chest Frame */}
        <div className="relative w-[calc(100%+64px)] -mx-8 mt-auto z-30">
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
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
          onClick={() => setShowProgressEdit(false)}
        >
          <div
            className="relative w-[320px] h-[520px]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src="/assets/frame.png"
              alt=""
              fill
              className="object-fill"
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

              <div className="mt-3 w-full flex items-center justify-center gap-2">
                <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-[#E7C16E] to-transparent" />
                <div className="w-2 h-2 rounded-full border-2 border-[#E7C16E]" />
                <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-[#E7C16E] to-transparent" />
              </div>

              <div className="mt-6 w-full space-y-6">
                <div className="space-y-2">
                  <div className="text-[18px] font-bold text-[#F1D08A] brawl-text">
                    Current Page
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 px-3 py-2 rounded-lg border-2 border-[#D6A75C] bg-[#2B4E6E]">
                      <input
                        type="number"
                        min="0"
                        value={currentPage}
                        onChange={(e) => setCurrentPage(e.target.value)}
                        className="w-full bg-transparent text-center text-[18px] text-[#F6D58A] outline-none"
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
                    <div className="flex-1 px-3 py-2 rounded-lg border-2 border-[#D6A75C] bg-[#2B4E6E]">
                      <input
                        type="number"
                        min="1"
                        value={totalPages}
                        onChange={(e) => setTotalPages(e.target.value)}
                        className="w-full bg-transparent text-center text-[18px] text-[#F6D58A] outline-none"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 w-full flex gap-4">
                <button
                  onClick={() => setShowProgressEdit(false)}
                  className="flex-1 py-2 text-[16px] font-bold text-[#5A3C12] rounded-full border-2 border-[#F6D58A]"
                  style={{
                    background: 'linear-gradient(to bottom, #FBD37C 0%, #E7B354 100%)',
                    boxShadow: '0 4px 0 rgba(0,0,0,0.2)',
                  }}
                >
                  Cancel
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
                  className="flex-1 py-2 text-[16px] font-bold text-[#5A3C12] rounded-full border-2 border-[#F6D58A]"
                  style={{
                    background: 'linear-gradient(to bottom, #FBD37C 0%, #E7B354 100%)',
                    boxShadow: '0 4px 0 rgba(0,0,0,0.2)',
                  }}
                >
                  Save
                </button>
              </div>

              <div className="mt-4 flex items-center justify-center gap-2">
                {Array.from({ length: 5 }).map((_, index) => (
                  <svg
                    key={index}
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M12 3l2.9 6 6.6.5-5 4.2 1.6 6.4-6.1-3.6-6.1 3.6 1.6-6.4-5-4.2 6.6-.5L12 3z"
                      stroke="#F6D58A"
                      strokeWidth="2"
                      fill="transparent"
                    />
                  </svg>
                ))}
              </div>

              <button
                onClick={() => {
                  const current = parseInt(currentPage, 10);
                  const total = parseInt(totalPages, 10);
                  if (!Number.isNaN(current) && !Number.isNaN(total) && total > 0) {
                    updateReadingProgress(current, total);
                  }
                  setShowProgressEdit(false);
                }}
                className="mt-4 w-[180px] py-2 text-[16px] font-bold text-[#5A3C12] rounded-full border-2 border-[#F6D58A]"
                style={{
                  background: 'linear-gradient(to bottom, #FBD37C 0%, #E7B354 100%)',
                  boxShadow: '0 4px 0 rgba(0,0,0,0.2)',
                }}
              >
                Finished!
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
