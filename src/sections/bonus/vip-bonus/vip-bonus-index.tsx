// // import { VIP_REQUIREMENTS } from "@/sections/bonus/shared/config";
// // import { useMemo } from "react";
// import { useTranslation } from "@/lib/i18n/react-i18next";
// import Iconify from "@/components/iconify";
// import { useBoundStore } from "@/store";
// import { useBonusSwitch } from "@/hooks/api/useAuth";
// import { BonusListHeader, BonusLuckyNumberCardV2, BonusVipProgressCardV2, MysteryBoxCardV2, BonusVipMondayCardV2 } from "@/sections/bonus";
//
// export const VipBonusIndex = () => {
//
//   const { t } = useTranslation();
//   const isAuthenticated = useBoundStore((state) => !!state.user);
//   const { switchData } = useBonusSwitch();
//   // const status = useBoundStore((state) => state.status);
//
//   // const unlockedVipBonuses = useMemo(() => {
//   //   if (!status?.vip) return 0;
//
//   //   let count = 0;
//   //   const vipLevel = status.vip;
//
//   //   // Check Achievements
//   //   if (vipLevel >= VIP_REQUIREMENTS.achievements.requiredLevel) count++;
//
//   //   // Check Mystery Box
//   //   if (vipLevel >= VIP_REQUIREMENTS.mysteryBox.requiredLevel) count++;
//
//   //   // Check Lucky Number
//   //   if (vipLevel >= VIP_REQUIREMENTS.luckyNumber.requiredLevel) count++;
//
//   //   // Check VIP Monday (only if enabled)
//   //   if (switchData?.bonus_switch?.monday_vip_bonus === 1 && vipLevel >= VIP_REQUIREMENTS.vipMonday.requiredLevel) {
//   //     count++;
//   //   }
//
//   //   return count;
//   // }, [status?.vip, switchData?.bonus_switch?.monday_vip_bonus]);
//
//   return (
//     <>
//       {/* <div className="flex items-center gap-2">
//         <Iconify icon="custom:vip" width={20} height={20} className="text-primary" />
//         <p className="text-sm font-semibold">{t("bonus:vip_bonus")}</p>
//         {unlockedVipBonuses > 0 && (
//           <div className="badge badge-primary badge-soft font-bold">
//             {unlockedVipBonuses}
//           </div>
//         )}
//       </div> */}
//       <BonusListHeader
//         title={t("bonus:vip_bonus")}
//         icon={<Iconify icon="custom:vip" width={20} height={20} className="text-primary" />}
//         childrenClassName="grid grid-cols-1 gap-3 min-[640px]:grid-cols-2 min-[1000px]:grid-cols-3 min-[1300px]:grid-cols-4 min-[1550px]:grid-cols-5 justify-items-center"
//       >
//         {isAuthenticated && <BonusVipProgressCardV2 />}
//         {/* {isAuthenticated && <BonusVipProgressCard />} */}
//
//         {/* <BonusAchievementsCard />  */}
//         <MysteryBoxCardV2 />
//         {switchData?.bonus_switch?.monday_vip_bonus === 1 && <BonusVipMondayCardV2 />}
//         <BonusLuckyNumberCardV2 />
//         {/* {switchData?.bonus_switch?.monday_vip_bonus === 1 && <BonusVipMondayCard />} */}
//       </BonusListHeader>
//     </>
//   );
// };
