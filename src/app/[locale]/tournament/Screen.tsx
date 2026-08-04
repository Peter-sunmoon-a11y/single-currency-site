import { TournamentHeroSection, TournamentList } from "@/sections/tournament";
import { useTranslation } from "@/lib/i18n/react-i18next";

function RouteComponent() {
  const { t } = useTranslation();

  return (
    <div className="p-4 flex flex-col gap-4">
      <TournamentHeroSection />

      <div className="flex flex-col gap-3 md:mb-10">
        <p className="text-base font-bold">{t("casino:tournaments")}</p>
        <TournamentList />
      </div>
    </div>
  );
}

export const beforeLoad = undefined;

export default RouteComponent;
