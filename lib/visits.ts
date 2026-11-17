import { createClient } from '@/lib/supabase/client';

// Usage log: one row each time a kid opens the app, so we can see who uses it and
// how often. Repeat opens within 30 minutes count as the same visit.
const VISIT_GAP_MS = 30 * 60 * 1000;

export function logVisit(userId: string) {
  if (typeof window === 'undefined') return;
  // Don't count development and testing on this machine.
  if (['localhost', '127.0.0.1'].includes(window.location.hostname)) return;

  const key = `bq:lastVisit:${userId}`;
  try {
    const last = Number(localStorage.getItem(key) ?? 0);
    if (Date.now() - last < VISIT_GAP_MS) return;
    localStorage.setItem(key, String(Date.now()));
  } catch {
    // Storage unavailable (private mode): still log, just without the 30-minute gap.
  }

  // Deliberately quiet on failure: a missed log entry must never bother the kid.
  createClient()
    .from('visits')
    .insert({ user_id: userId })
    .then(({ error }) => { if (error) console.warn('Visit not logged:', error.message); });
}
