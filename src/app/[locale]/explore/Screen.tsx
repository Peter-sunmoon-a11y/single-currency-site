import { searchParamsToObject } from "@/lib/navigation";
import { buildConfig } from "@/lib/env";
import { useSearchParams, usePathname } from "next/navigation";
import {
  getDefaultSecondaryValue,
  hasSecondaryMenu,
  getPrimaryApiCategory,
  getSecondaryApiCategory
} from "@/config";
import { useUserGameList } from "@/hooks/api/useAuth.ts";
import { useCasinoGameList } from "@/hooks/api/usePublic.ts";
import { bonus_currencies, ExploreGameGrid, ExploreFilterBar } from "@/sections/explore";
import axios from "axios";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useBoundStore } from "@/store";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { useSettlementCurrency } from "@/contexts/SettlementCurrencyContext.tsx";
import { isSupportedLocale } from "@/lib/i18n/config";
import { useAppNavigate } from "@/hooks/useAppNavigate";

export const sanitizeSearchValue = (value: unknown) => {
  if (typeof value !== "string") return "";
  return value.split("?")[0]?.split("#")[0] ?? "";
};

export const validateExploreSearch = (search: Record<string, unknown>) => {
  // 只保留已知的有效参数，过滤掉未知参数（如 rt=fxiq）
  // 部分 PWA 容器会把自己的 query 片段拼进参数值里（例如 category=all?rb=Ftxi），这里做一次兜底清洗。

  const type = sanitizeSearchValue(search.type) || "casino";
  const result: Record<string, string> = {
    type
  };

  const hasSecondaryCategory = hasSecondaryMenu(type);

  if (hasSecondaryCategory && search.category) {
    const category = sanitizeSearchValue(search.category);
    if (category) {
      result.category = category;
    }
  }

  if (typeof search.providers !== "undefined" && search.providers) {
    const providers = sanitizeSearchValue(search.providers);
    if (providers) {
      const providerList = providers
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);

      // providers=all 用于触发供应商筛选弹层
      if (providerList.includes("all")) {
        result.providers = "all";
      } else {
        result.providers = providerList.join(",");
      }
    }
  }

  // Allow sort parameter
  if (typeof search.sort !== "undefined") {
    // Also sanitize sort parameter to prevent pollution
    result.sort = sanitizeSearchValue(search.sort);
  }

  return result;
};

const isExplorePathname = (pathname: string) => {
  if (pathname === "/explore" || pathname.startsWith("/explore/")) return true;

  const [, maybeLocale, route] = pathname.split("/");
  return isSupportedLocale(maybeLocale) && route === "explore";
};

