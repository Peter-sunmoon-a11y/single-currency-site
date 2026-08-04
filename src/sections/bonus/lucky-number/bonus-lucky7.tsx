import {useMemo, useState} from "react";
import clsx from "clsx";
import {useTranslation} from "@/lib/i18n/react-i18next";
import {useBoundStore} from "@/store";
import {Info} from "@/sections/bonus/components/Info.tsx";
import {useAppNavigate} from "@/hooks/useAppNavigate";
import {useLuckyNumberConfig} from "@/hooks/api/usePublic";
import {useBonusSwitch, useClaimLuckyNumberMutation, useLuckyNumberRewards} from "@/hooks/api/useAuth";
import {useDisplayCurrencyFormatter} from "@/contexts/DisplayCurrencyContext";
import {BonusClaimModal} from "@/sections/dollars/bonus-claim-modal";
import {CountdownTimer} from "@/sections/dollars/CountdownTimer";
import {VipButton2} from "@/sections/bonus/shared/VipButton.tsx";
import {Decimal} from "decimal.js";
import {
  CLAIMABLE_BONUS_ANCHOR_IDS,
  CLAIMABLE_BONUS_SCROLL_MARGIN_TOP_CLASS
} from "@/sections/bonus/shared/claimable-bonus-config";
import {ConfirmBox} from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import {Modal} from "@/components/ui/Modal";
import {GameImage} from "@/components/ui/GameImage";
import {ChevronRight} from "lucide-react";
import {useLocale} from "next-intl";
import type {ReactNode} from "react";
import {parser} from "@/components/header/message-v2/c/InnerMsgLink.tsx";

const toNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toArray = <T, >(value: T[] | null | undefined): T[] => (Array.isArray(value) ? value : []);
const toRecord = (value: unknown): Record<string, any> => (value && typeof value === "object" && !Array.isArray(value)
  ? value as Record<string, any>
  : {});
const getNextUtcMidnightTimestamp = () => {
  const now = new Date();
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1) / 1000;
};

const getNextUtcMidnightCountdown = () => {
  return getNextUtcMidnightTimestamp();
};

const formatCurrentDateLabel = () => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date());
};

const formatLuckyRewardTimestamp = (timestamp: number, locale: string) => {
  if (timestamp <= 0) return "--";

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).format(new Date(timestamp * 1000));
};

const LUCKY_REWARD_LEVEL_KEYS = [
  "level",
  "reward_level",
  "lucky_level",
  "match_level",
  "hit_level",
  "repeat_level",
  "match_count",
  "hit_count",
  "repeat_count",
  "consecutive_count",
  "streak",
  "digit_count"
];

const longestDigitStreak = (value: unknown, digit: number) => {
  const normalized = String(value ?? "");
  const target = String(digit);
  let maxStreak = 0;
  let current = 0;

  for (const char of normalized) {
    if (char === target) {
      current += 1;
      maxStreak = Math.max(maxStreak, current);
    } else {
      current = 0;
    }
  }

  return maxStreak;
};

const getLuckyRewardLevel = (item: Record<string, any>, luckyDigit: number) => {
  for (const key of LUCKY_REWARD_LEVEL_KEYS) {
    const value = toNumber(item?.[key]);
    if (value > 0) return value;
  }

  const hitNumber = item?.hit_number ?? item?.hitNumber ?? item?.matched_number ?? item?.lucky_number;
  const hitLevel = longestDigitStreak(hitNumber, luckyDigit);
  if (hitLevel > 0) return hitLevel;

  return longestDigitStreak(item?.bet_id ?? item?.betId ?? item?.order_sn ?? item?.order_id, luckyDigit);
};

const getLuckyRewardAmountUsdt = (item: Record<string, any>) => {
  return toNumber(
    item?.reward_amount_usdt ??
    item?.amount_usdt ??
    item?.reward_usdt ??
    item?.value_usdt ??
    item?.amount ??
    item?.reward_amount ??
    item?.value
  );
};

const getLuckyRewardBetValue = (item: Record<string, any>) => {
  const extraData = parser(item?.extra_data);
  const betAmount = extraData?.bet_amount ?? item?.bet_amount ?? 0;
  const betCurrency = extraData?.bet_currency ?? item?.bet_currency ?? "USD";

  return {
    amount: toNumber(betAmount),
    currency: String(betCurrency || "USD")
  };
};

