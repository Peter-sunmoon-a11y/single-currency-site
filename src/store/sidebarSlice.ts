import { StateCreator } from "zustand";
import { ISidebarSlice, Store } from "./type";

export const createSidebarSlice: StateCreator<Store, [], [], ISidebarSlice> = (set) => ({
  isSidebarDrawerOpen: false,
  closeSidebarDrawer: () => set({ isSidebarDrawerOpen: false }),
  toggleSidebarDrawer: () => set((state) => ({ isSidebarDrawerOpen: !state.isSidebarDrawerOpen })),
});
