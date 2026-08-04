import { StateCreator } from "zustand";

export interface IExploreSlice {
  exploreState: {
    games: any[];
    page: number;
    scrollTop: number;
    filterFingerprint: string;
  };
  setExploreState: (state: Partial<IExploreSlice["exploreState"]>) => void;
  resetExploreState: () => void;
}

const initialState = {
  games: [],
  page: 1,
  scrollTop: 0,
  filterFingerprint: "",
};

export const createExploreSlice: StateCreator<IExploreSlice> = (set) => ({
  exploreState: initialState,
  setExploreState: (updates) =>
    set((state) => ({
      exploreState: { ...state.exploreState, ...updates },
    })),
  resetExploreState: () => set({ exploreState: initialState }),
});
