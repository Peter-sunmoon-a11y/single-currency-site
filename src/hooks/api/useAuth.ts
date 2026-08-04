import { useBoundStore } from "@/store";
import {
  activateBooster,
  bonusSwitch,
  claimTieredFirstDeposit,
  claimMembersDay,
  claimAchievementBonus,
  claimBonus,
  claimMondayVipBonus,
  claimLuckyNumberRewards,
  getBonusConfigList,
  getBonusWalletHistory,
  getClaimBonus,
  getClaimCount,
  getConquestList,
  getConquestsCompleted,
  getLuckyNumberRewards,
  getMembersDayStatus,
  getMondayVipBonus,
  getTieredFirstDepositSummary,
  getUserClaimBonus
} from "@/services/auth/bonus";
import {
  checkDemoSupport,
  getDefaultAdTag,
  getTopWageredGames,
  getUserFreeGameRecords,
  getUserGameList,
  launchDemoGame,
  launchGameV2,
  likeGameV2
} from "@/services/auth/game";
import { createAdTag, getAdTagList, getReferralList, setDefaultAdTag } from "@/services/auth/referral";
import {
  getAllSpinWinList,
  getBuddyBallsClaimList,
  getBuddyBallsPlayList,
  getPoolPrizeList,
  getUserSpinChance,
  getUserSpinWinList,
  userBuddyBallsHome,
  userLuckySpinHome
} from "@/services/auth/miniGames";
import {
  getCryptoDepositAddress,
  getFiatGatewayDepositParams,
  getFiatGatewayWithdrawParams,
  getSupportedCryptoDepositGateways,
  getSupportedCryptoWithdrawGateways,
  getSupportedFiatDepositGateways,
  getUserBalance,
  getUserBalanceExtension,
  getUserWithdrawWallet
} from "@/services/auth/wallet";
import {
  getKycDetail,
  getMyAchievements,
  getUserAchievementsV2,
  getUserDefaultCurrency,
  getUserProfile,
  getVipConfig,
  getWalletSettingsCurrency
} from "@/services/auth/user";
import {
  getLastTournamentLeaderboard,
  getTournamentLeaderboard,
  getTournamentList,
  getTournamentPoolPrize
} from "@/services/auth/tournament";
import { getNotificationMessage } from "@/services/auth/notification";
import {
  getSportsBonusConfigList,
  getSportsBonusIsRegionBanned,
  getSportsBonusWalletHistory
} from "@/services/auth/sportsBonus";
import { signIn, signOut, signUp, signupRoiBest } from "@/services/auth/session";
import { loginByGoogle, loginByFacebook, loginByTMA } from "@/services/public/auth";
import { useIdleEnabled } from "@/hooks/useIdleEnabled";
import type { LoginCredentials, LoginResponse } from "@/types/auth";
import { promotionConfig } from "@/lib/env";
import type { CreateAdTagParams, GetReferralListParams, SetDefaultAdTagParams } from "@/types/referral";
import { clearAuth, hasAuth } from "@/utils/auth";
import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions
} from "@tanstack/react-query";
import { createElement } from "react";
import { useMemo } from "react";
import { toast } from "sonner";
import type { KycDetail } from "@/types/profile";
import type { ITournament } from "@/types/tournament";
import type { UserGameListParams, UserGameListResponse } from "@/types/game";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { trackCustomEvent } from "@/utils/helper.ts";
import { normalizeLocale } from "@/lib/i18n/config.ts";
import { localizeHref } from "@/lib/navigation.ts";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { tryShowNotificationPrompt } from "@/hooks/useWebPush.ts";
import { useAppNavigate } from "@/hooks/useAppNavigate.ts";

export const AUTH_QUERY_KEYS = {
  currentUser: ["auth", "currentUser"] as const,
  tournamentList: ["auth", "tournamentList"] as const,
  userBalance: ["auth", "userBalance"] as const,
  cryptoDepositAddress: ["auth", "cryptoDepositAddress"] as const,
  supportedCryptoWithdrawGateways: ["auth", "supportedCryptoWithdrawGateways"] as const,
  supportedCryptoDepositGateways: ["auth", "supportedCryptoDepositGateways"] as const,
  supportedFiatDepositGateways: ["auth", "supportedFiatDepositGateways"] as const,
  withdrawGatewayRequiredFields: ["auth", "withdrawGatewayRequiredFields"] as const,
  claimBonus: ["auth", "claimBonus"] as const,
  fiatGatewayWithdrawParams: ["auth", "fiatGatewayWithdrawParams"] as const,
  fiatGatewayDepositParams: ["auth", "fiatGatewayDepositParams"] as const,
  userBalanceExtension: ["auth", "userBalanceExtension"] as const,
  userClaimBonus: ["auth", "userClaimBonus"] as const,
  conquests: ["auth", "conquests"] as const,
  conquestList: ["auth", "conquestList"] as const,
  calendarBonus: ["auth", "calendarBonus"] as const,
  gameLaunch: ["auth", "gameLaunch"] as const,
  userWithdrawWallet: ["auth", "userWithdrawWallet"] as const,
  userFreeGameRecords: ["auth", "userFreeGameRecords"] as const,
  topWageredGames: ["auth", "topWageredGames"] as const,
  userGameList: ["auth", "userGameList"] as const,
  defaultAdTag: ["auth", "defaultAdTag"] as const,
  userAchievements: ["auth", "userAchievements"] as const,
  myAchievements: ["auth", "myAchievements"] as const,
  vipConfigList: ["auth", "vipConfigList"] as const,
  referralClaim: ["auth", "referralClaim"] as const,
  groupClaim: ["auth", "groupClaim"] as const,
  referralList: ["auth", "referralList"] as const,
  adTagList: ["auth", "adTagList"] as const,
  vipNextLevelData: ["auth", "vipNextLevelData"] as const,
  unreadNotificationCounter: ["auth", "unreadNotificationCounter"] as const,
  kycDetail: ["auth", "kycDetail"] as const,
  tournamentPoolPrize: ["auth", "tournamentPoolPrize"] as const,
  notificationMessage: ["auth", "notificationMessage"] as const,
  bonusConfigList: ["auth", "bonusConfigList"] as const,
  sportsBonusConfigList: ["auth", "sportsBonusConfigList"] as const,
  sportsBonusWalletHistory: ["auth", "sportsBonusWalletHistory"] as const,
  sportsBonusIsRegionBanned: ["auth", "sportsBonusIsRegionBanned"] as const,
  userBonusLatestHistory: ["auth", "userBonusLatestHistory"] as const,
  checkDetailPromo: ["auth", "checkDetailPromo"] as const,
  todayDepositCount: ["auth", "todayDepositCount"] as const,
  tournamentLeaderboard: ["auth", "tournamentLeaderboard"] as const,
  userBuddyBallsHome: ["auth", "userBuddyBallsHome"] as const,
  bonusWalletHistory: ["auth", "bonusWalletHistory"] as const,
  buddyBallsClaimList: ["auth", "buddyBallsClaimList"] as const,
  buddyBallsPlayList: ["auth", "buddyBallsPlayList"] as const,
  lastTournamentLeaderboard: ["auth", "lastTournamentLeaderboard"] as const,
  buddyBalls: ["auth", "buddyBalls"] as const,
  dailyCheckInConfig: ["auth", "dailyCheckInConfig"] as const,
  checkInHistory: ["auth", "checkInHistory"] as const,
  userLuckySpinHome: ["auth", "userLuckySpinHome"] as const,
  spinPoolPrizeList: ["auth", "spinPoolPrizeList"] as const,
  allSpinWinList: ["auth", "allSpinWinList"] as const,
  userSpinChance: ["auth", "userSpinChance"] as const,
  userSpinWinList: ["auth", "userSpinWinList"] as const,
  luckyNumberRewards: ["auth", "luckyNumberRewards"] as const,
  membersDayStatus: ["auth", "membersDayStatus"] as const,
  tieredFirstDepositSummary: ["auth", "tieredFirstDepositSummary"] as const
};

