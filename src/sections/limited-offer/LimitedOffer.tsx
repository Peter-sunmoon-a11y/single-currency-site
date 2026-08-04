import { Modal } from "@/components/ui/Modal";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { useGetPromoByPage } from "@/query/promo.tsx";
import { useAppNavigate } from "@/hooks/useAppNavigate";
import {CountdownTimer} from "@/sections/dollars/CountdownTimer.tsx";

// TODO: 满足条件时候会自动弹出
export const LimitedOffer = (
  {
    open,
    data,
    onClose
  }: {
    open: boolean;
    data: any;
    onClose: () => void;
  }) => {

  const navigate = useAppNavigate();
  const { t } = useTranslation("gameDetail");

  const { formatWithConversion } = useDisplayCurrencyFormatter();

  const { refetch: refetchPromotion } = useGetPromoByPage();

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={t("gameDetail:limitedOffer")}
      position="modal-middle"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center flex-col gap-4">
          <img src="/images/deposit_promotion/specialOffer.png" alt="" className="w-[100px] animate-swing" />
          <div>
            <p className="text-center text-base-content/50 text-base">{t("gameDetail:deposit", {
              value: `${(() => {
                return formatWithConversion(data?.min_amount || 10000, "USDT",{
                  showCode: false,
                  showSymbol: true
                }).formatted;
              })()
              }`
            })}</p>
            <p className="text-center text-base-content/50 text-base">
              {t("gameDetail:instantCashBonus")}
            </p>
            <p className="text-center text-primary text-2xl font-bold">{t("gameDetail:get", {
              value: `${formatWithConversion(data?.bonus_amount, "USDT", {
                showSymbol: true,
                showCode: false
              }).formatted}`
            })}</p>
          </div>
        </div>
        {data?.expired_at > 0 && <div
          className="text-sm text-primary flex justify-center">
          <CountdownTimer expireTime={data?.expired_at || 0} />
        </div>}
        <button className="btn btn-primary" onClick={() => {
          void refetchPromotion();
          void navigate({ to: "/finance" });
          onClose();
        }}
        >{t("gameDetail:depositNow")}</button>
      </div>
    </Modal>
  );
};

export default LimitedOffer;
