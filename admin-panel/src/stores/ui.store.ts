import { create } from "zustand";

interface UiState {
  isSidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  isSidebarOpen: false,
  setSidebarOpen: (v) => set({ isSidebarOpen: v }),
}));
