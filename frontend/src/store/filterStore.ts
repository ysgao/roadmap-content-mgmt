import { create } from 'zustand'

interface FilterState {
  origin: string
  siStatus: string
  activityType: string
  setOrigin: (v: string) => void
  setSiStatus: (v: string) => void
  setActivityType: (v: string) => void
  reset: () => void
}

export const useFilterStore = create<FilterState>(set => ({
  origin: '',
  siStatus: '',
  activityType: '',
  setOrigin: (v: string) => set({ origin: v }),
  setSiStatus: (v: string) => set({ siStatus: v }),
  setActivityType: (v: string) => set({ activityType: v }),
  reset: () => set({ origin: '', siStatus: '', activityType: '' }),
}))