const getLuckyRewardId = (item: Record<string, any>) => item?.reward_id ?? item?.id ?? item?.claim_id;
const getLuckyRewardClaimable = (item: Record<string, any>) => toNumber(item?.handle_status) === 0;

const getLuckyRewardTimestamp = (item: Record<string, any>) => {
  const rawTimestamp = toNumber(
    item?.updated_at ??
    item?.created_at ??
    item?.reward_time ??
    item?.bet_time ??
    item?.time
  );
  return rawTimestamp > 0 ? rawTimestamp : 0;
};

const getLuckyRewardBetId = (item: Record<string, any>) => {
  return String(
    item?.bet_id ??
    item?.betId ??
    item?.order_sn ??
    item?.order_id ??
    item?.game_order_id ??
    item?.bill_no ??
    ""
  );
};

const renderHighlightedBetId = (betId: string, hitNumber: string): ReactNode => {
  if (!betId) return "--";
  if (!hitNumber) return betId;

  const escapedHitNumber = hitNumber.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = betId.split(new RegExp(`(${escapedHitNumber})`, "g"));

  return parts.map((part, index) => (
    <span
      key={`${part}-${index}`}
      className={part === hitNumber ? "text-primary font-bold italic" : undefined}
    >
      {part}
    </span>
  ));
};

const getLuckyRewardHitNumber = (item: Record<string, any>, level: number, luckyDigit: number) => {
  const rawValue = item?.hit_number ?? item?.hitNumber ?? item?.matched_number ?? item?.lucky_number;
  const normalized = String(rawValue ?? "").replace(/\s+/g, "");
  if (normalized) return normalized;
  return String(luckyDigit).repeat(Math.max(1, level));
};

const getLuckyRewardGameName = (item: Record<string, any>) => {
  return String(
    item?.game_name ??
    item?.title ??
    item?.slot_name ??
    item?.game_title ??
    item?.order_detail?.display_game_name ??
    item?.order_detail?.game_name ??
    item?.game?.game_name ??
    item?.game?.title ??
    ""
  );
};

const getLuckyRewardGameImage = (item: Record<string, any>) => {
  return String(
    item?.game_img ??
    item?.game_image ??
    item?.image ??
    item?.img ??
    item?.icon ??
    item?.order_detail?.game_image ??
    item?.game?.image ??
    item?.game?.imageUrl ??
    ""
  );
};

const getLuckyRewardGameRouteId = (item: Record<string, any>) => {
  const provider = item?.game_provider ??
    item?.provider ??
    item?.order_detail?.game_provider ??
    item?.order_detail?.game_publisher ??
    item?.game?.game_provider;
  const innerGameId = item?.inner_game_id ??
    item?.game_id ??
    item?.order_detail?.inner_game_id ??
    item?.order_detail?.game_id ??
    item?.game?.inner_game_id ??
    item?.game?.game_id;

  if (provider && innerGameId) return `${provider}:${innerGameId}`;
  if (innerGameId) return String(innerGameId);
  return "";
};

type LuckyRewardRow = {
  raw: Record<string, any>;
  id: string | number | undefined;
  level: number;
  amountUsdt: number;
  claimable: boolean;
  timestamp: number;
  betId: string;
  hitNumber: string;
  gameName: string;
  gameImage: string;
  gameRouteId: string;
};

type LuckyRuleRow = {
  level: number;
  returnRate: number;
  rewards: LuckyRewardRow[];
  claimableRewards: LuckyRewardRow[];
  totalAmountUsdt: number;
};

