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
    <div className="flex flex-col items-center space-y-1">
      {/* Dome with Navigation Arrows */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={onPrevCategory}
          className="w-12 h-12 transition-transform hover:scale-110 active:scale-95"
          aria-label="Previous category"
        >
          <Image src="/assets/yellowleft.png" alt="" width={48} height={48} />
        </button>

        <div style={{ width: '150px', height: '150px' }}>
          <Image
            src={category.domeImage}
            alt={category.name}
            width={150}
            height={150}
            className="object-contain"
          />
        </div>

        <button
          onClick={onNextCategory}
          className="w-12 h-12 transition-transform hover:scale-110 active:scale-95"
          aria-label="Next category"
        >
          <Image src="/assets/yellowright.png" alt="" width={48} height={48} />
        </button>
      </div>

      {/* Book Counter */}
      <div className="text-white text-base font-semibold brawl-text">
        {currentBookIndex + 1}/{bookCount}
      </div>
    </div>
  );
}
