import { InnerDataTranslation, useNavigateGuard } from "@/sections/casino/hero-banner/InnerComponents.tsx";
import { BannerVisual } from "@/sections/casino/hero-banner/template/BannerVisual";
import { useMemo } from "react";
import i18n from "@/i18n.ts";

export const CommonBanner = ({ content, isPriority = false }: { content: string; isPriority?: boolean }) => {
  const { navigate } = useNavigateGuard();

  const banner = useMemo(() => {
    try {
      const keys = JSON.parse(content);
      return keys.find((l: Record<string, any>) => l?.language === i18n.language) ?? (keys[0] || "en");
    } catch {
      return null;
    }
  }, [i18n.language]);

  return (
    <BannerVisual
      className="flex-[0_0_100%]"
      priority={isPriority}
      picture={banner?.picture}
      onClick={() => navigate(banner?.btn_url, true)}
      title={
        <InnerDataTranslation
          text={banner?.title || banner?.banner_name}
          value={banner?.value ?? "0"}
          percent={banner?.percent ?? "0"}
        />
      }
      cta={
        banner?.btn_text ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(banner?.btn_url, true);
            }}
            className="btn btn-primary btn-soft btn-sm px-3 text-xs"
          >
            {banner?.btn_text}
          </button>
        ) : null
      }
    />
  );
};
