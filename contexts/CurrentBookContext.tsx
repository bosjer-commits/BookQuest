'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  coverUrl?: string;
  rating?: number;
}

interface CurrentBookContextType {
  currentBook: CurrentBookData | null;
  inProgressBooks: CurrentBookData[];
  finishedBooks: CurrentBookData[];
  setCurrentBook: (book: Book, coverUrl?: string) => void;
  updateProgress: (progress: number) => void;
  updateRating: (rating: number) => void;
  clearCurrentBook: () => void;
  removeInProgressBook: (bookTitle: string) => void;
  removeFinishedBook: (bookTitle: string) => void;
}

const CurrentBookContext = createContext<CurrentBookContextType | undefined>(undefined);

export function CurrentBookProvider({ children }: { children: ReactNode }) {
  const [currentBook, setCurrentBookState] = useState<CurrentBookData | null>(null);
  const [inProgressBooks, setInProgressBooks] = useState<CurrentBookData[]>([]);
  const [finishedBooks, setFinishedBooks] = useState<CurrentBookData[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('currentBook');
    const savedInProgress = localStorage.getItem('inProgressBooks');
    const savedFinished = localStorage.getItem('finishedBooks');

    if (saved) {
      try {
        setCurrentBookState(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved book:', e);
      }
    }

    if (savedInProgress) {
      try {
        setInProgressBooks(JSON.parse(savedInProgress));
      } catch (e) {
        console.error('Failed to parse in-progress books:', e);
      }
    }

    if (savedFinished) {
      try {
        setFinishedBooks(JSON.parse(savedFinished));
      } catch (e) {
        console.error('Failed to parse finished books:', e);
      }
    }
  }, []);

  // Save to localStorage whenever currentBook changes
  useEffect(() => {
    if (currentBook) {
      localStorage.setItem('currentBook', JSON.stringify(currentBook));
    } else {
      localStorage.removeItem('currentBook');
    }
  }, [currentBook]);

  // Save to localStorage whenever inProgressBooks changes
  useEffect(() => {
    localStorage.setItem('inProgressBooks', JSON.stringify(inProgressBooks));
  }, [inProgressBooks]);

  // Save to localStorage whenever finishedBooks changes
  useEffect(() => {
    localStorage.setItem('finishedBooks', JSON.stringify(finishedBooks));
  }, [finishedBooks]);

  const setCurrentBook = (book: Book, coverUrl?: string) => {
    // If there's a current book with progress, save it to in-progress
    if (currentBook && currentBook.progress > 0) {
      setInProgressBooks((prev) => {
        // Don't add if already in progress
        const exists = prev.some((b) => b.book.title === currentBook.book.title);
        if (exists) {
          // Update existing
          return prev.map((b) =>
            b.book.title === currentBook.book.title ? currentBook : b
          );
        }
        // Add new
        return [...prev, currentBook];
      });
    }

    setCurrentBookState({
      book,
      progress: 0,
      coverUrl,
      rating: 0
    });
  };

  const updateProgress = (progress: number) => {
    if (currentBook) {
      setCurrentBookState({
        ...currentBook,
        progress: Math.min(100, Math.max(0, progress))
      });
    }
  };

  const updateRating = (rating: number) => {
    if (currentBook) {
      setCurrentBookState({
        ...currentBook,
        rating: Math.min(5, Math.max(0, rating))
      });
    }
  };

  const clearCurrentBook = () => {
    // Save current book to finished books before clearing
    if (currentBook) {
      setFinishedBooks((prev) => {
        // Don't add if already finished
        const exists = prev.some((b) => b.book.title === currentBook.book.title);
        if (exists) {
          return prev;
        }
        return [...prev, currentBook];
      });

      // Remove from in-progress if it exists there
      setInProgressBooks((prev) => prev.filter((b) => b.book.title !== currentBook.book.title));
    }

    setCurrentBookState(null);
  };

  const removeInProgressBook = (bookTitle: string) => {
    setInProgressBooks((prev) => prev.filter((b) => b.book.title !== bookTitle));
  };

  const removeFinishedBook = (bookTitle: string) => {
    setFinishedBooks((prev) => prev.filter((b) => b.book.title !== bookTitle));
  };

  return (
    <CurrentBookContext.Provider value={{ currentBook, inProgressBooks, finishedBooks, setCurrentBook, updateProgress, updateRating, clearCurrentBook, removeInProgressBook, removeFinishedBook }}>
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
