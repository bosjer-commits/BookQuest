'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import BottomNav from '@/components/BottomNav';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useCurrentBook } from '@/contexts/CurrentBookContext';

interface BookCardProps {
  book: any;
  coverUrl?: string;
  onRemove: () => void;
  onStartReading: () => void;
  showProgress?: boolean;
  progress?: number;
}

function BookCard({ book, coverUrl, onRemove, onStartReading, showProgress, progress }: BookCardProps) {
  return (
    <div className="parchment-card p-2 flex-shrink-0" style={{ width: 'calc(33.333% - 8px)' }}>
      {/* Book Cover */}
      <div className="w-full aspect-[2/3] bg-navy border-2 border-gold rounded shadow-md overflow-hidden mb-2 relative">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={book.title}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-navy-light to-navy-dark flex items-center justify-center p-2">
            <div className="text-center">
              <p className="text-gold text-xs font-bold line-clamp-3">
                {book.title}
              </p>
            </div>
          </div>
        )}

        {/* Remove Heart Button */}
        <button
          onClick={onRemove}
          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-parchment bg-opacity-90 flex items-center justify-center hover:bg-opacity-100 transition-all"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="#c41e3a"
            stroke="#c41e3a"
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      {/* Book Info */}
      <h3 className="text-navy text-xs font-bold line-clamp-2 mb-1">
        {book.title}
      </h3>
      <p className="text-brown-text text-xs line-clamp-1 mb-2">
        {book.author}
      </p>

      {/* Progress Bar if applicable */}
      {showProgress && progress !== undefined && (
        <div className="progress-bar-container mb-2">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
      )}

      {/* Start Reading Button */}
      <button
        onClick={onStartReading}
        className="w-full py-1.5 bg-navy border border-gold rounded text-gold text-xs hover:bg-navy-light transition-colors"
      >
        Start Reading
      </button>
    </div>
  );
}

interface CategorySectionProps {
  title: string;
  books: any[];
  emptyMessage: string;
  onRemove: (title: string) => void;
  onStartReading: (book: any, coverUrl?: string) => void;
  showProgress?: boolean;
}

function CategorySection({ title, books, emptyMessage, onRemove, onStartReading, showProgress }: CategorySectionProps) {
  const [startIndex, setStartIndex] = useState(0);
  const visibleBooks = books.slice(startIndex, startIndex + 3);
  const canGoBack = startIndex > 0;
  const canGoForward = startIndex + 3 < books.length;

  return (
    <div className="mb-6">
      <h2 className="fantasy-header text-lg text-navy mb-3">{title}</h2>

      {books.length === 0 ? (
        <div className="parchment-card p-4 text-center">
          <p className="text-brown-text text-sm">{emptyMessage}</p>
        </div>
      ) : (
        <div className="relative">
          {/* Left Arrow */}
          {canGoBack && (
            <button
              onClick={() => setStartIndex(Math.max(0, startIndex - 3))}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 w-8 h-8 rounded-full bg-navy border-2 border-gold flex items-center justify-center hover:bg-navy-light transition-colors z-10"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gold">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          )}

          {/* Books */}
          <div className="flex gap-3">
            {visibleBooks.map((item, index) => (
              <BookCard
                key={index}
                book={showProgress ? item.book : item.book}
                coverUrl={item.coverUrl}
                onRemove={() => onRemove(showProgress ? item.book.title : item.book.title)}
                onStartReading={() => onStartReading(showProgress ? item.book : item.book, item.coverUrl)}
                showProgress={showProgress}
                progress={showProgress ? item.progress : undefined}
              />
            ))}
          </div>

          {/* Right Arrow */}
          {canGoForward && (
            <button
              onClick={() => setStartIndex(Math.min(books.length - 3, startIndex + 3))}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 w-8 h-8 rounded-full bg-navy border-2 border-gold flex items-center justify-center hover:bg-navy-light transition-colors z-10"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gold">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function FavoritesPage() {
  const router = useRouter();
  const { favorites, removeFavorite } = useFavorites();
  const { inProgressBooks, finishedBooks, setCurrentBook, removeInProgressBook, removeFinishedBook } = useCurrentBook();

  const handleStartReading = (book: any, coverUrl?: string) => {
    setCurrentBook(book, coverUrl);
    router.push('/');
  };

  return (
    <div className="h-full flex flex-col">
      <main className="flex-1 px-6 py-4">
        <h1 className="fantasy-header text-2xl text-navy mb-6 text-center">Favorites</h1>

        {/* Favorites Category */}
        <CategorySection
          title="Favorited"
          books={favorites}
          emptyMessage="No favorites yet. Tap the heart icon in the library to add books."
          onRemove={removeFavorite}
          onStartReading={handleStartReading}
        />

        {/* In Progress Category */}
        <CategorySection
          title="In Progress"
          books={inProgressBooks}
          emptyMessage="No books in progress yet."
          onRemove={removeInProgressBook}
          onStartReading={handleStartReading}
          showProgress={true}
        />

        {/* Finished Category */}
        <CategorySection
          title="Finished"
          books={finishedBooks}
          emptyMessage="No finished books yet."
          onRemove={removeFinishedBook}
          onStartReading={handleStartReading}
          showProgress={true}
        />
      </main>

      <BottomNav active="favorites" />
    </div>
  );
}
