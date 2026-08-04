import { Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "@/lib/i18n/react-i18next";
import Iconify from "@/components/iconify";
import { Modal } from "@/components/ui/Modal";
import { useBoundStore } from "@/store";
import { useGameProviders } from "@/hooks/api/usePublic";
import { useSettlementCurrency } from "@/contexts/SettlementCurrencyContext";
import { cn } from "@/utils/cn";
import { hasSecondaryMenu, PRIMARY_MENUS, SECONDARY_MENUS } from "@/config";
import { ExplorePrimaryTabs } from "./ExplorePrimaryTabs";

const bonus_currencies = new Set(["BONUS"]);
const PROVIDER_CATEGORY_KEY_SET = new Set([
  ...PRIMARY_MENUS.map((item) => item.value),
  ...PRIMARY_MENUS.map((item) => item.apiCategory),
  ...Object.values(SECONDARY_MENUS).flat().map((item) => item.value),
  "prediction"
]);
const CASINO_PROVIDER_BYPASS_CATEGORY_SET = new Set(["hot", "recent", "favorites"]);

interface ProviderOption {
  label: string;
  value: string;
  logo: string;
  dayLogo?: string;
  dayMiniLogo: string;
  nightMiniLogo: string;
  providerGameCategoryMap?: unknown;
}

export interface ExploreFilterBarProps {
  gameType: string;
  category: string;
  selectedProviders: string[];
  onChangeTab: (value: string) => void;
  onChangeProviders: (providers: string[] | ((prev: string[]) => string[])) => void;
  filterParams: Record<string, any>;
  providers?: string;
}

type SheetType = "provider" | null;

const SHEET_CLOSE_DELAY_MS = 180;

export function ExploreFilterBar({
  gameType,
  category,
  selectedProviders,
  onChangeTab,
  onChangeProviders,
  filterParams,
  providers = "",
}: ExploreFilterBarProps) {
  const { t } = useTranslation();
  const openModal = useBoundStore((state) => state.openModal);
  const isAuthenticated = useBoundStore((state) => !!state.user);
  const { selectedCurrency } = useSettlementCurrency();
  const { data: gameProvidersData } = useGameProviders();
  const [openSheet, setOpenSheet] = useState<SheetType>(null);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const closeSheetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const is_bonus_currency = bonus_currencies.has(selectedCurrency);

  const isScopedProviderCategoryMap = useCallback((input: unknown): boolean => {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
      return false;
    }

    const record = input as Record<string, unknown>;
    if ("categories" in record) {
      return true;
    }

    return Object.keys(record).some((key) => PROVIDER_CATEGORY_KEY_SET.has(key));
  }, []);

  const hasSecondaryCategoryInProviderMap = useCallback((
    input: unknown,
    primaryCategories: string[],
    secondaryCategory: string
  ): boolean => {
    if (primaryCategories.length === 0 || !secondaryCategory) return true;
    if (!input || typeof input !== "object" || Array.isArray(input)) return false;

    const record = input as Record<string, unknown>;
    const categories = record.categories;

    if (!categories || typeof categories !== "object" || Array.isArray(categories)) {
      return false;
    }

    return primaryCategories.some((primaryCategory) => {
      const categoryValues = (categories as Record<string, unknown>)[primaryCategory];
      if (Array.isArray(categoryValues)) {
        return categoryValues.some((item) => String(item ?? "").trim() === secondaryCategory);
      }

      if (categoryValues && typeof categoryValues === "object" && !Array.isArray(categoryValues)) {
        return Object.prototype.hasOwnProperty.call(categoryValues, secondaryCategory);
      }

      return false;
    });
  }, []);

  const hasPrimaryCategoryWithCategoriesFallback = useCallback((
    input: unknown,
    primaryCategories: string[]
  ): boolean => {
    if (primaryCategories.length === 0) return true;
    if (!input || typeof input !== "object" || Array.isArray(input)) return false;

    const record = input as Record<string, unknown>;
    const categories = record.categories;

    if (categories && typeof categories === "object" && !Array.isArray(categories)) {
      const categoryRecord = categories as Record<string, unknown>;
      const hasCategoryKey = primaryCategories.some((primaryCategory) =>
        Object.prototype.hasOwnProperty.call(categoryRecord, primaryCategory)
      );

      if (hasCategoryKey) {
        return true;
      }
    }

    return primaryCategories.some((primaryCategory) => Object.prototype.hasOwnProperty.call(record, primaryCategory));
  }, []);

  const hasPrimaryCategoryInCategories = useCallback((
    input: unknown,
    primaryCategories: string[]
  ): boolean => {
    if (primaryCategories.length === 0) return true;
    if (!input || typeof input !== "object" || Array.isArray(input)) return false;

    const record = input as Record<string, unknown>;
    const categories = record.categories;

    if (!categories || typeof categories !== "object" || Array.isArray(categories)) {
      return false;
    }

    return primaryCategories.some((primaryCategory) =>
      Object.prototype.hasOwnProperty.call(categories, primaryCategory)
    );
  }, []);

  // Dark theme detection
  useEffect(() => {
    const check = () => {
      const root = document.documentElement;
      return root.getAttribute("data-theme") === "dark" || root.classList.contains("dark");
    };
    setIsDarkTheme(check());
    const observer = new MutationObserver(() => setIsDarkTheme(check()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    return () => {
      if (closeSheetTimerRef.current) {
        clearTimeout(closeSheetTimerRef.current);
      }
    };
  }, []);

  const providerCategoryMapByProvider = useMemo(() => {
    const response = gameProvidersData as Record<string, any> | undefined;
    const rootData = response?.data;
    const candidates = [
      response?.provider_game_category_map,
      rootData?.provider_game_category_map,
      response?.providerGameCategoryMap,
      rootData?.providerGameCategoryMap
    ];

    const matched = candidates.find((item) => item && typeof item === "object" && !Array.isArray(item));
    return (matched ?? {}) as Record<string, unknown>;
  }, [gameProvidersData]);

  // Provider options filtered by current game type
  const allProviderOptions: ProviderOption[] = useMemo(() => {
    return (gameProvidersData?.data || []).map((p: any) => {
      const directCategoryMap = isScopedProviderCategoryMap(p.provider_game_category_map)
        ? p.provider_game_category_map
        : undefined;

      return {
      label: p.name,
      value: p.name_key ?? p.name,
      logo: p.logo,
      dayLogo: p.day_logo,
      dayMiniLogo: p.day_mini_logo,
      nightMiniLogo: p.night_mini_logo,
      providerGameCategoryMap:
        directCategoryMap ??
        providerCategoryMapByProvider[p.name_key]
      };
    }).filter((p: ProviderOption) => Boolean(p.value))
  }, [gameProvidersData?.data, isScopedProviderCategoryMap, providerCategoryMapByProvider]);

  const shouldBypassProviderCategoryFilter = useMemo(() => {
    if (gameType === "bonus") return true;
    if (gameType === "casino" && CASINO_PROVIDER_BYPASS_CATEGORY_SET.has(category)) return true;
    return false;
  }, [category, gameType]);

  const providerPrimaryCategoryKeys = useMemo(() => {
    if (shouldBypassProviderCategoryFilter) return [];

    const matchedPrimaryMenu = PRIMARY_MENUS.find((item) =>
      item.value === gameType ||
      item.apiCategory === gameType ||
      item.value === filterParams?.game_category_1 ||
      item.apiCategory === filterParams?.game_category_1
    );

    return Array.from(new Set([
      String(filterParams?.game_category_1 || "").trim(),
      String(gameType || "").trim(),
      matchedPrimaryMenu?.value ?? "",
      matchedPrimaryMenu?.apiCategory ?? ""
    ].filter(Boolean)));
  }, [filterParams, gameType, shouldBypassProviderCategoryFilter]);

  const providerPrimaryCategory = providerPrimaryCategoryKeys[0] ?? "";

  const providerSecondaryCategory = useMemo(() => {
    if (shouldBypassProviderCategoryFilter) return "";
    return String(filterParams?.game_category_2 || "").trim();
  }, [filterParams, shouldBypassProviderCategoryFilter]);

  const shouldUsePrimaryCategoryKeyMatch = useMemo(() => {
    return !providerSecondaryCategory && !hasSecondaryMenu(gameType);
  }, [gameType, providerSecondaryCategory]);

  const shouldUsePrimaryCategoriesPresenceMatch = useMemo(() => {
    return hasSecondaryMenu(gameType) && !providerSecondaryCategory;
  }, [gameType, providerSecondaryCategory]);

  const providerOptions: ProviderOption[] = useMemo(() => {
    if (shouldBypassProviderCategoryFilter || !providerPrimaryCategory) {
      return allProviderOptions;
    }

    return allProviderOptions.filter((provider) => {
      if (shouldUsePrimaryCategoryKeyMatch) {
        return hasPrimaryCategoryWithCategoriesFallback(provider.providerGameCategoryMap, providerPrimaryCategoryKeys);
      }

      if (shouldUsePrimaryCategoriesPresenceMatch) {
        return hasPrimaryCategoryInCategories(provider.providerGameCategoryMap, providerPrimaryCategoryKeys);
      }

      return hasSecondaryCategoryInProviderMap(
        provider.providerGameCategoryMap,
        providerPrimaryCategoryKeys,
        providerSecondaryCategory
      );
    });
  }, [
    allProviderOptions,
    hasPrimaryCategoryInCategories,
    hasPrimaryCategoryWithCategoriesFallback,
    hasSecondaryCategoryInProviderMap,
    providerPrimaryCategory,
    providerPrimaryCategoryKeys,
    providerSecondaryCategory,
    shouldBypassProviderCategoryFilter,
    shouldUsePrimaryCategoryKeyMatch,
    shouldUsePrimaryCategoriesPresenceMatch
  ]);

  // Sync URL providers param
  useEffect(() => {
    if (!providers) {
      onChangeProviders([]);
      return;
    }
    if (providers.includes("all")) {
      onChangeProviders([]);
      setOpenSheet("provider");
      return;
    }
    const list = providers.split(",").map(p => p.trim()).filter(Boolean);
    onChangeProviders(list.length > 0 ? [list[0]] : []);
  }, [providers]); // eslint-disable-line react-hooks/exhaustive-deps

  const resolveLogo = useCallback((p: ProviderOption) => {
    if (p.logo?.trim()) return isDarkTheme ? p.logo : p.dayLogo || p.logo;
    const mini = isDarkTheme ? p.nightMiniLogo : p.dayMiniLogo;
    return mini?.trim() ? mini : isDarkTheme ? p.logo : p.dayLogo || p.logo;
  }, [isDarkTheme]);

  // Secondary items for current game type (filtered by auth)
  const secondaryItems = useMemo(() => {
    const raw = SECONDARY_MENUS[gameType] ?? [];
    return raw.filter(item => isAuthenticated || (item.value !== "recent" && item.value !== "favorites"));
  }, [gameType, isAuthenticated]);

  const showSecondaryRow = secondaryItems.length > 0;

  const selectedProvider = allProviderOptions.find((p) => p.value === selectedProviders[0]);

  useEffect(() => {
    if (selectedProviders.length === 0) return;
    if (providers === "all") return;

    const currentSelected = selectedProviders[0];
    const isStillAvailable = providerOptions.some((provider) => provider.value === currentSelected);

    if (!isStillAvailable) {
      onChangeProviders([]);
    }
  }, [onChangeProviders, providerOptions, providers, selectedProviders]);

  const scheduleSheetClose = useCallback(() => {
    if (closeSheetTimerRef.current) {
      clearTimeout(closeSheetTimerRef.current);
    }

    closeSheetTimerRef.current = setTimeout(() => {
      setOpenSheet(null);
      closeSheetTimerRef.current = null;
    }, SHEET_CLOSE_DELAY_MS);
  }, []);

  return (
    <div className="flex flex-col gap-1 w-full">
      {/* Row 1: primary categories */}
      <ExplorePrimaryTabs
        items={PRIMARY_MENUS.filter(item => item.value !== "bonus" || is_bonus_currency)}
        activeValue={gameType}
        onSelect={onChangeTab}
      />

      {/* Row 1.5: secondary categories — only when the current type has them */}
      {showSecondaryRow && (
        <ExplorePrimaryTabs
          items={secondaryItems}
          activeValue={category}
          onSelect={onChangeTab}
          variant="pill"
        />
      )}

      {/* Row 2: provider pill + search */}
      <div className="flex items-center gap-1 justify-end">
        {/* Provider — lightweight outline pill */}
        <button
          type="button"
          onClick={() => setOpenSheet(s => s === "provider" ? null : "provider")}
          className={cn(
            "flex items-center gap-1 px-2 h-8 rounded-field text-sm font-bold transition-colors shrink-0",
            selectedProviders.length > 0
              ? "bg-primary/20 text-primary"
              : "bg-base-100 text-base-content/70"
          )}
        >
          <span className={'text-base-content/40 font-semibold'}>{t('casino:provider')}</span>
          <Iconify icon="custom:providers" width={18} height={18} />
          {selectedProvider?.label ?? t("explore:all", "All")}
        </button>

        {/* Search — always on right */}
        <button
          type="button"
          onClick={() => openModal("OPEN_EXPLORE_SEARCH_MODAL", filterParams)}
          className="flex items-center justify-center gap-1 w-8 h-8 rounded-field bg-base-100 text-base-content/70 text-[13px] font-semibold transition-colors hover:text-base-content shrink-0"
        >
          <Search size={18} className={"text-primary"} />
        </button>
      </div>

      {/* Provider sheet */}
      <Modal
        isOpen={openSheet === "provider"}
        onClose={() => setOpenSheet(null)}
        position="modal-bottom"
        style={{ minHeight: "50dvh" }}
        title={t("explore:providers")}
      >
        <div className="grid grid-cols-3 gap-1">
          <div
            onClick={() => {
              onChangeProviders([]);
              scheduleSheetClose();
            }}
            className={cn(
              "relative rounded-field p-2 cursor-pointer flex items-center justify-center transition-colors bg-base-200",
              selectedProviders.length === 0 ? "text-primary" : "border-transparent"
            )}
          >
            <span className="text-sm font-bold">{t("explore:all")}</span>
            {selectedProviders.length === 0 && (
              <span
                aria-hidden="true"
                className="absolute bottom-0 right-0 h-0 w-0 border-b-[18px] border-l-[18px] border-b-primary border-l-transparent rounded-br-[inherit]"
              />
            )}
          </div>
          {providerOptions.map(option => {
            const isSelected = selectedProviders.includes(option.value);
            const logoUrl = resolveLogo(option);
            return (
              <div
                key={option.value}
                onClick={() => {
                  onChangeProviders([option.value]);
                  scheduleSheetClose();
                }}
                className={cn(
                  "relative h-12 rounded-field p-1.5 cursor-pointer flex items-center justify-center transition-colors bg-base-200",
                  isSelected ? "text-primary" : "border-transparent"
                )}
              >
                {logoUrl ? (
                  <img src={logoUrl} alt={option.label} className="w-full h-full object-contain" />
                ) : (
                  <span className="text-xs font-bold">{option.label}</span>
                )}
                {isSelected && (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-0 right-0 h-0 w-0 border-b-[18px] border-l-[18px] border-b-primary border-l-transparent rounded-br-[inherit]"
                  />
                )}
              </div>
            );
          })}
        </div>
      </Modal>

    </div>
  );
}
