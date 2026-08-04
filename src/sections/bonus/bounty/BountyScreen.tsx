"use client";

import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { useAppNavigate } from "@/hooks/useAppNavigate";
import { useTranslation } from "@/lib/i18n/react-i18next";
import {
  useBountyChallengeList,
  useBountyMyWinList,
  type BountyChallengeItem,
  type BountyMyWinItem, DEFAULT_LIMIT, useBountyStatus
} from "@/query/bounty";
import { NothingFound } from "@/components/ui/NothingFound";
import { SelectDropdown } from "@/components/modal/UserFinanceModal/c/SelectDropdown.tsx";
import { GameImage } from "@/components/ui/GameImage";
import { Gamepad2, Search, User2 } from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { Alert } from "@/components/icons/Alert.tsx";
import { toast } from "sonner";
import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { BonusClaimModal } from "@/sections/dollars/bonus-claim-modal";
import Decimal from "decimal.js";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { claimBountyReward } from "@/services/auth/bounty";
import { BOUNTY_QUERY_KEYS } from "@/query/bounty";
import { formatDateTime } from "@/utils/formatDateTime";

type ScreenTab = "active" | "completed" | "my";
type MyFilter = "" | 0 | 1;
type SortBy = "created" | "reward";

const TAB_PATHS: Record<ScreenTab, string> = {
  active: "/bounty/active",
  completed: "/bounty/completed",
  my: "/bounty/my"
};

