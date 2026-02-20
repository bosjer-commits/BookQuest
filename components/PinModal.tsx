'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { type UserProfile } from '@/data/users';

interface PinModalProps {
  profile: UserProfile;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PinModal({ profile, onSuccess, onCancel }: PinModalProps) {
  const [digits, setDigits] = useState<string[]>([]);
  const [error, setError] = useState(false);

  const isKid = profile.role === 'kid';
  const avatarSrc = `/assets/Skins/${profile.name}_profile.png`;

  useEffect(() => {
    if (digits.length === 4) {
      const entered = digits.join('');
      if (entered === profile.pin) {
        onSuccess();
      } else {
        setError(true);
        setTimeout(() => {
          setDigits([]);
          setError(false);
        }, 600);
      }
    }
  }, [digits, profile.pin, onSuccess]);

  const handleDigit = (d: string) => {
    if (digits.length < 4 && !error) {
      setDigits((prev) => [...prev, d]);
    }
  };

  const handleBackspace = () => {
    if (!error) setDigits((prev) => prev.slice(0, -1));
  };

  const numPad = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: 'var(--navy)' }}
    >
      {/* Decorative glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] pointer-events-none"
        style={{
          background: isKid
            ? 'radial-gradient(ellipse at center top, rgba(116,185,255,0.12) 0%, transparent 70%)'
            : 'radial-gradient(ellipse at center top, rgba(162,155,254,0.12) 0%, transparent 70%)',
        }}
      />

      {/* Profile avatar */}
      <div className="mb-8 flex flex-col items-center gap-2">
        <div
          className="rounded-2xl overflow-hidden flex items-center justify-center"
          style={{
            width: 90,
            height: 90,
            background: isKid
              ? 'radial-gradient(ellipse at center, #3d8ba8 0%, #1a3a52 100%)'
              : 'linear-gradient(135deg, #4a3b6b 0%, #2d1f4a 100%)',
            border: isKid ? '3px solid #74B9FF' : '3px solid #A29BFE',
            boxShadow: isKid
              ? '0 0 16px rgba(116,185,255,0.5)'
              : '0 0 16px rgba(162,155,254,0.5)',
          }}
        >
          <Image
            src={avatarSrc}
            alt={profile.name}
            width={90}
            height={90}
            className="w-full h-full object-cover"
          />
        </div>
        <span
          className="text-base font-bold brawl-text"
          style={{ color: isKid ? '#7EC3FF' : '#C8B4FF' }}
        >
          {profile.name}
        </span>
      </div>

      {/* 4-dot PIN indicator */}
      <div className="flex gap-4 mb-3">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-150"
            style={{
              width: 16,
              height: 16,
              background:
                digits.length > i
                  ? error
                    ? '#FF6B6B'
                    : isKid
                      ? '#74B9FF'
                      : '#A29BFE'
                  : 'rgba(255,255,255,0.18)',
              boxShadow:
                digits.length > i && !error
                  ? isKid
                    ? '0 0 8px rgba(116,185,255,0.7)'
                    : '0 0 8px rgba(162,155,254,0.7)'
                  : 'none',
            }}
          />
        ))}
      </div>

      {/* Error label */}
      <div style={{ height: 22, marginBottom: 12 }}>
        {error && (
          <p
            className="text-sm font-bold text-center brawl-text"
            style={{ color: '#FF6B6B' }}
          >
            Wrong code
          </p>
        )}
      </div>

      {/* Number pad */}
      <div className="grid grid-cols-3 gap-3" style={{ width: 228 }}>
        {numPad.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => handleDigit(d)}
            className="rounded-2xl font-black text-2xl flex items-center justify-center transition-all active:scale-95"
            style={{
              height: 66,
              background: isKid
                ? 'rgba(116,185,255,0.08)'
                : 'rgba(162,155,254,0.08)',
              border: isKid
                ? '2px solid rgba(116,185,255,0.25)'
                : '2px solid rgba(162,155,254,0.25)',
              color: '#fff',
            }}
          >
            {d}
          </button>
        ))}

        {/* Bottom row: blank | 0 | backspace */}
        <div />
        <button
          type="button"
          onClick={() => handleDigit('0')}
          className="rounded-2xl font-black text-2xl flex items-center justify-center transition-all active:scale-95"
          style={{
            height: 66,
            background: isKid
              ? 'rgba(116,185,255,0.08)'
              : 'rgba(162,155,254,0.08)',
            border: isKid
              ? '2px solid rgba(116,185,255,0.25)'
              : '2px solid rgba(162,155,254,0.25)',
            color: '#fff',
          }}
        >
          0
        </button>
        <button
          type="button"
          onClick={handleBackspace}
          className="rounded-2xl flex items-center justify-center transition-all active:scale-95"
          style={{
            height: 66,
            background: isKid
              ? 'rgba(116,185,255,0.08)'
              : 'rgba(162,155,254,0.08)',
            border: isKid
              ? '2px solid rgba(116,185,255,0.25)'
              : '2px solid rgba(162,155,254,0.25)',
            color: 'rgba(255,255,255,0.7)',
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
            <line x1="18" y1="9" x2="12" y2="15" />
            <line x1="12" y1="9" x2="18" y2="15" />
          </svg>
        </button>
      </div>

      {/* Cancel */}
      <button
        type="button"
        onClick={onCancel}
        className="mt-10 text-sm font-bold"
        style={{ color: 'rgba(116,185,255,0.5)' }}
      >
        Cancel
      </button>
    </div>
  );
}
