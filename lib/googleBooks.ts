export interface GoogleBookResult {
  title: string;
  authors: string[];
  description?: string;
  imageLinks?: {
    thumbnail?: string;
    smallThumbnail?: string;
  };
  publishedDate?: string;
  isbn?: string;
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

  // Prefer larger thumbnail, fall back to small
  let url = result.imageLinks.thumbnail || result.imageLinks.smallThumbnail || null;

  if (!url) return null;

  // Ensure HTTPS (Google Books sometimes returns HTTP URLs)
  url = url.replace('http://', 'https://');

  // Remove zoom parameter and request larger image
  // Default is zoom=1, but we can request zoom=0 for better quality
  url = url.replace('&edge=curl', ''); // Remove edge curl effect
  if (!url.includes('zoom=')) {
    url += '&zoom=0';
  }

  return url;
}
