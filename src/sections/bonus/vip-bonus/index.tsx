import { useTranslation } from "@/lib/i18n/react-i18next";
import Iconify from "@/components/iconify";
import {
  BonusListHeader,
  BonusLucky7,
  MemberBonus,
  MembersDay
} from "@/sections/bonus";
import { VipMonday } from "@/sections/bonus/vip-monday";
import { JesterBonus } from "./jester";

export const VIPBonus = () => {
  const { t } = useTranslation();


  return (
    <BonusListHeader
      icon={<Iconify icon="custom:vip" width={20} height={20} className="shrink-0 text-primary" />}
      title={t("bonus:vip_bonus")}
      childrenClassName="grid grid-cols-1 gap-2"
    >
      <MemberBonus />

      <MembersDay />

      <VipMonday />

      <JesterBonus />

      <BonusLucky7 />

    </BonusListHeader>
  );
};
