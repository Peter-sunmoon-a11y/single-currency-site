export type ErrorString = `${string}_error`;

export interface IFiat {
  method: Record<string, any> | null;
  currency: Record<string, any> | null;
  formItem: Record<string, any> | null;

  [key: ErrorString]: boolean;
}

export interface ICrypto {
  network: Record<string, any> | null;
  currency: Record<string, any> | null;
}

export interface IWithdrawCrypto extends ICrypto {
  inputAmount: string;
  toWallet: string;
  comment?: string;
}

export interface IFinanceSlice {
  depositBalanceSync: {
    active: boolean;
    startedAt: number | null;
    expiresAt: number | null;
  };
  startDepositBalanceSync: (durationMs?: number) => void;
  stopDepositBalanceSync: () => void;

  withdrawType: "crypto" | "fiat";
  setWithdrawType: (params: "crypto" | "fiat") => void;

  // withdraw fiat
  withdrawFiat: IFiat & { extraItem: Record<string, any> | null };
  setWithdrawFiat: (params: Partial<IFiat & { extraItem: Record<string, any> | null }>) => void;
  resetWithdrawFiat: () => void;

  // withdraw fiat V2
  withdrawFiatV2: Omit<IFiat, "currency">;
  setWithdrawFiatV2: (params: Partial<IFiat>) => void;
  resetWithdrawFiatV2: () => void;

  // withdraw crypto
  withdrawCrypto: IWithdrawCrypto;
  setWithdrawCrypto: (params: Partial<IWithdrawCrypto>) => void;
  resetWithdrawCrypto: () => void;

  depositType: "crypto" | "fiat";
  setDepositType: (params: "crypto" | "fiat") => void;

  // deposit crypto
  depositCrypto: ICrypto;
  setDepositCrypto: (params: Partial<ICrypto>) => void;

  // deposit fiat
  depositFiat: IFiat & { extraItem: Record<string, any> | null };
  setDepositFiat: (params: Partial<IFiat & { extraItem: Record<string, any> | null }>) => void;

  swapFrom: {
    currency: Record<string, any> | null;
    inAmount: string;
  };
  setSwapFrom: (params: { currency?: Record<string, any>; inAmount?: string }) => void;

  swapTo: {
    currency: Record<string, any> | null;
    outAmount: string;
  };
  setSwapTo: (params: { currency?: Record<string, any>; outAmount?: string }) => void;

  syncAction: { type: TActions | undefined; data?: any };
  setSyncAction: (t: TActions | undefined, data?: any) => void;

  // 多弹窗状态管理（支持多个弹窗同时显示）
  modals: Record<string, { open: boolean; data?: any }>;
  openModal: (type: TActions, data?: any) => void;
  closeModal: (type: TActions) => void;

  bonusSwapFrom: {
    currency: Record<string, any> | null;
    inAmount: string;
  };
  setBonusSwapFrom: (params: { currency?: Record<string, any>; inAmount?: string }) => void;

  bonusSwapTo: {
    currency: Record<string, any> | null;
    outAmount: string;
  };
  setBonusSwapTo: (params: { currency?: Record<string, any>; outAmount?: string }) => void;
}

