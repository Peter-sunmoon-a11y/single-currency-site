import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { SwapReceive } from "./SwapReceive.tsx";
import { SwapSend } from "./SwapSend.tsx";
import { userPurchaseBonus } from "@/services/auth/purchase";
import { useBoundStore } from "@/store";
import Decimal from "decimal.js";
import { ReactNode, useCallback, useState } from "react";
import { Trans, useTranslation } from "@/lib/i18n/react-i18next";
import { toast } from "sonner";
import {
  useAvailableBalance, useBonusSwapSelectedFirstTime
} from "@/components/modal/UserFinanceModal/helper.ts";
import { BONUS_ERROR_MAP, EBonus, InnerToastCustom } from "@/sections/dollars/components.tsx";
import { Modal } from "@/components/ui/Modal.tsx";
import { parser } from "@/components/header/message-v2/c/InnerMsgLink.tsx";
import { useUserBonusWallet } from "@/query/dollars.ts";
import { useUpdateSettlementCurrency } from "@/contexts/SettlementCurrencyContext.tsx";
import { useCurrencyData } from "@/hooks/useCurrency.ts";
import { useAuth } from "@/contexts/AuthContext";
import { ExchangeIcon } from "@/components/modal/UserFinanceModal/Swap.tsx";
import { useAppNavigate } from "@/hooks/useAppNavigate";

