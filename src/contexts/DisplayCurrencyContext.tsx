/**
 * 显示货币/游戏货币上下文 (DisplayCurrencyContext)
 *
 * 这个上下文管理用户的显示货币偏好。系统中有两个货币概念：
 *
 * 1. **结算币**: 用户实际充值、提现的货币，可以是法币或加密货币（如USDT、BTC、ETH、USD、CNY等）
 * 2. **显示币/游戏币**: 用户选择的显示和游戏单位（如PHP、VND、USD等）
 *
 * 工作原理：
 * - 用户选择PHP作为显示货币
 * - 用户充值的结算币（USDT、BTC、USD等）会通过实时汇率自动转换成PHP进行显示
 * - 进入游戏时，所有金额都以PHP为单位进行计算和显示
 * - 如果某个游戏不支持用户选择的显示货币，系统会通过 getUserDefaultCurrency 接口返回该游戏支持的默认货币
 * - 提现时再转换回对应的结算币
 *
 * 主要功能：
 * 1. 管理用户选择的显示货币/游戏货币（支持localStorage持久化）
 * 2. 自动与登录用户的currency_fiat设置同步
 * 3. 提供智能的货币转换和格式化功能（结算币 ↔ 显示币）
 * 4. 使用最新的汇率数据进行实时转换
 *
 * 使用建议：
 * - 大部分UI组件应该使用 useDisplayCurrency() 和 useDisplayCurrencyFormatter()
 * - formatWithConversion: 自动转换到用户选择的显示货币（如 BTC → PHP）
 * - formatWithoutConversion: 只格式化原始货币，不进行转换（如直接显示 BTC）
 * - 如果需要任意货币间转换而不依赖用户偏好，可以直接使用 @/hooks/useCurrency 中的 convertCurrency 和 formatCurrency
 *
 * @example
 * ```typescript
 * // 获取用户的显示货币/游戏货币偏好
 * const { selectedCurrency, setSelectedCurrency } = useDisplayCurrency();
 *
 * // 将结算币(USDT)自动转换并格式化为显示币(PHP)
 * const { formatWithConversion } = useDisplayCurrencyFormatter();
 * const formatted = formatWithConversion(100, 'USDT', { showSymbol: true }); // 显示为PHP金额
 * ```
 */

import { isSupportedCurrency } from "@/contexts/SettlementCurrencyContext.tsx";
import { AUTH_QUERY_KEYS } from "@/hooks/api/useAuth.ts";
import { useSupportedGameCurrencies } from "@/hooks/api/usePublic.ts";
import { useCurrencyData } from "@/hooks/useCurrency";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { updateUserDisplayFiat } from "@/services/auth/user";
import { useBoundStore } from "@/store";
import { useQueryClient } from "@tanstack/react-query";
import Decimal from "decimal.js";
import { useRef } from "react";
import { toast } from "sonner";

export function useDisplayCurrency() {
  const { t } = useTranslation("common");

  const { data: supportedCurrencies } = useSupportedGameCurrencies();

  const user = useBoundStore((s) => s.user);
  const queryClient = useQueryClient();
  const { formatCurrency, convertCurrency, getCurrency, getCurrencySymbol, groupedCurrencies, exchangeRates, isLoading } =
    useCurrencyData();

  const isUpdating = useRef(false);
  const selectedCurrency = useBoundStore((s) => s.displayCurrency);
  const setDisplayCurrency = useBoundStore((s) => s.setDisplayCurrency);

  const getSelectedCurrencyInfo = () => getCurrency(selectedCurrency);

  const updateDisplayCurrency = async (currency: string): Promise<void> => {
    if (!user) return;

    if (isUpdating.current) return;

    if (!isSupportedCurrency(supportedCurrencies?.data ?? [], currency)) {
      setDisplayCurrency("USD");
      return;
    }

    if (selectedCurrency === currency) return;

    isUpdating.current = true;

    try {
      // 更新显示汇率币种 request api -> API: /profile.user.currency_fiat
      const response = await updateUserDisplayFiat(currency);

      if (response.code !== 0) {
        // 接口失败：回滚乐观更新，提示用户
        setDisplayCurrency(user.currency_fiat);
        toast.success(t("gameCurrencyUpdated"));
        return;
      }

      setDisplayCurrency(currency);
      // 更新 RQ 缓存，AuthContext sync effect 自动同步到 store
      queryClient.setQueryData(AUTH_QUERY_KEYS.currentUser, (old: any) =>
        old ? { ...old, user: { ...old.user, currency_fiat: currency } } : old,
      );
      toast.success(t("gameCurrencyUpdated"));
    } catch (error) {
      // 接口失败：回滚乐观更新，提示用户
      setDisplayCurrency(user.currency_fiat);
      toast.error(t("gameCurrencyUpdatedFailed"));
    } finally {
      isUpdating.current = false;
    }
  };

  return {
    selectedCurrency,
    setSelectedCurrency: setDisplayCurrency,
    updateDisplayCurrency,
    getSelectedCurrencyInfo,
    isLoading,
    formatCurrency,
    convertCurrency,
    getCurrencySymbol,
    groupedCurrencies,
    exchangeRates,
  };
}

