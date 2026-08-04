import { useTranslation } from "@/lib/i18n/react-i18next";

function RouteComponent() {
  const { t } = useTranslation("popup");

  return (
    <div className="p-4 flex flex-col gap-4">

      {/* 顶部渐变卡片 */}
      <div
        className="pl-6 pr-4 relative overflow-hidden h-[150px] flex items-center rounded-lg bg-gradient-to-br from-primary/50 via-primary/25 to-base-200"
      >
        <div className="relative z-10 flex items-center h-full justify-between w-full">
          <h1 className="text-2xl font-bold text-base-content">
            {t("popup:get_buck")}
          </h1>
          <div className="flex items-center -space-x-6">
            <img src="/images/platform_token/usdt.png" className="w-18" />
            <img src="/images/platform_token/buck.png" className="w-28" />
          </div>
        </div>
      </div>

      {/* 内容卡片 */}
      <div className="flex flex-col gap-4">

        {/* What is BUCK? */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <img src="/images/platform_token/buck.png" className="w-5 h-5" />
            <h3 className="text-base font-bold text-base-content">{t("popup:what_is_buck")}</h3>
          </div>
          <p className="text-sm text-base-content/50">
            {t("popup:what_is_buck_description")}
          </p>
        </div>

        {/* Is BUCK exchangeable? */}
        <div>
          <h3 className="text-base font-bold text-base-content mb-2">{t("popup:is_buck_exchangeable")}</h3>
          <p className="text-sm text-base-content/50 leading-5">
            {t("popup:is_buck_exchangeable_description")}
          </p>
        </div>

        {/* Expiration */}
        <div>
          <h3 className="text-base font-bold text-base-content mb-2">{t("popup:expiration")}</h3>
          <p className="text-sm text-base-content/50">
            {t("popup:expiration_description")}
          </p>
        </div>

        {/* General Terms */}
        <div>
          <h3 className="text-base font-bold text-base-content mb-2">{t("popup:freeSpins.general_terms")}</h3>
          <p className="text-sm text-base-content/50 whitespace-pre-line">
            {t("popup:general_terms_description")}
          </p>
        </div>

      </div>
    </div>
  );
}

export const beforeLoad = undefined;

export default RouteComponent;
