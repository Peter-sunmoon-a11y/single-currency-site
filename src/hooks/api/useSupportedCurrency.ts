import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSupportedCurrencyV2 } from "@/services/auth/wallet";
import { useBoundStore } from "@/store";

export const useSupportedCurrencyV2 = () => {
  const user = useBoundStore((state) => state.user);

  return useQuery({
    queryKey: ["useSupportedCurrencyV2"],
    queryFn: async () => {
      return getSupportedCurrencyV2();
    },
    enabled: !!user,
    refetchOnMount: false,
    refetchOnWindowFocus: false
  });
};

export const useSupportedCurrencyV2Filter = (
  type: "CRYPTO" | "FIAT" = "CRYPTO",
  direction: "WITHDRAW" | "DEPOSIT" = "DEPOSIT"
) => {
  const { data, isLoading } = useSupportedCurrencyV2();

  return useMemo(() => {
    const transform = data?.data ?? [];
    const currencies = transform
      .filter(
        (item: { can_withdraw: number; currency_type: string; can_deposit: number }) =>
          item.currency_type === type &&
          (direction === "DEPOSIT" ? item.can_deposit : item.can_withdraw) === 1
      )
      .sort((a: { weight: number }, b: { weight: number }) => (b.weight ?? 0) - (a.weight ?? 0));
    return [
      isLoading,
      currencies,
      currencies.map((item: { icon: string; currency: string; display_name: string, is_default: number }) => ({
        id: item.currency,
        value: item.currency,
        label: item.display_name,
        ...item,
        icon: `/images/currency/${item.display_name?.toLowerCase()}.png`
      }))
    ] as [boolean, any[], any[]];
  }, [data, type, direction]);
};
