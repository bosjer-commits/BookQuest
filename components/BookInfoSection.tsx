'use client';

import Image from 'next/image';

interface BookInfoSectionProps {
  author: string;
  title: string;
}

export default function BookInfoSection({ author, title }: BookInfoSectionProps) {
  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Decorative Bars with Heart */}
      <div className="flex items-center justify-center gap-3">
        <Image src="/assets/littleyellowbar.svg" alt="" width={100} height={10} />
        <Image
          src="/assets/fullheart.png"
          alt=""
          width={40}
          height={40}
          className="object-contain"
        />
        <Image src="/assets/littleyellowbar.svg" alt="" width={100} height={10} />
      </div>

      {/* Author Name */}
      <div className="text-white text-base font-bold text-center brawl-text px-4">
        {author}
      </div>

      {/* Book Title */}
      <div className="text-white text-xl font-bold text-center brawl-text px-4">
        {title}
      </div>

      {/* Bottom Decorative Bar */}
      <div className="flex items-center justify-center">
        <Image src="/assets/littleyellowbar.svg" alt="" width={200} height={10} />
      </div>
    </div>
  );
}