// ── Sign Up ──────────────────────────────────────────────────────────────────

export function useSignUp() {
  const { t } = useTranslation("login");
  return useMutation({
    mutationFn: (credentials: Record<string, any>) => {
      const fn = promotionConfig.isRoiBest ? signupRoiBest : signUp;
      return fn(credentials as LoginCredentials);
    },
    onError: (error: any) => {
      const apiCode = error?.code ?? error?.responseData?.code;
      const errMap: Record<number, string> = {
        20011: "emailAlreadyRegistered",
        20012: "phoneNumberAlreadyRegistered",
        20013: "usernameAlreadyRegistered",
        1002: "pleaseCheckYourUsername"
      };
      if (errMap[apiCode]) toast.error(t(errMap[apiCode]));
      else if (error instanceof Error) toast.error(error.message);
      else toast.error(t("pleaseTryAgainLater"));
    }
  });
}

// ── Social Login ─────────────────────────────────────────────────────────────

export function useLogin() {
  const { t, i18n } = useTranslation();

  const router = useRouter();

  const pathname = usePathname();

  const searchParams = useSearchParams();

  const setAuthSession = useBoundStore((s) => s.setAuthSession);

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => signIn(credentials),
    onSuccess: (data) => {
      if (data?.code === 0) {
        toast.success(t("toast:signInSuccess"));

        // 写浏览器缓存和运行期间缓存
        setAuthSession({ user: data?.user, status: data?.status, token: data?.data?.token });

        // 登录成功后立即设置用户语言
        const locale = normalizeLocale(data?.user?.language_code);
        if (locale !== i18n.language) {
          void i18n.changeLanguage(locale);
          const search = searchParams.toString();
          const currentHref = search ? `${pathname}?${search}` : pathname;
          router.replace(localizeHref(currentHref, locale));
        }

        // GTM 记录推送
        trackCustomEvent("login", "userLogin", {
          id: data?.user?.id,
          username: data?.user?.username,
          nick_name: data?.user?.nickname,
          country: data?.user?.country
        });
      } else {
        toast.error(t("toast:signInFailed"));
      }
    },
    onError: (error) => {
      toast.error(error.message || t("toast:signInFailed"));
    }
  });
}

type SocialLoginParams = {
  data: Record<string, any>;
  signal?: AbortSignal;
  headers?: Record<string, any>;
};

export function useLoginByGoogle() {
  const { t, i18n } = useTranslation();

  const router = useRouter();

  const navigate = useAppNavigate();

  const pathname = usePathname();

  const searchParams = useSearchParams();

  const setAuthSession = useBoundStore((s) => s.setAuthSession);

  return useMutation({
    mutationFn: ({ data, signal, headers }: SocialLoginParams) => loginByGoogle(data, signal, headers),
    onSuccess: (data) => {
      if (data?.code === 0) {
        toast.success(t("toast:signInSuccess"));
        // 写浏览器缓存和运行期间缓存
        setAuthSession({ user: data.user, status: data.status, token: data.data.token });

        // 登录成功后立即设置用户语言
        const locale = normalizeLocale(data?.user?.language_code);
        if (locale !== i18n.language) {
          void i18n.changeLanguage(locale);
          const search = searchParams.toString();
          const currentHref = search ? `${pathname}?${search}` : pathname;
          router.replace(localizeHref(currentHref, locale));
        }

        void navigate({ to: "/casino" });

        // 数据上报
        trackCustomEvent("login", "userLogin", {
          id: data.user?.id,
          username: data.user?.username,
          nick_name: data.user?.nickname,
          country: data.user?.country
        });
      } else {
        toast.error(t("toast:signInFailed"));
      }
    },
    onError: () => {
      toast.error(t("toast:signInFailed"));
    }
  });
}

