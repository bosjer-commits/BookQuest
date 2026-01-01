'use client';

import Image from 'next/image';

interface BookDisplayProps {
  title: string;
  year: number;
  coverUrl: string | null;
  loading: boolean;
  onPrevBook: () => void;
  onNextBook: () => void;
  onInfoClick: () => void;
}

export default function BookDisplay({
  title,
  year,
  coverUrl,
  loading,
  onPrevBook,
  onNextBook,
  onInfoClick,
}: BookDisplayProps) {
  return (
    <div className="relative flex items-center justify-center gap-0" style={{ paddingLeft: '5px', paddingRight: '5px' }}>
      {/* Left Arrow */}
      <button
        onClick={onPrevBook}
        className="w-14 h-14 flex-shrink-0 transition-transform hover:scale-110 active:scale-95"
        style={{ marginRight: '-10px' }}
        aria-label="Previous book"
      >
        <Image src="/assets/blueleft.png" alt="" width={56} height={56} />
      </button>

      {/* Book with Frame */}
      <div className="relative">
        {/* Container for book and frame */}
        <div
          className="relative"
          style={{
            width: '310px',
            height: '460px',
          }}
        >
          {/* Book Cover - positioned behind the frame */}
          <div className="absolute" style={{ top: '8%', right: '8%', bottom: '6%', left: '8%', zIndex: 1 }}>
            {loading ? (
              <div className="text-white text-xs">Loading...</div>
            ) : coverUrl ? (
              <img
                src={coverUrl}
                alt={title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                className="rounded"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center p-2 rounded">
                <div className="text-center">
                  <p className="text-white text-xs font-bold">{title}</p>
                </div>
              </div>
            )}
          </div>

          {/* Frame overlay - positioned on top of book cover */}
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
          />

          {/* Year text at bottom of frame */}
          <div className="absolute bottom-3 left-0 right-0 text-center" style={{ zIndex: 3 }}>
            <span className="text-white font-bold text-lg brawl-text">{year}</span>
          </div>
        </div>

        {/* Info Button - positioned at top-right corner */}
        <button
          onClick={onInfoClick}
          className="absolute -right-3 -top-3 w-10 h-10 transition-transform hover:scale-110 active:scale-95"
          aria-label="Book information"
        >
          <Image src="/assets/info.png" alt="" width={40} height={40} />
        </button>
      </div>

      {/* Right Arrow */}
      <button
        onClick={onNextBook}
        className="w-14 h-14 flex-shrink-0 transition-transform hover:scale-110 active:scale-95"
        style={{ marginLeft: '-10px' }}
        aria-label="Next book"
      >
        <Image src="/assets/blueright.png" alt="" width={56} height={56} />
      </button>
    </div>
  );
}