function LuckyRuleCard({
                         row,
                         luckyDigit,
                         t,
                         onClick
                       }: {
  row: LuckyRuleRow;
  luckyDigit: number;
  t: ReturnType<typeof useTranslation>["t"];
  onClick: (level: number) => void;
}) {
  return (
    <button
      type="button"
      disabled={row?.rewards?.length === 0}
      onClick={() => {
        if (row?.rewards?.length > 0) onClick(row.level);
      }}
      className={clsx(
        "relative flex flex-col rounded-lg bg-base-100 px-2 py-1 text-left transition-colors cursor-pointer"
      )}
    >
      {row?.rewards?.length > 0 && row?.rewards?.[0]?.raw?.handle_status === 0 && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 text-primary">
          <ChevronRight size={16}/>
        </div>
      )}

      <div className="min-w-0 text-sm font-bold italic text-base-content">
        {`...${String(luckyDigit).repeat(Math.max(1, row.level))}...`}
      </div>
      <div className="text-xs text-primary">
        {t("popup:luckySeven.condition1", {
          percent: `${Decimal(row.returnRate).div(100).toDP(8, Decimal.ROUND_DOWN)} x`
        })}
      </div>

      {row?.rewards?.length > 0 && row?.rewards?.[0]?.raw?.handle_status === 0 && (
        <div className="absolute right-0 top-1/2 flex w-full -translate-y-1/2 justify-end -space-x-4">
          {Array.from({length: row.level}, (_, index) => (
            <img
              key={`${row.level}-${index}`}
              src={`/images/bonus_lucky7/number${luckyDigit}.png`}
              alt=""
              className="h-8 opacity-20"
            />
          ))}
        </div>
      )}
    </button>
  );
}

function LuckyRulesPanel({
                           currentDateLabel,
                           ruleRows,
                           luckyDigit,
                           t,
                           onSelectRule
                         }: {
  currentDateLabel: string;
  ruleRows: LuckyRuleRow[];
  luckyDigit: number;
  t: ReturnType<typeof useTranslation>["t"];
  onSelectRule: (level: number) => void;
}) {
  return (
    <div className="rounded-xl bg-base-200 p-2 flex flex-col gap-2">
      <div className="flex flex-col gap-2">
        <div className="text-xs font-bold text-base-content">
          {currentDateLabel}
        </div>

        <div className="grid grid-cols-2 gap-1">
          {ruleRows.map((row) => (
            <LuckyRuleCard
              key={row.level}
              row={row}
              luckyDigit={luckyDigit}
              t={t}
              onClick={onSelectRule}
            />
          ))}
        </div>
      </div>

      <p className="text-xs text-base-content/50 italic">
        {t("popup:luckySeven.firstQualifyingBetNote")}
      </p>
    </div>
  );
}

