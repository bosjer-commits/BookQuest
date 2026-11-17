export interface GoogleBookResult {
  title: string;
  authors: string[];
  description?: string;
  imageLinks?: {
    small?: string;
    medium?: string;
    large?: string;
    extraLarge?: string;
    thumbnail?: string;
    smallThumbnail?: string;
  };
  publishedDate?: string;
  isbn?: string;
}

interface OpenLibrarySearchResult {
  docs?: Array<{
    title?: string;
    cover_i?: number;
    isbn?: string[];
  }>;
}

// Optional API key raises the very low anonymous Google Books quota.
// Restrict the key by HTTP referrer in Google Cloud so it can't be abused.
const GOOGLE_BOOKS_KEY = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY;
const keyParam = GOOGLE_BOOKS_KEY ? `&key=${GOOGLE_BOOKS_KEY}` : '';

export async function searchBook(title: string, author: string): Promise<GoogleBookResult | null> {
  try {
    // Try multiple search strategies in order of specificity
    const searchStrategies = [
      // Strategy 1: Exact title and author
      `intitle:"${encodeURIComponent(title)}"+inauthor:"${encodeURIComponent(author)}"`,
      // Strategy 2: Title and author without exact match
      `intitle:${encodeURIComponent(title)}+inauthor:${encodeURIComponent(author)}`,
      // Strategy 3: Just title with author as general query
      `"${encodeURIComponent(title)}"+${encodeURIComponent(author)}`,
      // Strategy 4: Just title
      `intitle:${encodeURIComponent(title)}`,
    ];

    for (const query of searchStrategies) {
      const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=5${keyParam}`;

      const response = await fetch(url);

      if (!response.ok) {
        console.error('Google Books API error:', response.status);
        continue;
      }

      const data = await response.json();

      if (!data.items || data.items.length === 0) {
        continue;
      }

      // Find the best match with an image
      for (const item of data.items) {
        const book = item.volumeInfo;

        // Check if this result has an image
        if (book.imageLinks && (book.imageLinks.thumbnail || book.imageLinks.smallThumbnail)) {
          // Verify it's a reasonable match (author should be somewhat similar)
          const bookAuthors = (book.authors || []).join(' ').toLowerCase();
          const searchAuthor = author.toLowerCase();

          // If author is in the result or very first strategy, accept it
          if (searchStrategies.indexOf(query) <= 1 || bookAuthors.includes(searchAuthor) || searchAuthor.includes(bookAuthors)) {
            return {
              title: book.title,
              authors: book.authors || [],
              description: book.description,
              imageLinks: book.imageLinks,
              publishedDate: book.publishedDate,
              isbn: book.industryIdentifiers?.[0]?.identifier,
            };
          }
        }
      }

      // If we found results but no images, return the first result anyway for description
      const firstBook = data.items[0].volumeInfo;
      return {
        title: firstBook.title,
        authors: firstBook.authors || [],
        description: firstBook.description,
        imageLinks: firstBook.imageLinks,
        publishedDate: firstBook.publishedDate,
        isbn: firstBook.industryIdentifiers?.[0]?.identifier,
      };
    }

    console.log(`No results found for: ${title} by ${author}`);
    return null;
  } catch (error) {
    console.error('Error fetching book from Google Books:', error);
    return null;
  }
}

export interface BookSearchItem {
  title: string;
  author: string;
  coverUrl: string | null;
  description?: string;
  year: number;
  totalPages: number;
  isbn?: string;
}

// Raised by callers to distinguish "quota exceeded" from "no results".
export class BookSearchRateLimitError extends Error {
  constructor() {
    super('Google Books rate limit exceeded');
    this.name = 'BookSearchRateLimitError';
  }
}

function parseVolumes(data: { items?: unknown[] }): BookSearchItem[] {
  const items = Array.isArray(data.items) ? data.items : [];
  const byKey = new Map<string, BookSearchItem>();
  const results: BookSearchItem[] = [];

  for (const raw of items) {
    const info = (raw as { volumeInfo?: Record<string, unknown> }).volumeInfo ?? {};
    const title = info.title as string | undefined;
    if (!title) continue;

    const author = ((info.authors as string[] | undefined) ?? []).join(', ') || 'Unknown';
    const key = `${title.toLowerCase()}|${author.toLowerCase()}`;

    const imageLinks = info.imageLinks as { thumbnail?: string; smallThumbnail?: string } | undefined;
    let cover: string | null = imageLinks?.thumbnail || imageLinks?.smallThumbnail || null;
    if (cover) {
      cover = cover.replace('http://', 'https://').replace('&edge=curl', '');
    }

    const published = info.publishedDate as string | undefined;
    const year = published ? parseInt(String(published).slice(0, 4), 10) || 0 : 0;

    const identifiers =
      (info.industryIdentifiers as { type?: string; identifier?: string }[] | undefined) ?? [];
    const isbn =
      identifiers.find((i) => i.type === 'ISBN_13')?.identifier ??
      identifiers.find((i) => i.type === 'ISBN_10')?.identifier;
    const description = info.description as string | undefined;
    const totalPages = (info.pageCount as number | undefined) ?? 0;

    // The same book often comes back as several editions. Keep one entry, but let a
    // later edition fill in whatever the first one lacked (most importantly the cover).
    const existing = byKey.get(key);
    if (existing) {
      if (!existing.coverUrl && cover) existing.coverUrl = cover;
      if (!existing.isbn && isbn) existing.isbn = isbn;
      if (!existing.totalPages && totalPages) existing.totalPages = totalPages;
      if (!existing.description && description) existing.description = description;
      if (!existing.year && year) existing.year = year;
      continue;
    }

    const item: BookSearchItem = { title, author, coverUrl: cover, description, year, totalPages, isbn };
    byKey.set(key, item);
    results.push(item);
  }

  return results;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Free-text search returning a de-duplicated list of results (for the "add any book" flow).
//
// The Google Books API is unreliable: it intermittently returns 0 results (and
// the odd 5xx) for queries that genuinely have matches. We retry a few times so
// a real book isn't reported as "not found" just because one request flaked out.
//
// Throws BookSearchRateLimitError on persistent 429s so the UI can be honest.
export async function searchBooks(query: string, maxResults = 12): Promise<BookSearchItem[]> {
  const q = query.trim();
  if (!q) return [];

  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
    q
  )}&maxResults=${maxResults}&printType=books${keyParam}`;

  const maxAttempts = 5;
  let sawOkEmpty = false; // a clean 200 that returned nothing (likely genuine no-match)
  let sawRateLimit = false;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    let response: Response;
    try {
      response = await fetch(url);
    } catch (error) {
      console.warn('Google Books search fetch failed, retrying:', error);
      await delay(250);
      continue;
    }

    if (response.status === 429) {
      sawRateLimit = true;
      await delay(300);
      continue;
    }
    if (!response.ok) {
      console.warn('Google Books search HTTP', response.status, '- retrying');
      await delay(300);
      continue;
    }

    let results: BookSearchItem[] = [];
    try {
      results = parseVolumes(await response.json());
    } catch (error) {
      console.warn('Google Books parse failed, retrying:', error);
      await delay(250);
      continue;
    }

    if (results.length > 0) return results;

    // 200 but empty — usually the flaky API; retry a couple more times before trusting it.
    sawOkEmpty = true;
    await delay(250);
  }

  // Exhausted retries. If we ever got a clean-but-empty response, treat it as a
  // real "no matches"; otherwise the endpoint was failing outright.
  if (sawOkEmpty) return [];
  if (sawRateLimit) throw new BookSearchRateLimitError();
  throw new Error('Google Books search failed after retries');
}

export function getBookCoverUrl(result: GoogleBookResult | null): string | null {
  if (!result?.imageLinks) return null;

  // Prefer the largest available image from Google Books.
  let url =
    result.imageLinks.extraLarge ||
    result.imageLinks.large ||
    result.imageLinks.medium ||
    result.imageLinks.small ||
    result.imageLinks.thumbnail ||
    result.imageLinks.smallThumbnail ||
    null;

  if (!url) return null;

  // Ensure HTTPS (Google Books sometimes returns HTTP URLs)
  url = url.replace('http://', 'https://');

  // Remove edge curl effect and request a higher zoom when possible.
  url = url.replace('&edge=curl', ''); // Remove edge curl effect
  if (url.includes('zoom=')) {
    url = url.replace(/zoom=\d+/g, 'zoom=2');
  } else {
    url += '&zoom=2';
  }

  return url;
}

function normalizeIsbn(isbn: string): string {
  return isbn.replace(/[^0-9Xx]/g, '').toUpperCase();
}

async function isImageAvailable(url: string): Promise<boolean> {
  try {
    const head = await fetch(url, { method: 'HEAD' });
    if (head.ok) return true;
    const get = await fetch(url);
    return get.ok;
  } catch (error) {
    console.warn('Image check failed:', error);
    return false;
  }
}

export async function fetchOpenLibraryCover(
  title: string,
  author: string,
  isbn?: string
): Promise<string | null> {
  try {
    if (isbn) {
      const normalized = normalizeIsbn(isbn);
      const isbnUrl = `https://covers.openlibrary.org/b/isbn/${normalized}-L.jpg`;
      if (await isImageAvailable(isbnUrl)) {
        return isbnUrl;
      }
    }

    const searchUrl = `https://openlibrary.org/search.json?title=${encodeURIComponent(
      title
    )}&author=${encodeURIComponent(author)}&limit=5`;
    const response = await fetch(searchUrl);
    if (!response.ok) {
      console.warn('Open Library search failed:', response.status);
      return null;
    }

    const data = (await response.json()) as OpenLibrarySearchResult;
    const doc = data.docs?.find((d) => d.cover_i) || data.docs?.[0];
    if (!doc) return null;

    if (doc.cover_i) {
      return `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
    }

    const docIsbn = doc.isbn?.[0];
    if (docIsbn) {
      const normalized = normalizeIsbn(docIsbn);
      return `https://covers.openlibrary.org/b/isbn/${normalized}-L.jpg`;
    }

    return null;
  } catch (error) {
    console.error('Open Library cover fetch failed:', error);
    return null;
  }
}

// Loads the image in the browser to see whether it really exists. Unlike fetch(),
// this is not subject to CORS, so it works for any cover host.
function imageLoads(url: string, timeoutMs = 6000): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);
  return new Promise((resolve) => {
    const img = new window.Image();
    const timer = setTimeout(() => resolve(false), timeoutMs);
    img.onload = () => {
      clearTimeout(timer);
      resolve(img.naturalWidth > 1);
    };
    img.onerror = () => {
      clearTimeout(timer);
      resolve(false);
    };
    img.src = url;
  });
}

