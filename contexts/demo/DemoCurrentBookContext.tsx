'use client';

import { useState, useEffect, ReactNode } from 'react';
import { CurrentBookContext } from '@/contexts/CurrentBookContext';

interface DemoBook {
  year: number;
  title: string;
  author: string;
}

interface DemoCurrentBookData {
  book: DemoBook;
  progress: number;
  currentPage?: number;
  totalPages?: number;
  coverUrl?: string;
  rating?: number;
}

// Internal localStorage row shape (mirrors DB schema)
interface DemoBookRecord {
  title: string;
  author: string;
  book_year: number;
  cover_url?: string | null;
  reading_status?: 'current' | 'in_progress' | 'finished' | null;
  current_page?: number;
  total_pages?: number;
  rating?: number;
  is_favorite?: boolean;
  favorited_at?: number;
}

function booksKey(userId: string) {
  return `bq:demo:${userId}:books`;
}

function loadRecords(userId: string): DemoBookRecord[] {
  try {
    return JSON.parse(localStorage.getItem(booksKey(userId)) ?? '[]');
  } catch {
    return [];
  }
}

function saveRecords(userId: string, records: DemoBookRecord[]) {
  localStorage.setItem(booksKey(userId), JSON.stringify(records));
}

function recordToBookData(row: DemoBookRecord): DemoCurrentBookData {
  const safeTotal = Math.max(1, row.total_pages ?? 0);
  const safeCurrent = Math.min(Math.max(0, row.current_page ?? 0), safeTotal);
  const percent =
    row.reading_status === 'finished'
      ? 100
      : (row.total_pages ?? 0) > 0
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

function upsertRecord(userId: string, record: DemoBookRecord) {
  const all = loadRecords(userId);
  const idx = all.findIndex((b) => b.title === record.title);
  if (idx >= 0) {
    all[idx] = { ...all[idx], ...record };
  } else {
    all.push(record);
  }
  saveRecords(userId, all);
}

function patchRecord(userId: string, title: string, patch: Partial<DemoBookRecord>) {
  const all = loadRecords(userId);
  const idx = all.findIndex((b) => b.title === title);
  if (idx >= 0) {
    all[idx] = { ...all[idx], ...patch };
    saveRecords(userId, all);
  }
}

export function DemoCurrentBookProvider({
  children,
  userId,
}: {
  children: ReactNode;
  userId: string;
}) {
  const [currentBook, setCurrentBookState] = useState<DemoCurrentBookData | null>(null);
  const [inProgressBooks, setInProgressBooks] = useState<DemoCurrentBookData[]>([]);
  const [finishedBooks, setFinishedBooks] = useState<DemoCurrentBookData[]>([]);

  // Load from localStorage when userId changes
  useEffect(() => {
    const all = loadRecords(userId);
    const current = all.find((r) => r.reading_status === 'current');
    const inProgress = all.filter((r) => r.reading_status === 'in_progress');
    const finished = all.filter((r) => r.reading_status === 'finished');
    setCurrentBookState(current ? recordToBookData(current) : null);
    setInProgressBooks(inProgress.map(recordToBookData));
    setFinishedBooks(finished.map(recordToBookData));
  }, [userId]);

  const setCurrentBook = (book: DemoBook, coverUrl?: string) => {
    // Move old current to in_progress
    if (currentBook && currentBook.progress > 0) {
      setInProgressBooks((prev) => {
        const exists = prev.some((b) => b.book.title === currentBook.book.title);
        if (exists) return prev.map((b) => b.book.title === currentBook.book.title ? currentBook : b);
        return [...prev, currentBook];
      });
      patchRecord(userId, currentBook.book.title, { reading_status: 'in_progress' });
    }

    setInProgressBooks((prev) => prev.filter((b) => b.book.title !== book.title));

    const newBook: DemoCurrentBookData = {
      book,
      progress: 0,
      currentPage: 0,
      totalPages: 0,
      coverUrl,
      rating: 0,
    };
    setCurrentBookState(newBook);
    upsertRecord(userId, {
      title: book.title,
      author: book.author,
      book_year: book.year,
      cover_url: coverUrl ?? null,
      reading_status: 'current',
      current_page: 0,
      total_pages: 0,
      rating: 0,
    });
  };

  const updateProgress = (progress: number) => {
    if (!currentBook) return;
    setCurrentBookState({ ...currentBook, progress: Math.min(100, Math.max(0, progress)) });
  };

  const updateReadingProgress = (currentPage: number, totalPages: number) => {
    if (!currentBook) return;
    const safeTotal = Math.max(1, totalPages);
    const safeCurrent = Math.min(Math.max(0, currentPage), safeTotal);
    const percent = Math.round((safeCurrent / safeTotal) * 100);
    setCurrentBookState({
      ...currentBook,
      currentPage: safeCurrent,
      totalPages: safeTotal,
      progress: Math.min(100, Math.max(0, percent)),
    });
    patchRecord(userId, currentBook.book.title, {
      current_page: safeCurrent,
      total_pages: safeTotal,
    });
  };

  const updateRating = (rating: number) => {
    if (!currentBook) return;
    const safeRating = Math.min(5, Math.max(0, rating));
    setCurrentBookState({ ...currentBook, rating: safeRating });
    patchRecord(userId, currentBook.book.title, { rating: safeRating });
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

    const finishedBook: DemoCurrentBookData = {
      ...currentBook,
      currentPage: safeCurrent,
      totalPages: safeTotal,
      progress: 100,
      rating: safeRating,
    };

    setFinishedBooks((prev) => {
      const exists = prev.some((b) => b.book.title === finishedBook.book.title);
      if (exists) return prev.map((b) => b.book.title === finishedBook.book.title ? finishedBook : b);
      return [...prev, finishedBook];
    });
    setInProgressBooks((prev) => prev.filter((b) => b.book.title !== finishedBook.book.title));
    setCurrentBookState(null);
    upsertRecord(userId, {
      title: currentBook.book.title,
      author: currentBook.book.author,
      book_year: currentBook.book.year,
      cover_url: currentBook.coverUrl ?? null,
      reading_status: 'finished',
      current_page: safeCurrent,
      total_pages: safeTotal,
      rating: safeRating,
    });
  };

  const clearCurrentBook = () => {
    if (currentBook) {
      setFinishedBooks((prev) => {
        const exists = prev.some((b) => b.book.title === currentBook.book.title);
        if (exists) return prev;
        return [...prev, currentBook];
      });
      setInProgressBooks((prev) => prev.filter((b) => b.book.title !== currentBook.book.title));
      patchRecord(userId, currentBook.book.title, { reading_status: 'finished' });
    }
    setCurrentBookState(null);
  };

  const removeInProgressBook = (bookTitle: string) => {
    setInProgressBooks((prev) => prev.filter((b) => b.book.title !== bookTitle));
    patchRecord(userId, bookTitle, { reading_status: null });
  };

  const removeFinishedBook = (bookTitle: string) => {
    setFinishedBooks((prev) => prev.filter((b) => b.book.title !== bookTitle));
    patchRecord(userId, bookTitle, { reading_status: null });
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
