'use client';

import { useEffect, useState } from 'react';
import { SAVE_ERROR_EVENT } from '@/lib/saveError';

// Shown briefly when a change couldn't be written to the database.
export default function SaveErrorToast() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const show = () => {
      setVisible(true);
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => setVisible(false), 6000);
    };
    window.addEventListener(SAVE_ERROR_EVENT, show);
    return () => {
      window.removeEventListener(SAVE_ERROR_EVENT, show);
      if (timer) clearTimeout(timer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      role="alert"
      className="fixed left-1/2 -translate-x-1/2 top-3 z-[60] w-[calc(100%-24px)] max-w-[400px] rounded-xl px-4 py-3 text-center text-sm font-bold text-white"
      style={{
        background: 'rgba(176,42,42,0.96)',
        border: '2px solid #FF6B6B',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
      }}
      onClick={() => setVisible(false)}
    >
      That didn&apos;t save. Check the internet and try again.
    </div>
  );
}
