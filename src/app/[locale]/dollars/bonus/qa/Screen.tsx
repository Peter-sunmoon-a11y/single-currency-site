import {
  InnerDescription,
  EBonus, InnerGiveUpBonus
} from "@/sections/dollars/components.tsx";
import { useUserBonusWallet } from "@/query/dollars.ts";
import { InnerSlogan } from "@/standard/modals/DemoLazyInfoModal.tsx";
import { useTranslation } from "@/lib/i18n/react-i18next";

function Index() {
  const { t } = useTranslation();

  // 彩金钱包数据
  const { data: bonusWallet } = useUserBonusWallet();

  // 彩金配置数据

  const current = bonusWallet?.data;

  // 活动描述
  return <div className={"p-4 flex flex-col gap-4"}>
    <InnerSlogan
      // 根据设计稿自行修改文字
      title={t("bonus:slotBonus")}
      // 根据设计稿自行修改图片
      picture="/images/bonus_store/bonus-store.png"
    />
    {/* 是否可放弃彩金 */}
    <InnerGiveUpBonus />
    <InnerDescription data={current} currency={EBonus.TOKEN} />
  </div>;
}
export const beforeLoad = undefined;

export default Index;