export function useLoginByFacebook() {
  const { t, i18n } = useTranslation();

  const router = useRouter();
  const navigate = useAppNavigate();

  const pathname = usePathname();

  const searchParams = useSearchParams();

  const setAuthSession = useBoundStore((s) => s.setAuthSession);

  return useMutation({
    mutationFn: ({ data, signal, headers }: SocialLoginParams) => loginByFacebook(data, signal, headers),
    onSuccess: (data) => {
      if (data?.code === 0) {
        toast.success(t("toast:signInSuccess"));
        // 写浏览器缓存和运行期间缓存
        setAuthSession({ user: data.user, status: data.status, token: data.data.token });

        // 登录成功后立即设置用户语言
        const locale = normalizeLocale(data?.user?.language_code);
        if (locale !== i18n.language) {
          void i18n.changeLanguage(locale);
          const search = searchParams.toString();
          const currentHref = search ? `${pathname}?${search}` : pathname;
          router.replace(localizeHref(currentHref, locale));
        }

        void navigate({ to: "/casino" });

        // 数据上报
        trackCustomEvent("login", "userLogin", {
          id: data.user?.id,
          username: data.user?.username,
          nick_name: data.user?.nickname,
          country: data.user?.country
        });
      } else {
        toast.error(t("toast:signInFailed"));
      }
    },
    onError: () => {
      toast.error(t("toast:signInFailed"));
    }
  });
}

export function useLoginByTMA() {
  const setAuthSession = useBoundStore((s) => s.setAuthSession);
  return useMutation({
    mutationFn: async (data: Record<string, any> = {}) => {
      const res = await loginByTMA(data);
      if (res.code !== 0) throw new Error(res.msg || "Login failed");
      return res as unknown as LoginResponse;
    },
    onSuccess: (res) => {
      setAuthSession({ user: res.user, status: res.status, token: res.data.token });
    }
  });
}

// ── Logout ───────────────────────────────────────────────────────────────────

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => signOut(),
    onSuccess: () => {
      clearAuth("logout_success");
      queryClient.setQueryData(AUTH_QUERY_KEYS.currentUser, null);
      queryClient.clear();
    },
    onError: (error) => {
      console.error("Logout failed:", error);
      clearAuth("logout_error");
      queryClient.clear();
    }
  });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.currentUser,
    queryFn: () => getUserProfile(),
    enabled: hasAuth()
  });
}

// 赛事列表（需登录）
export function useTournamentList() {
  const user = useBoundStore((state) => state.user);
  const query = useQuery<{ data: ITournament[]; code: number }>({
    queryKey: [...AUTH_QUERY_KEYS.tournamentList, user?.id],
    queryFn: () => getTournamentList(),
    enabled: !!user && hasAuth(),
    refetchOnMount: true,
    gcTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev
  });

  const list = query.data?.code === 0 ? query.data?.data ?? [] : [];
  const filtered = useMemo(() => {
    const hiddenProviders = new Set(["newbie", "pp"]);
    return list.filter((item) => !hiddenProviders.has((item.game_provider || "").toLowerCase()));
  }, [list]);
  return { tournamentList: filtered, isLoading: query.isLoading };
}

export function useTournamentPoolPrize(
  tournamentId?: number | string,
  tournamentLevel?: string,
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
  }
) {
  const { enabled: optionEnabled, refetchInterval, ...restOptions } = options ?? {};
  const enabled = Boolean(tournamentId && tournamentLevel && (optionEnabled ?? true));

  return useQuery<number>({
    queryKey: [...AUTH_QUERY_KEYS.tournamentPoolPrize, tournamentId, tournamentLevel],
    queryFn: async () => {
      const response = await getTournamentPoolPrize({
        tournament_id: tournamentId!,
        tournament_level: tournamentLevel!
      });
      return response.data ?? 0;
    },
    enabled,
    refetchInterval: refetchInterval ?? 30 * 1000,
    ...restOptions
  });
}

export function useUserGameList(
  params: UserGameListParams,
  queryOptions?: Omit<UseQueryOptions<UserGameListResponse>, "queryKey" | "queryFn" | "enabled"> & {
    enabled?: boolean
  }
) {
  const user = useBoundStore((state) => state.user);
  const { enabled: optionEnabled, ...restOptions } = queryOptions ?? {};
  const enabled = !!user && (optionEnabled ?? true);

  return useQuery<UserGameListResponse>({
    queryKey: [...AUTH_QUERY_KEYS.userGameList, user?.id, params],
    queryFn: () => getUserGameList(params),
    enabled,
    gcTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
    ...restOptions
  });
}

// 获取特定网络的加密货币存款地址
export const useCryptoDepositAddress = (network: string) => {
  const user = useBoundStore((state) => state.user);
  return useQuery({
    queryKey: [...AUTH_QUERY_KEYS.cryptoDepositAddress, network],
    queryFn: () => getCryptoDepositAddress(network),
    enabled: !!user && !!network && hasAuth() // 只有当用户已登录并且提供了网络参数时才执行查询
  });
};

// 存款取款网关支持
export const useSupportedCryptoWithdrawGateways = (currency: string) => {
  const user = useBoundStore((state) => state.user);
  return useQuery({
    queryKey: [...AUTH_QUERY_KEYS.supportedCryptoWithdrawGateways, currency],
    queryFn: async () => {
      return getSupportedCryptoWithdrawGateways(currency);
    },
    enabled: !!currency && !!user && hasAuth()
  });
};

export const useSupportedCryptoDepositGateways = (currency: string) => {
  const user = useBoundStore((state) => state.user);
  return useQuery({
    queryKey: [...AUTH_QUERY_KEYS.supportedCryptoDepositGateways, currency],
    queryFn: async () => {
      return getSupportedCryptoDepositGateways(currency);
    },
    enabled: !!currency && !!user && hasAuth()
  });
};

// 获取支持法币存款的网关
export const useSupportedFiatDepositGateways = (currency: string) => {
  const isAuthenticated = !!useBoundStore((state) => state.user);
  return useQuery({
    queryKey: [...AUTH_QUERY_KEYS.supportedFiatDepositGateways, currency],
    queryFn: async () => {
      return getSupportedFiatDepositGateways(currency);
    },
    enabled: !!currency && isAuthenticated && hasAuth()
  });
};

// 获取取款网关必填字段
export const useFiatGatewayWithdrawParams = (gateway_id: string, pay_bankcode: string) => {
  const user = useBoundStore((state) => state.user);
  return useQuery({
    queryKey: [...AUTH_QUERY_KEYS.fiatGatewayWithdrawParams, gateway_id, pay_bankcode],
    queryFn: () => getFiatGatewayWithdrawParams(gateway_id, pay_bankcode),
    enabled: !!user && !!gateway_id && !!pay_bankcode && hasAuth()
  });
};

