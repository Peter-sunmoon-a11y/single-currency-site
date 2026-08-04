import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { SwapReceive } from "@/components/modal/UserFinanceModal/c/SwapReceive.tsx";
import { SwapSend } from "@/components/modal/UserFinanceModal/c/SwapSend.tsx";
import { createSwapOrder } from "@/services/auth/wallet";
import { useBoundStore } from "@/store";
import { useToggle } from "@/hooks/useToggle";
import Decimal from "decimal.js";
import { ArrowDown } from "lucide-react";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { toast } from "sonner";
import {
  open_debug,
  useAvailableBalance,
  useSwapCurrencySelectedFirstTime
} from "@/components/modal/UserFinanceModal/helper.ts";
import { useCurrencyData } from "@/hooks/useCurrency.ts";
import FormatAmount from "@/components/modal/UserFinanceModal/c/FormatAmount";
import clsx from "clsx";
import { useAuth } from "@/contexts/AuthContext";
import { FinanceGuide } from "@/components/modal/UserFinanceModal/c/FinanceGuide.tsx";

export const Swap = ({ open }: { open: boolean }) => {
  // initial default selected option
  useSwapCurrencySelectedFirstTime();

  const { t } = useTranslation();

  const { swapFrom, swapTo, setSwapFrom } = useBoundStore();

  const [loading, { set }] = useToggle<boolean>(false);

  // 键盘弹起时 sticky 按钮退出吸底
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // 可用余额
  const {
    available = "0",
    userBalanceLoading,
    userBalanceExtensionLoading,
    userBalanceRefetch,
    userBalanceExtensionRefetch
  } = useAvailableBalance(swapFrom.currency?.currency);

  const { isLoading: l2, convertCurrency, exchangeRates } = useCurrencyData();

  const swapFeeRate = useMemo(() => {
    if (!swapFrom.currency || !swapTo.currency) return Decimal(0);
    const toFeeRate = swapTo.currency?.swap_fee_rate ?? Decimal(0);
    const fromFeeRate = swapFrom.currency?.swap_fee_rate ?? Decimal(0);
    return Decimal(fromFeeRate).plus(toFeeRate);
  }, [swapFrom, swapTo]);

  const exchangeRate = useMemo(() => {
    if (!swapFrom.currency?.currency || !swapTo.currency?.currency) return "0";

    const rate = convertCurrency({
      amount: 1,
      fromCurrency: swapFrom.currency.currency,
      toCurrency: swapTo.currency.currency,
      exchangeRates
    }).toString();

    if (swapFeeRate.gt(0)) {
      const b = Decimal(rate);
      const c = b.minus(b.mul(swapFeeRate));
      const d = c.gt(0) ? c : Decimal(0);
      return d.toDP(8, Decimal.ROUND_DOWN).toString();
    }

    return rate;
  }, [l2, swapTo, swapFrom, swapFeeRate, exchangeRates]);

  const swapToAmount = useMemo(() => {
    if (l2 || !swapFrom.currency || !swapFrom.inAmount || !swapTo.currency) return "";
    if (!swapFrom.currency?.currency || !swapTo.currency?.currency) return "";

    const amount = (Decimal(exchangeRates?.[swapFrom.currency.currency] || 0)
      .div(exchangeRates?.[swapTo.currency.currency] || 1)
      .times(swapFrom.inAmount || 0)).toFixed(swapTo.currency?.display_decimal, Decimal.ROUND_DOWN).toString();

    if (swapFeeRate.gt(0)) {
      const b = Decimal(amount);
      const c = b.minus(b.mul(swapFeeRate));
      const d = c.gt(0) ? c : Decimal(0);
      return d.toFixed(swapTo.currency?.display_decimal, Decimal.ROUND_DOWN).toString();
    }

    return amount;
  }, [l2, swapTo, swapFrom, swapFeeRate, exchangeRates]);

  // 创建订单
  const createOrder = useCallback(async () => {
    if (open_debug) {
      console.info("Swap Order Data");
      console.info({
        to_currency: swapTo.currency?.currency,
        from_amount: swapFrom.inAmount,
        from_currency: swapFrom.currency?.currency
      });
      return;
    }

    set(true);

    try {
      const data = await createSwapOrder({
        to_currency: swapTo.currency?.currency,
        from_amount: swapFrom.inAmount,
        from_currency: swapFrom.currency?.currency
      });

      if (data?.code !== 0) {
        toast.error(t("toast:failedToCreateSwapOrder"));
        set(false);
        return;
      }

      setSwapFrom({ inAmount: "" });

      // balance update
      void userBalanceRefetch();
      void userBalanceExtensionRefetch();

      toast.success(
        <div className="flex flex-col font-semibold">
          <span className="font-bold">{t("common:common.submissionSuccessful")}</span>
          <span className="">{t("toast:swapOrderCreatedSuccessfully")}</span>
        </div>
      );
    } catch (err: any) {
      toast.error(err.message);
      set(false);
    } finally {
      set(false);
    }
  }, [swapTo, swapFrom]);

  useEffect(() => {
    if (!window.visualViewport) return;
    const handleResize = () => {
      setKeyboardVisible(window.visualViewport!.height < window.innerHeight * 0.75);
    };
    window.visualViewport.addEventListener("resize", handleResize);
    return () => window.visualViewport?.removeEventListener("resize", handleResize);
  }, []);


  // TODO: 个性引导
  const { user } = useAuth();

  if (!user) return <FinanceGuide type={t("common.swap")} />;

  return (
    <div className="flex flex-col gap-4 mt-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col">
          {/* You send */}
          <SwapSend open={open} available={available} loading={userBalanceLoading || userBalanceExtensionLoading} />

          <ExchangeIcon />

          {/* You receive */}
          <SwapReceive swapToAmount={swapToAmount} exchangeRate={exchangeRate} />
        </div>

        <div className={clsx("w-full z-1", !keyboardVisible && "sticky bottom-1")}>
          {/* 确认摘要 - 仅在有输入金额时显示 */}
          {new Decimal(swapFrom.inAmount || 0).gt(0) && (
            <div className="flex flex-col bg-base-200 rounded-lg mb-1 text-base-content/50 text-xs font-semibold divide-y divide-dashed divide-base-content/20 px-2">
              <div className="flex items-center justify-between py-2">
                <span className="text-base-content/50 text-sm font-semibold">{t("finance:swap_send")}</span>
                <span className="text-base-content text-sm font-bold flex items-center gap-1">
                  <FormatAmount amount={swapFrom.inAmount} local decimals={18} />
                  {swapFrom.currency?.currency}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-base-content/50 text-sm font-semibold">{t("finance:swap_receive")}</span>
                <span className="text-base-content text-sm font-bold flex items-center gap-1">
                  <FormatAmount amount={swapToAmount} local decimals={swapTo.currency?.decimal} />
                  {swapTo.currency?.currency}
                </span>
              </div>
            </div>
          )}

          {/* 提交按钮 */}
          <div className="rounded-lg">
            <MessageBox
              show={new Decimal(swapFrom.inAmount || 0).gt(0) && new Decimal(available).gte(Number(swapFrom.inAmount || 0))}>
              <ConfirmBox onClick={createOrder} loading={loading}>
                <p className="font-bold">{t("finance:swap")}</p>
              </ConfirmBox>
            </MessageBox>

            <MessageBox show={new Decimal(available).lt(swapFrom.inAmount || 0)}>
              <ConfirmBox disabled>
                <span className="text-base-content/50">{t("finance:insufficient_balance")}</span>
              </ConfirmBox>
            </MessageBox>

            <MessageBox show={new Decimal(swapFrom.inAmount || 0).lte(0)}>
              <ConfirmBox disabled>
                <span className="text-base-content/50">{t("finance:enter_amount")}</span>
              </ConfirmBox>
            </MessageBox>
          </div>
        </div>
      </div>
    </div>
  );
};

export const MessageBox = ({ show, children }: { show: boolean; children: ReactNode }) => {
  return show ? children : null;
};

export const ExchangeIcon = () => {
  return (
    <div className="flex justify-center items-center py-1">
      <div className="rounded-full bg-base-200 p-1 text-primary/75">
        <ArrowDown className="w-4 h-4" />
      </div>
    </div>
  );
};
