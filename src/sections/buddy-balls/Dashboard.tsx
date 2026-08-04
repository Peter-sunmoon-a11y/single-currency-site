import { Trans, useTranslation } from "@/lib/i18n/react-i18next";
import { useUserBuddyBallsHome } from "@/hooks/api/useAuth.ts";
import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { ReactNode, useCallback, useState } from "react";
import { userBuddyBallsClaim } from "@/services/auth/miniGames";
import { toast } from "sonner";
import { useCurrencyData } from "@/hooks/useCurrency.ts";
import { useBoundStore } from "@/store";
import clsx from "clsx";
import { InnerToastCustom } from "@/sections/dollars/components.tsx";
import { History } from "lucide-react";
import { useAppNavigate } from "@/hooks/useAppNavigate";

export function Dashboard() {
  const navigate = useAppNavigate();
  const openModal = useBoundStore((state) => state.openModal);
  const { t } = useTranslation(["buddyBalls", "bonus", "common", "transaction", "toast", "doubleOrNothing", "mysteryBox"]);
  const user = useBoundStore((state) => state.user);

  const { data: buddy, refetch: refetchBuddyBallsHome } = useUserBuddyBallsHome();
  const { convertCurrency, exchangeRates, formatCurrency } = useCurrencyData();
  const [bonusPending, setBonusPending] = useState(false);

  const currency_fiat = user?.currency_fiat ?? "";
  const processing_total_amount = buddy?.data?.processing_total_amount || 0;
  const hasEarnings = Number(processing_total_amount) > 0;

  const processing_total_amount_exchange = formatCurrency({
    amount: convertCurrency({
      amount: processing_total_amount,
      fromCurrency: "USDT",
      toCurrency: currency_fiat,
      exchangeRates,
    }),
    currency: currency_fiat,
    showSymbol: true,
    showCode: false,
  }).formatted;

  const showBaseToast = useCallback(
    (params: { icon: string; title: string; subTitle: ReactNode }) => {
      toast.custom(
        (tst) => (
          <InnerToastCustom
            closeBtn
            tst={tst}
            icon={params.icon}
            title={params.title}
            subTitle={params.subTitle}
            onConfirm={() => console.info("onClose")}
          />
        ),
        { duration: 6_000, position: "top-right" },
      );
    },
    [],
  );

  const showErrorToast = useCallback(
    (i18nKey: string) => {
      showBaseToast({
        icon: "/images/common/error.png",
        title: t("transaction:transactionStatus.failed"),
        subTitle: <Trans i18nKey={i18nKey} />,
      });
    },
    [showBaseToast, t],
  );

  const showSuccessToast = useCallback(
    (amount: string) => {
      const _amount = formatCurrency({
        amount: convertCurrency({
          amount,
          fromCurrency: "USDT",
          toCurrency: currency_fiat,
          exchangeRates,
        }),
        currency: currency_fiat,
        showSymbol: true,
        showCode: false,
      }).formatted;
      showBaseToast({
        icon: "/images/game_buddy_balls/buddy-win.png",
        title: t("doubleOrNothing:congratulations"),
        subTitle: (
          <div className="text-primary font-semibold">
            {t("mysteryBox:you_win")} <b>{_amount}</b>
          </div>
        ),
      });
    },
    [showBaseToast, exchangeRates, currency_fiat, t],
  );

  const handle = useCallback(async () => {
    setBonusPending(true);
    try {
      const response = await userBuddyBallsClaim();
      if (response.code === 0 || response.code === 200) {
        showSuccessToast(response?.data?.ball_amount);
        void refetchBuddyBallsHome();
      } else {
        showErrorToast("toast:claimBonusFailed");
      }
    } catch {
      showErrorToast("toast:claimBonusFailed");
    } finally {
      setBonusPending(false);
    }
  }, [processing_total_amount]);

  return (
    <div
      className="rounded-box overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, color-mix(in oklab, var(--color-primary) 22%, var(--color-base-200)) 0%, var(--color-base-200) 60%)",
      }}
    >
      {/* 积分行 */}
      <div className="flex items-stretch">
        {/* 球数量 */}
        <button
          type="button"
          className="flex items-center gap-2 px-2 py-2 flex-1 transition-opacity active:opacity-70"
          onClick={() => openModal("OPEN_BUDDY_BALLS_MODAL")}
        >
          <img
            src="/images/game_buddy_balls/ball-pool.png"
            alt=""
            className="w-10 h-10 object-contain shrink-0"
          />
          <div className="flex flex-col leading-none gap-1 text-left">
            <span className="text-[12px] uppercase text-base-content/60">
              {t("buddyBalls:buddyBalls")}
            </span>
            <span className="text-lg font-black text-primary">
              {buddy?.data?.balls ?? 0}
            </span>
          </div>
        </button>

        {/* 分割线 */}
        <div className="w-px bg-primary/20 my-2" />

        {/* 收益 */}
        <div className="flex items-center gap-2 px-2 py-2 flex-1">
          <div className="flex flex-col leading-none gap-1">
            <span className="text-[12px] uppercase text-base-content/60">
              {t("bonus:earnings", "Earnings")}
            </span>
            <span
              className={clsx(
                "text-lg font-black tabular-nums",
                hasEarnings ? "text-primary" : "text-base-content/60",
              )}
            >
              {processing_total_amount_exchange}
            </span>
          </div>
        </div>
      </div>

      {/* 分割线 */}
      <div
        className="h-px mx-4"
        style={{
          background: "color-mix(in oklab, var(--color-primary) 25%, transparent)",
        }}
      />

      {/* 操作行 */}
      <div className="flex items-center gap-1 px-2 py-2">
        <button
          type="button"
          className="btn btn-sm btn-primary btn-soft flex-1 gap-1 text-sm"
          onClick={() => openModal("OPEN_BUDDY_BALLS_MODAL")}
        >
          <img src="/images/game_buddy_balls/ball.png" alt="" className="w-5 h-5" />
          {t("buddyBalls:getMore", "Get More")}
        </button>

        <button
          type="button"
          className="btn btn-sm btn-primary btn-soft flex-1 gap-1 text-sm"
          onClick={() => void navigate({ to: "/buddy-balls/history" })}
        >
          <History className="w-4 h-4" />
          {t("common:common.history")}
        </button>

        <ConfirmBox
          loading={bonusPending}
          disabled={!hasEarnings}
          className={'btn btn-sm btn-primary btn-soft flex-1 gap-1 text-sm'}
          onClick={handle}
        >
          {t("bonus:claim")}
        </ConfirmBox>
      </div>
    </div>
  );
}
