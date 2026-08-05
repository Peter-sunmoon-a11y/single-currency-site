import { BigLogo } from "@/components/Logo";
import { PwaInstallButton } from "@/components/PwaInstallButton";
import { LazySection } from "@/components/ui/LazySection";
import { useGameProviders } from "@/hooks/api/usePublic.ts";
import { siteConfig } from "@/lib/env";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { localizeHref } from "@/lib/navigation";
import { SocialMedia } from "@/sections/casino/SocialMedia.tsx";
import { getImgCompressParams } from "@/utils/helper.ts";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

const certificationIcons = [
  { src: "/images/partners/certifications/18.svg", alt: "18+", width: 36, height: 30 },
  { src: "/images/partners/certifications/gamble-aware.svg", alt: "Gamble Aware", width: 56, height: 30 },
  { src: "/images/partners/certifications/gamcare.svg", alt: "GamCare", width: 36, height: 30 },
  { src: "/images/partners/certifications/itech-lab.svg", alt: "iTech Lab", width: 38, height: 30 },
  { src: "/images/partners/certifications/responsible-gaming.svg", alt: "Responsible Gaming", width: 90, height: 30 },
  { src: "/images/partners/certifications/gaming-laboratories.svg", alt: "Gaming Laboratories", width: 30, height: 30 },
];

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/40 to-primary/40" />
      <p className="text-sm font-bold uppercase text-base-content/50 shrink-0">{label}</p>
      <div className="h-px flex-1 bg-gradient-to-l from-transparent via-primary/40 to-primary/40" />
    </div>
  );
}

export const Footer = () => {
  const { t } = useTranslation("profile");
  const supportName = siteConfig.supportName;

  const router = useRouter();
  const { data: gameProvidersResponse } = useGameProviders();
  const gameProviders = gameProvidersResponse?.data;

  const handleProviderClick = useCallback(
    (provider: any) => {
      const providerKey = provider.name_key ?? provider.id;
      const searchParams = new URLSearchParams({
        type: "casino",
        category: "hot",
        providers: String(providerKey),
      });
      router.push(localizeHref(`/explore?${searchParams.toString()}`));
    },
    [router],
  );

  return (
    <LazySection>
      <footer className="flex flex-col gap-6 pb-2">
        {/* 3. 品牌信息 + PWA */}
        <div>
          <div className="flex justify-between gap-2 flex-1 mb-2">
            <div className="flex-1">
              <BigLogo />
              <div className="pt-2">
                <div className="flex-1">
                  <p className="text-xs text-base-content">{t("casino:footerDescriptionFour", { supportName })}</p>
                  <p
                    className="text-xs text-base-content/50">{t("casino:footerDescriptionFive", { year: new Date().getFullYear() })}</p>
                </div>
              </div>
            </div>
            <PwaInstallButton />
          </div>

          {/* 4. 社交媒体 */}
          <SocialMedia />

        </div>

        {/* 5. 游戏供应商 - 品质背书 */}
        <div className="flex flex-col gap-3">
          <SectionDivider label={t("casino:gameProviders", "Game Providers")} />
          <div className="flex flex-wrap gap-1 justify-center">
            {gameProviders?.map((provider: Record<string, any>) => (
              <div
                key={provider.id}
                onClick={() => handleProviderClick(provider)}
                className="cursor-pointer bg-base-100 rounded-md px-0.5 py-0.5"
              >
                <div className="w-[80px] h-[31px] flex items-center justify-center">
                  <img
                    src={getImgCompressParams(provider.day_logo, "auto", 60)}
                    alt={provider.name}
                    loading="lazy"
                    className="max-w-full max-h-full w-auto h-auto"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 6. 认证与负责任博彩 - 可信度核心 */}
        <div className="flex flex-col gap-3">
          <SectionDivider label={t("casino:responsibleGambling", "Responsible Gambling")} />
          <div className="flex flex-wrap items-center justify-center gap-x-3">
            {certificationIcons.map((icon) => (
              <img key={icon.src} src={icon.src} alt={icon.alt} title={icon.alt} className="h-8" />
            ))}
          </div>
        </div>
      </footer>
    </LazySection>
  );
};