// 获取用户余额
export const useUserBalance = () => {
  const user = useBoundStore((state) => state.user);
  const depositBalanceSync = useBoundStore((state) => state.depositBalanceSync);
  const isAuthenticated = !!user && hasAuth();
  const enabled = useIdleEnabled(isAuthenticated);

  return useQuery({
    queryKey: AUTH_QUERY_KEYS.userBalance,
    queryFn: async () => {
      const { data } = await getUserBalance();
      return data;
    },
    enabled,
    refetchInterval: depositBalanceSync.active ? 10_000 : false
  });
};

export const useFiatGatewayDepositParams = (gateway_id: string, pay_bankcode: string) => {
  const user = useBoundStore((state) => state.user);
  return useQuery({
    queryKey: [...AUTH_QUERY_KEYS.fiatGatewayDepositParams, gateway_id, pay_bankcode],
    queryFn: async () => {
      return getFiatGatewayDepositParams(gateway_id, pay_bankcode);
    },
    enabled: !!user && !!gateway_id && !!pay_bankcode && hasAuth()
  });
};

// 获取当前用户是否有待领取的Bonus
export const useClaimBonus = (item: "cashback" | "rakeback" | "tournament" | "level_up" | "vip_bonus_lucky_number_seven") => {
  const user = useBoundStore((state) => state.user);
  return useQuery({
    queryKey: [...AUTH_QUERY_KEYS.claimBonus, item],
    queryFn: () => getClaimBonus(item),
    enabled: !!user && hasAuth(), // 只有当用户已登录时才执行查询
    refetchInterval: 30 * 1000
  });
};

/**
 * Hook for fetching user balance extension
 */
export const useUserBalanceExtension = () => {
  const user = useBoundStore((state) => state.user);
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.userBalanceExtension,
    queryFn: async () => {
      const { data } = await getUserBalanceExtension();
      return data;
    },
    enabled: !!user && hasAuth()
  });
};

// 获取用户bonus 领取详细记录
export const useUserClaimBonus = () => {
  const user = useBoundStore((state) => state.user);
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.userClaimBonus,
    queryFn: () => getUserClaimBonus(),
    enabled: !!user && hasAuth() // 只有当用户已登录时才执行查询
  });
};

export const useLuckyNumberRewards = () => {
  const user = useBoundStore((state) => state.user);
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.luckyNumberRewards,
    queryFn: () => getLuckyNumberRewards(),
    enabled: !!user && hasAuth()
  });
};

export const useMembersDayStatus = () => {
  const user = useBoundStore((state) => state.user);
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.membersDayStatus,
    queryFn: () => getMembersDayStatus(),
    enabled: !!user && hasAuth()
  });
};

export const useTieredFirstDepositSummary = () => {
  const user = useBoundStore((state) => state.user);
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.tieredFirstDepositSummary,
    queryFn: () => getTieredFirstDepositSummary(),
    enabled: !!user && hasAuth()
  });
};

// 领取bonus的mutation
export const useClaimBonusMutation = (
  callback?: (response: any, variables: any) => void,
  showSuccessToast = false
) => {
  const queryClient = useQueryClient();

  const { t } = useTranslation(["toast", "vipMonday"]);

  return useMutation({
    mutationFn: ({ item, currency }: { item: string; currency?: string }) =>
      claimBonus(item, currency),
    onSuccess: (response: any, variables) => {
      if (response.code === 0) {
        showSuccessToast && toast.success(t("toast:bonusClaimedSuccessfully"));
        // 刷新用户bonus详情
        void queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.userClaimBonus });
        // 刷新cashback / rakeback / tournament / level_up待领取金额
        void queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.claimBonus });
        // 刷新余额相关数据
        void queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.userBalance });
        // 触发一次webpush订阅,提醒用户未来可以收到订阅消息以提升用户体验
        tryShowNotificationPrompt();
      } else {
        const { code } = response;
        if (code === 4001) {
          toast.error(t("vipMonday:not_in_claim_time_range"));
        } else if (code === 4002) {
          toast.error(t("vipMonday:bonus_already_claimed"));
        } else if (code === 4003) {
          toast.error(t("vipMonday:wager_requirement_not_met"));
        } else if (code === 50006) {
          // 奖金池不足 → 引导联系客服
          toast.error(t("toast:pleaseContactCustomerService"));
        } else {
          // 50001: 无记录 | 50002: 余额为 0 | 50012: 余额不足 1
          // 50009: 乐观锁冲突 | 59999: 系统异常
          toast.error(t("toast:claimBonusFailed"));
        }
      }

      // 调用自定义的回调
      if (callback) callback(response, variables);
    },
    onError: (error: any) => {
      console.error("Failed to claim bonus:", error);
      toast.error(t("toast:claimBonusFailed"));
    }
  });
};

export const useClaimLuckyNumberMutation = (
  callback?: (response: any, variables: any) => void,
  showSuccessToast = false
) => {
  const { t } = useTranslation(["toast"]);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ currency, reward_ids }: { currency: string; reward_ids: Array<string | number> }) =>
      claimLuckyNumberRewards(currency, reward_ids),
    onSuccess: (response: any, variables) => {
      if (response.code === 0) {
        showSuccessToast && toast.success(t("toast:bonusClaimedSuccessfully"));
        void queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.luckyNumberRewards });
      } else if (response.code === 50006) {
        toast.error(t("toast:pleaseContactCustomerService"));
      } else {
        toast.error(t("toast:claimBonusFailed"));
      }

      if (callback) callback(response, variables);
    },
    onError: (error: any) => {
      console.error("Failed to claim lucky number rewards:", error);
      toast.error(t("toast:claimBonusFailed"));
    }
  });
};

