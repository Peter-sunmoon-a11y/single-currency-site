import { siteConfig } from "@/lib/env";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { ReferralHeroSection } from "@/sections/referral/referral-hero-section.tsx";
import { ReferralGuard } from "@/sections/referral/referral-guard.tsx";
import { InnerDescriptionItem } from "@/sections/dollars/components.tsx";
import { useCallback, useState } from "react";

type TView = `view_${number}`;

const buildAnchor = (href: string, label: string) =>
  `<a target="_blank" rel="noopener noreferrer" href="${href}" class="text-primary font-bold text-sm">${label}</a>`;

export const ReferralFAQ = () => {
  const { t } = useTranslation("referral");

  const websiteUrl = siteConfig.url;
  const websiteNickname = siteConfig.nickname;
  const businessEmail = siteConfig.businessEmail;

  const websiteLink = buildAnchor(websiteUrl, websiteNickname);
  const emailLink   = buildAnchor(`mailto:${businessEmail}`, businessEmail);

  const faqItems = [
    { id: "faq-1", question: "referral:faqOne.title",   answer: "referral:faqOne.content",   values: { gameLink: websiteLink } },
    { id: "faq-2", question: "referral:faqTwo.title",   answer: "referral:faqTwo.content",   values: { amount: "$1200", percentage: "50%" } },
    { id: "faq-3", question: "referral:faqThree.title", answer: "referral:faqThree.content", values: { amount: "$1200", parts: "16", level: "VIP2 to VIP80", gameLink: websiteLink } },
    { id: "faq-4", question: "referral:faqFour.title",  answer: "referral:faqFour.content",  values: { emailLink } },
    { id: "faq-5", question: "referral:faqFive.title",  answer: "referral:faqFive.content",  values: { codes: "20" } },
    { id: "faq-6", question: "referral:faqSix.title",   answer: "referral:faqSix.content",   values: { gameLink: websiteLink } },
    { id: "faq-7", question: "referral:faqSeven.title", answer: "referral:faqSeven.content", values: {} },
    { id: "faq-8", question: "referral:faqEight.title", answer: "referral:faqEight.content", values: {} },
  ];

  const [statement, setStatement] = useState<{ [key: TView]: boolean } | null>(null);

  const handle = useCallback((rules: Record<string, any>) => {
    setStatement((v) => ({
      ...v,
      ["view_" + rules.id]: !v?.[("view_" + rules.id) as TView],
    }));
  }, []);

  return (
    <ReferralGuard>
      {(referral_enable: boolean) => (
        <div className="p-4 flex flex-col gap-4">
          <ReferralHeroSection referralEnable={referral_enable} />

          <h3 className="text-base font-bold">{t("faq")}</h3>

          {faqItems.map((rule) => (
            <InnerDescriptionItem
              key={rule.id}
              desc={rule.answer}
              title={rule.question}
              values={rule.values}
              handle={() => handle(rule)}
              statement={statement}
            />
          ))}
        </div>
      )}
    </ReferralGuard>
  );
};
