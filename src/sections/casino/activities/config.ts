export type ActivityItem = {
  icon: string;
  labelKey: string;
  to: string;
  from: string;
  dot: string;
  label?: string;
};

// 服务端 `sidebar_bonus_shortcuts` 返回的字符串 id，会在这里映射成前端展示配置。
// 后续新增活动时，只需要在这里追加一个同名 key。
export const presetActivityItems: Record<string, ActivityItem> = {
  bonus_store: {
    icon: "/images/bonus_store/bonus-store-icon.webp",
    labelKey: "bonus.slotBonus",
    to: "/dollars/bonus",
    from: "from-primary/20",
    dot: "bg-primary"
  },
  sports_bonus: {
    icon: "/images/bonus_sports/sports-bonus-icon.webp",
    labelKey: "bonus.sports_bonus",
    to: "/dollars/sports-bonus",
    from: "from-primary/20",
    dot: "bg-primary"
  },
  buddy_balls: {
    icon: "/images/game_buddy_balls/buddy-balls-icon.webp",
    labelKey: "buddyBalls.buddyBalls",
    to: "/buddy-balls",
    from: "from-primary/20",
    dot: "bg-primary"
  },
  lucky_spin: {
    icon: "/images/game_lucky_spin/spins-small.png",
    labelKey: "bonus.lucky_spin",
    to: "/lucky-spin",
    from: "from-primary/20",
    dot: "bg-primary"
  }
};