export type TActions =
  | "SYNC_USER_LATEST_DEPOSIT"
  | "SYNC_DEPOSIT_FIAT_CREATE"
  | "SYNC_WITHDRAW_FIAT_CREATE"
  | "SYNC_WITHDRAW_CRYPTO_CREATE"
  | "SYNC_ADD_WITHDRAW_ADDRESS"
  | "OPEN_DEPOSIT_FIAT_VIEW_MODAL"
  | "OPEN_DEPOSIT_BONUS_TIPS_MODAL"
  | "OPEN_DEPOSIT_MIN_AMOUNT_MODAL"
  | "OPEN_WITHDRAW_MIN_AMOUNT_MODAL"
  | "OPEN_WITHDRAW_ADDRESS_ADD_MODAL"
  | "OPEN_WITHDRAW_METHOD_ADD_MODAL"
  | "OPEN_WITHDRAW_ORDER_OK_MODAL"
  | "OPEN_WITHDRAW_FIAT_PIN_MODAL"
  | "OPEN_WITHDRAW_CRYPTO_PIN_MODAL"
  | "OPEN_CRYPTO_SETTLEMENT_MODAL"
  | "OPEN_CHANGE_PASSWORD_MODAL"
  | "OPEN_SET_WITHDRAWAL_PIN_MODAL"
  | "OPEN_EMAIL_VERIFICATION_MODAL"
  | "OPEN_PHONE_VERIFICATION_MODAL"
  | "OPEN_WELCOME_SIGN_UP_MODAL"
  | "OPEN_EXTRA_REFERRAL_BONUS_MODAL"
  | "OPEN_DOUBLE_OR_NOTHING_MODAL"
  | "OPEN_DOUBLED_UP_MODAL"
  | "OPEN_NOTHING_MODAL"
  | "OPEN_BOOST_MODAL"
  | "OPEN_VIP_MONDAY_BONUS_MODAL"
  | "OPEN_FINANCE_AML_MODAL"
  | "OPEN_PLAY_BONUS_MODAL"
  | "OPEN_GIVE_UP_BONUS_MODAL"
  | "OPEN_LIMIT_OFFER_MODAL"
  | "OPEN_GET_PROMO_CODE_MODAL"
  | "OPEN_BUDDY_BALLS_MODAL"
  | "OPEN_DAILY_CHECK_IN_DEPOSIT_MODAL"
  | "OPEN_BOUNTY_MODAL"
  | "OPEN_BONUS_STORE_MODAL"
  | "OPEN_BONUS_SWAP_MODAL"
  | "OPEN_BONUS_CLAIM_MODAL"
  | "OPEN_FIRST_CHALLENGE_INFO_MODAL"
  | "OPEN_TIERED_FIRST_DEPOSIT_INFO_MODAL"
  | "OPEN_LUCKY_SPIN_MODAL"
  | "OPEN_WHEEL_FORTUNE_WIN_MODAL"
  | "OPEN_FIAT_CHANNEL_MODAL"
  | "OPEN_REFERRAL_SHARE_BIG_WIN_MODAL"
  | "OPEN_SPORTS_BONUS_SWAP_MODAL"
  | "OPEN_PLAY_SPORTS_BONUS_MODAL"
  | "OPEN_CURRENCY_SELECTOR_MODAL"
  | "OPEN_WALLET_MODAL"
  | "OPEN_USER_FINANCE_MODAL"
  | "OPEN_INTERNAL_MESSAGE_MODAL"
  | "OPEN_AUTH_MODAL"
  | "OPEN_BET_SLIP_MODAL"
  | "OPEN_SUNDAY_SUPER_HELP_MODAL"
  | "OPEN_DOUBLE_OR_NOTHING_HELP_MODAL"
  | "OPEN_LIMITED_OFFERS_HELP_MODAL"
  | "OPEN_SPORTS_BONUS_HELP_MODAL"
  | "OPEN_RAKEBACK_HELP_MODAL"
  | "OPEN_TOURNAMENT_HELP_MODAL"
  | "OPEN_MYSTERY_BOX_MODAL"
  | "OPEN_MYSTERY_BOX_HELP_MODAL"
  | "OPEN_JESTER_HELP_MODAL"
  | "OPEN_LUCKY_NUMBER_HELP_MODAL"
  | "OPEN_MEMBERS_DAY_HELP_MODAL"
  | "OPEN_MEMBER_BONUS_HELP_MODAL"
  | "OPEN_GAME_BAN_REASON_MODAL"
  | "OPEN_EXPLORE_SEARCH_MODAL"
  | "OPEN_FREE_SPINS_HELP_MODAL"
  | "OPEN_NOTIFICATION_PROMPT_MODAL"
  | "OPEN_GAME_DETAILS_MODAL"
  | "OPEN_CREATE_CAMPAIGN_MODAL"
  | "OPEN_REFERRAL_REWARDS_DETAILS_MODAL"
  | "OPEN_REFERRAL_COMMISSIONS_DETAILS_MODAL"
  | "OPEN_FREE_SPIN_MODAL"
  | "OPEN_ROLLOVER_DETAILS_MODAL"
  | "OPEN_PHONE_AREA_CODE_MODAL"
  | "OPEN_FIRST_CHALLENGE_POPUP_MODAL"
  | "CLOSE_FINANCE_MODAL";

export type TPublicProfileKeys =
  | "HideAllProfileInfo"
  | "HideStatistics"
  | "HideTop3Games"
  | "HideAchievements"
  | "HideTournamentRewards"
  | "DoNotPushNotifications"
  | "DoNOTReceivePromotionalOffers";

export type IPublicProfileKeys = {
  [key in TPublicProfileKeys]: boolean;
};

export interface IPublicProfileSlice {
  publicProfile: IPublicProfileKeys;
  setPublicProfile: (params: Partial<IPublicProfileKeys>) => void;
}

export interface ISettingSlice {
  openGamePage: boolean;
  setOpenGamePage: (openGamePage: boolean) => void;
  isGameFullScreen: boolean;
  setGameFullScreen: (isFullScreen: boolean) => void;
  isDirectPlay: boolean;
  setDirectPlay: (isDirectPlay: boolean) => void;
  pwaUpdateAvailable: boolean;
  setPwaUpdateAvailable: (available: boolean) => void;
}

export interface IHeaderSlice {
  headerBackAction: (() => void) | null;
  setHeaderBackAction: (action: (() => void) | null) => void;
}

export interface ISidebarSlice {
  isSidebarDrawerOpen: boolean;
  closeSidebarDrawer: () => void;
  toggleSidebarDrawer: () => void;
}

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

import type { IAuthSlice } from "./authSlice";
import type { ICurrencySlice } from "./currencySlice";

export type Store = IFinanceSlice & ISettingSlice & IHeaderSlice & ISidebarSlice & IExploreSlice & ICurrencySlice & IAuthSlice;

export type TabItemsType = "deposit" | "withdraw" | "swap" | `deposit_${string}` | `withdraw_${string}` | `swap_${string}`;
