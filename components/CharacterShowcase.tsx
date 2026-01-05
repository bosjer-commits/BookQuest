'use client';

import { useState } from 'react';
import Image from 'next/image';

type CharacterShowcaseProps = {
  skins: string[];
  name: string;
};

export default function CharacterShowcase({ skins, name }: CharacterShowcaseProps) {
  const [activeSkinIndex, setActiveSkinIndex] = useState(0);
  const currentSkin = skins[activeSkinIndex];

  return (
    <div className="relative h-[50vh] w-full">
      {/* Ornate panel background inspired by progress-mockup */}
      <div className="absolute inset-0">
        {/* Outer dark frame */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #1a3a52 0%, #0d1f2d 50%, #1a3a52 100%)',
          }}
        />

        {/* Inner teal/cyan gradient panel */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, #5fb3d4 0%, #3d8ba8 40%, #2a5f7a 80%, #1a3a52 100%)',
            boxShadow: 'inset 0 0 100px rgba(95,179,212,0.3), inset 0 0 50px rgba(255,255,255,0.1)',
          }}
        />

        {/* Animated shimmer overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at center, rgba(107,255,255,0.2) 0%, transparent 60%)',
            animation: 'shimmer-pulse 3s ease-in-out infinite',
          }}
        />

        {/* Decorative light rays from center */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `
              repeating-conic-gradient(
                from 0deg at 50% 50%,
                transparent 0deg,
                rgba(253,203,110,0.3) 2deg,
                transparent 4deg,
                transparent 40deg
              )
            `,
            animation: 'rotate-slow 20s linear infinite',
          }}
        />
      </div>

      {/* Ornate gold corner decorations */}
      <div
        className="absolute top-4 left-4 w-20 h-20 opacity-90"
        style={{
          background: 'radial-gradient(circle at top left, #FDCB6E 0%, #FFA502 100%)',
          clipPath: 'polygon(0 0, 100% 0, 0 100%)',
          filter: 'drop-shadow(0 2px 8px rgba(253,203,110,0.6))',
        }}
      />
      <div
        className="absolute top-4 right-4 w-20 h-20 opacity-90"
        style={{
          background: 'radial-gradient(circle at top right, #FDCB6E 0%, #FFA502 100%)',
          clipPath: 'polygon(100% 0, 100% 100%, 0 0)',
          filter: 'drop-shadow(0 2px 8px rgba(253,203,110,0.6))',
        }}
      />
      <div
        className="absolute bottom-4 left-4 w-20 h-20 opacity-90"
        style={{
          background: 'radial-gradient(circle at bottom left, #FDCB6E 0%, #FFA502 100%)',
          clipPath: 'polygon(0 0, 0 100%, 100% 100%)',
          filter: 'drop-shadow(0 2px 8px rgba(253,203,110,0.6))',
        }}
      />
      <div
        className="absolute bottom-4 right-4 w-20 h-20 opacity-90"
        style={{
          background: 'radial-gradient(circle at bottom right, #FDCB6E 0%, #FFA502 100%)',
          clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
          filter: 'drop-shadow(0 2px 8px rgba(253,203,110,0.6))',
        }}
      />

      {/* Cyan gemstone accents */}
      <div
        className="absolute top-8 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full"
        style={{
          background: 'radial-gradient(circle at 30% 30%, #6BFFFF 0%, #00CED1 100%)',
          boxShadow: '0 0 15px rgba(107,255,255,0.8), inset -2px -2px 4px rgba(0,0,0,0.3)',
          animation: 'gem-sparkle 2s ease-in-out infinite',
        }}
      />
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full"
        style={{
          background: 'radial-gradient(circle at 30% 30%, #6BFFFF 0%, #00CED1 100%)',
          boxShadow: '0 0 15px rgba(107,255,255,0.8), inset -2px -2px 4px rgba(0,0,0,0.3)',
          animation: 'gem-sparkle 2s ease-in-out infinite 1s',
        }}
      />

      {/* Character spotlight */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[80%]"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.15) 0%, transparent 70%)',
          filter: 'blur(30px)',
        }}
      />

      <button
        type="button"
        onClick={() => setActiveSkinIndex((prev) => (prev - 1 + skins.length) % skins.length)}
        className="absolute -left-5 top-1/2 -translate-y-1/2 w-14 h-14 flex items-center justify-center z-30"
        aria-label="Previous skin"
      >
        <Image
          src="/assets/blueleft.png"
          alt=""
          width={56}
          height={56}
          className="w-14 h-14 object-contain"
        />
      </button>

      <div
        className="absolute left-1/2 top-1/2 w-full h-full flex items-center justify-center z-20"
        style={{ transform: 'translate(-50%, -50%)' }}
      >
        {/* Character shadow */}
        <div
          className="absolute bottom-[5%] left-1/2 -translate-x-1/2 w-[60%] h-12 rounded-full opacity-40"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.8) 0%, transparent 70%)',
            filter: 'blur(15px)',
          }}
        />

        {/* Character glow aura */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            filter: 'drop-shadow(0 0 40px rgba(126,195,255,0.5)) drop-shadow(0 0 80px rgba(108,92,231,0.3))',
          }}
        >
          <Image
            src={currentSkin}
            alt={name}
            width={1680}
            height={1680}
            className="h-full w-auto object-contain"
            style={{
              animation: 'character-entrance 0.6s ease-out',
            }}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => setActiveSkinIndex((prev) => (prev + 1) % skins.length)}
        className="absolute -right-5 top-1/2 -translate-y-1/2 w-14 h-14 flex items-center justify-center z-30"
        aria-label="Next skin"
      >
        <Image
          src="/assets/blueright.png"
          alt=""
          width={56}
          height={56}
          className="w-14 h-14 object-contain"
        />
      </button>

      {/* Top accent border glow */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, #74B9FF 50%, transparent 100%)',
          boxShadow: '0 0 20px rgba(116,185,255,0.8)',
        }}
      />

      <style jsx>{`
        @keyframes shimmer-pulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.05);
          }
        }

        @keyframes rotate-slow {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes gem-sparkle {
          0%, 100% {
            filter: brightness(1) drop-shadow(0 0 5px rgba(107,255,255,0.8));
          }
          50% {
            filter: brightness(1.3) drop-shadow(0 0 15px rgba(107,255,255,1));
          }
        }

        @keyframes character-entrance {
          0% {
            transform: scale(0.9);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
