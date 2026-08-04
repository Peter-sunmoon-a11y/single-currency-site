import { Trans } from "@/lib/i18n/react-i18next";
import { useBaseConfig } from "@/hooks/api/usePublic.ts";
import i18n from "@/i18n.ts";
import dynamic from "next/dynamic";
import { normalizeBannerText, renderBannerText } from "@/sections/casino/hero-banner/InnerComponents.tsx";

const GoogleAuth = dynamic(() => import("@/components/socialLogin/GoogleAuth.tsx"), {
  ssr: false
});

export const UserNotLoginBanner = () => {
  const { data: config } = useBaseConfig();

  const base_config = config?.data;
  const main_banner_text = base_config?.main_banner_text;
  const final_main_banner_text = main_banner_text?.[i18n.language] || main_banner_text?.["en"] || "";
  const normalizedBannerText = normalizeBannerText(final_main_banner_text);
  const shouldRenderBannerText = /<\d+>|&lt;\d+&gt;|<br\s*\/?>|<\/?[a-z][\s\S]*>/i.test(final_main_banner_text || "");

  return <div className={"h-full flex justify-between"}>
      <div className="z-1">
        <div className={"h-full pl-6 flex flex-col justify-center font-bold"}>
        <div className={"text-xl whitespace-pre-line"}>
          {final_main_banner_text ? (
            shouldRenderBannerText ? (
              renderBannerText(normalizedBannerText)
            ) : (
              <Trans i18nKey={final_main_banner_text} components={[<span className="text-primary" />]} />
            )
          ) : (
            <InnerSloganText />
          )}
        </div>
        <div className={""}>
          <GoogleAuth />
        </div>
      </div>
    </div>
    <picture className="h-full absolute right-0">
      <img
        src={"/images/home_pages/single-suarez-small1.png"}
        alt=""
        width={209}
        height={209}
        loading="eager"
        fetchPriority="high"
        decoding="sync"
        className="object-contain h-full w-full"
      />
    </picture>
  </div>;
};

const InnerSloganText = () => {
  return (<>
    <div><Trans i18nKey={"banner:BE_THE_FIRST"} /></div>
    <div className={"text-primary"}><Trans i18nKey={"banner:CHALLENGE_EVERYTHING"} /></div>
  </>);
};
