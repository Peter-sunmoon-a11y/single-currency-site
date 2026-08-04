import {useTranslation} from "@/lib/i18n/react-i18next";
import {useAuth} from "@/contexts/AuthContext";
import {isTelegramWebApp} from "@/utils/telegramWebApp";
import {LastUpdate} from "@/components/sidebar/LastUpdate.tsx";
import {useBoundStore} from "@/store";

export function SettingsBox() {
  const {t} = useTranslation(["profile", "common"]);

  const user = useBoundStore((state) => state.user);

  const {logout} = useAuth();

  return (
    <section className="space-y-4">
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-base-content/50">{t("profile:appStatus")}</h2>
        {/*打包时间显示*/}
        <LastUpdate/>
        {user && !isTelegramWebApp() && (
          <section className="space-y-2">
            <button className="btn btn-md btn-primary btn-soft w-full" onClick={async () => {
              await logout();
            }}>
              {t("common:logout")}
            </button>
          </section>
        )}
      </section>
    </section>
  );
}