/**
 * 增强版货币格式化hook
 *
 * 提供智能的货币格式化功能，包括：
 * - 自动转换到用户选择的游戏货币
 * - 保持原始货币格式化（不转换）
 * - 访问用户的货币偏好设置
 *
 * @example
 * ```typescript
 * const { formatWithConversion, formatWithoutConversion } = useCurrencyFormatter();
 *
 * // 将BTC转换为用户的游戏货币（如USD）并格式化
 * const converted = formatWithConversion(0.5, 'BTC', { showSymbol: true });
 *
 * // 直接格式化BTC，不进行转换
 * const original = formatWithoutConversion(0.5, 'BTC', { showSymbol: true });
 * ```
 */
export function useDisplayCurrencyFormatter() {
  const { selectedCurrency, formatCurrency, convertCurrency, exchangeRates, isLoading } = useDisplayCurrency();

  const formatWithConversion = (
    amount: number | string,
    fromCurrency: string,
    options?: {
      showSymbol?: boolean;
      showCode?: boolean;
      compact?: boolean;
      minimizeDecimals?: boolean;
      displayDecimal?: number;
    },
  ) => {
    if (isLoading) {
      return {
        value: 0,
        formatted: "0.00",
        currency: selectedCurrency,
        displayName: selectedCurrency,
      };
    }

    // 转换货币
    const convertedAmount = convertCurrency({
      amount,
      fromCurrency,
      toCurrency: selectedCurrency,
      exchangeRates,
    });

    // 格式化显示
    return formatCurrency({
      currency: selectedCurrency,
      amount: convertedAmount,
      showSymbol: options?.showSymbol ?? true,
      showCode: options?.showCode ?? true,
      compact: options?.compact ?? false,
      minimizeDecimals: options?.minimizeDecimals ?? true,
      displayDecimal: options?.displayDecimal,
      roundingMode: Decimal.ROUND_DOWN,
    });
  };

  const formatWithoutConversion = (
    amount: number | string,
    currency: string,
    options?: {
      showSymbol?: boolean;
      showCode?: boolean;
      compact?: boolean;
      minimizeDecimals?: boolean;
      displayDecimal?: number;
    },
  ) => {
    if (isLoading) {
      return {
        value: 0,
        formatted: "0.00",
        currency: currency,
        displayName: currency,
      };
    }

    // 直接格式化，不进行货币转换
    return formatCurrency({
      currency: currency,
      amount: amount,
      showSymbol: options?.showSymbol ?? true,
      showCode: options?.showCode ?? true,
      compact: options?.compact ?? false,
      minimizeDecimals: options?.minimizeDecimals ?? true,
      displayDecimal: options?.displayDecimal,
      roundingMode: Decimal.ROUND_DOWN,
    });
  };

  return {
    selectedCurrency,
    formatWithConversion,
    formatWithoutConversion,
    isLoading,
  };
}