// 领取vip monday的mutation
export const useClaimMondayBonusMutation = (
  callback?: (response: any, variables: any) => void,
  showSuccessToast = false
) => {
  const { t } = useTranslation("toast");

  return useMutation({
    mutationFn: ({ id, currency }: { id: string; currency: string; }) =>
      claimMondayVipBonus(id, currency),
    onSuccess: (response: any, variables) => {
      if (response.code === 0) {
        showSuccessToast && toast.success(t("toast:bonusClaimedSuccessfully"));
      } else {
        const { code } = response;
        if (code === 4001) {
          toast.error(t("vipMonday:not_in_claim_time_range"));
        } else if (code === 4002) {
          toast.error(t("vipMonday:bonus_already_claimed"));
        } else if (code === 4003) {
          toast.error(t("vipMonday:wager_requirement_not_met"));
        } else if (code === 50006) {
          // 奖金池不足 → 引导联系客服
          toast.error(t("toast:pleaseContactCustomerService"));
        } else {
          // 50001: 无记录 | 50002: 余额为 0 | 50012: 余额不足 1
          // 50009: 乐观锁冲突 | 59999: 系统异常
          toast.error(t("toast:claimBonusFailed"));
        }
      }

      // 调用自定义的回调
      if (callback) callback(response, variables);
    },
    onError: (error: any) => {
      console.error("Failed to claim bonus:", error);
      toast.error(t("toast:claimBonusFailed"));
    }
  });
};

export const useClaimMembersDayMutation = (
  callback?: (response: any, variables: any) => void
) => {
  const { t } = useTranslation(["toast"]);

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ currency }: { currency: string }) => claimMembersDay(currency),
    onSuccess: (response: any, variables) => {
      if (response.code === 0) {
        toast.success(t("toast:bonusClaimedSuccessfully"));
        // FreeSpin窗口数据更新,触发FreeSpinContainer
        void queryClient.invalidateQueries({ queryKey: ["earliestPendingRecord"] });
        void queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.membersDayStatus });
        void queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.userFreeGameRecords });
        tryShowNotificationPrompt();
      } else if (response.code === 50006) {
        toast.error(t("toast:pleaseContactCustomerService"));
      } else {
        toast.error(t("toast:claimBonusFailed"));
      }

      if (callback) callback(response, variables);
    },
    onError: (error: any) => {
      console.error("Failed to claim members day reward:", error);
      toast.error(t("toast:claimBonusFailed"));
    }
  });
};

export const useClaimTieredFirstDepositMutation = (
  callback?: (response: any) => void
) => {
  const { t } = useTranslation(["bonus", "toast"]);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => claimTieredFirstDeposit(),
    onSuccess: (response: any) => {
      if (response.code === 0) {
        toast.success(t("toast:bonusClaimedSuccessfully"));
        void queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.tieredFirstDepositSummary });
        void queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.userClaimBonus });
        void queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.userBalance });
        tryShowNotificationPrompt();
      } else {
        toast.error(t("toast:claimBonusFailed"));
      }

      callback?.(response);
    },
    onError: (error: any) => {
      console.error("Failed to claim tiered first deposit:", error);
      toast.error(t("toast:claimBonusFailed"));
    }
  });
};

// Conquest相关查询和操作
export const useConquestsCompleted = () => {
  const user = useBoundStore((state) => state.user);
  return useQuery({
    queryKey: [...AUTH_QUERY_KEYS.conquests, "completed"],
    queryFn: () => getConquestsCompleted(),
    enabled: !!user && hasAuth()
  });
};

// Free Spins 相关查询和操作
export const useUserFreeGameRecords = () => {
  const user = useBoundStore((state) => state.user);
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.userFreeGameRecords,
    queryFn: () => getUserFreeGameRecords(),
    enabled: !!user && hasAuth(),
    // Return from game pages should always refresh the latest free spin counts
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true
  });
};

export const useActivateBoosterMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: () => activateBooster(),
    onSuccess: () => {
      // Invalidate user profile to refresh battery status
      void queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.currentUser });
      toast.success(t("toast:booster_activated_successfully"));
    },
    onError: (error: any) => {
      console.error("Failed to activate booster:", error);
      toast.error(error.message || "Failed to activate booster");
    }
  });
};

// 游戏启动相关 hooks
export const useLaunchGameMutation = () => {
  const { t } = useTranslation("toast");
  return useMutation({
    mutationFn: (params: {
      inner_game_id: string;
      game_provider: string;
      game_currency: string;
      lang: string;
      name_key?: string;
      home_url?: string;
      close_url?: string;
      deposit_url?: string;
      history_url?: string;
      is_support_demo_game?: string;
    }) => launchGameV2(params),
    onError: (error: any) => {
      console.error("Failed to launch game:", error);
      toast.error(t("failedToLaunchGame"));
    }
  });
};

// 试玩游戏启动
export const useLaunchDemoGameMutation = () => {
  return useMutation({
    mutationFn: (params: {
      inner_game_id: string;
      game_provider: string;
      game_currency: string;
      lang: string;
      name_key?: string;
      home_url?: string;
      close_url?: string;
      deposit_url?: string;
      history_url?: string;
    }) => launchDemoGame(params),
    onError: (error: any) => {
      console.error("Failed to launch demo game:", error);
      toast.error("Failed to launch demo game");
    }
  });
};

// 检查游戏是否支持演示模式
export const useCheckDemoSupportQuery = (params: {
  inner_game_id: string;
  game_provider: string;
  game_currency?: string;
  lang?: string;
  name_key?: string;
}, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["checkDemoSupport", params.inner_game_id, params.game_provider],
    queryFn: () => checkDemoSupport(params),
    enabled: enabled && !!params.inner_game_id && !!params.game_provider && hasAuth()
  });
};

export const useGetUserDefaultCurrencyMutation = () => {
  return useMutation({
    mutationFn: (params: {
      inner_game_id: string;
    }) => getUserDefaultCurrency(params),
    onError: (error: any) => {
      console.error("Failed to get user default currency:", error);
    }
  });
};

export const useLikeGameMutation = () => {
  const { t } = useTranslation();

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (inner_game_id: string) => likeGameV2(inner_game_id),
    onSuccess: (response) => {
      if (response.code === 0) {
        // TODO: 探索页有一项显示是: 关于用户操作过的游戏
        void queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.userGameList });
      } else {
        toast.error(t("common:operationFailed"));
      }
    },
    onError: (_error: any) => {
      toast.error(t("common:operationFailed"));
    }
  });
};

