'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import BottomNav from '@/components/BottomNav';
import CategorySelector from '@/components/CategorySelector';
import BookDisplay from '@/components/BookDisplay';
import BookInfoSection from '@/components/BookInfoSection';
import { prizeCategories } from '@/data/categories';
import { searchBook, getBookCoverUrl } from '@/lib/googleBooks';
import { useCurrentBook } from '@/contexts/CurrentBookContext';
import { useFavorites } from '@/contexts/FavoritesContext';

export default function LibraryPage() {
  const router = useRouter();
  const { setCurrentBook } = useCurrentBook();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [bookIndex, setBookIndex] = useState(0);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const currentCategory = prizeCategories[categoryIndex];
  const currentBook = currentCategory.books[bookIndex];

  const handleStartReading = () => {
    setCurrentBook(currentBook, coverUrl || undefined);
    router.push('/');
  };

  const toggleFavorite = () => {
    if (isFavorite(currentBook.title)) {
      removeFavorite(currentBook.title);
    } else {
      addFavorite(currentBook, coverUrl || undefined);
    }
  };

  // Fetch book cover and description when book changes
  useEffect(() => {
    const fetchBookData = async () => {
      setLoading(true);
      setCoverUrl(null);
      setDescription(null);

      const result = await searchBook(currentBook.title, currentBook.author);
      const url = getBookCoverUrl(result);

      setCoverUrl(url);
      setDescription(result?.description || null);
      setLoading(false);
    };

    fetchBookData();
  }, [bookIndex, currentBook.title, currentBook.author]);

  const nextCategory = () => {
    setCategoryIndex((prev) => (prev + 1) % prizeCategories.length);
    setBookIndex(0);
  };

  const prevCategory = () => {
    setCategoryIndex((prev) => (prev - 1 + prizeCategories.length) % prizeCategories.length);
    setBookIndex(0);
  };

  const nextBook = () => {
    setBookIndex((prev) => (prev + 1) % currentCategory.books.length);
  };

  const prevBook = () => {
    setBookIndex((prev) => (prev - 1 + currentCategory.books.length) % currentCategory.books.length);
  };

  return (
    <div className="h-full flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-start px-4 pt-1 pb-0 space-y-6">
        <CategorySelector
          category={currentCategory}
          bookCount={currentCategory.books.length}
          currentBookIndex={bookIndex}
          onPrevCategory={prevCategory}
          onNextCategory={nextCategory}
        />

        <BookDisplay
          title={currentBook.title}
          year={currentBook.year}
          coverUrl={coverUrl}
          loading={loading}
          onPrevBook={prevBook}
          onNextBook={nextBook}
          onInfoClick={() => setShowInfo(true)}
        />

        <BookInfoSection author={currentBook.author} title={currentBook.title} />
      </main>

      <BottomNav active="library" />

      {/* Info Overlay */}
      {showInfo && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
          onClick={() => setShowInfo(false)}
        >
          <div
            className="parchment-card p-6 w-full max-w-sm max-h-[70vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            style={{ minWidth: '300px' }}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="fantasy-header text-lg text-navy pr-8">{currentBook.title}</h3>
              <button
                onClick={() => setShowInfo(false)}
                className="w-8 h-8 rounded-full bg-navy border border-gold flex items-center justify-center hover:bg-navy-light transition-colors flex-shrink-0"
              >
                <span className="text-gold text-lg">×</span>
              </button>
            </div>

            <p className="text-sm text-brown-text mb-2">
              <strong>Author:</strong> {currentBook.author}
            </p>
            <p className="text-sm text-brown-text mb-2">
              <strong>Year:</strong> {currentBook.year}
            </p>
            {currentBook.ageRange && (
              <p className="text-sm text-brown-text mb-4">
                <strong>Age Range:</strong> {currentBook.ageRange}
              </p>
            )}

            {currentBook.summary ? (
              <div className="text-sm text-brown-text leading-relaxed mb-4">
                <strong>Summary:</strong>
                <p className="mt-2">{currentBook.summary}</p>
              </div>
            ) : description ? (
              <div className="text-sm text-brown-text leading-relaxed mb-4">
                <strong>Description:</strong>
                <p className="mt-2">
                  {description.length > 300
                    ? description.substring(0, 300) + '...'
                    : description}
                </p>
              </div>
            ) : (
              <p className="text-sm text-brown-text italic mb-4">No description available.</p>
            )}

            <button
              onClick={handleStartReading}
              className="w-full py-3 bg-navy border-2 border-gold rounded text-gold font-bold hover:bg-navy-light transition-colors"
            >
              Start Reading
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
