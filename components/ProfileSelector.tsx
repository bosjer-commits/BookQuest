'use client';

import { useState } from 'react';
import { USERS, type UserProfile } from '@/data/users';
import { useUser } from '@/contexts/UserContext';
import PinModal from '@/components/PinModal';

// Hotspot positions as percentages of the image (top, left, width, height)
const HOTSPOTS: { id: string; top: number; left: number; width: number; height: number }[] = [
  // Row 1: Elliot, Robin, Simon
  { id: 'elliott', top: 22, left: 4,  width: 30, height: 16 },
  { id: 'robin',   top: 22, left: 35, width: 30, height: 16 },
  { id: 'simon',   top: 22, left: 66, width: 30, height: 16 },
  // Row 2: Oliver, Lucas
  { id: 'oliver',  top: 40, left: 14, width: 30, height: 16 },
  { id: 'lucas',   top: 40, left: 52, width: 30, height: 16 },
  // Row 3: Fanny, Fie, Jo
  { id: 'fanny',   top: 66, left: 4,  width: 30, height: 18 },
  { id: 'fie',     top: 66, left: 35, width: 30, height: 18 },
  { id: 'jo',      top: 66, left: 66, width: 30, height: 18 },
];

export default function ProfileSelector() {
  const { login } = useUser();
  const [pendingProfile, setPendingProfile] = useState<UserProfile | null>(null);

  const handleSelect = (id: string) => {
    const profile = USERS.find((u) => u.id === id);
    if (profile) setPendingProfile(profile);
  };

  if (pendingProfile) {
    return (
      <PinModal
        profile={pendingProfile}
        onSuccess={() => login(pendingProfile.id)}
        onCancel={() => setPendingProfile(null)}
      />
    );
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: 'var(--navy)' }}
    >
      <div className="relative w-full h-full max-w-[500px] mx-auto">
        <img
          src="/assets/Landingpage.webp"
          alt="Book Quest - Who's reading today?"
          className="w-full h-full object-contain"
        />
        {/* Invisible hotspot buttons over each character */}
        {HOTSPOTS.map((spot) => (
          <button
            key={spot.id}
            type="button"
            onClick={() => handleSelect(spot.id)}
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
