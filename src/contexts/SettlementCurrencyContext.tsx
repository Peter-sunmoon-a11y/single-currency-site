import { AUTH_QUERY_KEYS } from "@/hooks/api/useAuth.ts";
import { useSupportedSettlementCurrencies } from "@/hooks/api/usePublic.ts";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { updateUserSettlementCurrency } from "@/services/auth/user";
import { useBoundStore } from "@/store";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef } from "react";
import { toast } from "sonner";

export function isSupportedCurrency(currencies: { currency: string }[], currency: string) {
  return currencies.some((c) => c.currency.toLowerCase() === currency?.toLowerCase());
}

/** 轻量只读 hook，仅从 store 读取，无 React Query 订阅 */
export function useSettlementCurrency() {
  const selectedCurrency = useBoundStore((s) => s.settlementCurrency);
  const setSelectedCurrency = useBoundStore((s) => s.setSettlementCurrency);
  return { selectedCurrency, setSelectedCurrency };
}

/** 含更新逻辑的 hook，仅在需要 updateSettlementCurrency 的组件中使用 */
export function useUpdateSettlementCurrency() {
  const { t } = useTranslation("toast");

  const { data: settlementCurrencies } = useSupportedSettlementCurrencies();

  const user = useBoundStore((s) => s.user);
  const queryClient = useQueryClient();

  // 并发锁：防止上一个请求未完成时重复发起
  const isUpdating = useRef(false);
  const setSettlementCurrency = useBoundStore((s) => s.setSettlementCurrency);

  /**
   * 更新结算币种到服务端 & 缓存
   */
  const updateSettlementCurrency = useCallback(
    async (currency: string): Promise<void> => {
      if (!user) return;

      if (isUpdating.current) return;

      if (!isSupportedCurrency(settlementCurrencies?.data ?? [], currency)) return;

      isUpdating.current = true;

      try {
        // 更新结算币种 request api -> API: /profile.user.currency
        const response = await updateUserSettlementCurrency(currency);

        if (response.code !== 0) {
          // 接口失败：回滚乐观更新，提示用户
          setSettlementCurrency(user.currency);
          toast.error(t("toast:failedToUpdateSettlementCurrency"));
          return;
        }

        setSettlementCurrency(currency);
        // 更新 RQ 缓存，AuthContext sync effect 自动同步到 store
        queryClient.setQueryData(AUTH_QUERY_KEYS.currentUser, (old: any) => (old ? { ...old, user: { ...old.user, currency } } : old));
      } catch {
        // 网络异常：回滚乐观更新
        setSettlementCurrency(user.currency);
        toast.error(t("toast:failedToUpdateSettlementCurrency"));
      } finally {
        isUpdating.current = false;
      }
    },
    [settlementCurrencies?.data, user, queryClient, setSettlementCurrency, t],
  );

  return { updateSettlementCurrency };
}
