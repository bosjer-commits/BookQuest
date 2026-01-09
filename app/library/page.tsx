'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import BottomNav from '@/components/BottomNav';
import CategorySelector from '@/components/CategorySelector';
import BookDisplay from '@/components/BookDisplay';
import BookInfoSection from '@/components/BookInfoSection';
import { prizeCategories } from '@/data/categories';
import { searchBook, getBookCoverUrl, fetchOpenLibraryCover } from '@/lib/googleBooks';
import { getCoverOverrideByIsbn, getCoverOverrideByTitleAuthor } from '@/data/coverOverrides';
import { useCurrentBook } from '@/contexts/CurrentBookContext';
import { useFavorites } from '@/contexts/FavoritesContext';

function LibraryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const didInitFromQuery = useRef(false);
  const { setCurrentBook } = useCurrentBook();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [bookIndex, setBookIndex] = useState(0);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const coverCacheKey = 'bookquest_cover_cache_v1';
  const coverCacheTtlMs = 90 * 24 * 60 * 60 * 1000;

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

  const getCachedCover = (key: string): string | null => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { url: string; ts: number };
      if (!parsed?.url || !parsed?.ts) return null;
      if (Date.now() - parsed.ts > coverCacheTtlMs) {
        localStorage.removeItem(key);
        return null;
      }
      return parsed.url;
    } catch (error) {
      console.warn('Cover cache read failed:', error);
      return null;
    }
  };

  const setCachedCover = (key: string, url: string) => {
    try {
      localStorage.setItem(key, JSON.stringify({ url, ts: Date.now() }));
    } catch (error) {
      console.warn('Cover cache write failed:', error);
    }
  };

  const makeTitleAuthorKey = (title: string, author: string) =>
    `${coverCacheKey}:title:${title.toLowerCase().trim()}|author:${author.toLowerCase().trim()}`;
  const makeIsbnKey = (isbn: string) =>
    `${coverCacheKey}:isbn:${isbn.replace(/[^0-9Xx]/g, '').toUpperCase()}`;

  // Fetch book cover and description when book changes
  useEffect(() => {
    const fetchBookData = async () => {
      setLoading(true);
      setCoverUrl(null);
      setDescription(null);

      const titleAuthorKey = makeTitleAuthorKey(currentBook.title, currentBook.author);
      const overrideTitleAuthor = getCoverOverrideByTitleAuthor(
        currentBook.title,
        currentBook.author
      );
      if (overrideTitleAuthor) {
        setCoverUrl(overrideTitleAuthor);
        setLoading(false);
        return;
      }
      const cachedTitleAuthor = getCachedCover(titleAuthorKey);
      if (cachedTitleAuthor) {
        setCoverUrl(cachedTitleAuthor);
        setLoading(false);
        return;
      }

      const result = await searchBook(currentBook.title, currentBook.author);
      const url = getBookCoverUrl(result);

      const isbn = result?.isbn;
      const overrideIsbn = isbn ? getCoverOverrideByIsbn(isbn) : null;
      if (isbn) {
        const cachedIsbn = getCachedCover(makeIsbnKey(isbn));
        if (cachedIsbn) {
          setCoverUrl(cachedIsbn);
          setDescription(result?.description || null);
          setLoading(false);
          return;
        }
      }

      let finalUrl = overrideIsbn || url;
      if (!finalUrl) {
        finalUrl = await fetchOpenLibraryCover(
          currentBook.title,
          currentBook.author,
          isbn
        );
      }

      setCoverUrl(finalUrl);
      setDescription(result?.description || null);
      setLoading(false);

      if (finalUrl) {
        setCachedCover(titleAuthorKey, finalUrl);
        if (isbn) {
          setCachedCover(makeIsbnKey(isbn), finalUrl);
        }
      }
    };

    fetchBookData();
  }, [bookIndex, currentBook.title, currentBook.author]);

  useEffect(() => {
    if (didInitFromQuery.current) return;
    const title = searchParams.get('title');
    const author = searchParams.get('author');
    if (!title || !author) return;

    const decodedTitle = decodeURIComponent(title);
    const decodedAuthor = decodeURIComponent(author);

    for (let i = 0; i < prizeCategories.length; i += 1) {
      const bookIdx = prizeCategories[i].books.findIndex(
        (book) =>
          book.title.toLowerCase() === decodedTitle.toLowerCase() &&
          book.author.toLowerCase() === decodedAuthor.toLowerCase()
      );
      if (bookIdx !== -1) {
        setCategoryIndex(i);
        setBookIndex(bookIdx);
        didInitFromQuery.current = true;
        break;
      }
    }
  }, [searchParams]);

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
    <div className="min-h-full flex flex-col">
      <main
        className="flex-1 flex flex-col items-center justify-start px-4 pt-0 pb-0 space-y-6"
        style={{ transform: 'translateY(-24px)', paddingBottom: '96px' }}
      >
        <CategorySelector
          category={currentCategory}
          bookCount={currentCategory.books.length}
          currentBookIndex={bookIndex}
          onPrevCategory={prevCategory}
          onNextCategory={nextCategory}
        />

        <div className="flex flex-col items-center space-y-4 -mt-5">
          <BookDisplay
            title={currentBook.title}
            year={currentBook.year}
            coverUrl={coverUrl}
            loading={loading}
            onPrevBook={prevBook}
            onNextBook={nextBook}
            onInfoClick={() => setShowInfo(true)}
          />

          <BookInfoSection
            author={currentBook.author}
            title={currentBook.title}
            isFavorite={isFavorite(currentBook.title)}
            onToggleFavorite={toggleFavorite}
          />
        </div>
      </main>

      <BottomNav active="library" />

      {/* Info Overlay */}
      {showInfo && (
        <div
          className="fixed inset-0 bg-[var(--navy)] flex items-center justify-center z-50 p-4"
          onClick={() => setShowInfo(false)}
        >
          <div
            className="relative w-[320px] h-[520px]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src="/assets/infobg.png"
              alt=""
              fill
              className="object-fill scale-[1.1] pointer-events-none"
              sizes="320px"
            />

            <button
              onClick={() => setShowInfo(false)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full border-2 border-[#E5C26B] text-[#E5C26B] text-lg leading-none flex items-center justify-center bg-[#2B4E6E]"
              aria-label="Close info"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                  fill="#E5C26B"
                />
              </svg>
            </button>

            <div className="absolute inset-0 px-6 py-10 flex flex-col items-center text-center">
              <div className="w-full flex-1 flex flex-col items-center">
                <h3
                  className="text-[26px] font-bold brawl-text"
                  style={{
                    color: '#F6D58A',
                    textShadow:
                      '-2px 0 #5A3C12, 2px 0 #5A3C12, 0 -2px #5A3C12, 0 2px #5A3C12',
                  }}
                >
                  {currentBook.title}
                </h3>

                <div className="mt-3 space-y-1 text-[16px] font-bold text-[#F6D58A] brawl-text">
                  <div>Author: {currentBook.author}</div>
                  <div>Year: {currentBook.year}</div>
                  {currentBook.ageRange && <div>Age Range: {currentBook.ageRange}</div>}
                </div>

                <div className="relative mt-[60px] w-full flex-1 flex items-center justify-center">
                <Image
                  src="/assets/infobox.png"
                  alt=""
                  fill
                  className="object-contain scale-[1.1] pointer-events-none"
                  sizes="280px"
                />
                  <div className="absolute inset-[32px] flex items-center justify-center text-center">
                    <div className="w-full max-h-full text-[14px] text-[#F6D58A] leading-relaxed overflow-y-auto">
                      {currentBook.summary
                        ? currentBook.summary
                        : description
                          ? description.length > 300
                            ? description.substring(0, 300) + '...'
                            : description
                          : 'No description available.'}
                    </div>
                  </div>
                </div>
              </div>

              <button onClick={handleStartReading} className="mt-4 w-[200px] relative">
                <Image
                  src="/assets/start.png"
                  alt="Start Reading"
                  width={1187}
                  height={295}
                  className="w-full h-auto"
                />
                <span className="absolute inset-0 flex items-center justify-center text-[18px] font-bold text-[#5A3C12]">
                  Read
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LibraryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-white">Loading...</div></div>}>
      <LibraryContent />
    </Suspense>
  );
}
