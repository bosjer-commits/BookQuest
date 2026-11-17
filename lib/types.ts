// Shared types for books as the app shows and stores them.

/** A book as listed in the award data files or picked from search. */
export interface Book {
  year: number;
  title: string;
  author: string;
  illustrator?: string;
  publisher?: string;
  cover?: string;
  summary?: string;
  ageRange?: string;
}

/** A book on a shelf: favorites, in progress, finished, or a friend's row. */
export interface ShelfBook {
  book: { title: string; author: string; year?: number };
  coverUrl?: string;
}

/** One row of the user_books table (see supabase/schema.sql). */
export interface UserBookRow {
  user_id: string;
  title: string;
  author: string;
  cover_url: string | null;
  book_year: number | null;
  is_favorite: boolean;
  favorited_at: number | null;
  reading_status: 'current' | 'in_progress' | 'finished' | null;
  current_page: number | null;
  total_pages: number | null;
  rating: number | null;
  updated_at: string;
}
