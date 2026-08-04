"use client";

import { DataLoading } from "@/components/standard/DataLoading.tsx";
import { TextBaseContent } from "@/components/standard/TextBaseContent.tsx";
import { NothingFound } from "@/components/ui/NothingFound.tsx";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { requireAuth } from "@/lib/auth-guards";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { useFirstChallengeEligibility, useFirstChallengeHistory } from "@/query/firstChallenge";
import { getTaskIcon } from "@/sections/first-challenge/components.tsx";
import { InnerSlogan } from "@/standard/modals/DemoLazyInfoModal.tsx";
import { formatDateTime } from "@/utils/formatDateTime";
import clsx from "clsx";
import { ChevronRight } from "lucide-react";

function Screen() {
  const { t } = useTranslation("firstChallenge");
  const { data, isFetching } = useFirstChallengeHistory();
  const { data: eligibility } = useFirstChallengeEligibility();
  const { formatWithConversion } = useDisplayCurrencyFormatter();

  const items = data?.data?.records ?? [];

  const bonusAmount = formatWithConversion(eligibility?.data?.challenge?.total_reward_usdt ?? 0, "USDT", {
    showCode: false,
    showSymbol: true
  }).formatted;

  return (
    <div className="p-4">
      <InnerSlogan
        // 根据设计稿自行修改文字
        title={<div className="flex flex-col justify-center gap-1">
          <>
            <div className="w-full">
              <p className="whitespace-pre-line">{t("firstChallenge.title")}</p>
            </div>
            <p className="text-3xl text-primary">
              {bonusAmount}
            </p>
          </>
        </div>}
        // 根据设计稿自行修改图片
        picture="/images/bonus_first_challenge/entry-icon.webp"
      />

      <div className="relative mt-4 min-h-[110px] rounded-lg bg-base-200 p-2">
        <div className="space-y-1">
          {items.map((item: Record<string, any>, index: number) => {
            const Icon = getTaskIcon(item?.task_type || "");
            const amount = formatWithConversion(item?.reward_usdt ?? 0, "USDT", {
              showCode: false,
              showSymbol: true
            }).formatted;

            return (
              <div
                key={item?.id || item?.user_task_id || `${item?.task_type || "history"}-${index}`}
                className="rounded-lg bg-base-300 p-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-primary">
                      <span className="text-lg font-bold">{amount}</span>
                    </div>

                    <div className="flex items-center gap-1 mt-2 text-sm italic text-base-content">
                      <Icon className="h-4 w-4 shrink-0" />
                      <TextBaseContent text={t(`firstChallenge:tasks.${item?.task_type}.requirement`)} className={'!text-base-content'} />
                    </div>

                    <div className="mt-2 text-xs text-base-content/50">
                      {item?.claimed_at ? formatDateTime(item?.claimed_at || 0, "DD MMM YYYY · HH:mm") : "--"}
                    </div>
                  </div>

                  <div className={clsx("text-success text-sm leading-none")}>
                    ✓
                  </div>
                </div>

                {item?.task_target || item?.target_value ? (
                  <div className="mt-3 flex items-center gap-1 text-xs text-base-content/50">
                    <ChevronRight className="h-3 w-3 shrink-0" />
                    <span>{item?.task_target || item?.target_value}</span>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        {isFetching && <DataLoading />}
        {!isFetching && items.length === 0 && <NothingFound text={t("history.empty")} />}
      </div>
    </div>
  );
}

export const beforeLoad = requireAuth;

export default Screen;
