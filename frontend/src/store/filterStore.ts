import { create } from 'zustand'

interface FilterState {
  origin: string
  siStatus: string
  activityType: string
  hasActiveJira: boolean
  setOrigin: (v: string) => void
  setSiStatus: (v: string) => void
  setActivityType: (v: string) => void
  setHasActiveJira: (v: boolean) => void
  reset: () => void
}

export const useFilterStore = create<FilterState>(set => ({
  origin: '',
  siStatus: '',
  activityType: '',
  hasActiveJira: false,
  setOrigin: (v) => set({ origin: v }),
  setSiStatus: (v) => set({ siStatus: v }),
  setActivityType: (v) => set({ activityType: v }),
  setHasActiveJira: (v) => set({ hasActiveJira: v }),
  reset: () => set({ origin: '', siStatus: '', activityType: '', hasActiveJira: false }),
}))
