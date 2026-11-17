'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useCurrentBook } from '@/contexts/CurrentBookContext';
import { GOLD, GOLD_OUTLINE } from '@/lib/theme';

// Full-screen dialog for the current book: set pages, rate it, mark it finished.
// Render it only while open, so the fields start from the book's saved values.
export default function ProgressEditModal({ onClose }: { onClose: () => void }) {
  const { currentBook, updateReadingProgress, updateRating, finishCurrentBook } = useCurrentBook();
  const [currentPage, setCurrentPage] = useState(currentBook?.currentPage?.toString() || '');
  const [totalPages, setTotalPages] = useState(currentBook?.totalPages?.toString() || '');
  const rating = currentBook?.rating ?? 0;

  const handleSave = () => {
    const current = parseInt(currentPage, 10);
    const total = parseInt(totalPages, 10);
    if (!Number.isNaN(current) && !Number.isNaN(total) && total > 0) {
      updateReadingProgress(current, total);
    }
    onClose();
  };

  const handleFinish = () => {
    const current = parseInt(currentPage, 10);
    const total = parseInt(totalPages, 10);
    finishCurrentBook(
      Number.isNaN(current) ? undefined : current,
      Number.isNaN(total) ? undefined : total,
      rating
    );
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-[var(--navy)] flex items-center justify-center z-50 p-4"
      onClick={onClose}
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
            style={{ color: GOLD, textShadow: GOLD_OUTLINE }}
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
                    onFocus={(e) => e.target.select()}
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
                    onFocus={(e) => e.target.select()}
                    className="progress-input absolute inset-0 w-full bg-transparent text-center text-[18px] text-[#F6D58A] outline-none"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 w-full flex gap-4">
            <button onClick={onClose} className="flex-1">
              <Image
                src="/assets/cancel.png"
                alt="Cancel"
                width={370}
                height={133}
                className="w-full h-auto"
              />
            </button>
            <button onClick={handleSave} className="flex-1">
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
            onClick={handleFinish}
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
  );
}
