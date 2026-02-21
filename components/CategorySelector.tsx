'use client';

import Image from 'next/image';
import { PrizeCategory } from '@/data/categories';

interface CategorySelectorProps {
  category: PrizeCategory;
  bookCount: number;
  currentBookIndex: number;
  onPrevCategory: () => void;
  onNextCategory: () => void;
}

export default function CategorySelector({
  category,
  bookCount,
  currentBookIndex,
  onPrevCategory,
  onNextCategory,
}: CategorySelectorProps) {
  return (
    <div className="flex flex-col items-center shrink-0">
      {/* Dome with Navigation Arrows */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={onPrevCategory}
          className="w-10 h-10 transition-transform hover:scale-110 active:scale-95"
          aria-label="Previous category"
          style={{ marginTop: '20px' }}
        >
          <Image
            src="/assets/yellowleft.png"
            alt=""
            width={40}
            height={40}
            className="w-10 h-10 object-contain"
          />
        </button>

        <div style={{ width: '90px', height: '90px' }}>
          <Image
            src={category.domeImage}
            alt={category.name}
            width={90}
            height={90}
            className="object-contain"
          />
        </div>

        <button
          onClick={onNextCategory}
          className="w-10 h-10 transition-transform hover:scale-110 active:scale-95"
          aria-label="Next category"
          style={{ marginTop: '20px' }}
        >
          <Image
            src="/assets/yellowright.png"
            alt=""
            width={40}
            height={40}
            className="w-10 h-10 object-contain scale-[0.98]"
          />
        </button>
      </div>

      {/* Book Counter */}
      <div className="text-white text-sm font-semibold brawl-text -mt-1">
        {currentBookIndex + 1}/{bookCount}
      </div>
    </div>
  );
}
