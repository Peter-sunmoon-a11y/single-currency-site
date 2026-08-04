import { useTranslation } from "@/lib/i18n/react-i18next";
import { useState } from "react";
import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { useSportsBonusConfigList } from "@/hooks/api/useAuth.ts";
import Decimal from "decimal.js";
import { parser } from "@/components/header/message-v2/c/InnerMsgLink.tsx";
import { InnerOption } from "@/sections/dollars/components.tsx";
import { useBoundStore } from "@/store";

export default function SportsBonusOptional() {
  const openModal = useBoundStore((state) => state.openModal);

  const [bonusType, setBonusType] = useState<Record<string, any> | null>(null);

  const { t } = useTranslation("bonusStore");

  // 体育彩金活动配置列表
  const { data: bonusConfig } = useSportsBonusConfigList();

  return (
    <div className="relative">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          {(bonusConfig?.data ?? []).map((bonus: Record<string, any>) => {
            const parsed_data = parser(bonus?.extra_data);
            const bonus_name = parsed_data?.type;
            return (
              <InnerOption
                key={bonus?.name}
                icon={"/images/bonus_sports/sport.png"}
                name={bonus_name}
                rate={Decimal(parsed_data?.bonus_rate || 0).times(100).toFixed(0) + "%"}
                time={bonus?.repurchase_limit_time ?? 0}
                checked={bonusType?.name === bonus?.name}
                multiplier={parsed_data?.wager_require_multiplier}
                onClick={() => openModal("OPEN_PLAY_SPORTS_BONUS_MODAL", bonus)}
                onChecked={(checked) => setBonusType(checked ? bonus : null)}
              />
            );
          })}
        </div>

        <ConfirmBox
          onClick={() => {
            openModal("OPEN_SPORTS_BONUS_SWAP_MODAL", { ...bonusType });
          }}
          disabled={!bonusType}
        >
          {t("bonusStore:buyNow")}
        </ConfirmBox>
      </div>
    </div>
  );
}
