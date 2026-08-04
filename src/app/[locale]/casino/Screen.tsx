import { localizeHref } from "@/lib/navigation";
import { LazySection } from "@/components/ui/LazySection";
import { CasinoActivitiesSkeleton, CasinoSectionSkeleton } from "@/sections/casino/CasinoSkeletons";
import { PromotionalSkeleton } from "@/sections/casino/PromotionalSkeleton";
import { RecentBigWinsSkeleton } from "@/sections/casino/RecentBigWinsSkeleton";
import HeroBanner from "@/sections/casino/hero-banner";
import { useBoundStore } from "@/store";
import { scheduleIdle } from "@/utils/helper";
import { isTelegramWebApp } from "@/utils/telegramWebApp";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { memo, useEffect, useState, type ReactNode } from "react";

const Footer = dynamic(() => import("@/sections/casino/Footer.tsx").then((m) => m.Footer), {
  ssr: false,
});

const LiveBets = dynamic(() => import("@/sections/casino/live-bets").then((m) => m.LiveBets), {
  ssr: false,
  loading: () => <CasinoSectionSkeleton />,
});

const Activities = dynamic(() => import("@/sections/casino/activities"), {
  loading: () => <CasinoActivitiesSkeleton />,
});

const Promotional = dynamic(() => import("@/sections/casino/Promotional.tsx").then((m) => m.Promotional), {
  ssr: false,
  loading: () => <PromotionalSkeleton />,
});

const BetByCarousel = dynamic(() => import("@/sections/casino/BetByCarousel.tsx").then((m) => m.BetByCarousel), {
  ssr: false,
  loading: () => <CasinoSectionSkeleton className="h-[158px]" />,
});

const FeaturedGames = dynamic(() => import("@/sections/casino/FeaturedGames.tsx").then((m) => m.FeaturedGamesList), {
  loading: () => <CasinoSectionSkeleton />,
});

const RecentBigWins = dynamic(() => import("@/sections/casino/RecentBigWins.tsx").then((m) => m.RecentBigWins), {
  ssr: false,
  loading: () => <RecentBigWinsSkeleton />,
});

const BetByLinkGuard = dynamic(() => import("@/components/sidebar/BetByLinkGuard.tsx").then((m) => m.BetByLinkGuard), {
  ssr: false,
  loading: () => <CasinoSectionSkeleton className="h-[158px]" />,
});

const AcceptCurrencies = dynamic(() => import("@/sections/casino/AcceptCurrencies.tsx").then((m) => m.AcceptCurrencies), {
  ssr: false,
});

const CategoryGamesList = dynamic(() => import("@/sections/casino/CategoryGames.tsx").then((m) => m.CategoryGamesList), {
  loading: () => <CasinoSectionSkeleton />,
});

const PromoGuard = dynamic(() => import("@/sections/casino/PromoGuard.tsx").then((m) => m.PromoGuard), {
  ssr: false,
});

function DeferredSection({
  children,
  placeholder,
  minHeight,
}: {
  children: ReactNode;
  placeholder: ReactNode;
  minHeight: number | string;
}) {
  return (
    <LazySection rootMargin="400px 0px" minHeight={minHeight} placeholder={placeholder}>
      {children}
    </LazySection>
  );
}

const RouteComponent = memo(function RouteComponent() {
  const openModal = useBoundStore((state) => state.openModal);
  const isAuthenticated = useBoundStore((state) => !!state.user);
  const [shouldMountPromoGuard, setShouldMountPromoGuard] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (isTelegramWebApp()) return;
    if (!isAuthenticated) {
      // 转换为字符串进行比较，以兼容 boolean 和 string 类型
      const shouldOpenLogin = searchParams.get("openLogin") === "true";
      const shouldOpenSignUp = searchParams.get("openSignUp") === "true";

      if (shouldOpenLogin) {
        openModal("OPEN_AUTH_MODAL", { initialTab: "sign-in" });
        router.replace(localizeHref("/casino"));
      } else if (shouldOpenSignUp) {
        openModal("OPEN_AUTH_MODAL", { initialTab: "sign-up" });
        router.replace(localizeHref("/casino"));
      }
    }
  }, [searchParams, isAuthenticated, openModal, router]);

  useEffect(() => {
    if (!isAuthenticated) {
      setShouldMountPromoGuard(false);
      return;
    }

    return scheduleIdle(() => {
      setShouldMountPromoGuard(true);
    });
  }, [isAuthenticated]);

  return (
    <>
      <div className="flex flex-col gap-4 p-4 w-full">
        <HeroBanner />

        <Activities />

        <DeferredSection placeholder={<RecentBigWinsSkeleton />} minHeight={124}>
          <RecentBigWins />
        </DeferredSection>

        <DeferredSection placeholder={<PromotionalSkeleton />} minHeight={172}>
          <Promotional />
        </DeferredSection>

        <DeferredSection placeholder={<CasinoSectionSkeleton className="h-[158px]" />} minHeight={158}>
          <BetByLinkGuard>
            <BetByCarousel />
          </BetByLinkGuard>
        </DeferredSection>

        <DeferredSection placeholder={<CasinoSectionSkeleton />} minHeight={172}>
          <FeaturedGames />
        </DeferredSection>

        <DeferredSection placeholder={<CasinoSectionSkeleton />} minHeight={172}>
          <CategoryGamesList />
        </DeferredSection>

        <DeferredSection placeholder={<CasinoSectionSkeleton />} minHeight={172}>
          <LiveBets />
        </DeferredSection>

        <DeferredSection placeholder={<CasinoSectionSkeleton className="h-[120px]" />} minHeight={120}>
          <AcceptCurrencies />
        </DeferredSection>

        <DeferredSection placeholder={<CasinoSectionSkeleton className="h-[96px]" />} minHeight={96}>
          <Footer />
        </DeferredSection>
      </div>
      {shouldMountPromoGuard ? <PromoGuard /> : null}
    </>
  );
});

export const beforeLoad = undefined;

export default RouteComponent;
