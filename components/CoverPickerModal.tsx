'use client';

import { useEffect, useRef, useState } from 'react';
import { findCoverCandidates, type CoverCandidate } from '@/lib/googleBooks';
import { BLUE, GOLD, GOLD_OUTLINE } from '@/lib/theme';

interface CoverPickerModalProps {
  title: string;
  author: string;
  onPick: (coverUrl: string) => void;
  onClose: () => void;
}

// Full-screen picker: shows covers found for a book and lets the kid tap one.
export default function CoverPickerModal({ title, author, onPick, onClose }: CoverPickerModalProps) {
  const knownAuthor = author && author.toLowerCase() !== 'unknown' ? author.split(',')[0] : '';
  const [query, setQuery] = useState(`${title} ${knownAuthor}`.trim());
  const [covers, setCovers] = useState<CoverCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const seqRef = useRef(0);

  // Search when opened and again (after a pause) whenever the words change.
  useEffect(() => {
    const seq = ++seqRef.current;
    const timer = setTimeout(async () => {
      setLoading(true);
      const found = await findCoverCandidates(query);
      if (seq !== seqRef.current) return; // a newer search superseded this one
      setCovers(found);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div
      className="fixed inset-0 z-[55] flex flex-col"
      style={{ background: 'var(--navy)' }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-2 px-4 pt-4 pb-2">
        <h2
          className="flex-1 text-lg font-bold brawl-text"
          style={{ color: GOLD, textShadow: GOLD_OUTLINE }}
        >
          Choose a cover
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
            aria-label="Words to search covers for"
            className="flex-1 bg-transparent text-white outline-none text-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-5">
        {loading && (
          <p className="text-center text-sm brawl-text pt-6" style={{ color: BLUE }}>
            Looking for covers…
          </p>
        )}

        {!loading && covers.length === 0 && (
          <p className="text-center text-sm brawl-text pt-6 px-4" style={{ color: 'rgba(116,185,255,0.7)' }}>
            No covers found. Try changing the words above.
          </p>
        )}

        {!loading && covers.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {covers.map((cover) => (
              <button
                key={cover.url}
                type="button"
                data-testid="cover-option"
                onClick={() => onPick(cover.url)}
                className="rounded-lg overflow-hidden"
                style={{
                  aspectRatio: '2 / 3',
                  background: 'rgba(116,185,255,0.12)',
                  border: '2px solid rgba(116,185,255,0.35)',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cover.thumb}
                  alt=""
                  loading="lazy"
                  className="w-full h-full object-cover"
                  // A cover that fails to load is removed rather than left as an empty box.
                  onError={() => setCovers((prev) => prev.filter((c) => c.url !== cover.url))}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
