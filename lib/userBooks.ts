import { createClient } from '@/lib/supabase/client';
import type { UserBookRow } from '@/lib/types';

type Result = { rows: UserBookRow[]; failed: boolean };

// The reading-progress and favorites providers both need a user's book rows and
// mount at the same moment. They share one request instead of each making their own.
const inFlight = new Map<string, Promise<Result>>();

export function loadUserBooks(userId: string): Promise<Result> {
  let request = inFlight.get(userId);
  if (!request) {
    request = (async () => {
      const { data, error } = await createClient()
        .from('user_books')
        .select('*')
        .eq('user_id', userId);
      if (error) console.error('Failed to load books:', error);
      return { rows: (data ?? []) as UserBookRow[], failed: Boolean(error) };
    })();
    inFlight.set(userId, request);
    request.finally(() => inFlight.delete(userId));
  }
  return request;
}
