const DEFAULT_WORLD_CUP_START_AT = "2026-06-11T00:00:00Z";
const DEFAULT_WORLD_CUP_END_AT = "2026-07-19T23:59:59Z";

const SPORTS_BONUS_WORLD_CUP_PICTURE = "/images/bonus_sports/sports-bonus.png";
const SPORTS_BONUS_DEFAULT_PICTURE = "/images/bonus_sports/sports-bonus1.png";
const SPORTS_BONUS_WORLD_CUP_LABEL = "FIFA 2026";

function getWorldCupWindow() {
  const startAt = process.env.NEXT_PUBLIC_WORLD_CUP_START_AT ?? DEFAULT_WORLD_CUP_START_AT;
  const endAt = process.env.NEXT_PUBLIC_WORLD_CUP_END_AT ?? DEFAULT_WORLD_CUP_END_AT;

  return {
    startAt: new Date(startAt),
    endAt: new Date(endAt)
  };
}

export function isSportsBonusWorldCupActive(now = new Date()) {
  const { startAt, endAt } = getWorldCupWindow();

  if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
    return false;
  }

  return now >= startAt && now <= endAt;
}

export function getSportsBonusPicture(now = new Date()) {
  return isSportsBonusWorldCupActive(now)
    ? SPORTS_BONUS_WORLD_CUP_PICTURE
    : SPORTS_BONUS_DEFAULT_PICTURE;
}

export function getSportsBonusCampaignLabel(now = new Date()) {
  return isSportsBonusWorldCupActive(now)
    ? SPORTS_BONUS_WORLD_CUP_LABEL
    : "";
}
