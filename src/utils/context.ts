import { create } from 'zustand'
import {TaskType} from './enums'
import { type Group } from "@prisma/client";


interface AppState {
    // Filters that we can narrow tasks down by
    filterType: TaskType,
    filterGroup?: Group,
    setFilters: (taskType: TaskType, group?: Group) => void,
    setGroup: (to?: Group) => void,
}

export const useAppStore = create<AppState>()((set) => ({
    filterType: TaskType.Daily,
    setFilters: (taskType, group) => set(() => ({ filterType: taskType, group })),
    setGroup: (to) => set(() => ({filterGroup: to})),
  }))
  