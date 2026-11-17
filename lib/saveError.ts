// Saves are optimistic: the screen updates first and the database write follows.
// When a write fails we raise this event so SaveErrorToast can tell the kid,
// instead of the change silently disappearing on the next load.
export const SAVE_ERROR_EVENT = 'bq:save-error';

export function onSaved(what: string) {
  return ({ error }: { error: unknown }) => {
    if (!error) return;
    console.error(`Failed to save ${what}:`, error);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event(SAVE_ERROR_EVENT));
    }
  };
}
