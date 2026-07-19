'use client';

import { useState, useEffect, useRef } from 'react';
import { searchBooks, BookSearchRateLimitError, type BookSearchItem } from '@/lib/googleBooks';

export interface PickedBook {
  title: string;
  author: string;
  year: number;
  coverUrl?: string;
  totalPages?: number;
}

interface BookSearchModalProps {
  onClose: () => void;
  onPick: (book: PickedBook) => void;
}

const GOLD = '#F6D58A';
const BLUE = '#74B9FF';

export default function BookSearchModal({ onClose, onPick }: BookSearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<BookSearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [manual, setManual] = useState(false);
  const [mTitle, setMTitle] = useState('');
  const [mAuthor, setMAuthor] = useState('');
  const [mPages, setMPages] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced search as the user types
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = query.trim();
    if (q.length < 3) {
      setResults([]);
      setSearched(false);
      setLoading(false);
      setErrorMsg(null);
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    debounceRef.current = setTimeout(async () => {
      try {
        const items = await searchBooks(q);
        setResults(items);
        setErrorMsg(null);
      } catch (e) {
        setResults([]);
        setErrorMsg(
          e instanceof BookSearchRateLimitError
            ? 'Book search is over its daily limit right now. You can still add a book manually below.'
            : 'Search is unavailable right now. You can still add a book manually below.'
        );
      } finally {
        setSearched(true);
        setLoading(false);
      }
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const pickResult = (item: BookSearchItem) => {
    onPick({
      title: item.title,
      author: item.author,
      year: item.year,
      coverUrl: item.coverUrl ?? undefined,
      totalPages: item.totalPages,
    });
  };

  const submitManual = () => {
    const title = mTitle.trim();
    if (!title) return;
    const pages = parseInt(mPages, 10);
    onPick({
      title,
      author: mAuthor.trim() || 'Unknown',
      year: 0,
      totalPages: Number.isNaN(pages) ? undefined : pages,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'var(--navy)' }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-2">
        <h2
          className="flex-1 text-lg font-bold brawl-text"
          style={{
            color: GOLD,
            textShadow: '-2px 0 #5A3C12, 2px 0 #5A3C12, 0 -2px #5A3C12, 0 2px #5A3C12',
          }}
        >
          {manual ? 'Add a Book' : 'Find a Book'}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(22,37,68,0.85)', border: `2px solid ${BLUE}` }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
              fill={BLUE}
            />
          </svg>
        </button>
      </div>

      {manual ? (
        /* ---- Manual entry form ---- */
        <div className="flex-1 overflow-y-auto px-5 pt-2 flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-bold brawl-text" style={{ color: GOLD }}>Title</span>
            <input
              value={mTitle}
              onChange={(e) => setMTitle(e.target.value)}
              autoFocus
              className="rounded-xl px-3 py-3 text-white outline-none"
              style={{ background: 'rgba(116,185,255,0.08)', border: `2px solid ${BLUE}` }}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-bold brawl-text" style={{ color: GOLD }}>Author</span>
            <input
              value={mAuthor}
              onChange={(e) => setMAuthor(e.target.value)}
              className="rounded-xl px-3 py-3 text-white outline-none"
              style={{ background: 'rgba(116,185,255,0.08)', border: `2px solid ${BLUE}` }}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-bold brawl-text" style={{ color: GOLD }}>Total pages (optional)</span>
            <input
              value={mPages}
              onChange={(e) => setMPages(e.target.value.replace(/[^0-9]/g, ''))}
              inputMode="numeric"
              className="rounded-xl px-3 py-3 text-white outline-none w-32"
              style={{ background: 'rgba(116,185,255,0.08)', border: `2px solid ${BLUE}` }}
            />
          </label>

          <button
            type="button"
            onClick={submitManual}
            disabled={!mTitle.trim()}
            className="mt-2 rounded-full py-3 font-bold brawl-text"
            style={{
              background: 'linear-gradient(to bottom, #FDCB6E 0%, #F0A500 100%)',
              color: '#5A3C12',
              opacity: mTitle.trim() ? 1 : 0.5,
            }}
          >
            Start Reading
          </button>
          <button
            type="button"
            onClick={() => setManual(false)}
            className="text-sm font-bold"
            style={{ color: BLUE }}
          >
            ← Back to search
          </button>
        </div>
      ) : (
        /* ---- Search ---- */
        <>
          <div className="px-4">
            <div
              className="flex items-center gap-2 rounded-full px-4 py-2"
              style={{ background: 'rgba(116,185,255,0.08)', border: `2px solid ${BLUE}` }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="11" cy="11" r="7" stroke={BLUE} strokeWidth="2" />
                <path d="M20 20l-3.5-3.5" stroke={BLUE} strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
                placeholder="Search any book by title or author…"
                className="flex-1 bg-transparent text-white outline-none text-sm"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pt-3 pb-4">
            {loading && (
              <p className="text-center text-sm brawl-text pt-6" style={{ color: BLUE }}>
                Searching…
              </p>
            )}

            {!loading && errorMsg && (
              <p className="text-center text-sm brawl-text pt-6 px-4" style={{ color: '#FFB4A0' }}>
                {errorMsg}
              </p>
            )}

            {!loading && !errorMsg && searched && results.length === 0 && (
              <p className="text-center text-sm brawl-text pt-6" style={{ color: 'rgba(116,185,255,0.6)' }}>
                No matches found.
              </p>
            )}

            {!loading && query.trim().length > 0 && query.trim().length < 3 && (
              <p className="text-center text-sm brawl-text pt-6" style={{ color: 'rgba(116,185,255,0.6)' }}>
                Type a bit more to search…
              </p>
            )}

            <div className="flex flex-col gap-2">
              {results.map((item, i) => (
                <button
                  key={`${item.title}-${i}`}
                  type="button"
                  data-testid="search-result"
                  onClick={() => pickResult(item)}
                  className="flex items-center gap-3 rounded-xl p-2 text-left"
                  style={{ background: 'rgba(22,37,68,0.6)', border: '1px solid rgba(116,185,255,0.25)' }}
                >
                  <div
                    className="shrink-0 rounded overflow-hidden flex items-center justify-center"
                    style={{ width: 44, height: 62, background: 'rgba(116,185,255,0.12)' }}
                  >
                    {item.coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.coverUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl" style={{ color: 'rgba(255,255,255,0.4)' }}>📖</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white truncate">{item.title}</div>
                    <div className="text-xs truncate" style={{ color: BLUE }}>{item.author}</div>
                    {item.year > 0 && (
                      <div className="text-[10px]" style={{ color: 'rgba(116,185,255,0.6)' }}>{item.year}</div>
                    )}
                  </div>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
                    <path d="M9 6l6 6-6 6" stroke={GOLD} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* Manual fallback */}
          <div className="px-4 pb-5 pt-1 text-center">
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>Can&apos;t find it? </span>
            <button
              type="button"
              onClick={() => setManual(true)}
              className="text-xs font-bold underline"
              style={{ color: GOLD }}
            >
              Add manually
            </button>
          </div>
        </>
      )}
    </div>
  );
}
