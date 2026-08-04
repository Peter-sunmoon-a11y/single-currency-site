import { useSettlementCurrency } from "@/contexts/SettlementCurrencyContext.tsx";
import { useIdleEnabled } from "@/hooks/useIdleEnabled";
import { getBanGameList } from "@/services/auth/game";
import { useBoundStore } from "@/store";
import { useQuery } from "@tanstack/react-query";

/**
 * List of games where region or settlement currency is unavailable
 */
export const useBanGameList = (enabled = false) => {
  const user = useBoundStore((state) => state.user);
  const idleEnabled = useIdleEnabled(!!user && enabled);
  // 用户当前的结算币
  const { selectedCurrency } = useSettlementCurrency();
  return useQuery({
    queryKey: ["banGameList", selectedCurrency],
    queryFn: async () => {
      return getBanGameList(selectedCurrency);
    },
    enabled: idleEnabled,
  });
};
