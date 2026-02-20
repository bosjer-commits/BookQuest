'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Book {
  year: number;
  title: string;
  author: string;
  illustrator?: string;
  cover?: string;
  summary?: string;
  ageRange?: string;
}

interface CurrentBookData {
  book: Book;
  progress: number;
  currentPage?: number;
  totalPages?: number;
  coverUrl?: string;
  rating?: number;
}

interface CurrentBookContextType {
  currentBook: CurrentBookData | null;
  inProgressBooks: CurrentBookData[];
  finishedBooks: CurrentBookData[];
  setCurrentBook: (book: Book, coverUrl?: string) => void;
  updateProgress: (progress: number) => void;
  updateReadingProgress: (currentPage: number, totalPages: number) => void;
  updateRating: (rating: number) => void;
  finishCurrentBook: (currentPage?: number, totalPages?: number, rating?: number) => void;
  clearCurrentBook: () => void;
  removeInProgressBook: (bookTitle: string) => void;
  removeFinishedBook: (bookTitle: string) => void;
}

// Map a DB row to CurrentBookData
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToBookData(row: any): CurrentBookData {
  const safeTotal = Math.max(1, row.total_pages ?? 0);
  const safeCurrent = Math.min(Math.max(0, row.current_page ?? 0), safeTotal);
  const percent =
    row.reading_status === 'finished'
      ? 100
      : row.total_pages > 0
      ? Math.round((safeCurrent / safeTotal) * 100)
      : 0;
  return {
    book: { year: row.book_year ?? 0, title: row.title, author: row.author },
    progress: percent,
    currentPage: safeCurrent,
    totalPages: row.total_pages ?? 0,
    coverUrl: row.cover_url ?? undefined,
    rating: row.rating ?? 0,
  };
}

const CurrentBookContext = createContext<CurrentBookContextType | undefined>(undefined);

