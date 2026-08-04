import { StateCreator } from "zustand";
import { ISettingSlice, Store } from "./type";

const OPEN_GAME_PAGE_KEY = "open_game_page";
const GAME_FULLSCREEN_KEY = "full_screen";
const DIRECT_PLAY_KEY = "direct_play";

function readBooleanStorage(key: string) {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(key) === "true";
}

function writeBooleanStorage(key: string, value: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, String(value));
}

export const createSettingSlice: StateCreator<Store, [], [], ISettingSlice> = (set) => ({
  openGamePage: readBooleanStorage(OPEN_GAME_PAGE_KEY),
  setOpenGamePage: (open_game_page: boolean) => {
    writeBooleanStorage(OPEN_GAME_PAGE_KEY, open_game_page);
    set({ openGamePage: open_game_page });
  },
  isGameFullScreen: readBooleanStorage(GAME_FULLSCREEN_KEY),
  setGameFullScreen: (full_screen: boolean) => {
    writeBooleanStorage(GAME_FULLSCREEN_KEY, full_screen);
    set({ isGameFullScreen: full_screen });
  },
  isDirectPlay: readBooleanStorage(DIRECT_PLAY_KEY),
  setDirectPlay: (isDirectPlay: boolean) => {
    writeBooleanStorage(DIRECT_PLAY_KEY, isDirectPlay);
    set({ isDirectPlay });
  },
  pwaUpdateAvailable: false,
  setPwaUpdateAvailable: (available: boolean) => set({ pwaUpdateAvailable: available }),
});
