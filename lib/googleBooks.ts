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

export interface CoverCandidate {
  /** The image saved as the book's cover. */
  url: string;
  /** A smaller version of the same image, for showing many at once. */
  thumb: string;
}

async function googleCoverCandidates(query: string): Promise<string[]> {
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
    query
  )}&maxResults=20&printType=books${keyParam}`;

  // Same flakiness as searchBooks: retry a few times before giving up.
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        const data = (await response.json()) as {
          items?: { volumeInfo?: { imageLinks?: { thumbnail?: string; smallThumbnail?: string } } }[];
        };
        const covers = (data.items ?? [])
          .map((item) => item.volumeInfo?.imageLinks?.thumbnail || item.volumeInfo?.imageLinks?.smallThumbnail)
          .filter((link): link is string => Boolean(link))
          .map((link) => link.replace('http://', 'https://').replace('&edge=curl', ''));
        if (covers.length > 0) return covers;
      }
    } catch (error) {
      console.warn('Google Books cover search failed:', error);
    }
    await delay(250);
  }
  return [];
}

async function openLibraryCoverCandidates(query: string): Promise<number[]> {
  try {
    const params = new URLSearchParams({ q: query, limit: '20', fields: 'cover_i' });
    const response = await fetch(`https://openlibrary.org/search.json?${params.toString()}`);
    if (!response.ok) return [];
    const data = (await response.json()) as OpenLibrarySearchResult;
    return (data.docs ?? []).map((d) => d.cover_i).filter((id): id is number => Boolean(id));
  } catch (error) {
    console.warn('Open Library cover search failed:', error);
    return [];
  }
}

// Apple Books has real cover art for most ebooks. Searched in the Dutch, Swedish and
// US stores, since the kids read in all three languages.
async function appleCoverCandidates(query: string): Promise<CoverCandidate[]> {
  const perCountry = await Promise.all(
    ['nl', 'se', 'us'].map(async (country) => {
      try {
        const params = new URLSearchParams({ term: query, media: 'ebook', country, limit: '10' });
        const response = await fetch(`https://itunes.apple.com/search?${params.toString()}`);
        if (!response.ok) return [];
        const data = (await response.json()) as { results?: { artworkUrl100?: string }[] };
        return (data.results ?? [])
          .map((r) => r.artworkUrl100)
          .filter((art): art is string => Boolean(art))
          .map((art) => ({
            url: art.replace('100x100bb', '600x600bb'),
            thumb: art.replace('100x100bb', '300x300bb'),
          }));
      } catch (error) {
        console.warn('Apple Books cover search failed:', error);
        return [];
      }
    })
  );
  return interleave(perCountry);
}

// Takes one from each list in turn, so no single source fills the first rows.
function interleave<T>(lists: T[][]): T[] {
  const out: T[] = [];
  const longest = Math.max(0, ...lists.map((l) => l.length));
  for (let i = 0; i < longest; i += 1) {
    for (const list of lists) if (i < list.length) out.push(list[i]);
  }
  return out;
}

// Google Books often has no real cover and returns a scan of the title page instead:
// a white page with black letters. This spots those by looking at the pixels
// (through /api/cover-proxy, because the browser may not read another site's image).
function isPlainPage(url: string): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);
  return new Promise((resolve) => {
    const img = new window.Image();
    const timer = setTimeout(() => resolve(false), 7000);
    const finish = (plain: boolean) => {
      clearTimeout(timer);
      resolve(plain);
    };
    img.onerror = () => finish(false);
    img.onload = () => {
      try {
        const w = 24;
        const h = 36;
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return finish(false);
        ctx.drawImage(img, 0, 0, w, h);
        const { data } = ctx.getImageData(0, 0, w, h);
        let paper = 0;
        let colourless = 0;
        for (let i = 0; i < data.length; i += 4) {
          const max = Math.max(data[i], data[i + 1], data[i + 2]);
          const min = Math.min(data[i], data[i + 1], data[i + 2]);
          if (max - min < 30) {
            colourless += 1;
            if (max > 180) paper += 1;
          }
        }
        const total = w * h;
        finish(paper / total > 0.7 && colourless / total > 0.9);
      } catch {
        finish(false);
      }
    };
    img.src = `/api/cover-proxy?url=${encodeURIComponent(url)}`;
  });
}

async function coversForQuery(q: string): Promise<CoverCandidate[]> {
  const [apple, openLibraryIds, googleUrls] = await Promise.all([
    appleCoverCandidates(q),
    openLibraryCoverCandidates(q),
    googleCoverCandidates(q),
  ]);

  const openLibrary = openLibraryIds.map((id) => ({
    url: `https://covers.openlibrary.org/b/id/${id}-L.jpg`,
    thumb: `https://covers.openlibrary.org/b/id/${id}-M.jpg`,
  }));

  // Title-page scans are dropped entirely: a page of text is never a useful cover.
  const plainFlags = await Promise.all(googleUrls.map(isPlainPage));
  const google = googleUrls.filter((_, i) => !plainFlags[i]).map((url) => ({ url, thumb: url }));

  // Mixed across sources, so no single one fills the first rows.
  return interleave([apple, openLibrary, google]);
}

// Covers to choose from for a free-text query (normally "title author").
// Unlike findCover this does not try to pick the right one: the kid does that by eye.
export async function findCoverCandidates(query: string, max = 30): Promise<CoverCandidate[]> {
  const words = query
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);
  if (words.length === 0) return [];

  // A misspelt or over-specific title finds little. When that happens, try again
  // with the last word dropped (up to twice), which usually lands on the series.
  let candidates: CoverCandidate[] = [];
  for (let attempt = 0; attempt < 3 && words.length > 0; attempt += 1) {
    const found = await coversForQuery(words.join(' '));
    candidates = [...candidates, ...found];
    if (candidates.length >= 6) break;
    words.pop();
    if (words.join('').length < 3) break;
  }

  const seen = new Set<string>();
  return candidates
    .filter((c) => (seen.has(c.url) ? false : (seen.add(c.url), true)))
    .slice(0, max);
}
