'use client';

import { useState, useEffect, ReactNode } from 'react';
import { FavoritesContext } from '@/contexts/FavoritesContext';

interface DemoBook {
  year: number;
  title: string;
  author: string;
  illustrator?: string;
  cover?: string;
  summary?: string;
  ageRange?: string;
}

interface DemoFavoriteBook {
  book: DemoBook;
  coverUrl?: string;
  addedAt: number;
}

interface DemoBookRecord {
  title: string;
  author: string;
  book_year: number;
  cover_url?: string | null;
  is_favorite?: boolean;
  favorited_at?: number;
  reading_status?: string | null;
  [key: string]: unknown;
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

export function DemoFavoritesProvider({
  children,
  userId,
}: {
  children: ReactNode;
  userId: string;
}) {
  const [favorites, setFavorites] = useState<DemoFavoriteBook[]>([]);

  // Load from localStorage when userId changes
  useEffect(() => {
    const all = loadRecords(userId);
    const favs = all
      .filter((r) => r.is_favorite)
      .sort((a, b) => (b.favorited_at ?? 0) - (a.favorited_at ?? 0));
    setFavorites(
      favs.map((row) => ({
        book: { year: row.book_year ?? 0, title: row.title, author: row.author },
        coverUrl: row.cover_url ?? undefined,
        addedAt: row.favorited_at ?? 0,
      }))
    );
  }, [userId]);

  const addFavorite = (book: DemoBook, coverUrl?: string) => {
    const addedAt = Date.now();
    setFavorites((prev) => {
      if (prev.some((fav) => fav.book.title === book.title)) return prev;
      return [...prev, { book, coverUrl, addedAt }];
    });

    const all = loadRecords(userId);
    const idx = all.findIndex((r) => r.title === book.title);
    if (idx >= 0) {
      all[idx] = { ...all[idx], is_favorite: true, favorited_at: addedAt };
    } else {
      all.push({
        title: book.title,
        author: book.author,
        book_year: book.year,
        cover_url: coverUrl ?? null,
        is_favorite: true,
        favorited_at: addedAt,
      });
    }
    saveRecords(userId, all);
  };

  const removeFavorite = (bookTitle: string) => {
    setFavorites((prev) => prev.filter((fav) => fav.book.title !== bookTitle));

    const all = loadRecords(userId);
    const idx = all.findIndex((r) => r.title === bookTitle);
    if (idx >= 0) {
      all[idx] = { ...all[idx], is_favorite: false, favorited_at: undefined };
      saveRecords(userId, all);
    }
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
