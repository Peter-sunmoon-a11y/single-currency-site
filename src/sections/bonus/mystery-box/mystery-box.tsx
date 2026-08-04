/**
 * Bonus page Mystery Box card, used to open the actual content of Mystery Box.
 */
import { useTranslation } from "@/lib/i18n/react-i18next";
import { VIP_REQUIREMENTS } from "../shared/config";
import { VipButton } from "@/sections/bonus";
import { useHasMysteryBox } from "@/query/bouns";
import { Info } from "@/sections/bonus/components/Info.tsx";
import clsx from "clsx";
import { useBoundStore } from "@/store";
import { useAppNavigate } from "@/hooks/useAppNavigate";
import { useBonusSwitch } from "@/hooks/api/useAuth";
import {
  CLAIMABLE_BONUS_ANCHOR_IDS,
  CLAIMABLE_BONUS_SCROLL_MARGIN_TOP_CLASS
} from "@/sections/bonus/shared/claimable-bonus-config";

export function MysteryBox() {
  return <MysteryBoxGuard />;
}

function MysteryBoxGuard() {
  const { switchData } = useBonusSwitch();
  const { data: conquestsReward } = useHasMysteryBox();

  const mysteryBoxEnabled = switchData?.bonus_switch?.mystery_box === 0;
  const isClaimable = conquestsReward?.data?.has_mystery_box ?? false;

  if (mysteryBoxEnabled) {
    return null;
  }

  return <MysteryBoxContent isClaimable={isClaimable} />;
}

function MysteryBoxContent({
  isClaimable
}: {
  isClaimable: boolean;
}) {
  const navigate = useAppNavigate();
  const { t } = useTranslation(["bonus", "mysteryBox"]);
  const openModal = useBoundStore(state => state.openModal);

  const requiredVipLevel = VIP_REQUIREMENTS.mysteryBox.requiredLevel;

  const handle = () => {
    if (isClaimable) {
      openModal("OPEN_MYSTERY_BOX_MODAL");
    } else {
      void navigate({
        to: "/explore",
        search: { type: "casino", category: "hot" }
      })
    }
  };

  return (
    <div
      id={CLAIMABLE_BONUS_ANCHOR_IDS.mysteryBox}
      className={clsx(
        "relative bg-base-100 rounded-lg px-4 py-4 overflow-hidden flex flex-col gap-2",
        CLAIMABLE_BONUS_SCROLL_MARGIN_TOP_CLASS
      )}
    >
      <div className="flex items-center gap-4 justify-between">
        <div className="flex items-center gap-2">
          <img
            src={"/images/bonus_mysterybox/gift.png"}
            loading="lazy"
            decoding="async"
            className="w-8 h-8 object-contain" />
          <h2 className={clsx("text-base font-bold uppercase")}>
            {t("mysteryBox:mystery_box")}
          </h2>
          {/* 活动信息提示 */}
          <Info
            onClick={(e) => {
              e.stopPropagation();
              openModal("OPEN_MYSTERY_BOX_HELP_MODAL");
            }} />
        </div>
        <VipButton
          requiredLevel={requiredVipLevel}
          onClick={handle}
          claimable={isClaimable}
          useClaimStateWhenUnlocked
        />
      </div>
    </div>
  );
}
