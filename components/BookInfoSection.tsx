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
    <div className="flex flex-col items-center space-y-1" style={{ marginTop: '-80px' }}>
      {/* Decorative Bars with Heart */}
      <div className="flex items-center justify-center gap-2">
        <Image
          src="/assets/littleyellowbar.png"
          alt=""
          width={140}
          height={8}
          className="h-2 w-[140px]"
        />
        <button
          type="button"
          onClick={onToggleFavorite}
          className="transition-transform hover:scale-110 active:scale-95"
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          style={{ marginTop: '16px' }}
        >
          <Image
            src={heartSrc}
            alt=""
            width={180}
            height={180}
            className="object-contain"
            style={{ width: '180px', height: '180px' }}
          />
        </button>
        <Image
          src="/assets/littleyellowbar.png"
          alt=""
          width={140}
          height={8}
          className="h-2 w-[140px]"
        />
      </div>

      <div style={{ marginTop: '-36px' }}>
        {/* Author Name */}
        <div className="text-white text-[15px] font-bold text-center brawl-text px-4 -mt-6">
          {author}
        </div>

        {/* Book Title */}
        <div className="text-white text-xl font-bold text-center brawl-text px-4">
          {title}
        </div>
      </div>

      {/* Bottom Decorative Bar */}
      <div className="flex items-center justify-center">
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
