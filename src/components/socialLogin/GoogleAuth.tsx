import { useSocialList } from "@/components/socialLogin/helper.ts";
import i18n from "@/i18n.ts";
import { apiConfig, promotionConfig } from "@/lib/env";
import { toUrlSearchParams } from "@/utils/urlSearchParams";
import { useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

export default function GoogleAuth({ enabled }: { enabled?: boolean }) {
  const locationSearchParams = useSearchParams();
  const search = locationSearchParams.toString() ? `?${locationSearchParams.toString()}` : "";

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
      {Array.isArray(social?.data) &&
        social?.data?.length > 0 &&
        social.data.map((s: { name: string; online_url: string; name_key: string }) => {
          if (s?.name_key === "google")
            return <SocialButton key={s.name} name={s.name} onClick={() => getAuthLink(s.online_url, s.name_key)} />;
        })}
    </>
  );
}

const SocialButton = ({ name, ...props }: React.ComponentProps<"button"> & { name: string }) => {
  return (
    <button {...props} className="btn btn-ghost btn-square text-sm h-9 w-9">
      <img src={`/images/social/${name}.svg`} className="h-6 w-6" alt="" />
    </button>
  );
};
