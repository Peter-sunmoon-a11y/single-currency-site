"use client";

import { useTranslation } from "@/lib/i18n/react-i18next";
import { isSupportedLocale } from "@/lib/i18n/config";
import { useFirstChallengeEligibility, useFirstChallengeTasks } from "@/query/firstChallenge";
import { useBoundStore } from "@/store";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";

const HOME_PATHS = ["/casino"];

const getData = (value: any) => value?.data?.data ?? value?.data ?? value ?? {};

const toNumber = (value: any, fallback = 0) => {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
};

const toBoolean = (value: any, fallback = false) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    if (["1", "true", "yes"].includes(value.toLowerCase())) return true;
    if (["0", "false", "no"].includes(value.toLowerCase())) return false;
  }
  return fallback;
};

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

const normalizePathname = (pathname: string) => {
  const [, maybeLocale, ...rest] = pathname.split("/");
  if (isSupportedLocale(maybeLocale)) {
    const normalized = `/${rest.join("/")}`.replace(/\/+$/, "");
    return normalized || "/";
  }
  return pathname;
};

const normalizeEligibility = (response: any) => {
  const data = getData(response);
  return {
    isEligible: toBoolean(data.is_eligible ?? data.eligible ?? data.available, true),
    isForbidden: toBoolean(data.is_forbidden ?? data.forbidden, false),
    branchEnabled: toBoolean(data.branch_enabled ?? data.enabled ?? true, true),
    hasSeen: toBoolean(data.is_seen ?? data.has_seen ?? data.seen, false),
    openTaskCount: toNumber(data.open_task_count ?? data.unclaimed_count ?? data.available_task_count),
    currentAmount: toNumber(data.current_amount ?? data.progress_amount ?? data.collected_amount ?? data.current_progress),
    targetAmount: toNumber(data.target_amount ?? data.goal_amount ?? data.max_amount ?? data.total_amount, 10),
    endAt: (() => {
      const raw = toNumber(data.end_at ?? data.end_time ?? data.expire_at ?? data.expires_at, 0);
      if (!raw) return null;
      return raw > 1e12 ? raw : raw * 1000;
    })(),
  };
};

const normalizeTasks = (response: any, t: (key: string, options?: any) => string) => {
  const data = getData(response);
  const list = Array.isArray(data)
    ? data
    : Array.isArray(data.tasks)
      ? data.tasks
      : Array.isArray(data.list)
        ? data.list
        : Array.isArray(data.items)
          ? data.items
          : [];

  return list.map((item: Record<string, any>, index: number) => {
    const code = String(item.task_code ?? item.code ?? item.slug ?? item.key ?? `task_${index}`);
    const key = getTaskTranslationKey(code);

    return {
      id: String(item.id ?? item.task_id ?? item.challenge_task_id ?? code),
      code,
      title: item.title || t(`bonus:first_challenge.tasks.${key}.name`),
      rewardAmount: toNumber(item.reward_amount ?? item.amount ?? item.bonus_amount),
      isClaimed: toBoolean(item.is_claimed ?? item.claimed ?? item.status === "claimed"),
    };
  });
};

export const FirstChallengeCheck = () => {
  const { t } = useTranslation("bonus");
  const pathname = usePathname();
  const user = useBoundStore((state) => state.user);
  const openModal = useBoundStore((state) => state.openModal);
  const popupOpen = useBoundStore((state) => "OPEN_FIRST_CHALLENGE_POPUP_MODAL" in state.modals);

  const eligibilityQuery = useFirstChallengeEligibility();
  const tasksQuery = useFirstChallengeTasks();

  const normalizedPathname = useMemo(() => normalizePathname(pathname), [pathname]);
  const eligibility = useMemo(() => normalizeEligibility(eligibilityQuery.data), [eligibilityQuery.data]);
  const tasks = useMemo(() => normalizeTasks(tasksQuery.data, t), [tasksQuery.data, t]);
  const openedRef = useRef("");

  useEffect(() => {
    if (!HOME_PATHS.includes(normalizedPathname)) {
      openedRef.current = "";
    }
  }, [normalizedPathname]);

  useEffect(() => {
    if (!user || popupOpen || eligibilityQuery.isLoading || tasksQuery.isLoading) return;
    if (!HOME_PATHS.includes(normalizedPathname)) return;
    if (!eligibility.branchEnabled || eligibility.isForbidden || !eligibility.isEligible) return;
    if (eligibility.hasSeen || eligibility.openTaskCount <= 0) return;
    if (tasks.length === 0) return;

    const today = new Date().toISOString().slice(0, 10);
    const skipKey = `first_challenge.skip_day:${user.id}`;
    if (window.localStorage.getItem(skipKey) === today) return;

    const openSignature = `${user.id}:${today}:${normalizedPathname}`;
    if (openedRef.current === openSignature) return;

    openedRef.current = openSignature;
    openModal("OPEN_FIRST_CHALLENGE_POPUP_MODAL", { eligibility, tasks });
  }, [
    eligibility,
    eligibilityQuery.isLoading,
    normalizedPathname,
    openModal,
    popupOpen,
    tasks,
    tasksQuery.isLoading,
    user,
  ]);

  return null;
};

export default FirstChallengeCheck;
