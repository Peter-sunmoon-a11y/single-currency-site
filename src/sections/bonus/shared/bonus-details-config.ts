import Decimal from "decimal.js";

// 这些奖励类型不应计入 Bonus 首页的 Lifetime Bonus 统计。
// 原因是它们属于活动派生项或特殊奖励项，不适合作为常规奖励累计展示。
export const REWARD_ITEMS_EXCLUDED_FROM_LIFETIME_BONUS = [
  "don",
  "BONUS",
  "conquest",
  "bonus_manual",
  "special_offer_sunday",
  "special_offer_thursday"
] as const;

export const REWARD_ITEMS_EXCLUDED_FROM_LIFETIME_BONUS_SET = new Set<string>(
  REWARD_ITEMS_EXCLUDED_FROM_LIFETIME_BONUS
);
/**
 * BONUS, bonus_manual, bounty,
 * buddy_balls,
 * cashback,
 * daily_first_deposit_branch,
 * don,
 * don_lose, don_win,
 * first_challenge, free_bonus,
 * free_spin_reward, group, joker_bonus, level_up,
 * lucky_number, lucky_spin_mega, lucky_spin_normal,
 * mega_bonus, mega_bonus_uat, members_day, mini_bonus,
 * mini_bonus_uat, monday_vip_bonus, promo_code, Promocode_Bonuswallet_1,
 * Promocode_Bonuswallet_2, Promocode_PKLITE, rakeback, referral, special_offer_don_deposit,
 * special_offer_first_deposit, special_offer_second_deposit, special_offer_sunday,
 * special_offer_thursday, sports_bonus_claim, test_gene, tournament, vip_bonus_lucky_number_seven,
 * vip_bonus_mystery_box
 */
export const ALL_BONUS_TYPES = [
  { key: "don", label: "bonus:item.don" }, // Double or Nothing 聚合奖励
  { key: "group", label: "bonus:item.group" },
  { key: "referral", label: "bonus:referral_bonus" },
  { key: "rakeback", label: "bonus:super_rakeback" },
  { key: "level_up", label: "vip:level_up_bonus" },
  { key: "promo_code", label: "bonus:promo_code" }, // 优惠码
  { key: "tournament", label: "tournament:tournament_reward" },
  { key: "achievement", label: "bonus:achievements" },
  { key: "buddy_balls", label: "buddyBalls:buddyBalls" }, // 幸运球
  { key: "free_spin_reward", label: "bonus:item.free_spin_reward" }, // 免费旋转奖金
  { key: "monday_vip_bonus", label: "bonus:item.monday_vip_bonus" }, // 周一 VIP 奖金
  { key: "vip_bonus_mystery_box", label: "mysteryBox:mystery_box" },
  { key: "special_offer_first_deposit", label: "bonus:item.special_offer" }, // 首存类奖励聚合项
  { key: "cashback", label: "bonus:daily_cashback" },
  { key: "bounty", label: "bonus:item.bounty" },
  { key: "b03_bonus_wallet_bonus_claim", label: "bonus:bonusStore" }, // 体育彩金提取
  { key: "sports_bonus_claim", label: "bonus:item.sports_bonus" }, // 体育彩金提取
  { key: "free_bonus", label: "bonus:item.free_bonus" },
  { key: "mini_bonus", label: "bonus:item.mini_bonus" },
  { key: "mega_bonus", label: "bonus:item.mega_bonus" },
  // { key: "vip_bonus_lucky_number_seven", label: "bonus:item.lucky_number_seven" }, // Lucky Number 7
  { key: "lucky_number", label: "bonus:item.lucky_number_seven" }, // Lucky Number X
  { key: "daily_first_deposit_branch", label: "bonus:daily_first_deposit_title" }, // 每日首存奖励
  { key: "tiered_first_deposit", label: "bonus:tiered_first_deposit" }, // 阶梯奖励
  { key: "first_challenge", label: "bonus:first_challenge.title" }, // 首充挑战奖励
  { key: "members_day", label: "bonus:members_day" }, // 会员日奖励
  { key: "lucky_spin", label: "bonus:lucky_spin" }
] as const;

export type BonusDetailsSummaryMap = Map<string, { sum: number; currency: string }>;

// 统一处理需要聚合展示的奖励项。
// 某些卡片展示的是多个后端 item 的合并结果，因此不能直接读取当前 key 的 sum。
export function resolveBonusDetailAmount(bonusTypeKey: string, apiDataMap: BonusDetailsSummaryMap): number {
  if (bonusTypeKey === "don") {
    const donWin = apiDataMap.get("don_win")?.sum ?? 0;
    const donLose = apiDataMap.get("don_lose")?.sum ?? 0;
    return Decimal(donWin).plus(donLose).toNumber();
  }

  if (bonusTypeKey === "lucky_spin") {
    const lucky_spin_mega = apiDataMap.get("lucky_spin_mega")?.sum ?? 0;
    const lucky_spin_normal = apiDataMap.get("lucky_spin_normal")?.sum ?? 0;
    return Decimal(lucky_spin_mega).plus(lucky_spin_normal).toNumber();
  }

  if (bonusTypeKey === "special_offer_first_deposit") {
    const specialOfferDonDeposit = apiDataMap.get("special_offer_don_deposit")?.sum ?? 0;
    const specialOfferFirstDeposit = apiDataMap.get("special_offer_first_deposit")?.sum ?? 0;
    const specialOfferSecondDeposit = apiDataMap.get("special_offer_second_deposit")?.sum ?? 0;

    return Decimal(specialOfferDonDeposit)
      .plus(specialOfferFirstDeposit)
      .plus(specialOfferSecondDeposit)
      .toNumber();
  }

  return apiDataMap.get(bonusTypeKey)?.sum || 0;
}
