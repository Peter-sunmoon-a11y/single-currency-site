"use client";

import { useAppNavigate } from "@/hooks/useAppNavigate";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { useFirstChallengeMarkSeen } from "@/query/firstChallenge";
import { useBoundStore } from "@/store";
import { formatDateTime } from "@/utils/formatDateTime";
import { Modal } from "@/components/ui/Modal";
import { Bell, ChevronRight, Coins, Gift, Mail, Smartphone } from "lucide-react";
import { useEffect } from "react";

type FirstChallengePopupEligibility = {
  isEligible: boolean;
  hasSeen: boolean;
  currentAmount: number;
  targetAmount: number;
  endAt: number | null;
};

type FirstChallengePopupTask = {
  id: string;
  code: string;
  title: string;
  rewardAmount: number;
  isClaimed: boolean;
};

type FirstChallengePopupProps = {
  isOpen: boolean;
  onClose: () => void;
  eligibility: FirstChallengePopupEligibility;
  tasks: FirstChallengePopupTask[];
};

const FIRST_CHALLENGE_SKIP_KEY = "first_challenge.skip_day";

const getTaskTranslationKey = (code: string) => {
  const normalized = code.toLowerCase().replace(/-/g, "_");
  const map: Record<string, string> = {
    signup: "registration_reward",
    register: "registration_reward",
    registration: "registration_reward",
    registration_reward: "registration_reward",
    enable_notifications: "enable_notifications",
    allow_notifications: "enable_notifications",
    add_to_home_screen: "add_to_home_screen",
    verify_email: "verify_email",
    email_verification: "verify_email",
    verify_phone: "phone_verification",
    phone_verification: "phone_verification",
    make_a_deposit: "make_a_deposit",
    first_deposit: "make_a_deposit",
    claim_free_spin: "claim_free_spin",
    play_free_spins: "play_free_spins",
    free_spin_play: "play_free_spins",
  };
  return map[normalized] || normalized;
};

function getTaskIcon(code: string) {
  const normalized = getTaskTranslationKey(code);
  if (normalized.includes("email")) return Mail;
  if (normalized.includes("phone")) return Smartphone;
  if (normalized.includes("notification")) return Bell;
  if (normalized.includes("deposit")) return Coins;
  if (normalized.includes("home_screen")) return Smartphone;
  return Gift;
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-base-300">
      <div
        className="h-full rounded-full bg-[linear-gradient(90deg,#d4ff00_0%,#b5eb00_50%,#d4ff00_100%)] transition-all duration-500"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

export function FirstChallengePopup({
  isOpen,
  onClose,
  eligibility,
  tasks
}: FirstChallengePopupProps) {
  const user = useBoundStore((state) => state.user);
  const navigate = useAppNavigate();
  const { t } = useTranslation("bonus");
  const markSeenMutation = useFirstChallengeMarkSeen();

  useEffect(() => {
    if (isOpen && !eligibility.hasSeen && !markSeenMutation.isPending) {
      markSeenMutation.mutate();
    }
  }, [eligibility.hasSeen, isOpen, markSeenMutation]);

  const previewTasks = tasks.filter((task) => !task.isClaimed).slice(0, 3);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={""}
      hideTitle
      position="modal-middle"
      className="max-w-sm border border-lime-400/80 bg-[#0b0f16] p-4 text-white shadow-[0_0_32px_rgba(212,255,0,0.18)]"
      closeButtonClassName="btn-ghost btn-sm bg-white/10 text-white"
    >
      <div className="space-y-4">
        <div className="space-y-1">
          <div className="inline-flex rounded-full border border-lime-400/40 bg-lime-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-lime-300">
            {t("first_challenge.popup.welcome")}
          </div>
          <div className="text-3xl font-black uppercase leading-none">
            {t("first_challenge.details_modal.hero_title")}
          </div>
          <p className="text-sm text-white/70">{t("first_challenge.details_modal.intro")}</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <div className="mb-2 flex items-center justify-between text-sm text-white/70">
            <span>{t("first_challenge.progress_label")}</span>
            <span className="font-semibold text-white">
              ${eligibility.currentAmount} USD/${eligibility.targetAmount} USD
            </span>
          </div>
          <ProgressBar value={(eligibility.currentAmount / Math.max(eligibility.targetAmount, 1)) * 100} />

          <div className="mt-4 space-y-3">
            {previewTasks.map((task) => {
              const Icon = getTaskIcon(task.code);
              return (
                <div key={task.id} className="rounded-2xl border border-white/10 bg-[#141a24] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-lime-400/10 text-lime-300">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-white">{task.title}</div>
                        <div className="text-lg font-black text-lime-300">${task.rewardAmount} USD</div>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 shrink-0 text-lime-300" />
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            className="btn mt-4 h-11 w-full border-none bg-lime-400 text-base font-black text-[#11160f] shadow-none hover:bg-lime-300"
            onClick={() => {
              onClose();
              void navigate({ to: "/first-challenge" });
            }}
          >
            {t("first_challenge.popup.go")}
          </button>

          {eligibility.endAt && (
            <p className="mt-2 text-center text-xs text-white/55">
              {t("first_challenge.countdown_label")}: {formatDateTime(eligibility.endAt, "DD MMM YYYY · HH:mm")}
            </p>
          )}
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-white/70">
          <input
            type="checkbox"
            className="checkbox checkbox-sm border-white/30"
            onChange={(event) => {
              if (!user || !event.target.checked) return;
              window.localStorage.setItem(`${FIRST_CHALLENGE_SKIP_KEY}:${user.id}`, new Date().toISOString().slice(0, 10));
            }}
          />
          <span>{t("first_challenge.popup.skip_today")}</span>
        </label>
      </div>
    </Modal>
  );
}

export default FirstChallengePopup;
