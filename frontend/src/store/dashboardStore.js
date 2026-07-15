import { create } from 'zustand'

export const useDashboardStore = create((set) => ({
  summary: null,
  projectUtilization: [],
  floorUtilization: [],

  setSummary: (summary) =>
    set({
      summary,
    }),

  setProjectUtilization: (projectUtilization) =>
    set({
      projectUtilization,
    }),

  setFloorUtilization: (floorUtilization) =>
    set({
      floorUtilization,
    }),

  resetDashboard: () =>
    set({
      summary: null,
      projectUtilization: [],
      floorUtilization: [],
    }),
}))