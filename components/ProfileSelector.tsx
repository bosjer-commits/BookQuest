'use client';

import { useUser } from '@/contexts/UserContext';

// Hotspot positions as percentages of the image (top, left, width, height).
// Layout of newlandingpage.png — a 2x3 grid of profile cards:
//   Row 1: Annalyn, Lucas, Robin
//   Row 2: Oliver, Elliot, Simon
const HOTSPOTS: { id: string; top: number; left: number; width: number; height: number }[] = [
  // Row 1
  { id: 'annalyn', top: 37, left: 7,  width: 27, height: 24 },
  { id: 'lucas',   top: 37, left: 37, width: 27, height: 24 },
  { id: 'robin',   top: 37, left: 66, width: 27, height: 24 },
  // Row 2
  { id: 'oliver',  top: 61, left: 7,  width: 27, height: 24 },
  { id: 'elliott', top: 61, left: 37, width: 27, height: 24 },
  { id: 'simon',   top: 61, left: 66, width: 27, height: 24 },
];

export default function ProfileSelector() {
  const { login } = useUser();

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: 'var(--navy)' }}
    >
      <div className="relative w-full h-full max-w-[500px] mx-auto">
        <img
          src="/assets/newlandingpage.png"
          alt="Book Quest - Select your profile"
          className="w-full h-full object-contain"
        />
        {/* Invisible hotspot buttons over each character — one tap logs in, no PIN */}
        {HOTSPOTS.map((spot) => (
          <button
            key={spot.id}
            type="button"
            onClick={() => login(spot.id)}
            aria-label={`Select ${spot.id}`}
            className="absolute"
            style={{
              top: `${spot.top}%`,
              left: `${spot.left}%`,
              width: `${spot.width}%`,
              height: `${spot.height}%`,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          />
        ))}
      </div>
    </div>
  );
}
