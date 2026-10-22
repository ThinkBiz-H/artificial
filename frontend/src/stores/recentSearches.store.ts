import { create } from "zustand";
import { persist } from "zustand/middleware";

const MAX_ITEMS = 6;

interface RecentSearchesState {
  items: string[];
  add: (query: string) => void;
  remove: (query: string) => void;
  clear: () => void;
}

/** The shopper's own recent search terms, per browser (works for guests too). */
export const useRecentSearchesStore = create<RecentSearchesState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (query) => {
        const q = query.trim();
        if (q.length < 2) return;
        set({ items: [q, ...get().items.filter((i) => i.toLowerCase() !== q.toLowerCase())].slice(0, MAX_ITEMS) });
      },
      remove: (query) => set({ items: get().items.filter((i) => i !== query) }),
      clear: () => set({ items: [] }),
    }),
    { name: "recent_searches" },
  ),
);