export function CurrentBookProvider({ children, userId }: { children: ReactNode; userId: string }) {
  const [currentBook, setCurrentBookState] = useState<CurrentBookData | null>(null);
  const [inProgressBooks, setInProgressBooks] = useState<CurrentBookData[]>([]);
  const [finishedBooks, setFinishedBooks] = useState<CurrentBookData[]>([]);
  const supabase = createClient();

  // Load from Supabase on mount / userId change
  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('user_books')
        .select('*')
        .eq('user_id', userId)
        .not('reading_status', 'is', null);

      if (error) {
        console.error('Failed to load books:', error);
        return;
      }

      const current = data?.find((r) => r.reading_status === 'current');
      const inProgress = data?.filter((r) => r.reading_status === 'in_progress') ?? [];
      const finished = data?.filter((r) => r.reading_status === 'finished') ?? [];

      setCurrentBookState(current ? rowToBookData(current) : null);
      setInProgressBooks(inProgress.map(rowToBookData));
      setFinishedBooks(finished.map(rowToBookData));
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const setCurrentBook = (book: Book, coverUrl?: string) => {
    // Move old current book to in-progress (if it had progress)
    if (currentBook && currentBook.progress > 0) {
      setInProgressBooks((prev) => {
        const exists = prev.some((b) => b.book.title === currentBook.book.title);
        if (exists) {
          return prev.map((b) =>
            b.book.title === currentBook.book.title ? currentBook : b
          );
        }
        return [...prev, currentBook];
      });
      // Sync old current → in_progress in DB
      supabase
        .from('user_books')
        .update({ reading_status: 'in_progress', updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('title', currentBook.book.title)
        .then(({ error }) => { if (error) console.error(error); });
    }

    // Remove new book from in-progress state (it's becoming current)
    setInProgressBooks((prev) => prev.filter((b) => b.book.title !== book.title));

    const newBook: CurrentBookData = {
      book,
      progress: 0,
      currentPage: 0,
      totalPages: 0,
      coverUrl,
      rating: 0,
    };
    setCurrentBookState(newBook);

    // Upsert new book as current
    supabase
      .from('user_books')
      .upsert(
        {
          user_id: userId,
          title: book.title,
          author: book.author,
          cover_url: coverUrl ?? null,
          book_year: book.year,
          reading_status: 'current',
          current_page: 0,
          total_pages: 0,
          rating: 0,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,title' }
      )
      .then(({ error }) => { if (error) console.error(error); });
  };

  const updateProgress = (progress: number) => {
    if (!currentBook) return;
    const updated = { ...currentBook, progress: Math.min(100, Math.max(0, progress)) };
    setCurrentBookState(updated);
  };

  const updateReadingProgress = (currentPage: number, totalPages: number) => {
    if (!currentBook) return;
    const safeTotal = Math.max(1, totalPages);
    const safeCurrent = Math.min(Math.max(0, currentPage), safeTotal);
    const percent = Math.round((safeCurrent / safeTotal) * 100);
    const updated = {
      ...currentBook,
      currentPage: safeCurrent,
      totalPages: safeTotal,
      progress: Math.min(100, Math.max(0, percent)),
    };
    setCurrentBookState(updated);

    // Sync to Supabase
    supabase
      .from('user_books')
      .update({
        current_page: safeCurrent,
        total_pages: safeTotal,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('title', currentBook.book.title)
      .then(({ error }) => { if (error) console.error(error); });
  };

  const updateRating = (rating: number) => {
    if (!currentBook) return;
    const safeRating = Math.min(5, Math.max(0, rating));
    setCurrentBookState({ ...currentBook, rating: safeRating });

    supabase
      .from('user_books')
      .update({ rating: safeRating, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('title', currentBook.book.title)
      .then(({ error }) => { if (error) console.error(error); });
  };

  const finishCurrentBook = (currentPage?: number, totalPages?: number, rating?: number) => {
    if (!currentBook) return;
    const safeTotal = totalPages
      ? Math.max(1, totalPages)
      : Math.max(1, currentBook.totalPages ?? 1);
    const safeCurrent =
      currentPage !== undefined
        ? Math.min(Math.max(0, currentPage), safeTotal)
        : Math.min(Math.max(0, currentBook.currentPage ?? 0), safeTotal);
    const safeRating =
      rating !== undefined
        ? Math.min(5, Math.max(0, rating))
        : Math.min(5, Math.max(0, currentBook.rating ?? 0));

    const finishedBook: CurrentBookData = {
      ...currentBook,
      currentPage: safeCurrent,
      totalPages: safeTotal,
      progress: 100,
      rating: safeRating,
    };

    setFinishedBooks((prev) => {
      const exists = prev.some((b) => b.book.title === finishedBook.book.title);
      if (exists) {
        return prev.map((b) =>
          b.book.title === finishedBook.book.title ? finishedBook : b
        );
      }
      return [...prev, finishedBook];
    });
    setInProgressBooks((prev) =>
      prev.filter((b) => b.book.title !== finishedBook.book.title)
    );
    setCurrentBookState(null);

    // Sync to Supabase
    supabase
      .from('user_books')
      .upsert(
        {
          user_id: userId,
          title: currentBook.book.title,
          author: currentBook.book.author,
          cover_url: currentBook.coverUrl ?? null,
          book_year: currentBook.book.year,
          reading_status: 'finished',
          current_page: safeCurrent,
          total_pages: safeTotal,
          rating: safeRating,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,title' }
      )
      .then(({ error }) => { if (error) console.error(error); });
  };

  const clearCurrentBook = () => {
    if (currentBook) {
      setFinishedBooks((prev) => {
        const exists = prev.some((b) => b.book.title === currentBook.book.title);
        if (exists) return prev;
        return [...prev, currentBook];
      });
      setInProgressBooks((prev) =>
        prev.filter((b) => b.book.title !== currentBook.book.title)
      );

      // Sync to Supabase
      supabase
        .from('user_books')
        .update({ reading_status: 'finished', updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('title', currentBook.book.title)
        .then(({ error }) => { if (error) console.error(error); });
    }
    setCurrentBookState(null);
  };

  const removeInProgressBook = (bookTitle: string) => {
    setInProgressBooks((prev) => prev.filter((b) => b.book.title !== bookTitle));

    supabase
      .from('user_books')
      .update({ reading_status: null, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('title', bookTitle)
      .then(({ error }) => { if (error) console.error(error); });
  };

  const removeFinishedBook = (bookTitle: string) => {
    setFinishedBooks((prev) => prev.filter((b) => b.book.title !== bookTitle));

    supabase
      .from('user_books')
      .update({ reading_status: null, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('title', bookTitle)
      .then(({ error }) => { if (error) console.error(error); });
  };

  return (
    <CurrentBookContext.Provider
      value={{
        currentBook,
        inProgressBooks,
        finishedBooks,
        setCurrentBook,
        updateProgress,
        updateReadingProgress,
        updateRating,
        finishCurrentBook,
        clearCurrentBook,
        removeInProgressBook,
        removeFinishedBook,
      }}
    >
      {children}
    </CurrentBookContext.Provider>
  );
}

export function useCurrentBook() {
  const context = useContext(CurrentBookContext);
  if (context === undefined) {
    throw new Error('useCurrentBook must be used within a CurrentBookProvider');
  }
  return context;
}