function RouteComponent() {
  const navigate = useAppNavigate();
  const pathname = usePathname();
  const locationSearchParams = useSearchParams();
  const location = {
    pathname,
    search: locationSearchParams.toString() ? `?${locationSearchParams.toString()}` : "",
    href: locationSearchParams.toString() ? `${pathname}?${locationSearchParams.toString()}` : pathname,
    hash: typeof window === "undefined" ? "" : window.location.hash
  };

  const searchSearchParams = useSearchParams();
  const search = searchParamsToObject(searchSearchParams);
  const gameType = sanitizeSearchValue(search.type) || "casino";
  const supportsSecondaryCategory = hasSecondaryMenu(gameType);
  const initialCategory = supportsSecondaryCategory ? sanitizeSearchValue(search.category) : "";
  const providers = sanitizeSearchValue(search.providers);
  const sort = sanitizeSearchValue((search as any).sort);
  const user = useBoundStore((state) => state.user);
  const status = useBoundStore((state) => state.status);
  const isInitialized = useBoundStore((state) => state.isInitialized);
  const normalizedInitialCategory =
    gameType === "casino" && !user?.id && initialCategory === "recent" ? "hot" : initialCategory;

  useEffect(() => {
    const navEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    const isReload = navEntry?.type === "reload" || (performance as any)?.navigation?.type === 1;
    if (!isReload) return;

    if (window.RumSDK?.default) {
      const ArmsRum = window.RumSDK.default;
      ArmsRum.sendCustom({
        type: "ExplorePullToRefresh",
        name: "ExplorePullToRefresh",
        properties: {
          error_msg: `reload|url=${window.location.href}|type=${gameType}|category=${initialCategory ?? ""}|providers=${providers ?? ""}`,
          error_time: new Date().getTime(),
          error_user: user?.id,
          error_country: user?.country,
          error_version: buildConfig.version
        }
      });
    }
  }, [gameType, initialCategory, providers, user?.country, user?.id]);

  // Android PWA 下拉刷新/页面卸载时，未完成的请求可能会被取消（ERR_CANCELED）。
  // 取消不算真正的加载失败，避免误显示错误态。
  const isRequestCanceled = (err: unknown) => {
    if (!err) return false;
    if (axios.isCancel(err)) return true;
    const anyErr = err as any;
    return (
      anyErr?.code === "ERR_CANCELED" ||
      anyErr?.name === "CanceledError" ||
      anyErr?.name === "AbortError" ||
      (typeof anyErr?.message === "string" && anyErr.message.toLowerCase().includes("canceled"))
    );
  };

  // Derived state directly from URL
  const resolvedDefaultCategory = useMemo(() => {
    if (!supportsSecondaryCategory) {
      return "";
    }
    if (gameType === "casino") {
      if (!user?.id) return "hot";
      return status?.bet_times && status.bet_times > 0 ? "recent" : "hot";
    }
    return getDefaultSecondaryValue(gameType) || "hot";
  }, [gameType, status?.bet_times, supportsSecondaryCategory, user?.id]);

  const fallbackCategory = supportsSecondaryCategory ? "hot" : "";
  const value = normalizedInitialCategory || (isInitialized ? resolvedDefaultCategory : fallbackCategory);

  const sortValue = sort || (value === "new" ? "newest" : value === "hot" ? "popular" : "");
  const selectedProviders = useMemo(() => {
    if (!providers?.trim()) return [];
    return providers
      .split(",")
      .map((provider) => provider.trim())
      .filter(Boolean)
      .filter((provider) => provider !== "all");
  }, [providers]);

  const providersSignature = useMemo(() => selectedProviders.join(","), [selectedProviders]);

  const isUserTab = value === "recent" || value === "favorites";

  useEffect(() => {
    if (!isInitialized) {
      return;
    }
    if (!supportsSecondaryCategory) {
      return;
    }
    const targetCategory = normalizedInitialCategory || resolvedDefaultCategory;
    if (!targetCategory) {
      return;
    }
    if (initialCategory && initialCategory === normalizedInitialCategory) {
      return;
    }

    navigate({
      to: "/explore",
      search: (prev: any) => ({
        ...prev,
        type: gameType,
        category: targetCategory
      }),
      replace: true
    });
  }, [gameType, initialCategory, isInitialized, navigate, normalizedInitialCategory, resolvedDefaultCategory, supportsSecondaryCategory]);

  const handleSetSelectedProviders = useCallback((newProvidersOrFn: string[] | ((prev: string[]) => string[])) => {
    const nextProviders = typeof newProvidersOrFn === "function"
      ? newProvidersOrFn(selectedProviders)
      : newProvidersOrFn;

    const providersStr = nextProviders.join(",");

    navigate({
      to: "/explore",
      search: (prev: any) => ({
        ...prev,
        providers: nextProviders.length > 0 ? providersStr : undefined
      }),
      replace: true
    });
  }, [selectedProviders, navigate]);

  // Map frontend sort values to API format
  const getSortParam = (sortValue: string) => {
    if (!sortValue) {
      return "";
    }
    switch (sortValue) {
      case "popular":
        return "popular";
      case "az":
        return "a-z";
      case "za":
        return "z-a";
      case "newest":
        return "newest";
      default:
        return "popular";
    }
  };

  const sortParam = useMemo(() => getSortParam(sortValue), [sortValue]);

  const gameLimit = 30;
  const providersParam = selectedProviders.length > 0 ? selectedProviders.join(",") : "";

  const { i18n } = useTranslation();

  const { selectedCurrency } = useSettlementCurrency();

  // 是否是彩金币种（bonus 现为一级分类）
  const is_bonus_currency = gameType === "bonus" && bonus_currencies.has(selectedCurrency);

  const gameCategory1 = gameType === "casino" && value === "fishing" ? "fishing" : getPrimaryApiCategory(gameType);
  const gameCategory2 = gameType === "casino" && value === "fishing" ? "" : getSecondaryApiCategory(value);

  const filterParamsSig = useMemo(() => {
    if (isUserTab) {
      return JSON.stringify({
        mode: "user",
        type: value,
        providers: providersSignature,
        sort: sortParam
      });
    }

    return JSON.stringify({
      mode: "casino",
      game_category_1: gameCategory1,
      game_category_2: gameCategory2,
      providers: providersSignature,
      sort: sortParam
    });
  }, [gameCategory1, gameCategory2, isUserTab, is_bonus_currency, providersSignature, sortParam, value]);

  // Store Integration
  const { exploreState, setExploreState } = useBoundStore();
  const isCacheValid = exploreState.filterFingerprint === filterParamsSig;

  // Initialize from cache if valid, otherwise defaults
  const [currentPage, setCurrentPage] = useState(isCacheValid ? exploreState.page : 1);
  const [allGames, setAllGames] = useState<any[]>(isCacheValid ? exploreState.games : []);

  // 追踪上一次的 filterParamsSig，用于同步重置 page
  const prevFilterSigRef = useRef(filterParamsSig);

  // 标记是否从 store 缓存恢复，防止 refetchOnMount 导致重复追加
  const restoredFromCacheRef = useRef(isCacheValid && currentPage > 1);

  // 将菜单值映射到API参数
  const filterParams = useMemo(() => {
    return {
      sort: sortParam,
      lang: user?.language_code.toUpperCase() || i18n.language.toUpperCase() || "EN",
      keyword: "",
      providers: providersParam,
      game_category_1: gameCategory1,
      game_category_2: gameCategory2,
      type: ""
    };
  }, [is_bonus_currency, sortParam, user?.language_code, i18n.language, providersParam, gameCategory1, gameCategory2]);

  const baseParams = useMemo(() => {
    // 同步检测筛选条件是否变化，避免用旧的 page 发起请求
    const filterChanged = prevFilterSigRef.current !== filterParamsSig;
    const effectivePage = filterChanged ? 1 : currentPage;

    return {
      ...filterParams,
      limit: gameLimit,
      page: effectivePage
    };
  }, [filterParams, gameLimit, currentPage, filterParamsSig]);

  const userGameParams = useMemo(() => {
    return {
      type: value,
      keyword: "",
      providers: providersParam,
      sort: sortParam,
      lang: i18n.language,
      limit: 500,
      page: 1
    };
  }, [value, providersParam, sortParam, i18n.language]);

  const {
    data: casinoGameListData,
    isLoading: isCasinoLoading,
    isFetching: isCasinoFetching,
    isError: isCasinoError,
    error: casinoError
  } = useCasinoGameList(baseParams, {
    enabled: !isUserTab,
    // 中文注释：Android PWA 下拉刷新可能中断请求；确保重新挂载时会自动再拉一次，避免卡在错误态。
    refetchOnMount: true,
    retry: 2,
    retryDelay: 300
  });

  const casinoData = !isUserTab ? ((casinoGameListData as any) ?? {}) : {};

  const {
    data: userGameListData,
    isLoading: isUserGameListLoading,
    isFetching: isUserGameListFetching,
    isError: isUserGameListError,
    error: userGameListError
  } = useUserGameList(userGameParams, {
    enabled: isUserTab,
    refetchOnMount: true,
    retry: 2,
    retryDelay: 300,
    placeholderData: undefined
  });

  const crossNavigationTabs = useMemo(() => new Set(["casino", "slots", "liveCasino", "fast", "fishing", "bonus", "lottery"]), []);

  const changeExploreTab = (newValue: string) => {
    // 如果是跨类型切换（点击了一级菜单项）
    if (crossNavigationTabs.has(newValue)) {
      const targetType = newValue;
      const defaultCategory =
        targetType === "casino"
          ? status?.bet_times && status.bet_times > 0
            ? "recent"
            : "hot"
          : getDefaultSecondaryValue(targetType);

      const nextSearch: any = {
        type: targetType
      };

      if (targetType !== "fishing" && targetType !== "bonus" && targetType !== "lottery") {
        nextSearch.category = defaultCategory || "hot";
      }

      // 切换一级分类时，通常重置筛选条件
      navigate({
        to: "/explore",
        search: nextSearch,
        replace: true
      });
      return;
    }

    // 同一类型下切换二级分类
    const nextSearch: any = {
      type: gameType,
      category: newValue
    };

    // 保留 providers
    if (providersParam) {
      nextSearch.providers = providersParam;
    }

    // 处理排序逻辑
    if (newValue === "new") {
      nextSearch.sort = "newest";
    } else if (newValue === "hot") {
      nextSearch.sort = "popular";
    } else if (newValue === "all") {
      // Reset to default sort when returning to all
      nextSearch.sort = undefined;
    } else if (sortValue && sortValue !== "popular") {
      // 保留当前排序（如果不是默认值）
      nextSearch.sort = sortValue;
    }

    void navigate({
      to: "/explore",
      search: nextSearch,
      replace: true
    });
  };

  // 筛选条件变化时：重置分页，并更新指纹基准（否则翻页会一直被强制 page=1）
  useEffect(() => {
    const filterChanged = prevFilterSigRef.current !== filterParamsSig;
    if (!filterChanged) return;

    prevFilterSigRef.current = filterParamsSig;
    setCurrentPage(1);
    setAllGames([]);
    restoredFromCacheRef.current = false;
  }, [filterParamsSig]);

  // Sync state to store whenever data changes
  useEffect(() => {
    if (!isUserTab) {
      setExploreState({
        games: allGames,
        page: currentPage,
        filterFingerprint: filterParamsSig
      });
    }
  }, [allGames, currentPage, filterParamsSig, isUserTab, setExploreState]);

  // Accumulate games when new data arrives
  useEffect(() => {
    if (isUserTab) {
      return;
    }
    if (casinoData?.data) {
      if (currentPage === 1) {
        setAllGames(casinoData.data);
      } else if (restoredFromCacheRef.current) {
        // 从缓存恢复后 refetchOnMount 触发的数据已包含在缓存中，跳过追加
        restoredFromCacheRef.current = false;
      } else {
        setAllGames((prevGames) => [...prevGames, ...casinoData.data]);
      }
    } else if (currentPage === 1) {
      setAllGames([]);
    }
  }, [casinoData?.data, currentPage, isUserTab]);

  const handleLoadMore = useCallback(() => {
    if (isUserTab) return;
    setCurrentPage((prevPage) => prevPage + 1);
  }, [isUserTab]);

  const userGames = useMemo(() => {
    if (userGameListData?.code === 0 && Array.isArray(userGameListData.data)) {
      return userGameListData.data;
    }
    return [];
  }, [userGameListData]);

  const isFilterChanging = prevFilterSigRef.current !== filterParamsSig;
  const displayedGames = isFilterChanging ? [] : isUserTab ? userGames : allGames;
  const userGamesErrorState = isUserTab && (isUserGameListError || (userGameListData !== undefined && userGameListData.code !== 0));
  const isGridLoading = isUserTab ? isUserGameListLoading || isUserGameListFetching : isCasinoLoading || isCasinoFetching;
  const isGridError = isUserTab
    ? Boolean(userGamesErrorState) && !isRequestCanceled(userGameListError)
    : isCasinoError && !isRequestCanceled(casinoError);
  const hasMoreCasinoGames = !isUserTab && casinoData?.data?.length === gameLimit;
  const currentCount = displayedGames?.length ?? 0;
  const isLoadingMoreGames = !isUserTab && isCasinoLoading && currentPage > 1;
  const loadMoreHandler = !isUserTab ? handleLoadMore : undefined;
  // 首次加载中：正在请求 或 数据已到但还没同步到 allGames
  const hasPendingData = !isUserTab && casinoData?.data?.length > 0 && allGames.length === 0;
  const initialLoading = isFilterChanging || (isGridLoading && currentCount === 0) || hasPendingData;
  const gridContainerRef = useRef<HTMLDivElement>(null);

  // 防止在非 explore 路由下渲染（可能由 React 并发渲染导致）
  if (!isExplorePathname(location.pathname)) {
    return null;
  }

  return (
    <div className="flex flex-col h-full">
      {/** Fixed Header - Tabs and Search */}
      <div className="shrink-0 bg-base-300 px-1 pb-2 pt-2" style={{ touchAction: "pan-y" }}>
        <ExploreFilterBar
          gameType={gameType}
          category={value}
          selectedProviders={selectedProviders}
          onChangeTab={changeExploreTab}
          onChangeProviders={handleSetSelectedProviders}
          filterParams={filterParams}
          providers={providers}
        />
      </div>

      {/** Game list with virtual scrolling */}
      <div ref={gridContainerRef} className="flex-1 min-h-0 overflow-y-auto hide-scrollbar px-1 pb-2">
        <ExploreGameGrid
          isLoading={initialLoading}
          isError={isGridError}
          currentCount={currentCount}
          casinoGameList={{ data: displayedGames }}
          hasMoreGames={hasMoreCasinoGames}
          isLoadingMore={isLoadingMoreGames}
          onLoadMore={loadMoreHandler}
          scrollContainerRef={gridContainerRef}
        />
      </div>
    </div>
  );
}

export const beforeLoad = undefined;

export default RouteComponent;
