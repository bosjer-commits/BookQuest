'use client';

import Link from 'next/link';
import Image from 'next/image';

type NavItem = 'library' | 'favorites' | 'friends' | 'home';

interface BottomNavProps {
  active?: NavItem;
}

export default function BottomNav({ active = 'home' }: BottomNavProps) {

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 px-0 pb-0 pt-1 z-20"
      style={{
        backgroundImage: 'url(/assets/bluebar.svg)',
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="flex items-center justify-evenly w-full px-2 sm:px-4">
        {/* Home */}
        <Link
          href="/"
          className={`flex items-center justify-center flex-1 transition-all ${
            active === 'home' ? 'nav-icon active' : 'nav-icon'
          }`}
        >
          <Image
            src="/assets/homeicon.png"
            alt="Home"
            width={72}
            height={72}
            className={`w-16 h-16 sm:w-18 sm:h-18 object-contain transition-all ${
              active === 'home' ? 'scale-110' : ''
            }`}
          />
        </Link>

        {/* Library/Book */}
        <Link
          href="/library"
          className={`flex items-center justify-center flex-1 transition-all ${
            active === 'library' ? 'nav-icon active' : 'nav-icon'
          }`}
        >
          <Image
            src="/assets/libraryicon.png"
            alt="Library"
            width={72}
            height={72}
            className={`w-16 h-16 sm:w-18 sm:h-18 object-contain transition-all ${
              active === 'library' ? 'scale-110' : ''
            }`}
          />
        </Link>

        {/* Favorites/Heart */}
        <Link
          href="/favorites"
          className={`flex items-center justify-center flex-1 transition-all ${
            active === 'favorites' ? 'nav-icon active' : 'nav-icon'
          }`}
        >
          <Image
            src="/assets/hearticon.png"
            alt="Favorites"
            width={72}
            height={72}
            className={`w-16 h-16 sm:w-18 sm:h-18 object-contain transition-all ${
              active === 'favorites' ? 'scale-110' : ''
            }`}
          />
        </Link>

        {/* Friends */}
        <Link
          href="/friends"
          className={`flex items-center justify-center flex-1 transition-all ${
            active === 'friends' ? 'nav-icon active' : 'nav-icon'
          }`}
        >
          <Image
            src="/assets/friendsicon.png"
            alt="Friends"
            width={72}
            height={72}
            className={`w-16 h-16 sm:w-18 sm:h-18 object-contain transition-all ${
              active === 'friends' ? 'scale-110' : ''
            }`}
          />
        </Link>
      </div>
    </nav>
  );
}
