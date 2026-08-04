"use client";

import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { Bell, Coins, Gift, HandCoins, Mail, Smartphone, Zap } from "lucide-react";
import { TextBaseContent } from "@/components/standard/TextBaseContent.tsx";
import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { parser } from "@/components/header/message-v2/c/InnerMsgLink.tsx";

export type TaskType =
  | "registration_reward"
  | "enable_notifications"
  | "add_to_home_screen"
  | "verify_email"
  | "verify_phone"
  | "make_a_deposit"
  | "win_multiplier_on_slot"
  | "make_a_withdrawal"
  | "deposit_crypto"
  | "place_bets_on_games"
  | "secure_wins"
  | "lifetime_wager"
  | "wager_on_slot"
  | "wager_on_live_game"
  | "place_lottery_bets"
  | "wager_on_lottery"
  | "win_lottery_bets"
  | "place_valid_bets"
  | "bring_active_referral"
  | "swap_rewards"
  | "claim_free_spin"
  | "play_free_spins";

export const TASK_ARROW_ACTIONS: Record<TaskType, Record<string, any>> = {
  registration_reward: { kind: "none" },
  enable_notifications: { kind: "notification_permission" },
  add_to_home_screen: { kind: "pwa_install" },
  verify_email: { kind: "navigate", to: "/security" },
  verify_phone: { kind: "navigate", to: "/security" },
  make_a_deposit: { kind: "navigate", to: "/finance", search: { tab: "deposit" } },
  win_multiplier_on_slot: { kind: "navigate", to: "/explore", search: { type: "slots", category: "all" } },
  make_a_withdrawal: { kind: "navigate", to: "/finance", search: { tab: "withdraw" } },
  deposit_crypto: { kind: "navigate", to: "/finance", search: { tab: "deposit" } },
  place_bets_on_games: { kind: "navigate", to: "/explore", search: { type: "casino", category: "hot" } },
  secure_wins: { kind: "navigate", to: "/explore", search: { type: "casino", category: "hot" } },
  lifetime_wager: { kind: "navigate", to: "/explore", search: { type: "casino", category: "hot" } },
  wager_on_slot: { kind: "navigate", to: "/explore", search: { type: "slots", category: "all" } },
  wager_on_live_game: { kind: "navigate", to: "/explore", search: { type: "liveCasino", category: "all" } },
  place_lottery_bets: { kind: "navigate", to: "/explore", search: { type: "lottery" } },
  wager_on_lottery: { kind: "navigate", to: "/explore", search: { type: "lottery" } },
  win_lottery_bets: { kind: "navigate", to: "/explore", search: { type: "lottery" } },
  place_valid_bets: { kind: "navigate", to: "/explore", search: { type: "casino", category: "hot" } },
  bring_active_referral: { kind: "navigate", to: "/referral" },
  swap_rewards: { kind: "navigate", to: "/finance", search: { tab: "swap" } },
  claim_free_spin: { kind: "navigate", to: "/bonus" },
  play_free_spins: { kind: "navigate", to: "/bonus" }
};

export function getTaskIcon(taskType: string) {
  if (taskType?.includes("email")) return Mail;
  if (taskType?.includes("phone")) return Smartphone;
  if (taskType?.includes("notification")) return Bell;
  if (taskType?.includes("deposit")) return Coins;
  if (taskType?.includes("home_screen")) return Smartphone;
  if (taskType?.includes("free_spin")) return Zap;
  return Gift;
}

export function TaskItem(
  {
    task,
    loading,
    onTask,
    onClaim
  }: {
    task: Record<string, any>;
    loading: boolean;
    onTask: (task: Record<string, any>) => void;
    onClaim: (task: Record<string, any>) => void;
  }
) {
  const { t } = useTranslation("firstChallenge");
  const { formatWithConversion } = useDisplayCurrencyFormatter();

  const RequirementIcon = getTaskIcon(task.task_type);

  return (
    <div className={"bg-base-200 p-2 flex justify-between"}>
      <div className="flex flex-col gap-2 truncate">
        <div className="flex items-center gap-1 text-lg font-bold text-primary">
          <HandCoins className="h-5 w-5 shrink-0 animate-gift-shake" />
          {formatWithConversion(task.reward_usdt, "USDT", {
            showCode: false,
            showSymbol: true
          }).formatted}
        </div>

        <div className="flex items-start gap-1">
          <RequirementIcon className="h-4 w-4 shrink-0 text-base-content" />
          <TextBaseContent
            className="text-sm italic !text-base-content"
            text={t(`firstChallenge:tasks.${(task.task_type)}.requirement`, {
              amount: formatWithConversion(task.progress_target, "USDT", {
                showCode: false,
                showSymbol: true
              }).formatted,
              game_count: parser(task?.condition_json)?.target_count,
            })}
          />
        </div>

        <div className="flex items-center text-xs gap-1">
          <TextBaseContent text={t("firstChallenge.progress_label")} />
          <TextBaseContent text={<>{task.progress_percent}%</>} />
        </div>
      </div>

      <div>
        {task.claimed_at === 0 && task.status === 2
          ? (<ConfirmBox
            className="btn-sm text-sm"
            loading={loading}
            onClick={() => onClaim(task)}>
            {t("firstChallenge.actions.claim")}
          </ConfirmBox>)
          : <ConfirmBox
            className="btn-sm text-sm"
            onClick={() => onTask(task)}>
            {t("firstChallenge.entry.go")}
          </ConfirmBox>}
      </div>
    </div>
  );
}
