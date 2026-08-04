import { IFinanceSlice, Store, TActions } from "@/store/type.ts";
import { StateCreator } from "zustand";

export const createFinanceSlice: StateCreator<Store, [], [], IFinanceSlice> = (set) => ({
  depositBalanceSync: {
    active: false,
    startedAt: null,
    expiresAt: null,
  },
  startDepositBalanceSync: (durationMs = 60_000) =>
    set(() => {
      const startedAt = Date.now();
      return {
        depositBalanceSync: {
          active: true,
          startedAt,
          expiresAt: startedAt + durationMs,
        },
      };
    }),
  stopDepositBalanceSync: () =>
    set(() => ({
      depositBalanceSync: {
        active: false,
        startedAt: null,
        expiresAt: null,
      },
    })),

  // deposit/withdraw [crypto,fiat]
  depositType: "fiat",
  setDepositType: (params) => set(() => ({ depositType: params })),

  // deposit fiat
  depositFiat: {
    method: null,
    currency: null,
    formItem: null,
    extraItem: null,
  },
  setDepositFiat: (params) =>
    set((state) => {
      const need_reset_form = Boolean(params.method);
      // console.info("************ setDepositFiat start ************");
      // console.info(params.currency?.currency);
      // console.info(params.method?.display_name);
      // console.info("need_reset_form", need_reset_form);
      // console.info("************ setDepositFiat ended ************");
      const next_deposit_fiat = {
        ...state.depositFiat,
        ...params,
        formItem: need_reset_form ? null : { ...(state.depositFiat.formItem ?? {}), ...(params.formItem ?? {}) },
        extraItem: need_reset_form ? null : { ...(state.depositFiat.extraItem ?? {}), ...(params.extraItem ?? {}) },
      };

      // ‼️清除后缀为_error的字段残留，避免影响下一个阶段的数据
      if (need_reset_form) {
        // console.info("deleteProperty need_reset_form", need_reset_form);
        // console.info(next_deposit_fiat);
        Object.keys(next_deposit_fiat).forEach((k) => {
          if (k.endsWith("_error") && k !== "range_error") Reflect.deleteProperty(next_deposit_fiat, k);
        });
        // console.info(next_deposit_fiat);
      }

      return {
        depositFiat: {
          ...next_deposit_fiat,
        },
      };
    }),

  // deposit crypto
  depositCrypto: {
    currency: null,
    network: null,
  },
  setDepositCrypto: (params) => set((state) => ({ depositCrypto: { ...state.depositCrypto, ...params } })),

  // deposit/withdraw [crypto,fiat]
  withdrawType: "fiat",
  setWithdrawType: (params) => set(() => ({ withdrawType: params })),

  // withdraw fiat V1
  withdrawFiat: {
    method: null,
    currency: null,
    formItem: null,
    extraItem: null,
  },
  setWithdrawFiat: (params) =>
    set((state) => {
      const need_reset_form = Boolean(params.method);
      // console.info(`Store: Withdraw Fiat [${params.method?.currency}, ${params.method?.display_name}] update, need_reset_form = [${need_reset_form}]`);
      const next_withdraw_fiat = {
        ...state.withdrawFiat,
        ...params,
        formItem: need_reset_form ? null : { ...(state.withdrawFiat.formItem ?? {}), ...(params.formItem ?? {}) },
        extraItem: need_reset_form ? null : { ...(state.withdrawFiat.extraItem ?? {}), ...(params.extraItem ?? {}) },
      };

      // ‼️清除后缀为_error的字段残留，避免影响下一个阶段的数据
      if (need_reset_form) {
        Object.keys(next_withdraw_fiat).forEach((k) => {
          if (k.endsWith("_error")) Reflect.deleteProperty(next_withdraw_fiat, k);
        });
      }

      return {
        withdrawFiat: {
          ...next_withdraw_fiat,
        },
      };
    }),
  resetWithdrawFiat: () =>
    set((state) => {
      const next_withdraw_fiat = {
        ...state.withdrawFiat,
      };

      // ‼️清除后缀为_error的字段残留，避免影响下一个阶段的数据
      Object.keys(next_withdraw_fiat).forEach((k) => {
        if (k.endsWith("_error")) Reflect.deleteProperty(next_withdraw_fiat, k);
      });

      return {
        withdrawFiat: {
          ...next_withdraw_fiat,
        },
      };
    }),

  // withdraw fiat V2
  // currency 还是依赖于 V1
  withdrawFiatV2: {
    method: null,
    formItem: null,
  },
  setWithdrawFiatV2: (params) =>
    set((state) => {
      const need_reset_form = Boolean(params.method);
      // console.info("************ setWithdrawFiatV2 store change start ************");
      // console.info(params.method?.channel_class);
      // console.info("need_reset_form", need_reset_form);
      // console.info("************ setWithdrawFiatV2 store change ended ************");
      const next_withdraw_fiat_v2 = {
        ...state.withdrawFiatV2,
        ...params,
        formItem: need_reset_form ? null : { ...(state.withdrawFiatV2.formItem ?? {}), ...(params.formItem ?? {}) },
      };

      // ‼️清除后缀为_error的字段残留，避免影响下一个阶段的数据
      if (need_reset_form) {
        Object.keys(next_withdraw_fiat_v2).forEach((k) => {
          if (k.endsWith("_error")) Reflect.deleteProperty(next_withdraw_fiat_v2, k);
        });
      }

      return {
        withdrawFiatV2: {
          ...next_withdraw_fiat_v2,
        },
      };
    }),
  resetWithdrawFiatV2: () =>
    set((state) => {
      const next_withdraw_fiat_v2 = {
        ...state.withdrawFiatV2,
        formItem: { amount: "" },
      };

      // ‼️清除后缀为_error的字段残留，避免影响下一个阶段的数据
      Object.keys(next_withdraw_fiat_v2).forEach((k) => {
        if (k.endsWith("_error")) Reflect.deleteProperty(next_withdraw_fiat_v2, k);
      });

      return {
        withdrawFiatV2: {
          ...next_withdraw_fiat_v2,
        },
      };
    }),

  // withdraw fiat
  withdrawCrypto: {
    network: null,
    currency: null,
    comment: "",
    toWallet: "",
    inputAmount: "",
  },
  setWithdrawCrypto: (params) => {
    set((state) => {
      const effect = params.network ? { ...params, comment: "", inputAmount: "", toWallet: "" } : { ...state.withdrawCrypto, ...params };
      return {
        withdrawCrypto: {
          ...state.withdrawCrypto,
          ...effect,
        },
      };
    });
  },
  resetWithdrawCrypto: () => {
    set((state) => {
      return {
        withdrawCrypto: {
          ...state.withdrawCrypto,
          comment: "",
          inputAmount: "",
        },
      };
    });
  },

  // swap send
  swapFrom: { currency: null, inAmount: "" },
  setSwapFrom: (params) => set((state) => ({ swapFrom: { ...state.swapFrom, ...params } })),

  // swap receive
  swapTo: { currency: null, outAmount: "" },
  setSwapTo: (params) => set((state) => ({ swapTo: { ...state.swapTo, ...params } })),

  // which modal to show
  syncAction: { type: undefined, data: undefined },
  setSyncAction: (type: TActions | undefined, data?: any) => set({ syncAction: { type, data } }),

  // 多弹窗状态管理（支持多个弹窗同时显示）
  modals: {},
  openModal: (type: TActions, data?: any) =>
    set((state) => {
      if (type === "OPEN_AUTH_MODAL" && typeof window !== "undefined") {
        console.groupCollapsed("[OPEN_AUTH_MODAL]");
        console.log("pathname:", window.location.pathname);
        console.log("search:", window.location.search);
        console.log("data:", data);
        console.trace("trigger stack");
        console.groupEnd();
      }

      return {
        modals: {
          ...state.modals,
          [type]: { open: true, data },
        },
      };
    }),
  closeModal: (type: TActions) =>
    set((state) => {
      const { [type]: _, ...rest } = state.modals;
      return { modals: rest };
    }),

  // bonus swap send
  bonusSwapFrom: { currency: null, inAmount: "" },
  setBonusSwapFrom: (params) => set((state) => ({ bonusSwapFrom: { ...state.bonusSwapFrom, ...params } })),

  // bonus swap receive
  bonusSwapTo: { currency: null, outAmount: "" },
  setBonusSwapTo: (params) => set((state) => ({ bonusSwapTo: { ...state.bonusSwapTo, ...params } })),
});
