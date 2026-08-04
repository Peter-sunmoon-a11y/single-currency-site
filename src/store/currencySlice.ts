import { getBrowserCurrency, getDisplayCurrency } from "@/utils/currency";
import { USER_PREF_STORAGE_KEY } from "@/utils/storageKeys";
import type { StateCreator } from "zustand";
import type { Store } from "./type";

const DISPLAY_KEY = USER_PREF_STORAGE_KEY.displayCurrency;
const SETTLEMENT_KEY = USER_PREF_STORAGE_KEY.settlementCurrency;

function readStorage(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

export interface ICurrencySlice {
  settlementCurrency: string;
  displayCurrency: string;
  setSettlementCurrency: (currency: string) => void;
  setDisplayCurrency: (currency: string) => void;
}

export const createCurrencySlice: StateCreator<Store, [], [], ICurrencySlice> = (set) => ({
  displayCurrency: readStorage(DISPLAY_KEY) ?? getDisplayCurrency(),
  settlementCurrency: readStorage(SETTLEMENT_KEY) ?? getBrowserCurrency(),

  setSettlementCurrency: (currency) => {
    writeStorage(SETTLEMENT_KEY, currency);
    set({ settlementCurrency: currency });
  },

  setDisplayCurrency: (currency) => {
    writeStorage(DISPLAY_KEY, currency);
    set({ displayCurrency: currency });
  },
});
