import {
  Hero,
  ClaimableBonus,
  BonusStore,
  GeneralBonus,
  DailyCheckIn, VIPBonus
} from "@/sections/bonus";
import { ClaimPromoCode } from "@/sections/bonus/ClaimPromoCode.tsx";
import { FreeSpins } from "@/sections/bonus";
import { Achievements } from "@/sections/bonus/achievements/achievements.tsx";

function RouteComponent() {
  return (
    <div className="flex flex-col gap-2 p-4">
      {/*背景图背景色背景文字*/}
      <Hero />

      {/*可直接领取的奖励*/}
      <ClaimableBonus />

      {/*用户签到奖励*/}
      <DailyCheckIn />

      {/*免费旋转*/}
      <FreeSpins />

      {/*彩金商店*/}
      <BonusStore />

      {/*常规奖金*/}
      <GeneralBonus />

      {/*会员奖励*/}
      <VIPBonus />

      {/*用户成就奖励*/}
      <Achievements />

      {/* 用户获取优惠码 */}
      <ClaimPromoCode />
    </div>
  );
}

export const beforeLoad = undefined;

export default RouteComponent;