const Index = (
  {
    data,
    open,
    onClose
  }: {
    data: Record<string, any>
    open: boolean;
    onClose: () => void;
  }) => {
  const navigate = useAppNavigate();
  // initial default selected option
  useBonusSwapSelectedFirstTime();


  const { user } = useAuth();

  const { t } = useTranslation("bonusStore");

  const { bonusSwapFrom } = useBoundStore();

  const [isPending, setPending] = useState<boolean>(false);

  const { updateSettlementCurrency } = useUpdateSettlementCurrency();

  const { convertCurrency, formatCurrency, exchangeRates } = useCurrencyData();

  // 彩金钱包数据
  const { refetch: refetchBonusWallet } = useUserBonusWallet();

  const parsed_data = parser(data?.extra_data);
  const currency_fiat = user?.currency_fiat ?? "USD";

  const min_deposit_require_value = formatCurrency({
    amount: convertCurrency({
      amount: parsed_data?.min_deposit_require_value || 0,
      fromCurrency: "USDT",
      toCurrency: bonusSwapFrom.currency?.currency ?? 'USD',
      exchangeRates
    }),
    currency: bonusSwapFrom.currency?.currency ?? 'USD'
  });

  // TODO: 取值稍大保证购买的执行
  const min_deposit_require_value_ceil = Decimal(min_deposit_require_value.value).toDP(bonusSwapFrom.currency?.display_decimal, Decimal.ROUND_CEIL).toString();

  // 可用余额
  const {
    totalBalance: available = "0",
    userBalanceLoading,
    userBalanceExtensionLoading
  } = useAvailableBalance(bonusSwapFrom.currency?.currency);

  const showBaseToast = useCallback((params: {
    icon: string;
    title: string;
    subTitle: ReactNode;
  }) => {
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
      { duration: 6_000, position: "top-right" }
    );
  }, []);

  const showErrorToast = useCallback((i18nKey: string) => {
    showBaseToast({
      icon: "/images/common/error.png",
      title: t("transaction:transactionStatus.failed"),
      subTitle: <Trans i18nKey={i18nKey} />
    });
  }, [showBaseToast, t]);

  const showSuccessToast = useCallback((amount: string) => {
    const bonus_amount = formatCurrency({
      amount: convertCurrency({
        amount: amount,
        fromCurrency: "BONUS",
        toCurrency: currency_fiat,
        exchangeRates
      }),
      currency: currency_fiat,
      showSymbol: true, showCode: false
    }).formatted;
    showBaseToast({
      icon: "/images/bonus_store/bonus.png",
      title: t("bonus:Successful"),
      subTitle: (
        <Trans
          values={{ amount: `${Decimal(amount).toDP(2, Decimal.ROUND_DOWN).toString()} BONUS (≈${bonus_amount})` }}
          i18nKey={"bonusStore:purchased"}
          components={[<span className="text-primary font-bold" />]}
        />
      )
    });
  }, [showBaseToast, exchangeRates, currency_fiat, t]);

  // 创建订单
  const createOrder = useCallback(async () => {
    setPending(true);

    try {
      // 激活彩金活动
      const response = await userPurchaseBonus(bonusSwapFrom.inAmount, bonusSwapFrom.currency?.currency, data?.id);

      const error = response?.code ? BONUS_ERROR_MAP[response.code] : undefined;

      // 常规错误
      if (error) {
        showErrorToast(error);
        return;
      }

      // 错误兜底
      if (response?.code !== 0) {
        showErrorToast("bonusStore:failedCreate");
        return;
      }

      // 更新彩金钱包数据
      void refetchBonusWallet();

      // 跳转到活动页
      void navigate({ to: "/dollars/bonus" });

      // 切换彩金币种
      void updateSettlementCurrency(EBonus.TOKEN);

      showSuccessToast(response?.bonus_amount);

      onClose();
    } catch (_error) {
      console.info(_error);
    } finally {
      setPending(false);
    }
  }, [bonusSwapFrom.currency?.currency, bonusSwapFrom.inAmount, data?.id]);

  return (
    <Modal
      title={t("bonusStore:buyBonus")}
      isOpen={open}
      onClose={onClose}
      position="modal-middle"
    >
      <div className="flex flex-col gap-2">
        <div className="flex flex-col">

          {/* You send */}
          <SwapSend open={open}
                    minimum={min_deposit_require_value_ceil}
                    currency={min_deposit_require_value.currency}
                    available={available} loading={userBalanceLoading || userBalanceExtensionLoading}
                    onClose={onClose} />

          <ExchangeIcon />

          {/* You receive */}
          <SwapReceive open={open} data={data} minimum={min_deposit_require_value_ceil} />

          {/* 交易按钮状态 - 可交易 */}
          <MessageBox
            show={
              new Decimal(bonusSwapFrom.inAmount || 0).gt(0) &&
              new Decimal(available).gte(Number(bonusSwapFrom.inAmount || 0)) &&
              new Decimal(min_deposit_require_value_ceil).lte(bonusSwapFrom.inAmount || 0)
            }>
            <ConfirmBox onClick={createOrder} loading={isPending}>
              <p className="font-bold">{t("bonusStore:buyNow")}</p>
            </ConfirmBox>
          </MessageBox>

          {/* 交易按钮状态 - 小于最小购买限制 */}
          <MessageBox show={
            new Decimal(bonusSwapFrom.inAmount || 0).gt(0) &&
            new Decimal(min_deposit_require_value_ceil).gt(bonusSwapFrom.inAmount || 0)
          }>
            <ConfirmBox disabled>
              <span className="text-base-content/50">{t("bonusStore:amountLow")}</span>
            </ConfirmBox>
          </MessageBox>

          {/* 交易按钮状态 - 余额不足 */}
          <MessageBox show={new Decimal(available).lt(bonusSwapFrom.inAmount || 0)}>
            <ConfirmBox disabled>
              <span className="text-base-content/50">{t("finance:insufficient_balance")}</span>
            </ConfirmBox>
          </MessageBox>

          {/* 交易按钮状态 - 未输入 */}
          <MessageBox show={new Decimal(bonusSwapFrom.inAmount || 0).lte(0)}>
            <ConfirmBox disabled>
              <span className="text-base-content/50">{t("finance:enter_amount")}</span>
            </ConfirmBox>
          </MessageBox>
        </div>
      </div>
    </Modal>
  );
};

export default Index;

const MessageBox = ({ show, children }: { show: boolean; children: ReactNode }) => {
  return show ? children : null;
};