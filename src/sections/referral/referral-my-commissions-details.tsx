import { Modal } from "@/components/ui/Modal";
import { useEffect, useState } from "react";
import { getRewardGroupLogDetail } from "@/services/auth/referral";
import type { ICommissionDetail, CommissionRecord } from "@/types/referral";
import { useTranslation } from "@/lib/i18n/react-i18next";
import dayjs from "dayjs";
import { useDisplayCurrencyFormatter } from "@/hooks/currency";

export default function ReferralMyCommissionsDetails({
  item,
  isOpen,
  onClose,
}: {
  item: CommissionRecord | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation(["referral"]);
  const { formatWithConversion } = useDisplayCurrencyFormatter();
  const [detail, setDetail] = useState<ICommissionDetail | null>(null);

  useEffect(() => {
    if (!item) return;
      getRewardGroupLogDetail({ id: item.id })
      .then((res: any) => {
        setDetail(res.data);
      });
  }, [item]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("bonus:details")}
      position={"modal-middle"}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between bg-base-200 px-2 py-2 rounded-sm">
          <span className="text-sm text-base-content/50">{t("referral:username")}</span>
          <span className="text-sm font-semibold">{detail?.username}</span>
        </div>
        <div className="flex items-center justify-between bg-base-200 px-2 py-2 rounded-sm">
          <span className="text-sm text-base-content/50">{t("referral:registrationDate")}</span>
          <span className="text-sm font-semibold">
            {Number(detail?.regitration_date ?? 0) > 0 ? dayjs((detail?.regitration_date ?? 0) * 1000).format("YYYY/MM/DD") : "--"}
          </span>
        </div>
        <div className="flex items-center justify-between bg-base-200 px-2 py-2 rounded-sm">
          <span className="text-sm text-base-content/50">{t("referral:level")}</span>
          <span className="text-sm font-semibold">VIP {detail?.vip_level ?? "--"}</span>
        </div>
        <div className="flex items-center justify-between bg-base-200 px-2 py-2 rounded-sm">
          <span className="text-sm text-base-content/50">{t("referral:referralCode")}</span>
          <span className="text-sm font-semibold" dir="ltr">{detail?.referral_code ?? "--"}</span>
        </div>
        <div className="flex items-center justify-between bg-base-200 px-2 py-2 rounded-sm">
          <span className="text-sm text-base-content/50">{t("referral:rewardsUnlocked")}</span>
          <span className="text-sm font-semibold text-primary" dir="ltr">
            {formatWithConversion(detail?.rewards_unlocked ?? 0, "USD", {
              showSymbol: false,
              showCode: true,
              minimizeDecimals: true,
              displayDecimal: 4,
            }).formatted}
          </span>
        </div>
      </div>
    </Modal>
  );
}
