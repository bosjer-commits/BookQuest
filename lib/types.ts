export type UserRole = 'parent' | 'kid'
export type LanguagePreference = 'dutch' | 'swedish' | 'english'
export type BookStatus = 'favorites' | 'in_progress' | 'finished'

export interface Profile {
  id: string
  display_name: string
  role: UserRole
  language_preference: LanguagePreference
  avatar_url?: string
  currently_reading_book_id?: string
  created_at: string
}

export interface Book {
  id: string
  user_id: string
  title: string
  author?: string
  cover_url?: string
  year_published?: number
  description?: string
  total_pages?: number
  status: BookStatus
  pages_read: number
  rating?: number
  started_at?: string
  finished_at?: string
  created_at: string
  updated_at: string
}

export interface Friendship {
  id: string
  user_id_1: string
  user_id_2: string
  created_at: string
}

export interface BookCollection {
  id: string
  name: string
  description?: string
  language: 'dutch' | 'swedish' | 'english' | 'all'
  created_by?: string
  created_at: string
}

export interface CollectionBook {
  id: string
  collection_id: string
  title: string
  author?: string
  cover_url?: string
  year_published?: number
  description?: string
  total_pages?: number
  created_at: string
}

export interface GoogleBook {
  id: string
  title: string
  authors?: string[]
  thumbnail?: string
  pageCount?: number
  publishedDate?: string
  description?: string
}
