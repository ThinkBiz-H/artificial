import { create } from "zustand";

interface UiState {
  isMobileNavOpen: boolean;
  isCartDrawerOpen: boolean;
  isSearchOpen: boolean;
  setMobileNavOpen: (v: boolean) => void;
  setCartDrawerOpen: (v: boolean) => void;
  setSearchOpen: (v: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  isMobileNavOpen: false,
  isCartDrawerOpen: false,
  isSearchOpen: false,
  setMobileNavOpen: (v) => set({ isMobileNavOpen: v }),
  setCartDrawerOpen: (v) => set({ isCartDrawerOpen: v }),
  setSearchOpen: (v) => set({ isSearchOpen: v }),
}));
