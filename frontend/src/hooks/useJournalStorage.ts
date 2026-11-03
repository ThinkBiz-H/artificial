import { useEffect, useState } from "react";

/**
 * Re-reads a per-browser journal value (bookmarks, likes, recently viewed)
 * whenever it changes — in this tab (custom event) or another tab (storage).
 */
export function useJournalStorage<T>(read: () => T): T {
  const [value, setValue] = useState<T>(read);
  useEffect(() => {
    const refresh = () => setValue(read());
    window.addEventListener("journal-storage", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("journal-storage", refresh);
      window.removeEventListener("storage", refresh);
    };
    // `read` is a stable module function at every call site.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return value;
}
