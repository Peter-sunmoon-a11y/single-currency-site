import { searchParamsToObject } from "@/lib/navigation";
import { betbyConfig } from "@/lib/env";
import { useSearchParams, usePathname } from "next/navigation";
import { useBoundStore } from "@/store";
import { BetbyAccessDeniedError, BetbyNoAccessError, BetbyNotAllowedError } from "@/types/betby";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { isSupportedLocale } from "@/lib/i18n/config";
import { fetchBetbyAuthToken, getBetByConfig } from "@/services/sports/betby";
import type { BetbyAuthResponse, BTRendererInstance } from "@/types/betby";
import { SportsBonusGuard } from "@/sections/sports/SportsBonusGuard.tsx";
import { PUBLIC_QUERY_KEYS } from "@/hooks/api/usePublic.ts";
import { queryClient } from "@/integrations/tanstack-query/root-provider.tsx";
import { useAuthAction } from "@/hooks/useAuthAction";
import { useAppNavigate } from "@/hooks/useAppNavigate";
import { TextBaseContent } from "@/components/standard/TextBaseContent.tsx";
import type { ApiResponse } from "@/types/auth";
import { siteConfig } from "@/lib/env";
import { useRootCssPixelVar } from "@/hooks/useRootCssPixelVar";

const DEFAULT_BETBY_SDK_URL = "https://1stgame.sptpub.com/bt-renderer.min.js";
const BETBY_SDK_URL = betbyConfig.sdkUrl || DEFAULT_BETBY_SDK_URL;

const isSportsPathname = (pathname: string) => {
  if (pathname === "/sports" || pathname.startsWith("/sports/")) return true;

  const [, maybeLocale, route] = pathname.split("/");
  return isSupportedLocale(maybeLocale) && route === "sports";
};

// 创建支持国际化的错误组件
const RegionRestrictionError = () => {
  const { t } = useTranslation("information");

  return (
    <div className="h-full text-center flex flex-col items-center justify-center gap-4 px-10">
      <img src="/images/common/location-ban.png" alt="" className="w-[70px] h-[70px] text-primary" />
      <h1 className={"text-base font-bold"}>{t("userRestriction.title")}</h1>
      <TextBaseContent text={t("userRestriction.description", { host: siteConfig.nickname })} />
    </div>
  );
};