// 获取用户已添加的加密货币提款地址
export const useUserWithdrawWallet = (network?: string, effect = false) => {
  const user = useBoundStore((state) => state.user);
  return useQuery({
    queryKey: [...AUTH_QUERY_KEYS.userWithdrawWallet, network, effect],
    queryFn: () => getUserWithdrawWallet(network),
    enabled: !!user && !!network && hasAuth()
  });
};

// 获取征服任务列表（仅在登录后请求）
export const useConquestList = () => {
  const user = useBoundStore((state) => state.user);
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.conquestList,
    queryFn: () => getConquestList(),
    enabled: !!user && hasAuth()
  });
};

// 热门游戏
export const useTopWageredGames = () => {
  const user = useBoundStore((state) => state.user);
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.topWageredGames,
    queryFn: () => getTopWageredGames(),
    enabled: !!user && hasAuth()
  });
};

// 获取用户的广告参数
export const useDefaultAdTag = () => {
  const user = useBoundStore((state) => state.user);
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.defaultAdTag,
    queryFn: () => getDefaultAdTag(),
    enabled: !!user && hasAuth()
  });
};

// 获取VIP等级信息
export const useVipConfigList = () => {
  const user = useBoundStore((state) => state.user);
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.vipConfigList,
    queryFn: () => getVipConfig(),
    enabled: !!user && hasAuth()
  });
};

export const useVipNextLevelData = () => {
  const status = useBoundStore((state) => state.status);
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.vipNextLevelData,
    queryFn: () => getVipConfig(status?.vip ? status?.vip + 1 : 1),
    enabled: !!status && hasAuth()
  });
};

// 获取用户的成就列表
export const useUserAchievements = (sort: "asc" | "desc" = "asc") => {
  const user = useBoundStore((state) => state.user);
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.userAchievements,
    queryFn: () => getUserAchievementsV2(sort),
    enabled: !!user && hasAuth()
  });
};

// 获取用户已参与的成就记录
export const useMyAchievements = () => {
  const user = useBoundStore((state) => state.user);
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.myAchievements,
    queryFn: () => getMyAchievements(),
    enabled: !!user && hasAuth(),
    select: (data) => {
      // 处理数据，返回更友好的格式
      if (!data?.data || !Array.isArray(data.data)) {
        return { achievements: [], inProgress: [], completed: [] };
      }

      const achievements = data.data;
      const inProgress = achievements.filter((_record: any) => {
        // 这里需要根据具体业务逻辑判断是否完成
        // 暂时认为所有记录都是进行中的
        return true;
      });
      const completed = achievements.filter((_record: any) => {
        // 完成的成就判断逻辑
        return false; // 需要根据实际业务逻辑调整
      });

      return {
        achievements,
        inProgress,
        completed
      };
    }
  });
};

// 获取推荐奖励 Claim 数据（基础 API Hook）
export const useReferralClaim = () => {
  const user = useBoundStore((state) => state.user);
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.referralClaim,
    queryFn: () => getClaimBonus("referral"),
    enabled: !!user && hasAuth()
  });
};

// 获取团队佣金 Claim 数据（基础 API Hook）
export const useGroupClaim = () => {
  const user = useBoundStore((state) => state.user);
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.groupClaim,
    queryFn: () => getClaimBonus("group"),
    enabled: !!user && hasAuth()
  });
};

export const useReferralList = (params: Omit<GetReferralListParams, "last_id">) => {
  const user = useBoundStore((state) => state.user);
  return useInfiniteQuery({
    queryKey: [...AUTH_QUERY_KEYS.referralList, params],
    queryFn: ({ pageParam }) =>
      getReferralList({
        ...params,
        last_id: pageParam
      }),
    initialPageParam: "",
    getNextPageParam: (lastPage) =>
      lastPage.data?.length > 0 ? lastPage.data[lastPage.data.length - 1].id : undefined,
    enabled: !!user && hasAuth()
  });
};

export const useAdTagList = () => {
  const user = useBoundStore((state) => state.user);
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.adTagList,
    queryFn: () => getAdTagList(),
    enabled: !!user && hasAuth()
  });
};

export const useCreateAdTag = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation("referral");

  return useMutation({
    mutationFn: (params: CreateAdTagParams) => createAdTag(params),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.adTagList });
      // 如果创建时设为默认，刷新 defaultAdTag 确保推广链接实时更新
      if (variables.is_default) {
        queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.defaultAdTag });
      }
      toast.success(t("referral:campaignCreateSuccess", "Campaign created successfully!"));
    },
    onError: (error: any) => {
      console.error("Failed to create campaign:", error);
      const rawMessage =
        error?.response?.data?.data ||
        error?.response?.data?.msg ||
        error?.message ||
        "";
      const normalized = String(rawMessage).toLowerCase();

      if (normalized.includes("campaign already exists")) {
        toast.error(t("referral:campaignAlreadyExists", "Campaign already exists"));
        return;
      }

      toast.error(rawMessage || t("referral:campaignCreateFailed", "Failed to create campaign"));
    }
  });
};

export const useSetDefaultAdTag = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: SetDefaultAdTagParams) => setDefaultAdTag(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.adTagList });
      // 同时刷新 defaultAdTag，确保推广链接实时更新
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.defaultAdTag });
      toast.success("Campaign set as default successfully!");
    },
    onError: (error: any) => {
      console.error("Failed to set campaign as default:", error);
      toast.error(error.message || "Failed to set campaign as default");
    }
  });
};

export const QueryKycDetail = () => {
  const user = useBoundStore((state) => state.user);
  const defaultKycDetail: KycDetail = {
    id: 0,
    team_id: 0,
    user_id: 0,
    first_name: "",
    middle_name: "",
    last_name: "",
    birthday: "",
    country: "",
    state: "",
    city: "",
    address: "",
    zip_code: "",
    document_type: 0,
    document_url: "",
    status: 0,
    created_at: 0,
    updated_at: 0,
    email: "",
    nickname: "",
    phone: ""
  };

  const { data = { data: defaultKycDetail, code: 0 }, refetch } = useQuery<{ data: KycDetail, code: number }>({
    queryKey: AUTH_QUERY_KEYS.kycDetail,
    queryFn: () => getKycDetail(),
    enabled: !!user && hasAuth()
  });
  return {
    data: data && data.code === 0 ? (data?.data ?? defaultKycDetail) : defaultKycDetail,
    refetch
  };
};

