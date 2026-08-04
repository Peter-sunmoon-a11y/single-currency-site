import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { useGlobalCommissions } from "@/hooks/api/usePublic";
import { cn } from "@/utils/cn";
import { useTranslation } from "@/lib/i18n/react-i18next";
import clsx from "clsx";
import { DataLoading } from "@/components/standard/DataLoading.tsx";
import { NothingFound } from "@/components/ui/NothingFound.tsx";

const MAX_ROWS = 10;

export const ReferralLiveGlobalCommissions = () => {
  const { t } = useTranslation("referral");
  const { data: globalCommissionsResponse, isFetching } = useGlobalCommissions();
  const { formatWithConversion } = useDisplayCurrencyFormatter();

  const list = globalCommissionsResponse?.code === 0 ? (globalCommissionsResponse?.data ?? []) : [];
  const rows = list.slice(0, MAX_ROWS);

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* 表头 */}
      <div className="px-2 grid grid-cols-2 text-base-content/50 text-xs uppercase">
        <div className="text-start">{t("referral:user")}</div>
        <div className="text-end">{t("referral:type")} | {t("referral:rewards")}</div>
      </div>

      <div className={"relative rounded-lg bg-base-200 p-2 min-h-[180px]"}>
        <div className="space-y-1">
          {/* 数据行 */}
          {rows.map((commission: any, index: number) => {
            const reward = parseFloat(commission.reward || "0");
            const referType = commission.refer_type;
            return (
              <div
                key={commission?.id || index}
                className={clsx("flex flex-col gap-1 rounded-lg bg-base-300 p-2")}
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 items-center">
                  <div className="text-base-content/70 text-sm">
                    {commission.down_line_username}
                  </div>
                  <div>
                    <div className={cn(
                      "text-sm text-right italic",
                      referType === "direct"
                        ? "text-primary"
                        : "text-info"
                    )}>
                      {referType === "direct" ? t("referral:direct") : t("referral:indirect")}
                    </div>
                    <div className="flex items-center gap-1 justify-end">
                      <div
                        className={cn("text-sm font-bold", reward > 0 ? "text-primary" : "text-base-content/50")}>
                        {reward > 0 ? "+" : ""}
                        {formatWithConversion(reward, "USD", {
                          compact: false,
                          showCode: false,
                          minimizeDecimals: true
                        }).formatted}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {isFetching && <DataLoading />}
        {!isFetching && Number(list.length || 0) === 0 && <NothingFound />}
      </div>
    </div>
  );
};
