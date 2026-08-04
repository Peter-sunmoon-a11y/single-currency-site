import { useTranslation } from "@/lib/i18n/react-i18next";
import {
  useBonusSwitch,
  useClaimBonus,
  useGetMondayVipBonus,
  useLuckyNumberRewards,
  useMembersDayStatus
} from "@/hooks/api/useAuth";
import { useBaseConfig, useIsLeagueEnabled, useLuckyNumberConfig, useMembersDayConfig } from "@/hooks/api/usePublic";
import { useHasMysteryBox } from "@/query/bouns";
import { useFirstChallengeEligibility, useFirstChallengeTasks } from "@/query/firstChallenge";
import { useBoundStore } from "@/store";
import { Decimal } from "decimal.js";
import { CLAIMABLE_BONUS_ANCHOR_IDS } from "@/sections/bonus/shared/claimable-bonus-config";
import { getRakebackClaimableSummary } from "@/sections/bonus/shared/rakeback-claimable";

const toNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toArray = <T, >(value: T[] | null | undefined): T[] => (Array.isArray(value) ? value : []);

function ClaimableBonusShortcut({
                                  imageSrc,
                                  // title,
                                  targetId
                                }: {
  title?: string;
  imageSrc: string;
  targetId: string;
}) {
  return (
    <button
      type="button"
      className="group relative flex flex-col items-center gap-2 overflow-hidden rounded-lg bg-base-100 px-2 py-2 text-center transition-colors hover:bg-base-300/60 active:scale-[0.98]"
      onClick={() => {
        document.getElementById(targetId)?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }}
    >
      <span
        aria-hidden="true"
        className="absolute right-0.5 top-0.5 h-2 w-2 bg-success rounded-full"
      />
      <img
        src={imageSrc}
        alt=""
        className="w-8 h-8 object-contain animate-bob-pause transition-transform duration-300 group-hover:scale-110"
        loading="lazy"
        decoding="async"
      />
      {/*<span className="text-xs font-bold leading-tight text-base-content">*/}
      {/*  {title}*/}
      {/*</span>*/}
    </button>
  );
}