export const useNotificationMessage = (params: {
  read: number
}, enabled?: boolean) => {
  const user = useBoundStore((state) => state.user);
  const { i18n } = useTranslation();
  const lang = i18n.language || "en";

  return useInfiniteQuery({
    queryKey: [...AUTH_QUERY_KEYS.notificationMessage, params.read, lang],
    queryFn: async ({ pageParam = 0 }) => {
      return await getNotificationMessage({
        last_id: pageParam,
        limit: 30,
        has_read: params.read,
        lang
      });
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      return !lastPage?.meta?.has_more ? undefined : lastPage?.meta?.next_last_id;
    },
    enabled: !!user && enabled && hasAuth()
  });
};

// 未读取的站内信
export const useUnreadNotificationCounter = () => {
  const user = useBoundStore((state) => state.user);
  const isAuthenticated = !!user && hasAuth();
  const enabled = useIdleEnabled(isAuthenticated);
  const { i18n } = useTranslation();
  const lang = i18n.language || "en";

  return useQuery({
    queryKey: [...AUTH_QUERY_KEYS.unreadNotificationCounter, lang],
    queryFn: () => getNotificationMessage({
      last_id: 0,
      limit: 1,
      has_read: 0,
      lang
    }),
    enabled
  });
};

/**
 * 钱包设置中的法币列表
 */
export const useWalletSettingsCurrency = () => {
  const user = useBoundStore((state) => state.user);
  return useQuery({
    queryKey: ["walletSettingsCurrency"],
    queryFn: async () => {
      return getWalletSettingsCurrency();
    },
    enabled: !!user && hasAuth(),
    refetchOnMount: true
  });
};

export const useBonusClaimCount = () => {
  const user = useBoundStore((state) => state.user);
  const isAuthenticated = !!user && hasAuth();
  const enabled = useIdleEnabled(isAuthenticated);

  return useQuery({
    queryKey: ["useBonusClaimCount"],
    queryFn: () => getClaimCount(),
    enabled,
    refetchInterval: 30_000
  });
};

export const useMondayVipBonus = () => {
  const user = useBoundStore((state) => state.user);
  return useQuery({
    queryKey: ["useMondayVipBonus"],
    queryFn: () => getMondayVipBonus(),
    enabled: !!user && hasAuth(),
    refetchOnWindowFocus: "always"
  });
};

export const useBonusSwitch = () => {
  const user = useBoundStore((state) => state.user);

  const { data: switchData = { data: {}, code: 0 }, refetch, isLoading } = useQuery<{
    data: { [key: string]: any };
    code: number
  }>({
    queryKey: ["bonusSwitch"],
    queryFn: () => bonusSwitch(),
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    enabled: !!user && hasAuth()
  });

  const parsedSwitchData: { [key: string]: any } = switchData?.code === 0 ? switchData?.data ?? {} : {};

  const bonusSwitchData = {
    ...(parsedSwitchData?.bonus_switch ?? {}),
    monday_vip_bonus: (parsedSwitchData?.bonus_switch?.monday_vip_bonus ?? 1),// 即使返回null 或者没有也要 1，除非确定返回 0
    members_day: (parsedSwitchData?.bonus_switch?.members_day ?? 1)
  };

  return {
    switchData: {
      bonus_switch: bonusSwitchData
    },
    refetch,
    isLoading
  };
};

/**
 * 彩金活动配置列表
 */
export function useBonusConfigList() {
  const user = useBoundStore((state) => state.user);
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.bonusConfigList,
    queryFn: () => getBonusConfigList(),
    enabled: hasAuth() && !!user
  });
}

/**
 * 体育彩金活动配置列表
 */
export function useSportsBonusConfigList() {
  const user = useBoundStore((state) => state.user);
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.sportsBonusConfigList,
    queryFn: () => getSportsBonusConfigList(),
    enabled: hasAuth() && !!user
  });
}

/**
 * 当前用户请求 IP 所在区域是否属于 Betby 禁区(决定是否隐藏 sports bonus 入口)
 */
export function useSportsBonusIsRegionBanned() {
  const user = useBoundStore((state) => state.user);
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.sportsBonusIsRegionBanned,
    queryFn: () => getSportsBonusIsRegionBanned(),
    enabled: hasAuth() && !!user
  });
}

/**
 * 路由位置: https://localhost:3000/main/tournament/arena?id=%22200015%22
 * 排行榜列表数据
 * @param params
 */
export function useTournamentLeaderboard(params: {
  page: number
  limit: number
  // last_id: string
  // last_wagered: string
  tournament_id: string
  tournament_level: string
}) {
  const user = useBoundStore((state) => state.user);
  return useQuery({
    queryKey: [...AUTH_QUERY_KEYS.tournamentLeaderboard, params.page, params.tournament_id, params.tournament_level],
    queryFn: () => getTournamentLeaderboard(params),
    enabled: hasAuth() && !!user && !!params.tournament_id,
    placeholderData: keepPreviousData
  });
}

export function useLastTournamentLeaderboard(params: {
  page: number
  limit: number
  tournament_id: string
}) {
  const user = useBoundStore((state) => state.user);
  return useQuery({
    queryKey: [...AUTH_QUERY_KEYS.lastTournamentLeaderboard, params.page, params.tournament_id],
    queryFn: () => getLastTournamentLeaderboard(params.tournament_id, params.page, params.limit),
    enabled: hasAuth() && !!user && !!params.tournament_id
  });
}

export function useBonusWalletHistory(params: {
  page: number
  limit: number
  status: string
  last_id?: string
}) {
  const user = useBoundStore((state) => state.user);
  return useQuery({
    queryKey: [...AUTH_QUERY_KEYS.bonusWalletHistory, params.page, params.status],
    queryFn: () => getBonusWalletHistory(params),
    enabled: hasAuth() && !!user,
    placeholderData: keepPreviousData
  });
}

