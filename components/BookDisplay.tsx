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
    <div className="flex-1 min-h-0 flex items-center justify-center">
      {/* Book with Frame — arrows and info positioned relative to this */}
      <div className="relative h-full flex items-center justify-center">
        <div
          className="relative"
          style={{
            aspectRatio: '310 / 460',
            maxWidth: '310px',
            maxHeight: '460px',
            height: '100%',
          }}
        >
          {/* Book Cover */}
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

          {/* Frame overlay */}
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
          <div
            className="absolute left-0 right-0 flex items-center justify-center gap-2"
            style={{ bottom: '-4px', zIndex: 3 }}
          >
            <span
              className="text-white text-[20px] font-bold brawl-text relative top-[2px]"
              style={{
                textShadow:
                  '-2px 0 #000, 2px 0 #000, 0 -2px #000, 0 2px #000, -2px -2px #000, 2px -2px #000, -2px 2px #000, 2px 2px #000',
              }}
            >
              *
            </span>
            <span
              className="text-white text-[22px] font-bold brawl-text"
              style={{
                textShadow:
                  '-2px 0 #000, 2px 0 #000, 0 -2px #000, 0 2px #000, -2px -2px #000, 2px -2px #000, -2px 2px #000, 2px 2px #000',
              }}
            >
              {year}
            </span>
            <span
              className="text-white text-[20px] font-bold brawl-text relative top-[2px]"
              style={{
                textShadow:
                  '-2px 0 #000, 2px 0 #000, 0 -2px #000, 0 2px #000, -2px -2px #000, 2px -2px #000, -2px 2px #000, 2px 2px #000',
              }}
            >
              *
            </span>
          </div>

          {/* Left Arrow — positioned relative to book frame */}
          <button
            onClick={onPrevBook}
            className="absolute top-1/2 -translate-y-1/2 w-12 h-12 transition-transform hover:scale-110 active:scale-95 z-10"
            style={{ left: '-40px' }}
            aria-label="Previous book"
          >
            <Image
              src="/assets/blueleft.png"
              alt=""
              width={48}
              height={48}
              className="w-12 h-12 object-contain"
            />
          </button>

          {/* Right Arrow — positioned relative to book frame */}
          <button
            onClick={onNextBook}
            className="absolute top-1/2 -translate-y-1/2 w-12 h-12 transition-transform hover:scale-110 active:scale-95 z-10"
            style={{ right: '-40px' }}
            aria-label="Next book"
          >
            <Image
              src="/assets/blueright.png"
              alt=""
              width={48}
              height={48}
              className="w-12 h-12 object-contain scale-[0.98]"
            />
          </button>

          {/* Info Button — positioned relative to book frame */}
          <button
            onClick={onInfoClick}
            className="absolute w-10 h-10 transition-transform hover:scale-110 active:scale-95 z-10"
            aria-label="Book information"
            style={{ right: '-4px', top: '8px' }}
          >
            <Image src="/assets/info.png" alt="" width={40} height={40} />
          </button>
        </div>
      </div>
    </div>
  );
}
