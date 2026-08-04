import { Trans, useTranslation } from "@/lib/i18n/react-i18next";
import { Modal } from "@/components/ui/Modal.tsx";
import { InnerLabel } from "@/sections/dollars/components.tsx";
import { useBoundStore } from "@/store";
import { useCurrencyData } from "@/hooks/useCurrency.ts";
import Decimal from "decimal.js";
import { parser } from "@/components/header/message-v2/c/InnerMsgLink.tsx";
import { InnerDescription, InnerContainer, InnerContent, InnerHeader, InnerSlogan } from "@/standard/modals/DemoLazyInfoModal.tsx";

export default function PlayBonusDetailsModal(
  {
    data,
    open,
    onClose
  }: {
    data: Record<string, any>
    open: boolean;
    onClose: () => void;
  }) {
  const { t } = useTranslation("bonusStore");

  const user = useBoundStore((state) => state.user);
  const selectedCurrency = useBoundStore((state) => state.settlementCurrency);

  const { convertCurrency, formatCurrency, exchangeRates } = useCurrencyData();

  const currency_fiat = (user?.currency_fiat ?? "USD");

  const parsed_data = parser(data?.extra_data);
  const rawRate = parsed_data?.currency_bonus_rates?.[selectedCurrency] ?? parsed_data?.bonus_rate ?? 0;
  const bonus_rate = `${Decimal(rawRate).times(100).toFixed(0)}%`;
  const claim_max_multiplier = parsed_data?.claim_max_multiplier || 0;
  const wager_require_multiplier = parsed_data?.wager_require_multiplier || 0;
  const min_deposit_require_value = formatCurrency({
    amount: convertCurrency({
      amount: parsed_data?.min_deposit_require_value || 0,
      fromCurrency: "USDT",
      toCurrency: currency_fiat,
      exchangeRates
    }),
    currency: currency_fiat,
    showSymbol: true, showCode: false
  }).formatted;

  return (
    <Modal
      hideTitle
      isOpen={open}
      onClose={onClose}
      position="modal-middle"
      className="p-0 bg-transparent"
    >
      <InnerSlogan
        // 根据设计稿自行修改文字
        title={t("bonus:slotBonus")}
        // 根据设计稿自行修改图片
        picture="/images/bonus_store/bonus-store.png"
      />

      <InnerContainer>
        <InnerHeader
          title={<h1 className={"text-primary"}>
            {t("bonusStore:extraBonusGet", { value: bonus_rate })}
          </h1>}
          onClose={onClose}
        />
        <InnerContent>
          <InnerDescription>
            <div className={"grid grid-cols-2 gap-2"}>
              <InnerLabel title={t("bonusStore:minimumBuy")} subTitle={min_deposit_require_value} />
              <InnerLabel title={t("bonus:slotBonus")} subTitle={bonus_rate} />
              <InnerLabel title={t("bonus:wagerRequired")}
                          subTitle={t("bonusStore:bonusObtained", { value: wager_require_multiplier })} />
              <InnerLabel title={t("bonusStore:periodComplete")}
                          subTitle={`${data?.expire_days}d`} />
            </div>
          </InnerDescription>

          <InnerDescription>
            <Trans i18nKey={"bonusStore:bonusGameplay"} />
          </InnerDescription>

          <InnerDescription>
            <p className="bg-base-200 rounded-field p-2 flex flex-col gap-2">
              {t("bonus:maximumCashout")}
              <span
                className={"text-sm font-extrabold text-primary"}>{t("bonusStore:bonusObtained", { value: claim_max_multiplier })}
            </span>
              {t("bonus:bonus_rules_desc.cashout")}
            </p>
          </InnerDescription>

          <InnerDescription>
            <Trans
              i18nKey={"bonus:bonus_rules_desc.approximately"}
              values={{ value: parsed_data?.users_met_cashout ?? '55%' }}
              components={[<span className={"text-primary"} />]} />
          </InnerDescription>
        </InnerContent>
      </InnerContainer>
    </Modal>
  );
}
