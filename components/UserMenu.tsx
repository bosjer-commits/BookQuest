'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useUser } from '@/contexts/UserContext';
import { GOLD } from '@/lib/theme';

// Floating avatar button (top left) with the "Switch User" dropdown.
export default function UserMenu() {
  const { viewingProfile, logout } = useUser();
  const [open, setOpen] = useState(false);

  const avatar = viewingProfile
    ? `/assets/Skins/${viewingProfile.name}_profile.webp`
    : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed top-3 left-3 z-40 rounded-full overflow-hidden flex items-center justify-center"
        style={{
          width: '40px',
          height: '40px',
          background: 'rgba(22,37,68,0.85)',
          border: '2px solid rgba(116,185,255,0.6)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
        }}
        aria-label="User menu"
      >
        {avatar && (
          <Image src={avatar} alt={viewingProfile?.name ?? ''} width={40} height={40} className="w-full h-full object-cover" />
        )}
      </button>

      {open && (
        <div
          className="fixed top-14 left-3 z-40 rounded-xl py-2 px-3 flex flex-col gap-2 min-w-[160px]"
          style={{
            background: 'rgba(22,37,68,0.97)',
            border: '2px solid rgba(116,185,255,0.4)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          }}
        >
          <div className="text-sm font-bold brawl-text" style={{ color: GOLD }}>
            {viewingProfile?.name}
          </div>
          <button
            type="button"
            onClick={() => { logout(); setOpen(false); }}
            className="text-left text-xs font-bold py-1"
            style={{ color: '#FF6B6B' }}
          >
            Switch User
          </button>
        </div>
      )}

      {/* Backdrop to close menu */}
      {open && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