function SportsPageContent() {
  const navigate = useAppNavigate();
  const user = useBoundStore((state) => state.user);
  const { i18n } = useTranslation(["information", "common"]);
  const pathname = usePathname();
  const locationSearchParams = useSearchParams();
  const location = {
    pathname,
    search: locationSearchParams.toString() ? `?${locationSearchParams.toString()}` : "",
    href: locationSearchParams.toString() ? `${pathname}?${locationSearchParams.toString()}` : pathname,
    hash: typeof window === "undefined" ? "" : window.location.hash
  };
  const { openAuth } = useAuthAction();
  const searchParamsSearchParams = useSearchParams();
  const searchParams = searchParamsToObject(searchParamsSearchParams);
  const btPathParam = searchParams["bt-path"];

  const [params, setParams] = useState<BetbyAuthResponse | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [isRestricted, setIsRestricted] = useState(false);

  const btInstanceRef = useRef<BTRendererInstance | null>(null);
  const isSportsRouteRef = useRef(true);
  const lastInitParamsRef = useRef<{
    brandId: string | number;
    lang: string;
    topOffset: number;
    bottomOffset: number;
    currency: string;
  } | null>(null);
  const lastUserStateRef = useRef<{
    currency?: string;
    currency_fiat?: string;
    language_code?: string;
  }>({});

  const brandId = params?.brand_id;
  const token = params?.jwt ?? null;
  const normalizedLang = params?.lang === "zh-CN" ? "zh" : (params?.lang || "en");
  const currency = params?.currency || user?.currency_fiat || "USD";

  // Header 和 Betby 导航栏高度
  const headerHeight = 48;
  const betbyNavigationHeight = 48;
  const betbyStickyTop = 0;
  const safeAreaInsetTop = useRootCssPixelVar("--safe-area-inset-top");

  // bet slip 需要考虑：safe area + header + betby 导航栏
  const betbyBetSlipOffsetTop = safeAreaInsetTop + headerHeight + betbyNavigationHeight;

  // Dock 高度
  const dockHeight = 72;
  const betSlipBottomOffset = dockHeight;

  const getBetbyUrl = useCallback((btPath?: string) => {
    if (!btPath) return undefined;

    let value = btPath;
    try {
      value = decodeURIComponent(value);
    } catch {
      // ignore
    }

    if (!value.startsWith("/")) {
      value = `/${value}`;
    }
    return value;
  }, []);

  const getLegacyBetbyPathFromLocation = useCallback(() => {
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    const category = params.get("category");
    const sport = params.get("sport");

    if (category === "hot") return "/";
    if (category === "live") return "/live";
    if (category === "favorites") return "/favorites";
    if (!sport) return null;

    const sportMap: Record<string, string> = {
      football: "/soccer-1",
      basketball: "/basketball-2",
      cricket: "/cricket-21",
      tennis: "/tennis-5",
      esoccer: "/esoccer-300",
      "ice-hockey": "/ice-hockey-4",
      esports: "/e_sport/109",
      formula1: "/formula-1-40",
      baseball: "/3",
      handball: "/6",
      volleyball: "/volleyball-23"
    };

    return sportMap[sport] ?? null;
  }, []);

  const syncSearchWithBetbyPath = useCallback(() => {
    if (typeof window === "undefined") return;
    if ((window as any).__betby_disable_route_sync) return;
    if (!isSportsRouteRef.current) return;
    if (!isSportsPathname(window.location.pathname)) return;

    const params = new URLSearchParams(window.location.search);
    const betbyPath = params.get("bt-path");
    if (!betbyPath) return;

    const hasExtraParams = Array.from(params.keys()).some((key) => key !== "bt-path");
    if (!hasExtraParams && btPathParam === betbyPath) {
      return;
    }

    void navigate({
      to: "/sports",
      search: {
        "bt-path": betbyPath
      },
      replace: true
    });
  }, [btPathParam, navigate]);

  // 动态加载 Betby SDK 脚本
  useEffect(() => {
    if (window.BTRenderer) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = BETBY_SDK_URL;
    script.async = true;
    script.onload = () => {
      setScriptLoaded(true);
    };
    script.onerror = () => {
      console.error("❌ Failed to load Betby SDK");
    };

    document.body.appendChild(script);

    return () => {
      // 组件卸载时可选择移除脚本
    };
  }, []);

  // 限制访问
  const restrictAccess = useCallback(() => {
    if (btInstanceRef.current && typeof btInstanceRef.current.kill === "function") {
      btInstanceRef.current.kill();
    }
    btInstanceRef.current = null;
    lastInitParamsRef.current = null;
    setIsRestricted(true);
  }, []);

  // 获取集成参数
  const getIntegrationParams = useCallback(async () => {
    if (user) {
      // 已登录用户，获取认证令牌
      try {
        const response = await fetchBetbyAuthToken({
          currency: user.currency_fiat,
          lang: user.language_code
        });

        const paramsWithCurrency = {
          ...response,
          currency: user.currency_fiat
        };
        setParams(paramsWithCurrency);
        setIsRestricted(false);
        return paramsWithCurrency;
      } catch (error) {
        if (error instanceof BetbyNotAllowedError) {
          console.error("❌ Betby 不允许访问（错误码 80004）:", error);
          restrictAccess();
          return null;
        }
        if (error instanceof BetbyNoAccessError) {
          console.error("❌ Betby 访问被拒绝（无访问代码）:", error);
          restrictAccess();
          return null;
        }
        if (error instanceof BetbyAccessDeniedError) {
          console.error("❌ Betby 访问被拒绝（币种限制）:", error);
          restrictAccess();
          return null;
        }
        console.error("❌ 获取认证令牌失败，回退到游客模式", error);

        // 回退到游客模式
        try {
          const brandId = await getBetByConfig();
          const guestParams = {
            jwt: null,
            brand_id: brandId,
            lang: i18n.language,
            currency: "USD"
          };
          setParams(guestParams);
          setIsRestricted(false);
          return guestParams;
        } catch (configError) {
          console.error("❌ 获取 Betby 配置失败:", configError);
          restrictAccess();
        }
      }
    } else {
      // 未登录用户，使用游客模式
      try {
        const brandId = await getBetByConfig();
        const guestParams = {
          jwt: null,
          brand_id: brandId,
          lang: i18n.language,
          currency: "USD"
        };
        setParams(guestParams);
        setIsRestricted(false);
        return guestParams;
      } catch (error) {
        console.error("❌ 获取游客配置失败:", error);
        restrictAccess();
      }
    }
    return null;
  }, [user, restrictAccess, i18n.language]);

  // 刷新令牌
  const refreshToken = useCallback(async () => {
    if (!user) {
      return null;
    }

    try {
      const response = await fetchBetbyAuthToken({
        currency: user.currency_fiat,
        lang: user.language_code
      });

      return response?.jwt ?? null;
    } catch (error) {
      if (error instanceof BetbyNotAllowedError) {
        console.error("❌ 刷新令牌时 Betby 不允许访问（错误码 80004）:", error);
        restrictAccess();
        return null;
      }
      if (error instanceof BetbyNoAccessError) {
        console.error("❌ 刷新令牌时访问被拒绝（无访问代码）:", error);
        restrictAccess();
        return null;
      }
      if (error instanceof BetbyAccessDeniedError) {
        console.error("❌ 刷新令牌时访问被拒绝:", error);
        restrictAccess();
        return null;
      }
      console.error("❌ 刷新令牌失败，回退到游客模式", error);
      await getIntegrationParams();
      return null;
    }
  }, [user, getIntegrationParams, restrictAccess]);

  // 会话刷新回调
  const handleSessionRefresh = useCallback(async () => {
    try {
      const newParams = await getIntegrationParams();
      if (newParams) {
        const nextToken = newParams?.jwt ?? null;
        return nextToken;
      }
      return null;
    } catch (error) {
      console.error("❌ 会话刷新失败:", error);
      return null;
    }
  }, [getIntegrationParams]);

  // 令牌过期回调
  const handleTokenExpired = useCallback(async () => {
    try {
      const newToken = await refreshToken();
      return newToken;
    } catch (error) {
      console.error("❌ 刷新过期令牌失败:", error);
      return null;
    }
  }, [refreshToken]);

  // 令牌刷新回调
  const handleTokenRefresh = useCallback(async () => {
    try {
      const newToken = await refreshToken();
      return newToken;
    } catch (error) {
      console.error("❌ 令牌刷新失败:", error);
      return null;
    }
  }, [refreshToken]);

  const handleBetbyLogin = useCallback(() => {
    openAuth("signin");
  }, [openAuth]);

  const handleBetbyRegister = useCallback(() => {
    openAuth("signup");
  }, [openAuth]);

  // 初始化时获取参数
  useEffect(() => {
    if (scriptLoaded) {
      if (user) {
        lastUserStateRef.current = {
          currency: user.currency || undefined,
          currency_fiat: user.currency_fiat || undefined,
          language_code: user.language_code
        };
      }
      getIntegrationParams();
    }
  }, [scriptLoaded, getIntegrationParams]);

  // 监听用户变化（包括币种变化）
  useEffect(() => {
    if (scriptLoaded && user) {
      const currentState = {
        currency: user.currency || undefined,
        currency_fiat: user.currency_fiat || undefined,
        language_code: user.language_code
      };

      const lastState = lastUserStateRef.current;
      const hasChanged =
        lastState.currency !== currentState.currency ||
        lastState.currency_fiat !== currentState.currency_fiat ||
        lastState.language_code !== currentState.language_code;

      if (hasChanged) {
        lastUserStateRef.current = currentState;
        getIntegrationParams();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.currency, user?.currency_fiat, user?.language_code, scriptLoaded]);

  // 监听游客用户的语言变化
  useEffect(() => {
    if (scriptLoaded && !user) {
      getIntegrationParams();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language, scriptLoaded, user]);

  // 监听 URL 参数变化，更新 Betby 导航
  useEffect(() => {
    if (btInstanceRef.current && typeof btInstanceRef.current.updateOptions === "function") {
      const betbyUrl = getBetbyUrl(btPathParam);
      if (!betbyUrl) return;
      btInstanceRef.current.updateOptions({ url: betbyUrl });
    }
  }, [btPathParam, getBetbyUrl]);

  // 初始化时补齐 bt-path（兼容旧参数）
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ((window as any).__betby_disable_route_sync) return;
    if (!isSportsRouteRef.current) return;
    if (!isSportsPathname(window.location.pathname)) return;

    const params = new URLSearchParams(window.location.search);
    const locationPath = params.get("bt-path");
    const hasExtraParams = Array.from(params.keys()).some((key) => key !== "bt-path");

    if (btPathParam && !hasExtraParams) return;

    const legacyPath = getLegacyBetbyPathFromLocation();
    const nextPath = btPathParam ?? legacyPath ?? locationPath ?? "/";

    void navigate({
      to: "/sports",
      search: {
        "bt-path": nextPath
      },
      replace: true
    });
  }, [btPathParam, getLegacyBetbyPathFromLocation, navigate]);

  // 初始化 Betby SDK
  useEffect(() => {
    const target = document.getElementById("betby");

    if (isRestricted) {
      if (btInstanceRef.current && typeof btInstanceRef.current.kill === "function") {
        btInstanceRef.current.kill();
        btInstanceRef.current = null;
      }
      lastInitParamsRef.current = null;
      return;
    }

    if (!scriptLoaded || brandId == null || !target) {
      return;
    }

    const currentInitParams = {
      brandId,
      lang: normalizedLang,
      topOffset: betbyBetSlipOffsetTop,
      bottomOffset: betSlipBottomOffset,
      currency
    };

    const lastInit = lastInitParamsRef.current;
    const shouldReuseExistingInstance =
      !!btInstanceRef.current &&
      !!lastInit &&
      lastInit.brandId === currentInitParams.brandId &&
      lastInit.lang === currentInitParams.lang &&
      lastInit.currency === currentInitParams.currency;

    if (shouldReuseExistingInstance) {
      if (
        btInstanceRef.current &&
        typeof btInstanceRef.current.updateOptions === "function" &&
        lastInit &&
        (lastInit.topOffset !== currentInitParams.topOffset ||
          lastInit.bottomOffset !== currentInitParams.bottomOffset)
      ) {
        btInstanceRef.current.updateOptions({
          betSlipOffsetTop: currentInitParams.topOffset,
          betSlipOffsetBottom: currentInitParams.bottomOffset
        });
        lastInit.topOffset = currentInitParams.topOffset;
        lastInit.bottomOffset = currentInitParams.bottomOffset;
      }
      return;
    }

    if (btInstanceRef.current && typeof btInstanceRef.current.kill === "function") {
      btInstanceRef.current.kill();
      btInstanceRef.current = null;
      lastInitParamsRef.current = null;
    }

    let isCancelled = false;

    const timeoutId = window.setTimeout(() => {
      if (isCancelled) {
        return;
      }

      // 获取初始 URL
      const initialUrl = getBetbyUrl(btPathParam);

      const bt = new window.BTRenderer().initialize({
        brand_id: brandId,
        token,
        themeName:'1stgame',
        lang: normalizedLang,
        target,
        url: initialUrl, // 设置初始页面
        betSlipOffsetTop: betbyBetSlipOffsetTop,
        betSlipOffsetBottom: betSlipBottomOffset,
        stickyTop: betbyStickyTop,
        betslipZIndex: 996, // 低于 Sidebar (z-999) 和 Betby 导航栏 (z-997)
        onRouteChange: syncSearchWithBetbyPath,
        onLogin: handleBetbyLogin,
        onRegister: handleBetbyRegister,
        onRecharge: function() {
          // 导航到个人资料页面
          navigate({ to: "/profile" });
        },
        onSessionRefresh: handleSessionRefresh,
        onTokenExpired: handleTokenExpired,
        onTokenRefresh: handleTokenRefresh,
        onBetSlipStateChange: function() {
        }
      });

      btInstanceRef.current = bt;
      lastInitParamsRef.current = currentInitParams;
    }, 100);

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [
    brandId,
    normalizedLang,
    currency,
    scriptLoaded,
    navigate,
    betbyStickyTop,
    betbyBetSlipOffsetTop,
    betSlipBottomOffset,
    isRestricted,
    syncSearchWithBetbyPath,
    handleBetbyLogin,
    handleBetbyRegister,
    handleSessionRefresh,
    handleTokenExpired,
    handleTokenRefresh,
    token,
    btPathParam,
    getBetbyUrl
  ]);

  // 组件卸载时清理(TanStack Router lazy route 的 cleanup 不一定触发,但保留以防万一)
  useEffect(() => {
    return () => {
      isSportsRouteRef.current = false;
      if (btInstanceRef.current && typeof btInstanceRef.current.kill === "function") {
        btInstanceRef.current.kill();
        btInstanceRef.current = null;
      }
      lastInitParamsRef.current = null;
    };
  }, []);

  useEffect(() => {
    isSportsRouteRef.current = isSportsPathname(location.pathname);
    if (isSportsRouteRef.current && typeof window !== "undefined") {
      (window as any).__betby_disable_route_sync = false;
    }
  }, [location.pathname]);

  // 显示加载动画的条件：SDK 未加载或参数未准备好
  const showLoading = !scriptLoaded || (!params && !isRestricted);

  return (
    <div className="w-full h-full min-h-screen">
      {/* Betby 容器 */}
      {!isRestricted && <div id="betby" className="pb-18" />}

      {/* 加载动画 */}
      {showLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-2">
            <span className="loading loading-bars loading-lg text-primary"></span>
          </div>
        </div>
      )}

      {isRestricted && (
        <div className="absolute inset-0 flex items-center justify-center">
          <RegionRestrictionError />
        </div>
      )}
    </div>
  );
}

function SportsPage() {
  return (
    <SportsBonusGuard>
      <SportsPageContent />
    </SportsBonusGuard>
  );
}

export const beforeLoad = () => {
  const baseConfig = queryClient.getQueryData<ApiResponse<any>>(PUBLIC_QUERY_KEYS.baseConfig);

  if (baseConfig?.data?.is_show_betby === 0) {
    return {
      type: "block" as const,
      component: RegionRestrictionError
    };
  }
};

export default SportsPage;
