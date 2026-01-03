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
    cover_i?: number;
    isbn?: string[];
  }>;
}

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
      const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=5`;

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
