import { useTranslation } from "@/lib/i18n/react-i18next";
import { useState } from "react";
import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { useBonusConfigList } from "@/hooks/api/useAuth.ts";
import Decimal from "decimal.js";
import { parser } from "@/components/header/message-v2/c/InnerMsgLink.tsx";
import { InnerOption } from "@/sections/dollars/components.tsx";
import { useBoundStore } from "@/store";

export default function BonusOptional() {
  const openModal = useBoundStore((state) => state.openModal);
  const selectedCurrency = useBoundStore((s) => s.settlementCurrency);

  const [bonusType, setBonusType] = useState<Record<string, any> | null>(null);

  const { t } = useTranslation("bonusStore");

  // 彩金活动配置列表
  const { data: bonusConfig } = useBonusConfigList();

  return (
    <div className="relative">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          {
            (bonusConfig?.data ?? []).map((bonus: Record<string, any>) => {
              const parsed_data = parser(bonus?.extra_data);
              const bonus_name = parsed_data?.type;
              const bonus_rate = parsed_data?.bonus_rate;
              const currency_bonus_rates = parsed_data?.currency_bonus_rates?.[selectedCurrency];
              const rawRate = currency_bonus_rates ?? bonus_rate ?? 0;
              const rate = `${Decimal(rawRate).times(100).toFixed(0)}%`;
              return (
                <InnerOption
                  key={bonus?.name}
                  icon={"/images/bonus_store/bonus.png"}
                  name={bonus_name}
                  rate={rate}
                  time={bonus?.repurchase_limit_time ?? 0}
                  checked={bonusType?.name === bonus?.name}
                  multiplier={parsed_data?.wager_require_multiplier}
                  onClick={() => openModal("OPEN_PLAY_BONUS_MODAL", bonus)}
                  onChecked={(checked) => setBonusType(checked ? bonus : null)}
                >
                </InnerOption>
              );
            })
          }
        </div>

        <ConfirmBox
          onClick={() => {
            openModal("OPEN_BONUS_SWAP_MODAL", { ...bonusType });
          }}
          disabled={!bonusType}
        >
          {t("bonusStore:buyNow")}
        </ConfirmBox>
      </div>
    </div>
  );
}


/**
 * {
 *     "id": 14,
 *     "name": "180_bonus",
 *     "type": 2,
 *     "repurchase_limit_hours": 8760,
 *     "tolerance_rate": "0E-8",
 *     "currency": "BONUS",
 *     "status": 1,
 *     "expire_days": 30,
 *     "extra_data": "{\"type\": \"180_bonus\", \"bonus_rate\": \"1.8\", \"claim_min_value\": \"0\", \"claim_max_multiplier\": \"5\", \"wager_require_multiplier\": \"30\", \"max_deposit_require_value\": \"1000000000\", \"min_deposit_require_value\": \"10\"}",
 *     "created_at": 1773662400,
 *     "updated_at": 1773662400,
 *     "version": 0,
 *     "repurchase_remaining_seconds": 0,
 *     "repurchase_limit_time": 0
 * }
 *
 * 51025	参数错误	Invalid parameters
 * 51026	套餐不存在	Package not found
 * 51027	套餐无效	Package unavailable
 * 51028	请求处理中，请稍后	Request in progress
 * 51029	存在未完成的 Bonus	Active bonus exists
 * 51030	未到复购时间	Repurchase not allowed yet
 * 51031	配置数据无效	Invalid configuration
 * 51032	余额不足	Insufficient balance
 * 51033	换汇失败	Currency exchange failed
 * 51034	购买金额过低	Amount too low
 * 51035	购买金额过高	Amount too high
 * 51036	奖励比例无效	Invalid bonus rate
 * 51037	创建记录失败	Failed to create record
 */
