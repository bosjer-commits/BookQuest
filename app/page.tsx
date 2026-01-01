'use client';

import { useState, useEffect } from 'react';
import BottomNav from '@/components/BottomNav';
import CategorySelector from '@/components/CategorySelector';
import BookDisplay from '@/components/BookDisplay';
import BookInfoSection from '@/components/BookInfoSection';
import { prizeCategories } from '@/data/categories';
import { searchBook, getBookCoverUrl } from '@/lib/googleBooks';

export default function Home() {
  const [showProgressEdit, setShowProgressEdit] = useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [showBookInfo, setShowBookInfo] = useState(false);
  const [currentPage, setCurrentPage] = useState('');
  const [totalPages, setTotalPages] = useState('');

  // Navigation state
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [bookIndex, setBookIndex] = useState(0);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const currentCategory = prizeCategories[categoryIndex];
  const displayBook = currentCategory.books[bookIndex];

  // Category navigation
  const nextCategory = () => {
    setCategoryIndex((prev) => (prev + 1) % prizeCategories.length);
    setBookIndex(0); // Reset to first book in new category
  };

  const prevCategory = () => {
    setCategoryIndex((prev) => (prev - 1 + prizeCategories.length) % prizeCategories.length);
    setBookIndex(0); // Reset to first book in new category
  };

  // Book navigation
  const nextBook = () => {
    setBookIndex((prev) => (prev + 1) % currentCategory.books.length);
  };

  const prevBook = () => {
    setBookIndex((prev) => (prev - 1 + currentCategory.books.length) % currentCategory.books.length);
  };

  // Fetch book cover when book changes
  useEffect(() => {
    const fetchBookCover = async () => {
      setLoading(true);
      setCoverUrl(null);
      const result = await searchBook(displayBook.title, displayBook.author);
      const url = getBookCoverUrl(result);
      setCoverUrl(url);
      setLoading(false);
    };

    fetchBookCover();
  }, [displayBook.title, displayBook.author]);

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
          title={displayBook.title}
          year={displayBook.year}
          coverUrl={coverUrl}
          loading={loading}
          onPrevBook={prevBook}
          onNextBook={nextBook}
          onInfoClick={() => setShowBookInfo(true)}
        />

        <BookInfoSection author={displayBook.author} title={displayBook.title} />
      </main>

      <BottomNav active="home" />

      {/* Book Info Modal */}
      {showBookInfo && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
          onClick={() => setShowBookInfo(false)}
        >
          <div
            className="parchment-card p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="fantasy-header text-xl text-navy mb-4">{displayBook.title}</h3>
            <div className="space-y-3">
              <p className="text-brown-text">
                <span className="font-semibold">Author:</span> {displayBook.author}
              </p>
              <p className="text-brown-text">
                <span className="font-semibold">Year:</span> {displayBook.year}
              </p>
              <p className="text-brown-text">
                <span className="font-semibold">Category:</span> {currentCategory.name}
              </p>
            </div>
            <button
              onClick={() => setShowBookInfo(false)}
              className="mt-6 w-full px-4 py-2 bg-navy border-2 border-gold rounded text-gold hover:bg-navy-light transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Progress Edit Modal */}
      {showProgressEdit && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
          onClick={() => setShowProgressEdit(false)}
        >
          <div
            className="parchment-card p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
            style={{ minWidth: '320px' }}
          >
            <h3 className="fantasy-header text-xl text-navy mb-6">Update Progress</h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-brown-text block mb-2">Current Page</label>
                <input
                  type="number"
                  min="0"
                  value={currentPage}
                  onChange={(e) => setCurrentPage(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-navy rounded bg-parchment text-navy focus:outline-none focus:ring-2 focus:ring-navy"
                  placeholder="e.g., 45"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-sm text-brown-text block mb-2">Total Pages</label>
                <input
                  type="number"
                  min="1"
                  value={totalPages}
                  onChange={(e) => setTotalPages(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-navy rounded bg-parchment text-navy focus:outline-none focus:ring-2 focus:ring-navy"
                  placeholder="e.g., 300"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowProgressEdit(false)}
                  className="flex-1 px-4 py-2 border-2 border-gold rounded text-brown-text hover:bg-gold hover:bg-opacity-10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const current = parseInt(currentPage);
                    const total = parseInt(totalPages);
                    if (!isNaN(current) && !isNaN(total) && total > 0) {
                      const percentage = Math.round((current / total) * 100);
                      updateProgress(percentage);
                    }
                    setShowProgressEdit(false);
                  }}
                  className="flex-1 px-4 py-2 bg-navy border-2 border-gold rounded text-gold hover:bg-navy-light transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Finish Reading Confirmation Modal */}
      {showFinishConfirm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
          onClick={() => setShowFinishConfirm(false)}
        >
          <div
            className="parchment-card p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
            style={{ minWidth: '320px' }}
          >
            <h3 className="fantasy-header text-xl text-navy mb-4">Finish Reading</h3>
            <p className="text-brown-text mb-6">
              Are you sure you want to mark this book as finished? This will clear your current reading progress.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowFinishConfirm(false)}
                className="flex-1 px-4 py-2 border-2 border-gold rounded text-brown-text hover:bg-gold hover:bg-opacity-10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearCurrentBook();
                  setShowFinishConfirm(false);
                }}
                className="flex-1 px-4 py-2 bg-navy border-2 border-gold rounded text-gold hover:bg-navy-light transition-colors"
              >
                Finish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
