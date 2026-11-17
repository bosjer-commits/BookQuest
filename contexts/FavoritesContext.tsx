'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { loadUserBooks } from '@/lib/userBooks';
import type { Book } from '@/lib/types';
import { onSaved } from '@/lib/saveError';

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
  /** True when the saved data couldn't be loaded (e.g. the database is unreachable). */
  loadError?: boolean;
}

export const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children, userId }: { children: ReactNode; userId: string }) {
  const [favorites, setFavorites] = useState<FavoriteBook[]>([]);
  const [loadError, setLoadError] = useState(false);
  const supabase = createClient();

  // Load from Supabase on mount / userId change
  useEffect(() => {
    async function load() {
      const { rows, failed } = await loadUserBooks(userId);
      if (failed) {
        setLoadError(true);
        return;
      }

      const favoriteRows = rows
        .filter((row) => row.is_favorite)
        .sort((a, b) => (b.favorited_at ?? 0) - (a.favorited_at ?? 0));

      setFavorites(
        favoriteRows.map((row) => ({
          book: { year: row.book_year ?? 0, title: row.title, author: row.author },
          coverUrl: row.cover_url ?? undefined,
          addedAt: row.favorited_at ?? Date.now(),
        }))
      );
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const addFavorite = (book: Book, coverUrl?: string) => {
    const addedAt = Date.now();

    // Optimistic update
    setFavorites((prev) => {
      if (prev.some((fav) => fav.book.title === book.title)) return prev;
      return [...prev, { book, coverUrl, addedAt }];
    });

    // Sync to Supabase (upsert so we don't overwrite reading progress columns)
    supabase
      .from('user_books')
      .upsert(
        {
          user_id: userId,
          title: book.title,
          author: book.author,
          cover_url: coverUrl ?? null,
          book_year: book.year,
          is_favorite: true,
          favorited_at: addedAt,
        },
        { onConflict: 'user_id,title' }
      )
      .then(onSaved('favorite'));
  };

  const removeFavorite = (bookTitle: string) => {
    // Optimistic update
    setFavorites((prev) => prev.filter((fav) => fav.book.title !== bookTitle));

    // Sync to Supabase
    supabase
      .from('user_books')
      .update({ is_favorite: false, favorited_at: null })
      .eq('user_id', userId)
      .eq('title', bookTitle)
      .then(onSaved('favorite'));
  };

  const isFavorite = (bookTitle: string) => {
    return favorites.some((fav) => fav.book.title === bookTitle);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite, loadError }}>
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
