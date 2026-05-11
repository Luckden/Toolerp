import { create } from 'zustand'

type UiState = {
  compactMode: boolean
  toggleCompactMode: () => void
}

export const useUiStore = create<UiState>((set) => ({
  compactMode: false,
  toggleCompactMode: () =>
    set((state) => ({
      compactMode: !state.compactMode,
    })),
}))