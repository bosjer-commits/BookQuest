'use client';

import { useState } from 'react';
import Image from 'next/image';
import { USERS, type UserProfile } from '@/data/users';
import { useUser } from '@/contexts/UserContext';
import PinModal from '@/components/PinModal';

const KID_IDS = ['elliott', 'robin', 'simon', 'oliver', 'lucas'];
const PARENT_IDS = ['fanny', 'fie', 'jo'];

function getProfileImage(name: string): string {
  return `/assets/Skins/${name}_profile.png`;
}

function ProfileCard({ profile, onSelect }: { profile: UserProfile; onSelect: () => void }) {
  const isKid = profile.role === 'kid';
  const avatarSrc = getProfileImage(profile.name);

  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex flex-col items-center gap-2 focus:outline-none"
    >
      <div
        className="relative rounded-2xl overflow-hidden flex items-center justify-center"
        style={{
          width: '90px',
          height: '90px',
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
        className="text-sm font-bold brawl-text"
        style={{ color: isKid ? '#7EC3FF' : '#C8B4FF' }}
      >
        {profile.name}
      </span>
    </button>
  );
}

export default function ProfileSelector() {
  const { login } = useUser();
  const [pendingProfile, setPendingProfile] = useState<UserProfile | null>(null);
  const kids = USERS.filter((u) => KID_IDS.includes(u.id));
  const parents = USERS.filter((u) => PARENT_IDS.includes(u.id));

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
      className="fixed inset-0 flex flex-col items-center justify-center z-50"
      style={{ background: 'var(--navy)' }}
    >
      {/* Decorative glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center top, rgba(116,185,255,0.15) 0%, transparent 70%)',
        }}
      />

      <h1
        className="text-3xl font-black brawl-text mb-2"
        style={{
          color: '#F6D58A',
          textShadow: '-2px 0 #5A3C12, 2px 0 #5A3C12, 0 -2px #5A3C12, 0 2px #5A3C12',
        }}
      >
        Book Quest
      </h1>
      <p
        className="text-base font-bold brawl-text mb-8"
        style={{ color: '#7EC3FF' }}
      >
        Who&apos;s reading today?
      </p>

      {/* Kids grid */}
      <div className="flex flex-wrap justify-center gap-5 mb-6 px-4 max-w-[380px]">
        {kids.map((kid) => (
          <ProfileCard key={kid.id} profile={kid} onSelect={() => setPendingProfile(kid)} />
        ))}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-6 w-[280px]">
        <div className="flex-1 h-px" style={{ background: 'rgba(116,185,255,0.3)' }} />
        <span className="text-xs font-bold brawl-text" style={{ color: 'rgba(116,185,255,0.6)' }}>
          PARENTS
        </span>
        <div className="flex-1 h-px" style={{ background: 'rgba(116,185,255,0.3)' }} />
      </div>

      {/* Parents row */}
      <div className="flex justify-center gap-6">
        {parents.map((parent) => (
          <ProfileCard key={parent.id} profile={parent} onSelect={() => setPendingProfile(parent)} />
        ))}
      </div>
    </div>
  );
}
