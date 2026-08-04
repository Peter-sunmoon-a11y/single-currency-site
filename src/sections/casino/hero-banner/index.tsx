import { useBannerContentList } from "@/sections/casino/hero-banner/helper.ts";
import { UserNotLoginBanner } from "@/sections/casino/hero-banner/UserNotLoginBanner";
import { BannerVisual } from "@/sections/casino/hero-banner/template/BannerVisual";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { CasinoHeroSkeleton } from "@/sections/casino/CasinoSkeletons.tsx";
import { InnerDataTranslation, useNavigateGuard } from "@/sections/casino/hero-banner/InnerComponents.tsx";
import { useTranslation } from "@/lib/i18n/react-i18next";

const HeroBannerCarousel = dynamic(() => import("@/sections/casino/hero-banner/HeroBannerCarousel").then((m) => m.HeroBannerCarousel), {
  ssr: false,
  loading: () => <CasinoHeroSkeleton />
});

const Index = () => {
  const { data, isLoading } = useBannerContentList();
  const [isHydrated, setIsHydrated] = useState(false);

  const slides = useMemo(() => {
    const rawBanners = data?.data ?? [];
    return rawBanners.filter((item: Record<string, any>) => item?.name?.endsWith("_for_beggar_v3") || item?.name?.endsWith("_v2"));
  }, [data?.data]);

  const firstSlide = slides[0];

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return (
    <div
      className="select-none relative h-[180px] bg-base-200 rounded-lg overflow-hidden">
      {!isHydrated && firstSlide && <HeroBannerPreview content={firstSlide.content} />}

      {isHydrated && isLoading && <CasinoHeroSkeleton />}
      {isHydrated && !isLoading && slides.length > 0 && <HeroBannerCarousel slides={slides} />}
      {isHydrated && !isLoading && slides.length === 0 && <UserNotLoginBanner />}
      {!isHydrated && !firstSlide && <CasinoHeroSkeleton />}
    </div>
  );
};

export default Index;

const HeroBannerPreview = ({ content }: { content: string }) => {
  const { navigate } = useNavigateGuard();
  const { i18n } = useTranslation();

  const banner = useMemo(() => {
    try {
      const keys = JSON.parse(content);
      return keys.find((l: Record<string, any>) => l?.language === i18n.language) ?? keys[0];
    } catch {
      return null;
    }
  }, [content, i18n.language]);

  if (!banner) return null;

  return (
    <BannerVisual
      className="w-full"
      priority
      picture={banner?.picture}
      onClick={() => navigate(banner?.btn_url, true)}
      title={<InnerDataTranslation
        text={banner?.title || banner?.banner_name}
        value={banner?.value ?? "0"}
        percent={banner?.percent ?? "0"}
      />}
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
