'use client';

type CoverOverrides = {
  byTitleAuthor: Record<string, string>;
  byIsbn: Record<string, string>;
};

const coverOverrides: CoverOverrides = {
  byTitleAuthor: {
    'de mare van de witte toren|alet schouten': '/covers/de-mare-van-de-witte-toren.jpg',
  },
  byIsbn: {
    // '9780123456789': '/covers/example.jpg',
  },
};

const normalizeTitleAuthor = (title: string, author: string) =>
  `${title.trim().toLowerCase()}|${author.trim().toLowerCase()}`;

const normalizeIsbn = (isbn: string) => isbn.replace(/[^0-9Xx]/g, '').toUpperCase();

export function getCoverOverrideByTitleAuthor(title: string, author: string): string | null {
  const key = normalizeTitleAuthor(title, author);
  return coverOverrides.byTitleAuthor[key] || null;
}

export function getCoverOverrideByIsbn(isbn: string): string | null {
  const key = normalizeIsbn(isbn);
  return coverOverrides.byIsbn[key] || null;
}
