import { useTranslation } from "@/lib/i18n/react-i18next";

export const RecentBigWinsSkeleton = ({ sample }: { sample?: boolean }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-1 w-full min-h-[124px]">
      {!sample && (
        <div className="flex items-center gap-1.5">
          <span className="text-sm leading-none">🔥</span>
          <p className="text-base font-bold text-primary">
            {t("casino:recentBigWins")}
          </p>
        </div>
      )}
      <div className="overflow-hidden p-1">
        <div className="flex gap-1">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="flex w-16 shrink-0 flex-col items-center gap-1">
              <div className="skeleton h-[86px] w-[64px] rounded-lg bg-base-200" />
              <div className="skeleton h-3.5 w-16 rounded bg-base-200" />
              <div className="flex w-16 items-center gap-1">
                <div className="skeleton h-4 flex-1 rounded bg-base-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
