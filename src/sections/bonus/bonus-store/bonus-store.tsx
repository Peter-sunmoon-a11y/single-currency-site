import { BonusListHeader } from "@/sections/bonus";
import { useTranslation } from "@/lib/i18n/react-i18next";
import Iconify from "@/components/iconify";
import { SlotsBonusCard } from "./InnerComponents.tsx";
import { SportsBonusCard } from "@/sections/sports-bonus/sports-bonus-store/SportsBonusCard.tsx";
import { useNavigateGuard } from "@/sections/casino/hero-banner/InnerComponents.tsx";
import { useAppNavigate } from "@/hooks/useAppNavigate";

export const BonusStore = () => {

  const navigate = useAppNavigate();

  const { navigateCallback } = useNavigateGuard();

  const { t } = useTranslation("bonusStore");

  return (
    <BonusListHeader
      icon={<Iconify icon="custom:bonus-store" className="shrink-0 w-5 h-5 text-primary" />}
      title={t("bonus:bonus_store")}
      jumpTo={() => navigateCallback(() => {
        void navigate({ to: "/dollars/bonus/history" });
      }, true)}
      childrenClassName="grid grid-cols-1 gap-2"
    >
      <SlotsBonusCard />

      <SportsBonusCard />
    </BonusListHeader>
  );
};
