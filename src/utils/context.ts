import { create } from 'zustand'
import { type Group } from "@prisma/client";


interface AppState {
    // Filters that we can narrow tasks down by
    filterGroup?: Group,
    setGroup: (to?: Group) => void,
}

export const useAppStore = create<AppState>()((set) => ({
    setGroup: (to) => set(() => ({filterGroup: to})),
  }))
  