export function BountyScreen({ tab }: { tab: ScreenTab }) {
  const navigate = useAppNavigate();

  const { t } = useTranslation(["bonus", "common", "bounty"]);

  const { data: bountyStatus } = useBountyStatus();

  const [filters, setFilters] = useState<{
    sortBy: SortBy;
    myFilter: MyFilter;
    keywordInput: string;
  }>({
    sortBy: "created",
    myFilter: "",
    keywordInput: ""
  });

  const deferredKeyword = useDeferredValue(filters.keywordInput.trim());

  const tabs = useMemo(() => ([
    { value: "active", label: t("bonus:active") },
    { value: "completed", label: t("bonus:completed") },
    { value: "my", label: t("bounty:my_completed") }
  ]), [t]);

  const sortOptions = useMemo(() => ([
    { id: "created", value: "created", label: t("bounty:newly_added") },
    { id: "reward", value: "reward", label: t("bounty:highest_reward") }
  ]), [t]);

  const myFilterOptions = useMemo(() => ([
    { id: "all", value: "", label: t("bounty:all") },
    { id: "claimable", value: 0, label: t("bounty:claimable") },
    { id: "claimed", value: 1, label: t("bonus:claimed") }
  ]), [t]);

  const challengeQuery = useBountyChallengeList({
    tab: tab === "active" ? "active" : "completed",
    sortBy: filters.sortBy,
    keyword: tab === "my" ? "" : deferredKeyword,
    enabled: tab !== "my"
  });

  const myQuery = useBountyMyWinList({
    claimStatus: filters.myFilter,
    enabled: tab === "my"
  });

  const challengeItems = useMemo(() => challengeQuery.data?.pages.flatMap((page) => page?.data?.list || []) || [], [challengeQuery.data]);
  const myItems = useMemo(() => myQuery.data?.pages.flatMap((page) => page?.data?.list || []) || [], [myQuery.data]);

  const isMyTab = tab === "my";
  const query = isMyTab ? myQuery : challengeQuery;
  const items = isMyTab ? myItems : challengeItems;
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !query.hasNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !query.isFetchingNextPage) {
          void query.fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [query.hasNextPage, query.isFetchingNextPage, query.fetchNextPage, items.length, tab]);

  const is_forbidden = bountyStatus?.data?.is_forbidden;

  return (
    <div className="flex flex-col gap-4 p-4">
      {is_forbidden && (
        <p className="alert text-error text-sm font-bold italic">
          <span>{t("bounty:forbidden")}</span>
        </p>
      )}

      <div role="tablist" className="tabs tabs-box w-full">
        {tabs.map((item) => (
          <button
            key={item.value}
            type="button"
            role="tab"
            className={clsx(
              "tab flex-1 gap-1 text-sm px-1 font-bold",
              tab === item.value && "tab-active text-primary"
            )}
            onClick={() => {
              void navigate({ to: TAB_PATHS[item.value as ScreenTab] });
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="flex gap-1">
        <SelectDropdown
          title={""}
          value={isMyTab ? filters.myFilter : filters.sortBy}
          options={isMyTab ? myFilterOptions : sortOptions}
          onChange={(value) => {
            if (isMyTab) {
              setFilters((prev) => ({ ...prev, myFilter: value as MyFilter }));
              return;
            }
            setFilters((prev) => ({ ...prev, sortBy: value as SortBy }));
          }}
        />

        {!isMyTab && (
          <label className="input border-none flex items-center gap-2 bg-base-200">
            <Search className="w-4 h-4 text-base-content/50" />
            <input
              type="text"
              value={filters.keywordInput}
              onChange={(event) => setFilters((prev) => ({ ...prev, keywordInput: event.target.value }))}
              placeholder={t("common:common.searchPlaceholder")}
            />
          </label>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {query.isLoading && items.length === 0 && Array.from({ length: DEFAULT_LIMIT }).map((_, index) => (
          <div key={index} className="skeleton h-[167px] rounded-lg bg-base-200" />
        ))}

        {!query.isLoading && items.length === 0 && (
          <div className="relative min-h-48 rounded-lg bg-base-200">
            <NothingFound className="static min-h-48" />
          </div>
        )}

        {items.map((item) => (
          isMyTab
            ? <BountyMyCard key={`my-${item.winner_id}-${item.number}`} item={item as BountyMyWinItem} />
            : <BountyChallengeCard
              key={`challenge-${(item as BountyChallengeItem).winner_id}-${(item as BountyChallengeItem).inner_game_id}`}
              item={item as BountyChallengeItem} />
        ))}

        {query.hasNextPage && <div ref={sentinelRef} className="h-4" />}

        {query.isFetchingNextPage && (
          <div className="flex justify-center py-2">
            <span className="loading loading-bars loading-sm text-primary" />
          </div>
        )}
      </div>
    </div>
  );
}

function BountyChallengeCard({ item }: { item: BountyChallengeItem }) {
  const navigate = useAppNavigate();

  const { t } = useTranslation(["bonus", "bounty"]);
  const { formatWithConversion } = useDisplayCurrencyFormatter();

  const rewardTooltip = t("bounty:reward_tooltip", {
    minBet: item.min_bet_amount,
    minBetCurrency: item.min_bet_currency,
    multiplier: item.multiplier,
    winnerSlots: item.winner_slots
  });

  const handle = () => {
    // Navigate to game detail page with game_provider:inner_game_id format if provider exists
    if (item?.inner_game_id) {
      // If game_provider exists, use format: provider:inner_game_id
      // Otherwise just use inner_game_id
      const gameId = item.game_provider
        ? `${item.game_provider}:${item.inner_game_id}`
        : item.inner_game_id;

      void navigate({ to: "/games/$gameId", params: { gameId }, search: {} });
    }
  };

  return (
    <div className="rounded-lg bg-base-200 p-2">
      <div className="flex gap-2">
        <div className="w-22">
          <GameImage
            data={item}
            game={{
              inner_game_id: item.inner_game_id,
              game_provider: item.game_provider,
              game_name: item.display_game_name,
              image: item.image
            }}
          />
        </div>
        <div className="min-w-0 flex-1 flex flex-col gap-2">
          <div className="font-bold leading-5">{item.display_game_name}</div>

          <div className="grid grid-cols-2 gap-x-1 gap-y-2 text-sm">
            <InfoRow label={t("bounty:multiplier")} value={`${item.multiplier}x`} />
            <InfoRow label={t("bounty:min_bet")} value={`${item.min_bet_amount} ${item.min_bet_currency}`} />
            <InfoRow
              label={t("bounty:reward")}
              labelExtra={(
                <Alert
                  className={"w-4 h-4 text-base-content/60 cursor-pointer"}
                  onClick={() => toast.info(<p className={"text-sm"}>{rewardTooltip}</p>, { duration: 8_000 })} />
              )}
              value={formatWithConversion(item.reward_amount, item.reward_currency, {
                showCode: true,
                showSymbol: false
              }).formatted}
            />
            {!item.winner?.username && (
              <InfoRow label={t("bounty:progress")} value={`${item.completed_count}/${item.winner_slots}`} />)}
          </div>

          <div className="flex justify-end">
            {item.winner?.username && (
              <div className="btn btn-primary btn-soft btn-sm text-sm text-success px-2">
                <User2 size={18} />
                {item.winner?.avatar && (
                  <img src={item.winner.avatar} alt="" className="rounded-full w-5 h-5 shrink-0" />
                )}
                <span className="truncate italic">{item.winner.username}</span>
              </div>
            )}

            {!item.winner?.username && item.inner_game_id && (
              <button className={"w-fit btn btn-primary btn-soft btn-sm text-sm"} onClick={handle}>
                <Gamepad2 size={20} />
                {t("bounty:play")}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

function BountyMyCard({ item }: { item: BountyMyWinItem }) {
  const { t } = useTranslation(["bonus", "bounty"]);
  const { formatWithConversion } = useDisplayCurrencyFormatter();
  const queryClient = useQueryClient();
  const [triggerClaim, setTriggerClaim] = useState(false);
  const rewardTooltip = t("bounty:reward_tooltip", {
    minBet: item.min_bet_amount,
    minBetCurrency: item.min_bet_currency,
    multiplier: item.multiplier,
    winnerSlots: item.winner_slots
  });
  const claimableAmount = Decimal(item.claim_amount || item.reward_amount || 0).toString();

  const claimMutation = useMutation({
    mutationFn: (claimCurrency: string) => claimBountyReward({
      winner_id: item.winner_id,
      claim_currency: claimCurrency
    }),
    onSuccess: (response) => {
      if (response.code === 0) {
        toast.success(t("common:common.submissionSuccessful"));
        setTriggerClaim(false);
        void queryClient.invalidateQueries({ queryKey: BOUNTY_QUERY_KEYS.myWinList });
      } else {
        toast.error(response.msg || t("common:error", "Something went wrong. Please try again."));
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.msg || error?.message || t("common:error", "Something went wrong. Please try again."));
    }
  });

  const handleClaim = (claimCurrency: string) => {
    if (!claimCurrency) return;
    claimMutation.mutate(claimCurrency);
  };

  return (
    <div className="rounded-lg bg-base-200 p-2">
      <div className="flex gap-2">
        <div className="w-22">
          <GameImage
            data={item}
            game={{
              inner_game_id: item.inner_game_id,
              game_provider: item.game_provider,
              game_name: item.display_game_name,
              image: item.image
            }}
          />
        </div>
        <div className="min-w-0 flex-1 flex flex-col gap-2">
          <div className="font-bold leading-5">{item.display_game_name}</div>

          <div className="grid grid-cols-2 gap-x-1 gap-y-2 text-sm">
            <InfoRow label={t("bounty:multiplier")} value={`${item.multiplier}x`} />
            <InfoRow label={t("bounty:min_bet")} value={`${item.min_bet_amount} ${item.min_bet_currency}`} />
            <InfoRow
              label={t("bounty:reward")}
              labelExtra={(
                <Alert
                  className={"w-4 h-4 text-base-content/60 cursor-pointer"}
                  onClick={() => toast.info(<p className={"text-sm"}>{rewardTooltip}</p>, { duration: 8_000 })}
                />
              )}
              value={formatWithConversion(item.reward_amount, item.reward_currency, {
                showCode: true,
                showSymbol: false
              }).formatted}
            />
            {item.claim_status === 1 && Number(item.claimed_at) > 0 && (
              <InfoRow
                label={t("bonus:claimed")}
                value={formatDateTime(Number(item.claimed_at) * 1000, "DD MMM [']YY · HH:mm")}
                className={"text-base-content/50 font-normal text-xs"}
              />
            )}
          </div>

          <div className="flex justify-end">
            <ConfirmBox
              className={"w-fit btn-sm text-sm"}
              disabled={item.claim_status === 1 || claimMutation.isPending}
              loading={claimMutation.isPending}
              onClick={() => {
                if (item.claim_status !== 1) setTriggerClaim(true);
              }}
            >
              {item.claim_status === 1 ? t("bonus:claimed") : t("bounty:claim")}
            </ConfirmBox>
          </div>
        </div>
      </div>

      <BonusClaimModal
        bonus={claimableAmount}
        imageSrc="/images/bonus_bounty/bounty-hit.png"
        open={triggerClaim}
        onClick={handleClaim}
        onClose={() => setTriggerClaim(false)}
      />
    </div>
  );
}

function InfoRow({ label, labelExtra, value, className }: {
  label: string;
  labelExtra?: React.ReactNode;
  value: string,
  className?: string
}) {
  return (
    <div className={clsx("min-w-0")}>
      <div className="flex items-center gap-1 text-xs text-base-content/50">
        <span>{label}</span>
        {labelExtra}
      </div>
      <div className={clsx("truncate font-bold", className)}>{value}</div>
    </div>
  );
}