function LuckyRewardItem({
                           reward,
                           locale,
                           claimable,
                           playerName,
                           navigate,
                           formatWithConversion,
                           t
                         }: {
  reward: LuckyRewardRow;
  locale: string;
  claimable?: number;
  playerName: string;
  navigate: ReturnType<typeof useAppNavigate>;
  formatWithConversion: ReturnType<typeof useDisplayCurrencyFormatter>["formatWithConversion"];
  t: ReturnType<typeof useTranslation>["t"];
}) {
  return (
    <div className="flex flex-col gap-1 rounded-lg bg-base-200 p-2">
      <div className="flex items-center gap-2">
        <div className="w-15 shrink-0">
          <GameImage
            src={reward.gameImage}
            alt={reward.gameName || "Game"}
            gameId={reward.gameRouteId || undefined}
            data={reward.raw?.order_detail ?? reward.raw ?? {}}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate text-base font-bold text-base-content">
                {playerName}
              </div>
              <div className="text-xs text-base-content/50">
                {formatLuckyRewardTimestamp(reward.timestamp, locale)}
              </div>
            </div>
            {reward.claimable
              ? <span className="shrink-0 text-xs text-primary italic">{t("bonus:claimable")}</span>
              : <span
                className="shrink-0 text-xs italic text-base-content/50">{t("bonus:claimed")}</span>}
          </div>

          <div className="min-w-0 flex items-center justify-between gap-2">
            <div className={'truncate'}>
              <div className="truncate text-sm font-bold text-base-content">
                {reward.gameName || "--"}
              </div>
              <div className="text-xs font-semibold text-base-content/55">{t("menu:slots")}</div>
            </div>
            {reward.gameRouteId && (
              <button
                type="button"
                className="btn btn-sm btn-primary text-sm"
                onClick={() => {
                  void navigate({to: "/games/$gameId", params: {gameId: reward.gameRouteId}, search: {}});
                }}
              >
                {t("bonus:play")}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between text-base-content/50 text-sm">
        {t("bonus:lucky_number_bet_amount")}
        <div className="flex items-center text-primary">
          <span>{formatWithConversion(
            getLuckyRewardBetValue(reward.raw).amount,
            getLuckyRewardBetValue(reward.raw).currency,
            {
              showCode: true,
              showSymbol: false
            }
          ).formatted}</span>
        </div>
      </div>

      <div className="flex justify-between text-base-content/50 text-sm">
        {t("bonus:lucky_number_reward_amount")}
        <div className="flex items-center text-primary">
          <span>{formatWithConversion(claimable ?? 0, "USDT", {
            showCode: true,
            showSymbol: false
          }).formatted}</span>
        </div>
      </div>

      <div className="flex justify-between text-base-content/50 text-sm">
        {t("gameDetail:betId")}
        <span className="text-base-content">
          {renderHighlightedBetId(reward.betId, reward.hitNumber)}
        </span>
      </div>
    </div>
  );
}

function LuckyRewardsModal({
                             claimable,
                             isOpen,
                             selectedRule,
                             luckyDigit,
                             locale,
                             playerName,
                             navigate,
                             formatWithConversion,
                             t,
                             onClose
                           }: {
  isOpen: boolean;
  claimable?: number;
  selectedRule: LuckyRuleRow | null;
  luckyDigit: number;
  locale: string;
  playerName: string;
  navigate: ReturnType<typeof useAppNavigate>;
  formatWithConversion: ReturnType<typeof useDisplayCurrencyFormatter>["formatWithConversion"];
  t: ReturnType<typeof useTranslation>["t"];
  onClose: () => void;
}) {
  return (
    <Modal
      title={`...${String(luckyDigit).repeat(Math.max(1, selectedRule?.level ?? 1))}...`}
      isOpen={isOpen}
      onClose={onClose}
      position="modal-middle"
    >
      <div className="flex flex-col gap-1">
        {selectedRule?.rewards.map((reward) => (
          <LuckyRewardItem
            key={String(reward.id ?? `${reward.level}-${reward.betId}-${reward.timestamp}`)}
            reward={reward}
            locale={locale}
            claimable={claimable}
            playerName={playerName}
            navigate={navigate}
            formatWithConversion={formatWithConversion}
            t={t}
          />
        ))}
      </div>
    </Modal>
  );
}

function LuckySignedInCountdown() {
  return (
    <div className="absolute top-0 right-0 w-full h-4 flex items-center justify-end">
      <div
        className="flex items-center gap-1 absolute top-0 right-0 bg-primary/15 text-primary text-sm leading-none">
        <CountdownTimer className="font-normal" expireTime={getNextUtcMidnightCountdown()}/>
      </div>
    </div>
  );
}

function LuckySignedInDetails({
                                currentDateLabel,
                                ruleRows,
                                luckyDigit,
                                claimableAmountUsdt,
                                claimableRows,
                                canClaim,
                                formatWithConversion,
                                t,
                                onSelectRule,
                                onClaim
                              }: {
  currentDateLabel: string;
  ruleRows: LuckyRuleRow[];
  luckyDigit: number;
  claimableAmountUsdt: number;
  claimableRows: Record<string, any>[];
  canClaim: boolean;
  formatWithConversion: ReturnType<typeof useDisplayCurrencyFormatter>["formatWithConversion"];
  t: ReturnType<typeof useTranslation>["t"];
  onSelectRule: (level: number) => void;
  onClaim: (rewardIds: Array<string | number>, bonusAmountUsdt: number) => void;
}) {
  return (
    <>
      <LuckyRulesPanel
        currentDateLabel={currentDateLabel}
        ruleRows={ruleRows}
        luckyDigit={luckyDigit}
        t={t}
        onSelectRule={onSelectRule}
      />

      <div className="flex justify-between">
        <div className="text-sm font-bold flex items-center gap-1">
          <div className="text-base-content/50 font-normal">{t("bonus:claimable")}</div>
          <div className="flex-1 text-primary">
            {formatWithConversion(claimableAmountUsdt, "USDT", {showCode: false}).formatted}
          </div>
        </div>
        {canClaim && (
          <ConfirmBox
            className="btn-sm w-fit text-sm"
            onClick={() => {
              onClaim(
                claimableRows
                  .map((item) => item?.reward_id ?? item?.id)
                  .filter((id) => id !== undefined && id !== null),
                claimableAmountUsdt
              );
            }}
          >
            {t("bonus:claim")}
          </ConfirmBox>
        )}
      </div>
    </>
  );
}

export function BonusLucky7() {
  const {switchData} = useBonusSwitch();

  const {data: configResponse} = useLuckyNumberConfig();

  const luckyNumberConfig = configResponse?.data;

  const bonusLucky7Enabled = switchData?.bonus_switch?.lucky_number !== 0;

  if (!luckyNumberConfig?.enabled || !bonusLucky7Enabled) {
    return null;
  }

  return <BonusLuckyNumberContent/>;
}

function BonusLuckyNumberContent() {
  const navigate = useAppNavigate();
  const locale = useLocale();
  const openModal = useBoundStore((state) => state.openModal);
  const status = useBoundStore((state) => state.status);
  const user = useBoundStore((state) => state.user);
  const {t} = useTranslation(["mysteryBox", "popup", "bonus", "menu", "casino", "gameDetail"]);
  const {formatWithConversion} = useDisplayCurrencyFormatter();

  const {data: configResponse} = useLuckyNumberConfig();
  const {data: rewardsResponse} = useLuckyNumberRewards();
  const {mutate: claimLuckyNumber, isPending} = useClaimLuckyNumberMutation(undefined, true);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [claimRewardIds, setClaimRewardIds] = useState<Array<string | number>>([]);
  const [claimBonusAmountUsdt, setClaimBonusAmountUsdt] = useState(0);
  const [selectedRuleLevel, setSelectedRuleLevel] = useState<number | null>(null);

  // 活动基础配置来自公开接口；奖励领取状态来自登录态接口。
  const luckyNumberConfig = configResponse?.data ?? {};
  const rewardsData = rewardsResponse?.data ?? {};
  const luckyDigit = toNumber(luckyNumberConfig?.lucky_digit);
  const levels = toArray<number>(luckyNumberConfig?.levels)
    .map((level) => toNumber(level))
    .sort((a, b) => a - b);
  const returnRates = luckyNumberConfig?.return_rates ?? {};

  // 奖励列表字段在不同返回里结构不完全一致，这里先统一成数组。
  const rewardRows = toArray<Record<string, any>>(rewardsData?.list ?? rewardsData?.rows ?? rewardsData?.rewards);
  const claimableRows = rewardRows.filter((item) => toNumber(item?.handle_status) === 0);

  // 优先使用后端聚合值；没有时再从列表里兜底计算可领取数量和金额。
  const claimableCount = toNumber(rewardsData?.claimable_count ?? claimableRows.length);
  const claimableAmountUsdt = toNumber(
    rewardsData?.claimable_amount_usdt ??
    claimableRows.reduce((sum, item) => sum + toNumber(item?.reward_amount_usdt ?? item?.amount_usdt ?? item?.amount), 0)
  );
  const requiredVipLevel = toNumber(
    rewardsData?.min_vip ??
    rewardsData?.config?.min_vip ??
    (toArray<number>(luckyNumberConfig?.levels)[0] ?? 0)
  );
  const isAuthenticated = !!user;
  const playerName = user?.nickname || user?.username || "--";
  const isUnlocked = (status?.vip ?? 0) >= requiredVipLevel;
  const canClaim = isAuthenticated && isUnlocked && claimableCount > 0;

  // 将配置拍平成页面可直接渲染的规则列表。
  const normalizedRewardRows = useMemo<LuckyRewardRow[]>(() => {
    return rewardRows.map((item) => {
      const normalizedItem = toRecord(item);
      const level = getLuckyRewardLevel(normalizedItem, luckyDigit);

      return {
        raw: normalizedItem,
        id: getLuckyRewardId(normalizedItem),
        level,
        amountUsdt: getLuckyRewardAmountUsdt(normalizedItem),
        claimable: getLuckyRewardClaimable(normalizedItem),
        timestamp: getLuckyRewardTimestamp(normalizedItem),
        betId: getLuckyRewardBetId(normalizedItem),
        hitNumber: getLuckyRewardHitNumber(normalizedItem, level, luckyDigit),
        gameName: getLuckyRewardGameName(normalizedItem),
        gameImage: getLuckyRewardGameImage(normalizedItem),
        gameRouteId: getLuckyRewardGameRouteId(normalizedItem)
      };
    });
  }, [rewardRows, luckyDigit]);

  const ruleRows = useMemo<LuckyRuleRow[]>(() => {
    return levels.map((level) => {
      const matchedRewards = normalizedRewardRows
        .filter((item) => item.level === level)
        .sort((a, b) => b.timestamp - a.timestamp);

      return {
        level,
        returnRate: toNumber(returnRates[level]),
        rewards: matchedRewards,
        claimableRewards: matchedRewards.filter((item) => item.claimable),
        totalAmountUsdt: matchedRewards.reduce((sum, item) => sum + item.amountUsdt, 0)
      };
    });
  }, [levels, normalizedRewardRows, returnRates]);

  const selectedRule = ruleRows.find((row) => row.level === selectedRuleLevel) ?? null;

  // 详情区顶部日期按参考稿直接展示当前日期。
  const currentDateLabel = formatCurrentDateLabel();

  const openClaimModal = (rewardIds: Array<string | number>, bonusAmountUsdt: number) => {
    if (rewardIds.length === 0) return;
    setClaimRewardIds(rewardIds);
    setClaimBonusAmountUsdt(bonusAmountUsdt);
    setIsClaimModalOpen(true);
  };

  return (
    <>
      <div
        id={CLAIMABLE_BONUS_ANCHOR_IDS.lucky7}
        className={clsx(
          "relative bg-base-100 rounded-lg px-4 py-4 overflow-hidden flex flex-col gap-2",
          CLAIMABLE_BONUS_SCROLL_MARGIN_TOP_CLASS
        )}
      >
        {isAuthenticated && <LuckySignedInCountdown />}

        <div className="flex items-center gap-4 justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <img
              src={`/images/bonus_lucky7/number${luckyDigit}.png`}
              loading="lazy"
              decoding="async"
              className="w-8 h-8 object-contain"
              alt=""
            />
            <h2 className={clsx("text-base font-bold uppercase truncate")}>
              {t("mysteryBox:lucky_number_title", {digit: ""})}
            </h2>
            <Info
              onClick={(e) => {
                e.stopPropagation();
                openModal("OPEN_LUCKY_NUMBER_HELP_MODAL",{level: requiredVipLevel});
              }}
            />
          </div>

          <VipButton2
            onClick={() => {
              void navigate({
                to: "/explore",
                search: {type: "casino", category: "recent"}
              });
            }}
            requiredLevel={requiredVipLevel}
          />
        </div>

        {isAuthenticated && (
          <LuckySignedInDetails
            currentDateLabel={currentDateLabel}
            ruleRows={ruleRows}
            luckyDigit={luckyDigit}
            claimableAmountUsdt={claimableAmountUsdt}
            claimableRows={claimableRows}
            canClaim={canClaim}
            formatWithConversion={formatWithConversion}
            t={t}
            onSelectRule={setSelectedRuleLevel}
            onClaim={openClaimModal}
          />
        )}
      </div>

      <LuckyRewardsModal
        isOpen={!!selectedRule}
        claimable={claimableAmountUsdt}
        selectedRule={selectedRule}
        luckyDigit={luckyDigit}
        locale={locale}
        playerName={playerName}
        navigate={navigate}
        formatWithConversion={formatWithConversion}
        t={t}
        onClose={() => setSelectedRuleLevel(null)}
      />

      <BonusClaimModal
        open={isClaimModalOpen}
        bonus={String(claimBonusAmountUsdt)}
        loading={isPending}
        onClose={() => {
          setIsClaimModalOpen(false);
          setClaimRewardIds([]);
          setClaimBonusAmountUsdt(0);
        }}
        onClick={(currency) => {
          if (!currency || claimRewardIds.length === 0) return;

          claimLuckyNumber(
            {currency, reward_ids: claimRewardIds},
            {
              onSettled: () => {
                setIsClaimModalOpen(false);
                setClaimRewardIds([]);
                setClaimBonusAmountUsdt(0);
              }
            }
          );
        }}
      />
    </>
  );
}
