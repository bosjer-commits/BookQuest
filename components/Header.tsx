import Image from 'next/image';

export default function Header() {
  return (
    <header className="w-full bg-navy py-6 px-6 border-b-2 border-gold">
      <div className="flex justify-center">
        <Image
          src="/assets/bookquestlogonew.png"
          alt="Book Quest"
          width={200}
          height={80}
          className="object-contain"
          priority
        />
      </div>
    </header>
  );
}
