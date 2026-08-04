import { PropsWithChildren, useCallback, useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import { InnerToastCustom } from "@/sections/sports/components.tsx";
import { useSettlementCurrency } from "@/contexts/SettlementCurrencyContext.tsx";
import { useBoundStore } from "@/store";
import { useUserSportWallet } from "@/query/sports-bonus.ts";
import { useUserBalance } from "@/hooks/api/useAuth.ts";
import { useSwitchBackFromSports } from "@/hooks/useSwitchBackFromSports.ts";
import { ESport } from "@/sections/dollars/components.tsx";
import { usePathname } from "next/navigation";

export const SportsBonusGuard = (props: PropsWithChildren) => {
  const pathname = usePathname();

  // TODO: 用户离开/sports路径时切结算币
  useSwitchBackFromSports();

  // 当前会话是否已显示过提示
  const shownRef = useRef(false);

  const toastIdRef = useRef<string | number | null>(null);

  const user = useBoundStore((state) => state.user);

  // 钱包结算币种
  const { selectedCurrency } = useSettlementCurrency();

  // TODO: 体育彩金活动
  const { data: sport } = useUserSportWallet();

  // TODO: 切币提示框
  const showBaseToast = useCallback(() => {
    toastIdRef.current = toast.custom((tst) => (<InnerToastCustom tst={tst} />), { duration: 8_000, position: "top-right" });
  }, []);

  // 币种余额统计
  const { data: balances = [] } = useUserBalance();

  // 彩金币种余额
  const balance = useMemo(() => balances.find((b: {
    currency: string
  }) => b.currency === ESport.TOKEN), [balances])?.balance ?? 0;

  /**
   * TODO
   *  - 1️⃣用户参与了体育彩金活动
   *  - 2️⃣体育彩金有余额
   *  - 3️⃣当前币种非体育彩金币种
   *  - 4️⃣显示体育彩金引导提示（当前会话只提示一次）
   */
  useEffect(() => {
    if (!user) return;

    // - 1️⃣用户参与了体育彩金活动
    if (!sport?.data) return;

    // - 2️⃣体育彩金有余额
    if (Number(balance) <= 0) return;

    // - 3️⃣当前币种非体育彩金币种
    if (selectedCurrency === ESport.TOKEN) return;

    // - 4️⃣当前会话只提示一次
    if (shownRef.current) return;

    // 显示体育彩金引导提示
    showBaseToast();

    // - 4️⃣当前会话只提示一次
    shownRef.current = true;
  }, [user, sport, balance, selectedCurrency, showBaseToast]);

  useEffect(() => {
    if (!pathname.includes("/sports") && toastIdRef.current !== null) {
      toast.dismiss(toastIdRef.current);
      shownRef.current = false;
      toastIdRef.current = null;
    }

    return () => {
      if (toastIdRef.current !== null) {
        toast.dismiss(toastIdRef.current);
        shownRef.current = false;
        toastIdRef.current = null;
      }
    };
  }, [pathname]);

  return <div>{props?.children}</div>;
};
