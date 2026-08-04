import { useSearchParams, usePathname } from "next/navigation";
import { CurrencySelector } from "@/components/ui/CurrencySelector";
import { useBoundStore } from "@/store";
import { useSettlementCurrency } from "@/contexts/SettlementCurrencyContext";
import { Wallet } from "lucide-react";
import { ComponentProps, useEffect, useMemo, useState } from "react";
import { useUserBalance } from "@/hooks/api/useAuth.ts";
import { useSupportedSettlementCurrencies } from "@/hooks/api/usePublic";
import clsx from "clsx";
import { SmallLoading } from "@/components/modal/UserFinanceModal/c/Loading.tsx";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext.tsx";
import { useAppNavigate } from "@/hooks/useAppNavigate";
import { scheduleIdle } from "@/utils/helper";
import dynamic from "next/dynamic";

const WalletFinanceMqttSync = dynamic(
  () => import("@/components/header/WalletFinanceMqttSync").then((mod) => mod.WalletFinanceMqttSync),
  { ssr: false, loading: () => null }
);

export const WalletFinance = () => {
  const [shouldMountMqttSync, setShouldMountMqttSync] = useState(false);

  const { selectedCurrency } = useSettlementCurrency();
  const { isLoading: isCurrencyLoading } = useDisplayCurrencyFormatter();
  const { isLoading: isSettlementCurrencyLoading } = useSupportedSettlementCurrencies();
  const { data: userBalanceData = [], isLoading: isBalanceLoading } = useUserBalance();

  useEffect(() => {
    return scheduleIdle(() => {
      setShouldMountMqttSync(true);
    });
  }, []);

  const isZeroBalance = useMemo(() => {
    if (isBalanceLoading) return false;
    const balances = userBalanceData as any[];
    return balances.length === 0 || balances.every((b: any) => parseFloat(b.balance) === 0);
  }, [userBalanceData, isBalanceLoading]);

  return (
    <div className="flex items-center gap-1 w-full">
      {shouldMountMqttSync ? <WalletFinanceMqttSync /> : null}
      <SmallLoading
        className={"!min-w-full h-9 !bg-base-200"}
        loading={isBalanceLoading || isCurrencyLoading || isSettlementCurrencyLoading}
        content={
          <div
            className="z-[1002] flex h-9 min-w-0 w-full items-center rounded-field bg-[color-mix(in_oklab,var(--color-primary)_8%,var(--color-base-100))] pl-1 pr-1 text-primary">
            {/* 始终保留币种选择器，零余额时隐藏金额只显示币种 */}
            <CurrencySelector
              selectedCurrency={selectedCurrency}
              onCurrencySelect={() => {
              }}
              showBalance={!isZeroBalance}
              className="w-full"
            />
            <InnerGuideDeposits />
          </div>
        }>
      </SmallLoading>
    </div>
  );
};

/**
 * FIXME:
 *  用户无充值，则引导用户去充值
 */
const InnerGuideDeposits = () => {
  return (<InnerWalletButton className={"btn-square"}>
    <Wallet className="w-5 h-5" />
  </InnerWalletButton>);
};

const InnerWalletButton = (props: ComponentProps<"button">) => {

  const navigate = useAppNavigate();
  const pathname = usePathname();
  const locationSearchParams = useSearchParams();
  const location = {
    pathname,
    search: locationSearchParams.toString() ? `?${locationSearchParams.toString()}` : "",
    href: locationSearchParams.toString() ? `${pathname}?${locationSearchParams.toString()}` : pathname,
    hash: typeof window === "undefined" ? "" : window.location.hash
  };

  const openModal = useBoundStore((state) => state.openModal);

  // Check if current route is a game detail page
  const isGameDetailPage = location.pathname.startsWith("/games/");

  return <button
    className={clsx(`btn btn-primary h-7 w-7 ${isGameDetailPage ? "ml-auto" : ""}`, props.className)}
    onClick={() => {
      if (isGameDetailPage) {
        // TODO: 游戏页面需要保持原有的弹窗模式
        openModal("OPEN_USER_FINANCE_MODAL");
      } else {
        // TODO: 非游戏页面使用新的存取款模式
        void navigate({ to: "/finance" });
      }
    }}>
    {props.children}
  </button>;
};
