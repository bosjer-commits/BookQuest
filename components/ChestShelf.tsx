'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useChest } from '@/contexts/ChestContext';
import { BROWN } from '@/lib/theme';

const CHEST_GOALS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const CHESTS_PER_PAGE = 3;
const TOTAL_PAGES = Math.ceil(CHEST_GOALS.length / CHESTS_PER_PAGE);

interface ChestShelfProps {
  /** How many books the kid has finished; a chest unlocks at its goal. */
  finishedCount: number;
  onOpenChest: (goal: number) => void;
}

// The framed row of three chests on the home page, with paging arrows.
export default function ChestShelf({ finishedCount, onOpenChest }: ChestShelfProps) {
  const { isChestCollected } = useChest();
  const [page, setPage] = useState(0);
  const goals = CHEST_GOALS.slice(page * CHESTS_PER_PAGE, (page + 1) * CHESTS_PER_PAGE);

  return (
    <div
      className="relative w-[calc(100%+32px)] -mx-4 shrink-0 z-30 mt-auto mb-2"
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
          {goals.map((goal) => {
            const unlocked = finishedCount >= goal;
            const collected = isChestCollected(goal);
            return (
              <div key={goal} className="flex flex-col items-center gap-2">
                <div className="relative">
                  <Image
                    src="/assets/chest.png"
                    alt=""
                    width={152}
                    height={128}
                    className="w-[100px] h-auto"
                    style={{ opacity: collected ? 0.5 : 1 }}
                  />
                  {collected && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="11" fill="#00B894" stroke="white" strokeWidth="2" />
                        <path d="M7 12.5l3 3 7-7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="text-[10px] text-white brawl-text text-center -mt-2">
                  Read {goal} book{goal > 1 ? 's' : ''}
                </div>
                {collected ? (
                  <span
                    className="px-3 py-1 text-[10px] font-bold rounded-full border-2 border-white"
                    style={{
                      background: 'linear-gradient(to bottom, #00B894 0%, #00997A 100%)',
                      color: 'white',
                    }}
                  >
                    Collected
                  </span>
                ) : (
                  <button
                    className="relative w-[90px] h-[28px]"
                    disabled={!unlocked}
                    onClick={() => unlocked && onOpenChest(goal)}
                    style={{ opacity: unlocked ? 1 : 0.5 }}
                  >
                    <Image
                      src="/assets/start.png"
                      alt=""
                      fill
                      className="object-contain"
                      sizes="90px"
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold" style={{ color: BROWN }}>
                      Collect
                    </span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {page > 0 && (
        <button
          className="absolute left-[2px] top-1/2 -translate-y-1/2 w-10 h-10"
          aria-label="Previous chests"
          onClick={() => setPage((p) => p - 1)}
        >
          <Image src="/assets/blueleft.png" alt="" width={40} height={40} />
        </button>
      )}

      {page < TOTAL_PAGES - 1 && (
        <button
          className="absolute right-[2px] top-1/2 -translate-y-1/2 w-10 h-10"
          aria-label="Next chests"
          onClick={() => setPage((p) => p + 1)}
        >
          <Image src="/assets/blueright.png" alt="" width={40} height={40} />
        </button>
      )}
    </div>
  );
}
