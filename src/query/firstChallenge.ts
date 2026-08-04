import { AUTH_QUERY_KEYS } from "@/hooks/api/useAuth.ts";
import { useTranslation } from "@/lib/i18n/react-i18next";
import {
  claimFirstChallenge,
  collectFirstChallenge,
  firstChallengeMarkSeen,
  getFirstChallengeEligibility,
  getFirstChallengeHistory,
  getFirstChallengeTasks,
} from "@/services/auth/firstChallenge";
import { useBoundStore } from "@/store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const FIRST_CHALLENGE_QUERY_KEYS = {
  eligibility: ["firstChallenge", "eligibility"] as const,
  tasks: ["firstChallenge", "tasks"] as const,
  history: ["firstChallenge", "history"] as const,
};

export function useFirstChallengeEligibility() {
  const user = useBoundStore((state) => state.user);
  return useQuery({
    queryKey: FIRST_CHALLENGE_QUERY_KEYS.eligibility,
    queryFn: getFirstChallengeEligibility,
    enabled: !!user,
  });
}

export function useFirstChallengeTasks(deviceEnv = "other") {
  const user = useBoundStore((state) => state.user);
  return useQuery({
    queryKey: [...FIRST_CHALLENGE_QUERY_KEYS.tasks, deviceEnv],
    queryFn: () => getFirstChallengeTasks(deviceEnv),
    enabled: !!user,
  });
}

export function useFirstChallengeHistory() {
  const user = useBoundStore((state) => state.user);
  return useQuery({
    queryKey: FIRST_CHALLENGE_QUERY_KEYS.history,
    queryFn: getFirstChallengeHistory,
    enabled: !!user,
  });
}

export function useFirstChallengeMarkSeen() {
  return useMutation({
    mutationFn: firstChallengeMarkSeen,
    onSuccess: () => {},
  });
}

export function useFirstChallengeCollect() {
  const { t } = useTranslation("bonus");

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (currency: string) => collectFirstChallenge(currency),
    onSuccess: async (result) => {
      if (result?.code === 0) {
        toast.success(t("first_challenge.toast.success_title"));
        void queryClient.invalidateQueries({ queryKey: FIRST_CHALLENGE_QUERY_KEYS.eligibility });
        void queryClient.invalidateQueries({ queryKey: FIRST_CHALLENGE_QUERY_KEYS.tasks });
        void queryClient.invalidateQueries({ queryKey: FIRST_CHALLENGE_QUERY_KEYS.history });
        void queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.userBalance });
        return;
      }

      toast.error(t("first_challenge.collect_errors.generic"));
    },
    onError: async () => {
      toast.error(t("first_challenge.collect_errors.generic"));
    },
  });
}

export function useFirstChallengeClaim() {
  const { t } = useTranslation("bonus");

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (user_task_id: string) => claimFirstChallenge(user_task_id, ""),
    onSuccess: (result) => {
      if (result?.code === 0) {
        toast.success(t("first_challenge.toast.success_title"));
        void queryClient.invalidateQueries({ queryKey: FIRST_CHALLENGE_QUERY_KEYS.eligibility });
        void queryClient.invalidateQueries({ queryKey: FIRST_CHALLENGE_QUERY_KEYS.tasks });
        void queryClient.invalidateQueries({ queryKey: FIRST_CHALLENGE_QUERY_KEYS.history });
        return;
      }

      toast.error(t("first_challenge.collect_errors.generic"));
    },
    onError: () => {
      toast.error(t("first_challenge.collect_errors.generic"));
    },
  });
}
