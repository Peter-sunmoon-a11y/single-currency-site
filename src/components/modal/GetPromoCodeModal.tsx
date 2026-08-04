import { Modal } from "@/components/ui/Modal.tsx";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { useUpdateSettlementCurrency } from "@/contexts/SettlementCurrencyContext.tsx";
import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { EBonus } from "@/sections/dollars/components.tsx";
import { useMqttEvent } from "@/contexts/mqtt";
import { useBoundStore } from "@/store";
import { useEffect, useState } from "react";
import { useUserBuddyBallsHome } from "@/hooks/api/useAuth.ts";
import { useAppNavigate } from "@/hooks/useAppNavigate";
import { InnerCoinBox } from "@/sections/dollars/bonus-claim-modal.tsx";

type PromoCodeResultPayload = {
  type?: string;
};

export const GetPromoCodeModal = (
  {
    data,
    open,
    onClose
  }: {
    data: Record<string, any>;
    open: boolean;
    onClose: () => void;
  }) => {

  const navigate = useAppNavigate();
  const { t } = useTranslation();

  const user = useBoundStore((state) => state.user);

  // 设置结算币种
  const { updateSettlementCurrency } = useUpdateSettlementCurrency();

  // 球游戏 -> 球游戏的主页信息
  const { refetch: refetchBuddyBallsHome } = useUserBuddyBallsHome();

  const [freeSpinMsgReceived, setFreeSpinMsgReceived] = useState(false);

  // 派生状态
  const isFreeSpin = !!data?.type?.includes("free_spin");

  useEffect(() => {
    if (!open || !isFreeSpin) {
      setFreeSpinMsgReceived(false);
    }
  }, [open, isFreeSpin]);

  useMqttEvent<PromoCodeResultPayload>(
    user?.id ? `user/${user.id}/promo_code_result` : null,
    (message) => {
      if (!open || !isFreeSpin) return;
      if (!message.parsed?.type?.includes("free_spin")) return;
      setFreeSpinMsgReceived(true);
    }
  );

  return (
    <Modal
      isOpen={open}
      title={t("finance:promoCode")}
      onClose={onClose}
      position="modal-middle"
    >
      <div className="flex flex-col gap-4 items-center font-semibold overflow-hidden">
        {isFreeSpin && !freeSpinMsgReceived ? <InnerPending /> : <InnerSucceed />}

        {/* 非 FreeSpin 类型：直接跳转对应页面 */}
        {!isFreeSpin && (
          <button
            className="btn btn-primary w-full"
            onClick={() => {
              onClose();
              if (data?.type?.includes("bonus_wallet")) {
                void navigate({ to: "/dollars/bonus" });
                void updateSettlementCurrency(EBonus.TOKEN);
                return;
              }
              if (data?.type?.includes("buddy_balls")) {
                void navigate({ to: "/buddy-balls" });
                void refetchBuddyBallsHome();
                return;
              }
            }}>
            {t("bonus:gotIt")}
          </button>
        )}

        {/* FreeSpin：等消息到账后才显示按钮 */}
        {isFreeSpin && freeSpinMsgReceived && (
          <ConfirmBox className="">{t("bonus:gotIt")}</ConfirmBox>
        )}
      </div>
    </Modal>
  );
};

export default GetPromoCodeModal;

const InnerPending = () => {
  const { t } = useTranslation();
  return <div className="flex flex-col gap-4 items-center">
    <span className="loading loading-bars text-primary w-12 h-12" />
    <p className="text-sm font-extrabold text-primary mb-2">
      {t("common:claiming")}
    </p>
  </div>;
};

const InnerSucceed = () => {
  const { t } = useTranslation("doubleOrNothing");
  return <div className="flex flex-col gap-4 items-center">
    <InnerCoinBox />
    <p className="text-sm font-extrabold text-primary mb-2">
      {t("doubleOrNothing:congratulations")}
    </p>
  </div>;
};