export function useSportsBonusWalletHistory(params: {
  page: number
  limit: number
  status: string
  last_id?: string
}) {
  const user = useBoundStore((state) => state.user);
  return useQuery({
    queryKey: [...AUTH_QUERY_KEYS.sportsBonusWalletHistory, params.page, params.status],
    queryFn: () => getSportsBonusWalletHistory(params),
    enabled: hasAuth() && !!user,
    placeholderData: keepPreviousData
  });
}

// 球游戏 -> 球游戏的主页信息
export function useUserBuddyBallsHome() {
  const user = useBoundStore((state) => state.user);

  // TODO: 20260323记录 -》未来会替换为EMQX订阅通知

  return useQuery({
    queryKey: AUTH_QUERY_KEYS.userBuddyBallsHome,
    queryFn: () => userBuddyBallsHome(),
    enabled: hasAuth() && !!user
  });
}

// 球游戏 -> 收益提取操作记录
export function useBuddyBallsClaimList(params: {
  page: number
  limit: number
  last_id?: string
  source_group?: string
}) {
  const user = useBoundStore((state) => state.user);
  return useQuery({
    queryKey: [...AUTH_QUERY_KEYS.buddyBallsClaimList, params.page, params.source_group],
    queryFn: () => getBuddyBallsClaimList(params),
    enabled: hasAuth() && !!user,
    placeholderData: keepPreviousData
  });
}

// 球游戏 -> 球的消耗记录
export function useBuddyBallsPlayList(params: {
  page: number
  limit: number
  last_id?: string
}) {
  const user = useBoundStore((state) => state.user);
  return useQuery({
    queryKey: [...AUTH_QUERY_KEYS.buddyBallsPlayList, params.page],
    queryFn: () => getBuddyBallsPlayList(params),
    enabled: hasAuth() && !!user,
    placeholderData: keepPreviousData
  });
}

// 幸运盘 -> 主页信息
export function useUserLuckySpinHome(enabled = true) {
  const user = useBoundStore((state) => state.user);

  return useQuery({
    queryKey: AUTH_QUERY_KEYS.userLuckySpinHome,
    queryFn: () => userLuckySpinHome(),
    enabled: hasAuth() && !!user && enabled
  });
}

// 幸运盘 -> 奖池详情接口
export function useSpinPoolPrizeList(type: string) {
  const user = useBoundStore((state) => state.user);

  return useQuery({
    queryKey: [...AUTH_QUERY_KEYS.spinPoolPrizeList, type],
    queryFn: () => getPoolPrizeList(type),
    enabled: hasAuth() && !!user
  });
}

// 幸运盘 -> 所有人中奖列表接口
export function useAllSpinWinList(params: {
  page: number
  limit: number
  sort_type: string
}) {
  const user = useBoundStore((state) => state.user);
  return useQuery({
    queryKey: [...AUTH_QUERY_KEYS.allSpinWinList, params.page, params.sort_type],
    queryFn: () => getAllSpinWinList(params),
    enabled: hasAuth() && !!user,
    placeholderData: keepPreviousData
  });
}

// 幸运盘 -> 用户的抽奖机会获得
export function useUserSpinChance(params: {
  page: number
  limit: number
}) {
  const user = useBoundStore((state) => state.user);
  return useQuery({
    queryKey: [...AUTH_QUERY_KEYS.userSpinChance, params.page],
    queryFn: () => getUserSpinChance(params),
    enabled: hasAuth() && !!user,
    placeholderData: keepPreviousData
  });
}

// 幸运盘 -> 我的中奖列表接口
export function useUserSpinWinList(params: {
  page: number
  limit: number
  sort_type: string
}) {
  const user = useBoundStore((state) => state.user);
  return useQuery({
    queryKey: [...AUTH_QUERY_KEYS.userSpinWinList, params.page, params.sort_type],
    queryFn: () => getUserSpinWinList(params),
    enabled: hasAuth() && !!user,
    placeholderData: keepPreviousData
  });
}

// 领取成就bonus的mutation
export const useAchievementBonusMutation = (
  callback?: (response: any, variables: any) => void
) => {
  const { t } = useTranslation(["toast", "achievement"]);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: number }) =>
      claimAchievementBonus(id),
    onSuccess: (response: any, variables) => {
      if (response.code === 0) {
        void queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.userAchievements });
      } else {
        const { code } = response;
        if (code === 4001) {
          toast.error(t("vipMonday:not_in_claim_time_range"));
        } else if (code === 4002) {
          toast.error(t("vipMonday:bonus_already_claimed"));
        } else if (code === 4003) {
          toast.error(t("vipMonday:wager_requirement_not_met"));
        } else if (code === 50006) {
          // 奖金池不足 → 引导联系客服
          toast.error(t("toast:pleaseContactCustomerService"));
        } else if (code === 50011) {
          // 等级提示
          toast.error(createElement("p", null, t("achievement:achievementsAvailableLevel", { level: 2 })));
        } else {
          // 50001: 无记录 | 50002: 余额为 0 | 50012: 余额不足 1
          // 50009: 乐观锁冲突 | 59999: 系统异常
          toast.error(t("toast:claimBonusFailed"));
        }
      }

      // 调用自定义的回调
      if (callback) callback(response, variables);
    },
    onError: (error: any) => {
      console.error("Failed to claim bonus:", error);
      toast.error(t("toast:claimBonusFailed"));
    }
  });
};

export const useGetMondayVipBonus = () => {
  const user = useBoundStore((state) => state.user);
  const { data: mondayVipBonus, isLoading, refetch } = useQuery<{
    data: Record<string, any>;
    code: number;
  }>({
    queryKey: ["getMondayVipBonus"],
    queryFn: () => getMondayVipBonus(),
    enabled: !!user && hasAuth(),
    refetchOnMount: true
  });

  return {
    mondayVipBonus: mondayVipBonus?.code === 0 ? mondayVipBonus.data : undefined,
    isLoading,
    refetch
  };
};
