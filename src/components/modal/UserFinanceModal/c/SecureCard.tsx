import { useTranslation } from "@/lib/i18n/react-i18next";

export const SecureCard = () => {
  const { t } = useTranslation();

  return (
    <div
      className="flex items-center gap-4 rounded-lg p-4"
      style={{
        background: `
        radial-gradient(100% 157.05% at 0% 46.47%, 
        color-mix(in oklch, var(--color-info), transparent 60%) 50%,
        color-mix(in oklch, var(--color-base-300), transparent 30%)`,
      }}
    >
      <img src="/icons/isometric/24.svg" className="h-12 w-12" alt="Secure" />
      <p className="text-xs leading-4 text-base-content/50 font-semibold">
        {t("finance:youWillBeRedirectedToAThirdPartySiteVerifiedByOurPlatformForASecureAndTrustworthyBrowsingExperience")}
      </p>
    </div>
  );
};
