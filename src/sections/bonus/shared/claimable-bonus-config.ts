// 可领取奖励快捷导航对应的页面锚点，点击后滚动到真实奖励卡片位置。
export const CLAIMABLE_BONUS_ANCHOR_IDS = {
  memberBonus: "claimable-member-bonus",
  firstChallenge: "claimable-first-challenge",
  mysteryBox: "claimable-mystery-box",
  membersDay: "claimable-members-day",
  vipMonday: "claimable-vip-monday",
  lucky7: "claimable-lucky7",
  rakeback: "claimable-rakeback",
  tournament: "claimable-tournament"
} as const;

// 统一给锚点预留顶部固定 Header 的可视区域，避免滚动后被遮挡。
export const CLAIMABLE_BONUS_SCROLL_MARGIN_TOP_CLASS = "scroll-mt-24";
