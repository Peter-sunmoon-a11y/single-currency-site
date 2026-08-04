import { Store } from "@/store/type.ts";
import { create } from "zustand";
import { createAuthSlice } from "./authSlice";
import { createCurrencySlice } from "./currencySlice";
import { createExploreSlice } from "./exploreSlice";
import { createFinanceSlice } from "./financeSlice";
import { createHeaderSlice } from "./headerSlice";
import { createSettingSlice } from "./settingSlice";
import { createSidebarSlice } from "./sidebarSlice";

// TODO： 要拆分
export const useBoundStore = create<Store>((...props) => ({
  ...createAuthSlice(...props),
  ...createFinanceSlice(...props),
  ...createSettingSlice(...props),
  ...createHeaderSlice(...props),
  ...createSidebarSlice(...props),
  ...createExploreSlice(...props),
  ...createCurrencySlice(...props),
}));
