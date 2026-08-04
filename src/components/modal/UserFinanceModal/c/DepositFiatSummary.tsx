import { useBoundStore } from "@/store";
import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { emitter } from "@/store/emitter.ts";
import { Decimal } from "decimal.js";
import { InnerDisplayContent } from "@/components/modal/UserFinanceModal/c/WithdrawMethodInfoAdd.tsx";
import FormatAmount from "@/components/modal/UserFinanceModal/c/FormatAmount";
import { useGetPromoByPage } from "@/query/promo.tsx";
import { promoKey } from "@/components/modal/UserFinanceModal/c/SpecialOffers.utils.ts";
import { useTieredFirstDepositSummary } from "@/hooks/api/useAuth.ts";
import { useCurrencyData } from "@/hooks/useCurrency.ts";
import {
  getTieredFirstDepositMatchedReward,
  normalizeTieredFirstDepositSummary
} from "@/sections/bonus/tiered-first-deposit/tiered-first-deposit-shared";

export const DepositFiatSummary = () => {
  const { t } = useTranslation(["bonus", "doubleOrNothing", "vipMonday"]);

  // from data store, share common data
  const { depositFiat } = useBoundStore();

  const { currentPromo } = useGetPromoByPage();
  const { data: tieredFirstDepositData } = useTieredFirstDepositSummary();
  const { exchangeRates, convertCurrency } = useCurrencyData();

  const [CALC_BONUS_AMOUNT, SET_CALC_BONUS_AMOUNT] = useState<string>("");

  // rate 数据有多种字段
  const real_bonus_rate = Decimal(Number(currentPromo?.bonus_rate ?? 0) || Number(currentPromo?.fiat_bonus_rate ?? 0));

  // 事件通知
  useEffect(() => {
    const em = emitter.addListener("CALC_BONUS_AMOUNT", function(v: string) {
      SET_CALC_BONUS_AMOUNT(v);
    });

    return () => em?.remove();
  }, []);

  const tieredSummary = normalizeTieredFirstDepositSummary(tieredFirstDepositData?.data);
  const tieredReward = getTieredFirstDepositMatchedReward({
    summary: tieredSummary,
    depositAmount: depositFiat.formItem?.amount,
    depositCurrency: depositFiat.currency?.currency,
    exchangeRates,
    convertCurrency
  });

  if (!Decimal(depositFiat.formItem?.amount || 0).gt(0)) return null;

  return (
    <div
      className="flex flex-col bg-base-200 rounded-md mb-1 text-base-content/50 text-sm font-semibold divide-y divide-dashed divide-base-content/20 px-2">
      <div className="flex justify-between items-center py-2">
        <span>{t(`finance:depositAmount`)}</span>
        <div className="flex items-center text-base-content gap-1 font-bold tabular-nums">
          <FormatAmount amount={depositFiat.formItem?.amount ?? 0} local />
          {depositFiat.currency?.currency}
        </div>
      </div>

      <InnerDisplayContent show={currentPromo}>
        <div className="flex justify-between items-center py-2">
          <div className="flex items-center gap-1">
            <img src="/images/finance/gift-box.png" alt="" className="w-4 h-4" />
            {currentPromo?.promo_code === promoKey.everyDay() && t("vipMonday:super_sunday")}
            {currentPromo?.promo_code === promoKey.doubleDeposit() && t("doubleOrNothing:recovery_bonus_title")}
            {promoKey.limitOfferSet().has(currentPromo?.promo_code) && t("finance:limited_offer")}
            {real_bonus_rate.gt(0) && (
              <span className="text-xs text-primary">
                ({real_bonus_rate.mul(100).toDP(8).toString()}%)
              </span>
            )}
          </div>
          <div className="text-primary flex items-baseline font-bold gap-1 tabular-nums">
            <div className="flex">
              +<FormatAmount local amount={CALC_BONUS_AMOUNT} decimals={2} />
              {Decimal(depositFiat.formItem?.amount || 0).gt(0) && <span className={'pl-1'}>{depositFiat.currency?.currency}</span>}
            </div>
          </div>
        </div>
      </InnerDisplayContent>

      <InnerDisplayContent show={Boolean(tieredReward && Decimal(tieredReward.amount).gt(0))}>
        <div className="flex justify-between items-center py-2">
          <div className="flex items-center gap-1">
            <img src="/images/bonus_deposit_tiered/logo.png" alt="" className="w-4 h-4" />
            {t("bonus:tieredFirstDeposit.deposit_summary.reward_label")}
          </div>
          <div className="text-primary flex items-baseline font-bold gap-1 tabular-nums">
            <div className="flex">
              +<FormatAmount local amount={String(tieredReward?.amount ?? 0)} decimals={depositFiat.currency?.display_decimal ?? 2} />
              <span className="pl-1">{tieredReward?.currency}</span>
            </div>
          </div>
        </div>
      </InnerDisplayContent>
    </div>
  );
};
