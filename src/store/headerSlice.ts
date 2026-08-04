import { StateCreator } from "zustand";
import { IHeaderSlice, Store } from "./type";

export const createHeaderSlice: StateCreator<Store, [], [], IHeaderSlice> = (set) => ({
  headerBackAction: null,
  setHeaderBackAction: (action) => set({ headerBackAction: action }),
});
