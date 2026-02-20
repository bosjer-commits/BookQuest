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

export function FavoritesProvider({ children, userId }: { children: ReactNode; userId: string }) {
  const [favorites, setFavorites] = useState<FavoriteBook[]>([]);
  const supabase = createClient();

  // Load from Supabase on mount / userId change
  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('user_books')
        .select('title, author, cover_url, book_year, favorited_at')
        .eq('user_id', userId)
        .eq('is_favorite', true)
        .order('favorited_at', { ascending: false });

      if (error) {
        console.error('Failed to load favorites:', error);
        return;
      }

      setFavorites(
        (data ?? []).map((row) => ({
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
      .then(({ error }) => {
        if (error) console.error('Failed to save favorite:', error);
      });
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
      .then(({ error }) => {
        if (error) console.error('Failed to remove favorite:', error);
      });
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
