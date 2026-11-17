'use client';

import type { CSSProperties } from 'react';

// Round badge that sits on the corner of a book frame and opens the cover picker.
// Drawn to match the round blue-and-gold info badge on the Library frame.
export default function CoverButton({ onClick, style }: { onClick: () => void; style?: CSSProperties }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Change cover"
      className="absolute w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95 z-10"
      style={{
        background: 'radial-gradient(circle at 35% 28%, #7CCBFF 0%, #2F86E6 55%, #1A4FA8 100%)',
        border: '3px solid #F4B93E',
        boxShadow: '0 2px 0 #8A5A10, 0 4px 8px rgba(0,0,0,0.45), inset 0 2px 2px rgba(255,255,255,0.55)',
        ...style,
      }}
    >
      {/* Picture icon */}
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="2.5" stroke="#fff" strokeWidth="2.2" />
        <circle cx="8.5" cy="10" r="1.7" fill="#fff" />
        <path d="M4.5 17.5l5-5 3.5 3.5 2.5-2.5 4 4" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
