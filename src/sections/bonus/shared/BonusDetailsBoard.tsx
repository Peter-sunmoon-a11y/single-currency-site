import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { useUserClaimBonus } from "@/hooks/api/useAuth";
import { useMemo } from "react";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { cn } from "@/utils/cn";
import { ALL_BONUS_TYPES, resolveBonusDetailAmount } from "@/sections/bonus/shared/bonus-details-config";
import { Modal } from "@/components/ui/Modal";
import clsx from "clsx";

export function BonusDetailsBoard({
                                    open,
                                    onClose
                                  }: {
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation(["bonus", "vip", "tournament", "promoCode", "mysteryBox"]);
  const { formatWithConversion } = useDisplayCurrencyFormatter();
  const { data: bonusDetailsData, isLoading } = useUserClaimBonus();

  const bonusDetails = useMemo(() => {
    // 创建一个 Map 来存储 API 返回的数据，方便查找
    const apiDataMap = new Map<string, { sum: number; currency: string }>();

    if (bonusDetailsData?.data?.data && Array.isArray(bonusDetailsData.data.data)) {
      bonusDetailsData.data.data.forEach((item: any) => {
        apiDataMap.set(item.item, {
          sum: parseFloat(item.sum) || 0,
          currency: item.currency || "USDT"
        });
      });
    }

    // 创建完整的 bonus 列表，包含所有类型
    return ALL_BONUS_TYPES.map((bonusType: Record<string, any>) => {
      const apiData = apiDataMap.get(bonusType.key);

      return {
        type: bonusType.key,
        label: bonusType.label,
        amount: resolveBonusDetailAmount(bonusType.key, apiDataMap),
        currency: apiData?.currency || "USDT"
      };
    });
  }, [bonusDetailsData]);

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={t("bonus:bonus_details")}
      position="modal-middle"
    >
      {isLoading ? (
        <div className="grid grid-cols-2 gap-0.5">
          {Array.from({ length: ALL_BONUS_TYPES.length }).map((_, i) => (
            <div key={i} className="skeleton h-7 bg-base-200 rounded-sm" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-0.5">
          {bonusDetails.map((detail) => (
            <div
              key={detail.type}
              className={cn("flex gap-2 items-center justify-between px-2 rounded-sm h-7 bg-base-200")}
            >
              <p className="text-sm text-base-content/50 truncate">
                {t(detail.label)}
              </p>
              <p
                className={clsx("text-sm font-bold text-base-content/20 text-right", { "text-primary": Number(detail.amount) > 0 })}>
                {formatWithConversion(detail.amount, detail.currency, {
                  showCode: false,
                  displayDecimal: 6,
                  minimizeDecimals: true,
                }).formatted}
              </p>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
