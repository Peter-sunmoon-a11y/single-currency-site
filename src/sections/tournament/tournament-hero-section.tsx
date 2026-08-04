import { useTranslation } from "@/lib/i18n/react-i18next";
import { InnerSlogan } from "@/standard/modals/DemoLazyInfoModal.tsx";
import { Flame, RefreshCw, Target } from "lucide-react";

export const TournamentHeroSection = () => {
  const { t } = useTranslation("tournament");

  return (
    <>
      <InnerSlogan
        // 根据设计稿自行修改文字
        title={
          <>
            <p>{t("common:common.explore")}</p>
            <p className="text-primary">{t("casino:tournaments")}</p>
            <p>{t("tournament:drops_races")}</p>
          </>
        }
        // 根据设计稿自行修改图片
        picture="/images/tournament_pages/img.png"
      />

      <div className="p-4 rounded-box bg-base-200 flex flex-col gap-4">
        <h2 className="text-lg font-bold text-base-content">
          {t("tournament:enterTheArena", "Enter the Arena")}
        </h2>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className={"w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0"}>
              <Flame size={16} className="text-primary" />
            </span>
            <p className="flex-1 text-sm text-base-content/70">
              {t("tournament:enterTheArenaDescription1")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={"w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0"}>
            <RefreshCw size={16} className="text-primary" />
            </span>
            <p className="flex-1 text-sm text-base-content/70">
              {t("tournament:enterTheArenaDescription2")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={"w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0"}>
            <Target size={16} className="text-primary" />
            </span>
            <p className="flex-1 text-sm text-base-content/70">
              {t("tournament:enterTheArenaDescription3")}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