export const ClaimableBonus = () => {
  const { t } = useTranslation(["bonus", "mysteryBox", "vipMonday", "tournament"]);
  const { switchData } = useBonusSwitch();
  const { data: levelUpClaimData, isLoading: isLevelUpLoading } = useClaimBonus("level_up");
  const { data: rakebackClaimData, isLoading: isRakebackLoading } = useClaimBonus("rakeback");
  const { data: tournamentClaimData, isLoading: isTournamentLoading } = useClaimBonus("tournament");
  const { data: mysteryBoxResponse, isLoading: isMysteryBoxLoading } = useHasMysteryBox();
  const { data: firstChallengeEligibilityResponse, isLoading: isFirstChallengeEligibilityLoading } = useFirstChallengeEligibility();
  const { data: firstChallengeTasksResponse, isLoading: isFirstChallengeTasksLoading } = useFirstChallengeTasks();
  const { data: membersDayConfigResponse, isLoading: isMembersDayConfigLoading } = useMembersDayConfig();
  const { data: membersDayStatusResponse, isLoading: isMembersDayStatusLoading } = useMembersDayStatus();
  const { data: luckyNumberConfigResponse, isLoading: isLuckyNumberConfigLoading } = useLuckyNumberConfig();
  const { data: luckyNumberRewardsResponse, isLoading: isLuckyNumberRewardsLoading } = useLuckyNumberRewards();
  const { data: baseConfig } = useBaseConfig();
  const { isLeagueEnabled } = useIsLeagueEnabled();
  const { mondayVipBonus, isLoading: isMondayVipBonusLoading } = useGetMondayVipBonus();
  const status = useBoundStore((state) => state.status);
  const user = useBoundStore((state) => state.user);

  const items: Array<{ key: string; title: string; imageSrc: string; targetId: string }> = [];

  const memberBonusEnabled = switchData?.bonus_switch?.monday_vip_bonus !== 0;
  const memberBonusClaimable = Number(levelUpClaimData?.data?.data?.value ?? 0) > 0;
  if (!isLevelUpLoading && memberBonusEnabled && memberBonusClaimable) {
    items.push({
      key: "memberBonus",
      title: `VIP ${status?.vip ?? "--"}`,
      imageSrc: user ? `/images/vip/levels/${status?.vip ?? "--"}.png` : "/images/vip/gift-box.png",
      targetId: CLAIMABLE_BONUS_ANCHOR_IDS.memberBonus
    });
  }

  const firstChallengeEnabled = switchData?.bonus_switch?.first_challenge !== 0;
  const firstChallengeEligible = Boolean(firstChallengeEligibilityResponse?.data?.eligible);
  const firstChallengeClaimableTasks = (firstChallengeTasksResponse?.data?.tasks ?? []).filter(
    (task: Record<string, any>) => task?.status === 2
  ).length;
  const firstChallengeClaimable = firstChallengeClaimableTasks > 0;
  const firstChallengeReady = !isFirstChallengeEligibilityLoading && !isFirstChallengeTasksLoading;
  if (firstChallengeReady && firstChallengeEnabled && firstChallengeEligible && firstChallengeClaimable) {
    items.push({
      key: "firstChallenge",
      title: t("firstChallenge.entry.title"),
      imageSrc: "/images/bonus_first_challenge/entry-icon.webp",
      targetId: CLAIMABLE_BONUS_ANCHOR_IDS.firstChallenge
    });
  }

  const mysteryBoxEnabled = switchData?.bonus_switch?.mystery_box !== 0;
  if (!isMysteryBoxLoading && mysteryBoxEnabled && (mysteryBoxResponse?.data?.has_mystery_box ?? false)) {
    items.push({
      key: "mysteryBox",
      title: t("mysteryBox:mystery_box"),
      imageSrc: "/images/bonus_mysterybox/gift.png",
      targetId: CLAIMABLE_BONUS_ANCHOR_IDS.mysteryBox
    });
  }

  const membersDayEnabled = switchData?.bonus_switch?.members_day !== 0 && (membersDayConfigResponse?.data?.enabled ?? true);
  const membersDayConfig = membersDayConfigResponse?.data ?? {};
  const membersDayStatus = membersDayStatusResponse?.data ?? {};
  const membersDayRequiredVipLevel = toNumber(membersDayConfig?.min_vip ?? 0);
  const membersDayUnlocked = (status?.vip ?? 0) >= membersDayRequiredVipLevel;
  const membersDayClaimable = !Boolean(membersDayStatus?.claimed_this_month);
  const membersDayReady = !isMembersDayConfigLoading && !isMembersDayStatusLoading && membersDayStatus?.has_members_day;
  if (membersDayReady && membersDayEnabled && membersDayUnlocked && membersDayClaimable) {
    items.push({
      key: "membersDay",
      title: t("vipMonday:members_day"),
      imageSrc: "/images/bonus_monday/members-day.png",
      targetId: CLAIMABLE_BONUS_ANCHOR_IDS.membersDay
    });
  }

  const vipMondayEnabled = switchData?.bonus_switch?.monday_vip_bonus !== 0;
  const nowInSeconds = Math.floor(Date.now() / 1000);
  const vipMondayMaxWager = new Decimal(mondayVipBonus?.max_wager ?? 0).toNumber();
  const vipMondayCurrentWager = new Decimal(mondayVipBonus?.current_wager ?? 0).toNumber();
  const vipMondayWagerReached = vipMondayMaxWager <= vipMondayCurrentWager;
  const vipMondayInClaimWindow = (mondayVipBonus?.claim_start_time ?? 0) <= nowInSeconds &&
    nowInSeconds <= (mondayVipBonus?.claim_end_time ?? 0);
  if (!isMondayVipBonusLoading && vipMondayEnabled && vipMondayWagerReached && vipMondayInClaimWindow) {
    items.push({
      key: "vipMonday",
      title: t("vipMonday:vip_monday"),
      imageSrc: "/images/bonus_monday/vip-monday.png",
      targetId: CLAIMABLE_BONUS_ANCHOR_IDS.vipMonday
    });
  }

  const luckyNumberConfig = luckyNumberConfigResponse?.data ?? {};
  const luckyNumberRewards = luckyNumberRewardsResponse?.data ?? {};
  const luckyDigit = toNumber(luckyNumberConfig?.lucky_digit);
  const luckyNumberEnabled = switchData?.bonus_switch?.lucky_number !== 0 && !!luckyNumberConfig?.enabled;
  const luckyNumberRewardRows = toArray<Record<string, any>>(luckyNumberRewards?.list ?? luckyNumberRewards?.rows ?? luckyNumberRewards?.rewards);
  const luckyNumberClaimableRows = luckyNumberRewardRows.filter((item) => toNumber(item?.handle_status) === 0);
  const luckyNumberClaimableCount = toNumber(luckyNumberRewards?.claimable_count ?? luckyNumberClaimableRows.length);
  // const luckyNumberRequiredVipLevel = toNumber(
  //   luckyNumberRewards?.min_vip ??
  //   luckyNumberRewards?.config?.min_vip ??
  //   (toArray<number>(luckyNumberConfig?.levels)[0] ?? 0)
  // );
  // const luckyNumberUnlocked = (status?.vip ?? 0) >= luckyNumberRequiredVipLevel;
  const luckyNumberReady = !isLuckyNumberConfigLoading && !isLuckyNumberRewardsLoading;
  if (luckyNumberReady && luckyNumberEnabled && !!user && luckyNumberClaimableCount > 0) {
    items.push({
      key: "lucky7",
      title: t("mysteryBox:lucky_number_title", { digit: "" }),
      imageSrc: `/images/bonus_lucky7/number${luckyDigit}.png`,
      targetId: CLAIMABLE_BONUS_ANCHOR_IDS.lucky7
    });
  }

  const rakebackEnabled = switchData?.bonus_switch?.rakeback !== 0;
  const { amount: rakebackClaimableAmount } = getRakebackClaimableSummary(rakebackClaimData);
  const rakebackMinClaimAmount = parseFloat(baseConfig?.data?.bonus_config?.super_rakeback?.min_claim_amount || "1");
  if (rakebackEnabled && !isRakebackLoading && rakebackClaimableAmount >= rakebackMinClaimAmount) {
    items.push({
      key: "rakeback",
      title: t("bonus:super_rakeback"),
      imageSrc: "/images/bonus_rakeback/rakeback.png",
      targetId: CLAIMABLE_BONUS_ANCHOR_IDS.rakeback
    });
  }

  const tournamentClaimableAmount = parseFloat(tournamentClaimData?.data?.data?.value || "0") || 0;
  if (!isTournamentLoading && isLeagueEnabled && tournamentClaimableAmount > 0) {
    items.push({
      key: "tournament",
      title: t("tournament:tournament_reward"),
      imageSrc: "/images/bonus_tournament/cup.png",
      targetId: CLAIMABLE_BONUS_ANCHOR_IDS.tournament
    });
  }

  if (items.length <= 0) return null;

  return (
      <div className="flex gap-1 flex-wrap">
        {items.map((item) => (
          <ClaimableBonusShortcut
            key={item.key}
            imageSrc={item.imageSrc}
            title={item.title}
            targetId={item.targetId}
          />
        ))}
      </div>
  );
};
