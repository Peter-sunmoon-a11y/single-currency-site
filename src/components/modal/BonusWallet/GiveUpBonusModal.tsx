import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { Modal } from "@/components/ui/Modal.tsx";
import { Trans, useTranslation } from "@/lib/i18n/react-i18next";
import { ReactNode, useCallback, useState } from "react";
import { getCurrencyOtherThanBonusCoin, userAbandonBonus } from "@/services/auth/bonus";
import { userAbandonSport } from "@/services/auth/sportsBonus";
import { useUserBonusWallet } from "@/query/dollars.ts";
import { useUserSportWallet } from "@/query/sports-bonus.ts";
import { useUpdateSettlementCurrency } from "@/contexts/SettlementCurrencyContext.tsx";
import { toast } from "sonner";
import { InnerToastCustom } from "@/sections/dollars/components.tsx";
import { useAppNavigate } from "@/hooks/useAppNavigate";
import {
  InnerContainer,
  InnerContent,
  InnerDescription,
  InnerHeader,
  InnerSlogan
} from "@/standard/modals/DemoLazyInfoModal.tsx";
import { getSportsBonusCampaignLabel, getSportsBonusPicture } from "@/sections/sports-bonus/assets.ts";

export const GiveUpBonusModal = (
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
  const { t } = useTranslation();
  const campaignLabel = getSportsBonusCampaignLabel();

  // 设置结算币种
  const { updateSettlementCurrency } = useUpdateSettlementCurrency();

  const [isPending, setPending] = useState<boolean>(false);

  // 彩金钱包数据
  const { refetch: refetchBonusWallet } = useUserBonusWallet();
  const { refetch: refetchSportWallet } = useUserSportWallet();

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

  const handle = useCallback(async () => {
    setPending(true);

    try {
      // 放弃体育彩金活动
      if (data?.kind === "sports") {
        const response = await userAbandonSport(data?.id);

        if (response.code === 0 || response.code === 200) {
        } else if (response.code === 90006) {
          showErrorToast("sportsBonus:sportsBonusGiveUp");
          return;
        } else {
          showErrorToast("");
          return;
        }

        await refetchSportWallet();
      }

      // 放弃常规彩金活动
      if (data?.kind === "general") {
        const response = await userAbandonBonus(data?.id);

        if (response.code === 0 || response.code === 200) {
        } else {
          showErrorToast("");
          return;
        }

        await refetchBonusWallet();
      }

      void navigate({
        to: "/casino",
        search: {
          redirect: undefined,
          startapp: undefined,
          openFinance: undefined
        } as any
      });

      // 切换彩金币种为其他结算币种
      const currency = await getCurrencyOtherThanBonusCoin();

      if (currency?.data?.currency) {
        void updateSettlementCurrency(currency?.data?.currency);
      }

      onClose();
    } catch (_error) {
      console.info(_error);
    } finally {
      setPending(false);
    }
  }, [data?.id, data?.kind]);

  return (
    <Modal
      hideTitle
      isOpen={open}
      onClose={onClose}
      position="modal-middle"
      className="p-0 bg-transparent"
    >
      {
        data?.kind === "general"
          ? <InnerSlogan
            // 根据设计稿自行修改文字
            title={t("bonus:slotBonus")}
            // 根据设计稿自行修改图片
            picture="/images/bonus_store/bonus-store.png"
          />
          : <InnerSlogan
            // 根据设计稿自行修改文字
            title={<>
              {t("sportsBonus:bonus")}
              {campaignLabel ? <p className="mt-2 text-sm font-semibold text-primary italic">{campaignLabel}</p> : null}
            </>}
            // 根据设计稿自行修改图片
            picture={getSportsBonusPicture()}
          />
      }

      <InnerContainer>
        <InnerHeader
          title={<p className={"text-primary"}>
            {/* 根据设计稿自行修改文字 */}
            {t("bonus:lose_all")}
          </p>}
          onClose={onClose}
        />

        <InnerContent>
          <InnerDescription>
            <p className={"text-base-content font-bold"}>{t("bonus:reset_bonus")}</p>
          </InnerDescription>
          <InnerDescription>
            <div className="flex gap-2 items-center w-full">
              <ConfirmBox onClick={handle} loading={isPending}
                          className={"w-auto flex-1"}>{t("common:common.continue")}</ConfirmBox>
              <ConfirmBox onClick={onClose}
                          className={"w-auto flex-1 btn-soft"}>{t("common:common.cancel")}</ConfirmBox>
            </div>
          </InnerDescription>
        </InnerContent>
      </InnerContainer>
    </Modal>
  );
};

export default GiveUpBonusModal;
