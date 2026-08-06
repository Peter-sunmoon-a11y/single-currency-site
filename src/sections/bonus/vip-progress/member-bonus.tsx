import { ReactNode, useMemo } from "react";
import { useBoundStore } from "@/store";
import { useBonusSwitch, useClaimBonus, useClaimBonusMutation, useVipNextLevelData } from "@/hooks/api/useAuth";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import clsx from "clsx";
import { useAppNavigate } from "@/hooks/useAppNavigate";
import {
  CLAIMABLE_BONUS_ANCHOR_IDS,
  CLAIMABLE_BONUS_SCROLL_MARGIN_TOP_CLASS
} from "@/sections/bonus/shared/claimable-bonus-config";
import { useNavigateGuard } from "@/sections/casino/hero-banner/InnerComponents.tsx";
import { BonusClaimModal } from "@/sections/dollars/bonus-claim-modal";
import { useToggle } from "@/hooks/useToggle";
import { Info } from "@/sections/bonus/components/Info.tsx";
import { Decimal } from "decimal.js";
import { TextBaseContent } from "@/components/standard/TextBaseContent.tsx";

export const MemberBonus = () => {
  return (
    <MemberBonusGuard>
      {(props) => <MemberBonusContent {...props} />}
    </MemberBonusGuard>
  );
};

type MemberBonusGuardValues = {
  currentVip: string | number;
  badgeUrl: string;
  claimableAmount: number;
  formattedBonus: string;
  isClaimAvailable: boolean;
  xpToNextVip: number | null;
  nextVipLevel: number | null;
};

const MemberBonusGuard = ({
                            children
                          }: {
  children: (values: MemberBonusGuardValues) => ReactNode;
}) => {
  const { switchData } = useBonusSwitch();
  const status = useBoundStore((state) => state.status);
  const { formatWithConversion } = useDisplayCurrencyFormatter();
  const { data: levelUpClaimData } = useClaimBonus("level_up");
  const { data: vipNextLevelData } = useVipNextLevelData();
  const mondayVipBonusEnabled = switchData?.bonus_switch?.monday_vip_bonus !== 0;
  const currentVip = status?.vip || "--";
  const badgeUrl = `/images/vip/levels/${currentVip}.png`;
  const claimable = levelUpClaimData?.data?.data?.value || 0;
  const formattedBonus = formatWithConversion(claimable, "USDT", {
    showSymbol: true,
    showCode: false
  }).formatted;
  const isClaimAvailable = Number(levelUpClaimData?.data?.data?.value ?? 0) > 0;
  const nextVipFullXp = useMemo(() => Number(vipNextLevelData?.data?.xp || 0), [vipNextLevelData]);
  const userXp = useMemo(() => Number(status?.xp || 0), [status]);
  const numericCurrentVip = useMemo(() => Number(status?.vip ?? 0), [status]);
  const xpToNextVip = useMemo(() => {
    if (!nextVipFullXp || !numericCurrentVip) return null;
    return Decimal.max(0, Decimal(nextVipFullXp).sub(userXp)).toDP(0, Decimal.ROUND_UP).toNumber();
  }, [nextVipFullXp, numericCurrentVip, userXp]);
  const nextVipLevel = xpToNextVip === null ? null : numericCurrentVip + 1;

  if (!mondayVipBonusEnabled) {
    return null;
  }

  return children({
    currentVip,
    badgeUrl,
    claimableAmount: Number(claimable),
    formattedBonus,
    isClaimAvailable,
    xpToNextVip,
    nextVipLevel
  });
};

const MemberBonusContent = (
  {
    currentVip,
    badgeUrl,
    claimableAmount,
    formattedBonus,
    isClaimAvailable,
    xpToNextVip,
    nextVipLevel
  }: MemberBonusGuardValues) => {
  const navigate = useAppNavigate();
  const { t } = useTranslation();
  const user = useBoundStore((state) => state.user);
  const openModal = useBoundStore((state) => state.openModal);

  const [isClaimOpen, { setTrue: openClaimModal, setFalse: closeClaimModal }] = useToggle(false);

  const { navigateCallback } = useNavigateGuard();

  // Claim Logic
  const { mutate: claimBonus, isPending: isClaimPending } = useClaimBonusMutation();

  const handle = (selectedCurrency: string) => {
    if (!selectedCurrency || isClaimPending) return;

    claimBonus(
      { item: "level_up", currency: selectedCurrency },
      {
        onSuccess: (res: any) => {
          if (res.code === 0) {
            console.info('level_up');
            console.info(res);
            closeClaimModal();
            if (Number(res.data?.don_record_id) > 0) {
              openModal("OPEN_DOUBLE_OR_NOTHING_MODAL", {
                don_record_id: res.data?.don_record_id,
                amount: res.data?.amount
              });
            }
          }
        }
      }
    );
  };

  return (
    <>
      <div
        id={CLAIMABLE_BONUS_ANCHOR_IDS.memberBonus}
        className={clsx(
          "relative bg-base-100 rounded-lg px-4 py-4 overflow-hidden flex flex-col gap-2",
          CLAIMABLE_BONUS_SCROLL_MARGIN_TOP_CLASS
        )}
      >
        <div className="flex flex-col gap-2">
          <div className="flex justify-between pr-18">
            <div className="flex items-start gap-2 min-w-0">
              <img
                src={user ? badgeUrl : "/images/vip/gift-box.png"}
                loading="lazy"
                decoding="async"
                className="w-8 h-8 object-contain shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 min-w-0">
                  <h2 className={clsx("text-base font-bold uppercase min-w-0")}>
                    VIP {currentVip}
                    <sub
                      className={"text-base-content/50 text-[12px] font-normal pl-2"}>{t("bonus:bonus_detail_level_up")} </sub>
                  </h2>
                  <Info
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal("OPEN_MEMBER_BONUS_HELP_MODAL");
                    }}
                  />
                </div>
              </div>
            </div>
            {!user && <ConfirmBox
              className="btn-sm w-auto text-sm"
              onClick={() => navigateCallback(() => {
                void navigate({ to: "/vip-club" });
              }, true)}>
              {t("bonus:go")}
            </ConfirmBox>}
          </div>

          {user && xpToNextVip !== null && nextVipLevel !== null && (
            <TextBaseContent className={'italic text-xs'} text={t("vip:xp_to_vip", { xp: xpToNextVip, vip: nextVipLevel })} />
          )}

          <div className="flex items-center jusify-between gap-4">
            {user && <div className="flex-1 flex items-center gap-1">
              <div className="text-sm text-base-content/50">{t("bonus:claimable")}</div>
              <div className="text-sm text-primary font-bold">{formattedBonus}</div>
            </div>}
            {user && isClaimAvailable && (
              <ConfirmBox
                loading={isClaimPending}
                className="btn-sm w-auto text-sm"
                onClick={openClaimModal}
                disabled={isClaimPending}
              >
                {t("bonus:claim")}
              </ConfirmBox>
            )}
            {user && !isClaimAvailable && (
              <ConfirmBox
                className="btn-sm w-auto text-sm"
                onClick={() => void navigate({ to: "/vip-club" })}>
                {t("bonus:go")}
              </ConfirmBox>
            )}
          </div>
        </div>
      </div>
      <BonusClaimModal
        open={isClaimOpen}
        bonus={String(claimableAmount)}
        isBonus
        loading={isClaimPending}
        onClose={closeClaimModal}
        onClick={handle}
      />
    </>
  );
};
