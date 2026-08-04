import { useSocialList } from "@/components/socialLogin/helper.ts";
import i18n from "@/i18n.ts";
import { apiConfig, promotionConfig } from "@/lib/env";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { toUrlSearchParams } from "@/utils/urlSearchParams";
import clsx from "clsx";
import { useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

export default function SocialLogin({ enabled, className }: { title?: string; enabled?: boolean; className?: string }) {
  const locationSearchParams = useSearchParams();
  const search = locationSearchParams.toString() ? `?${locationSearchParams.toString()}` : "";
  const { t } = useTranslation("login");

  // 当前站支持的社媒
  const { data: social } = useSocialList(enabled);

  const params = useMemo(() => {
    let baseParams: Record<string, any> = {
      locale: i18n.language || "en",
      service: apiConfig.url?.replace("/api", ""),
      redirect_uri: location.origin,
    };

    const model = promotionConfig.model;
    const appid = promotionConfig.folder;

    const startapp = toUrlSearchParams(search).get("startapp");

    // For RoiBest
    if (appid && model === "roibest") {
      baseParams = { ...baseParams, appid };
    }

    // For Referral Link
    if (startapp) {
      baseParams = { ...baseParams, startapp };
    }

    return baseParams;
  }, [search, i18n.language]);

  // social login website
  const getAuthLink = useCallback(
    (url: string, auth_type: string) => {
      const searchParams = new URLSearchParams({ ...params, auth_type });
      window.location.href = `${url}?${searchParams}`;
    },
    [params],
  );

  return (
    <>
      {Array.isArray(social?.data) && social?.data?.length > 0 && (
        <div className={clsx("flex flex-col gap-4", className)}>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <div className="flex-1 h-px bg-gradient-to-r from-base-content/0 to-base-content/10" />
            <span className="whitespace-nowrap text-base-content/50 font-bold">{t("orLoginWith")}</span>
            <div className="flex-1 h-px bg-gradient-to-r from-base-content/10 to-base-content/0" />
          </div>

          <div className="flex justify-center gap-1">
            {(social?.data ?? []).map((s: { name: string; online_url: string; name_key: string }) => (
              <SocialButton key={s.name} name={s.name} onClick={() => getAuthLink(s.online_url, s.name_key)} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}

const SocialButton = ({ name, ...props }: React.ComponentProps<"button"> & { name: string }) => {
  return (
    <button {...props} key={name} className="btn btn-square btn-primary btn-soft">
      <img src={`/images/social/${name}.svg`} className="h-6 w-6" alt="" />
    </button>
  );
};
