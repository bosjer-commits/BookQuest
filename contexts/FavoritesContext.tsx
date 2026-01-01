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

interface FavoriteBook {
  book: Book;
  coverUrl?: string;
  addedAt: number;
}

interface FavoritesContextType {
  favorites: FavoriteBook[];
  addFavorite: (book: Book, coverUrl?: string) => void;
  removeFavorite: (bookTitle: string) => void;
  isFavorite: (bookTitle: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteBook[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('favorites');
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved favorites:', e);
      }
    }
  }, []);

  // Save to localStorage whenever favorites change
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const addFavorite = (book: Book, coverUrl?: string) => {
    setFavorites((prev) => {
      // Don't add if already exists
      if (prev.some((fav) => fav.book.title === book.title)) {
        return prev;
      }
      return [...prev, { book, coverUrl, addedAt: Date.now() }];
    });
  };

  const removeFavorite = (bookTitle: string) => {
    setFavorites((prev) => prev.filter((fav) => fav.book.title !== bookTitle));
  };

  const isFavorite = (bookTitle: string) => {
    return favorites.some((fav) => fav.book.title === bookTitle);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