// "The Hobbit: Or There and Back Again" and "the hobbit" should count as the same book.
function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .split(/[:(\u2013\u2014]/)[0]
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function sameTitle(a: string | undefined, b: string): boolean {
  if (!a) return false;
  const x = normalizeTitle(a);
  const y = normalizeTitle(b);
  return x.length > 0 && x === y;
}

const hasRealAuthor = (author: string) => {
  const a = author.trim().toLowerCase();
  return a.length > 0 && a !== 'unknown';
};

// Open Library cover for a book Google had no image for. Tries the ISBN first, then
// a title (+ author) search. Only accepts a search hit whose title really matches,
// so a kid doesn't end up with some other book's cover.
export async function findOpenLibraryCover(
  title: string,
  author: string,
  isbn?: string
): Promise<string | null> {
  try {
    if (isbn) {
      // default=false makes Open Library answer 404 instead of a blank placeholder.
      const isbnUrl = `https://covers.openlibrary.org/b/isbn/${normalizeIsbn(isbn)}-L.jpg?default=false`;
      if (await imageLoads(isbnUrl)) return isbnUrl;
    }

    const params = new URLSearchParams({ title, limit: '10', fields: 'title,cover_i' });
    if (hasRealAuthor(author)) params.set('author', author.split(',')[0].trim());
    const response = await fetch(`https://openlibrary.org/search.json?${params.toString()}`);
    if (!response.ok) return null;

    const data = (await response.json()) as OpenLibrarySearchResult;
    const match = data.docs?.find((d) => d.cover_i && sameTitle(d.title, title));
    return match ? `https://covers.openlibrary.org/b/id/${match.cover_i}-L.jpg` : null;
  } catch (error) {
    console.warn('Open Library cover lookup failed:', error);
    return null;
  }
}

// Best-effort cover for a book that was added without one (typed in by hand, or a
// search result with no image). Returns null when nothing trustworthy is found.
export async function findCover(title: string, author: string): Promise<string | null> {
  if (hasRealAuthor(author)) {
    const result = await searchBook(title, author);
    if (result && sameTitle(result.title, title)) {
      const url = getBookCoverUrl(result);
      if (url) return url;
    }
  }
  return findOpenLibraryCover(title, author);
}
