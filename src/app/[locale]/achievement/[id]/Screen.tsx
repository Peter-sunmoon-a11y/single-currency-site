import { useParams } from "next/navigation";
import { useAchievementBonusMutation, useUserAchievements } from "@/hooks/api/useAuth";
import { useMemo, useState } from "react";
import { useTranslation, Trans } from "@/lib/i18n/react-i18next";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { AchievementStep } from "@/types/bonus";
import dayjs from "dayjs";
import Decimal from "decimal.js";
import { useBoundStore } from "@/store";
import { TActions } from "@/store/type";
import { toast } from "sonner";
import { ReactNode } from "react";
import { ACHIEVEMENT_CONFIG } from "@/sections/bonus/achievements/bonus-achievements-list";
import { MousePointerClick, Pizza } from "lucide-react";
import { NothingFound } from "@/components/ui/NothingFound.tsx";
import { useAppNavigate } from "@/hooks/useAppNavigate";

function AchievementDetailPage() {

  const navigate = useAppNavigate();
  const { t } = useTranslation(["buddyBalls", "achievement"]);

  const { id } = useParams();

  const { formatWithConversion } = useDisplayCurrencyFormatter();

  const openModal = useBoundStore((state) => state.openModal);

  const { data: achievementsData } = useUserAchievements("asc");

  const { mutate: claimBonus } = useAchievementBonusMutation();
  const [claimingStepIds, setClaimingStepIds] = useState<number[]>([]);

  const achievement = useMemo(() => {
    if (!achievementsData?.data || !Array.isArray(achievementsData.data)) {
      return null;
    }

    const found = achievementsData.data.find((a: any) => String(a.id) === id || String(a.achievement_id) === id);
    if (!found) return null;

    const achievementSteps = found.achievementStep || [];
    const sortedSteps = [...achievementSteps].sort((a: any, b: any) => a.step - b.step);
    const completedSteps = sortedSteps.filter((s: any) => s.is_finish);
    const progress = completedSteps.length;
    const maxProgress = sortedSteps.length;

    const config = ACHIEVEMENT_CONFIG[found.key];

    return {
      id: String(found.id || found.achievement_id),
      key: found.key,
      name: t(`achievement:${found.key}.name`),
      description: found.description,
      icon: found.icon_url,
      btnText: config.btnText,
      link: config.link,
      modal: config.modal,
      progress,
      maxProgress,
      completed: progress === maxProgress && maxProgress > 0,
      steps: sortedSteps
    };
  }, [achievementsData, id, t]);

  const doTask = () => {
    if (achievement?.modal) {
      if (achievement.modal === "OPEN_SWAP") {
        void navigate({ to: "/finance", search: { tab: "swap" } });
      } else {
        openModal(achievement.modal as TActions);
      }
      navigate({ to: "/bonus", search: { view: undefined, tab: undefined } });
    }
    if (achievement?.link) {
      const url = new URL(decodeURIComponent(achievement?.link), window.location.origin);
      const pathname = url.pathname;
      const searchParams = Object.fromEntries(url.searchParams?.entries() || []);
      void navigate({
        to: pathname || "/",
        search: searchParams
      });
    }
  };

  const doClaim = (reward_achievement_log_id: number, data?: Record<string, any>) => {
    if (claimingStepIds.includes(reward_achievement_log_id)) {
      return;
    }

    setClaimingStepIds((current) => [...current, reward_achievement_log_id]);

    claimBonus(
      { id: reward_achievement_log_id },
      {
        onSuccess: (response) => {
          if (response.code === 0) {
            if (data && getAchievementBonusAmount(data)?.includes("x")) {
              toast.success(t("toast:ballsClaimed"));
            } else {
              toast.success(t("toast:bonusClaimedSuccessfully"));
            }

            if (Number(response?.data?.don_record_id) > 0)
              openModal("OPEN_DOUBLE_OR_NOTHING_MODAL", {
                don_record_id: response?.data?.don_record_id,
                amount: response?.data?.amount
              });
          }
        },
        onSettled: () => {
          setClaimingStepIds((current) =>
            current.filter((id) => id !== reward_achievement_log_id)
          );
        }
      }
    );
  };

  return (!achievement ? <NothingFound /> :
      <div className="flex flex-col gap-4 pb-10 p-4">
        <div className="flex items-center gap-3 z-10">
          <div className="w-10 h-10 flex items-center justify-center">
            <img
              src={ACHIEVEMENT_CONFIG[achievement?.key]?.icon}
              alt={achievement?.name}
              className="w-full h-full object-contain"
            />
          </div>
          <h2 className="text-base font-bold text-center">
            {achievement?.name}
          </h2>
        </div>

        <div className={"rounded-lg p-4 bg-base-200"}>
          <div className={"text-sm text-center text-base-content"}>{t("achievement:bonusAvailableForGame")}</div>
          <div className="flex gap-2 flex-wrap mt-4">
            <OpenBuddyBallsGame achievement={achievement} />
            <OpenAllCasinoGame achievement={achievement} />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {achievement?.steps.map((step: AchievementStep) => {
            const isClaiming = claimingStepIds.includes(step.reward_achievement_log_id);
            return (
              <div key={step.id} className="bg-base-200 rounded-lg p-4">
                <div className="flex justify-between">
                  <h2 className="text-base font-bold italic">
                    {t("bonus:level")} {step.step}
                  </h2>

                  <InnerBonusTypeSwitch data={step}>
                    {!step?.buddy_ball_count && (
                      <p className="text-xs text-base-content/50">
                        ≈{formatWithConversion(
                        parseFloat(step.reward_amount) || 0,
                        step.reward_currency || "BUCK",
                        { showCode: false }
                      ).formatted}
                      </p>
                    )}
                  </InnerBonusTypeSwitch>
                </div>

                {/* Step Status */}
                {(step.is_finish && step.is_claim) ? (
                  <div className="text-xs text-primary my-1">
                    {t("bonus:achieved_on")} {dayjs.unix(step?.updated_at ? Number(step?.updated_at) : 0).format("D MMM YYYY")}
                  </div>
                ) : (
                  <div className="flex items-center text-xs my-1 gap-1 font-extrabold">
                    {
                      step?.achievement_name === "Slotmaster"
                        ? (<div className="flex items-center gap-1">
                          {t("bonus:wager")}:{" "}
                          {formatWithConversion(step?.finish_number || 0, step?.reward_currency || "BUCK", {
                            showCode: false,
                            showSymbol: false
                          }).formatted}
                          <span>/</span>
                          <div className="text-primary">
                            {formatWithConversion(step?.total_number || 0, step?.reward_currency || "BUCK", {
                              showCode: true,
                              showSymbol: false
                            }).formatted}
                          </div>
                        </div>)
                        : (<div className="flex items-center gap-1">
                          {new Decimal(step?.finish_number ?? 0).toString()}
                          <span>/</span>
                          <span className="text-primary">{step?.total_number ?? 0}</span>
                        </div>)
                    }
                    <div>
                      {Number(step?.finish_number) > 0 && (step?.finish_number === step?.total_number) &&
                        <span className={"text-success"}>✓</span>}
                    </div>
                  </div>
                )}

                <div className="mt-2 flex items-start gap-4">
                  {/* Step Description */}
                  <p className="text-sm text-base-content/50 flex-1">
                    {step.locked ? (
                      <div>{t("bonus:unlock")}</div>
                    ) : (
                      <Trans
                        i18nKey={`achievement:${achievement.key}.description`}
                        values={{
                          count: step?.number,
                          amount: formatWithConversion(step?.total_number ?? 0,
                            step?.reward_currency ?? "BUCK",
                            { showCode: true, showSymbol: false }
                          ).formatted
                        }}
                        components={[<span className="font-semibold text-primary" key="highlight" />]}
                      />
                    )}
                  </p>

                  {/* Action Button */}
                  <div className={"text-right"}>
                    {!step.is_claim && step.is_finish && (
                      <button
                        className="btn btn-primary btn-sm btn-square"
                        disabled={isClaiming}
                        onClick={() => doClaim(step.reward_achievement_log_id, step)}
                      >
                        {isClaiming
                          ? <span className="loading loading-spinner loading-xs"></span>
                          : <Pizza size={24} />}
                      </button>
                    )}
                    {!step.is_finish && (
                      <button
                        className="btn btn-primary btn-sm btn-square"
                        onClick={() => doTask()}
                      >
                        <MousePointerClick size={24} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
  );
}

const getAchievementBonusIcon = (data: Record<string, any>) => {
  if (Number(data?.buddy_ball_count) > 0)
    return "/images/game_buddy_balls/ball.png";
  return "/icons/currency/buck.png";
};

const getAchievementBonusAmount = (data: Record<string, any>) => {
  if (Number(data?.buddy_ball_count) > 0)
    return `x${data?.buddy_ball_count}`;
  return parseFloat(data.reward_amount).toString();
};

const InnerBonusTypeSwitch = ({ data, children }: { data: AchievementStep; children?: ReactNode }) => {
  const { t } = useTranslation(["achievement", "buddyBalls"]);
  return (
    <div className="flex flex-col gap-1 items-end">
      <p className="text-sm text-base-content/50">
        {t("achievement:achievement_reward")}
      </p>
      <div className="flex items-center gap-1 text-primary text-sm font-extrabold">
        {t("buddyBalls:buddyBalls")}
        <img src={getAchievementBonusIcon(data)} className="w-4 h-4" />
        <div>
          {getAchievementBonusAmount(data)}
        </div>
      </div>
      {children}
    </div>
  );
};

const OpenBuddyBallsGame = ({ achievement }: { achievement: Record<string, any> }) => {
  const navigate = useAppNavigate();
  const { t } = useTranslation("buddyBalls");
  return Number(achievement?.steps?.[0]?.buddy_ball_count || 0) > 0
    && <div
      className={[
        "relative flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer overflow-hidden select-none",
        "bg-gradient-to-r from-yellow-500/20 via-orange-500/10 to-amber-500/20",
        "border border-yellow-500/40",
        "shadow-[0_0_14px_rgba(234,179,8,0.25)]",
        "hover:shadow-[0_0_24px_rgba(234,179,8,0.55)] hover:border-yellow-400/70",
        "active:scale-95 transition-all duration-300 group"
      ].join(" ")}
      onClick={() => void navigate({ to: "/buddy-balls" })}>
      {/* 扫光动效 */}
      <div
        className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <img
        className="w-9"
        src="/images/game_buddy_balls/ball-pool.png"
        alt=""
      />
      <span className="font-bold text-sm text-yellow-400 drop-shadow-[0_0_6px_rgba(234,179,8,0.9)]">
        {t("buddyBalls:buddyBalls")}
      </span>
      <MousePointerClick size={16} className="text-yellow-300 animate-pulse" />
    </div>;
};

const OpenAllCasinoGame = ({ achievement }: { achievement: Record<string, any> }) => {
  const navigate = useAppNavigate();
  const { t } = useTranslation("common");
  return !achievement?.steps?.[0]?.buddy_ball_count
    && <button className={"btn btn-primary"} onClick={() => void navigate({ to: "/explore?category=all" } as any)}>
      {t("common:common.casino")}
      <MousePointerClick size={20} />
    </button>;
};
export const beforeLoad = undefined;

export default AchievementDetailPage;
