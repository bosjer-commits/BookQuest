'use client';

import Image from 'next/image';

interface BookInfoSectionProps {
  author: string;
  title: string;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export default function BookInfoSection({
  author,
  title,
  isFavorite = false,
  onToggleFavorite,
}: BookInfoSectionProps) {
  const heartSrc = isFavorite ? '/assets/fullheart.png' : '/assets/emptyheart.png';

  return (
    <div className="flex flex-col items-center shrink-0" style={{ marginTop: '-14px', height: '90px' }}>
      {/* Decorative Bars with Heart */}
      <div className="flex items-center justify-center gap-2">
        <Image
          src="/assets/littleyellowbar.png"
          alt=""
          width={120}
          height={8}
          className="h-2 w-[120px]"
        />
        <button
          type="button"
          onClick={onToggleFavorite}
          className="transition-transform hover:scale-110 active:scale-95"
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Image
            src={heartSrc}
            alt=""
            width={50}
            height={50}
            className="object-contain"
            style={{ width: '50px', height: '50px' }}
          />
        </button>
        <Image
          src="/assets/littleyellowbar.png"
          alt=""
          width={120}
          height={8}
          className="h-2 w-[120px]"
        />
      </div>

      <div style={{ marginTop: '-6px' }}>
        {/* Author Name */}
        <div className="text-white text-[12px] font-bold text-center brawl-text px-4 whitespace-nowrap">
          {author}
        </div>

        {/* Book Title */}
        <div
          className="text-white font-bold text-center brawl-text px-4 whitespace-nowrap"
          style={{ fontSize: title.length > 30 ? '11px' : title.length > 20 ? '12px' : '14px' }}
        >
          {title}
        </div>
      </div>

      {/* Bottom Decorative Bar */}
      <div className="flex items-center justify-center mt-1">
        <Image
          src="/assets/yellowbar.png"
          alt=""
          width={240}
          height={8}
          className="h-2 w-[240px]"
        />
      </div>
    </div>
  );
}
