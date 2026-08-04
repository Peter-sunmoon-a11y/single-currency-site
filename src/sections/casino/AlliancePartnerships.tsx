import { useTranslations } from "next-intl";

const partners = [
  { teamLogo: "/images/partners/team-logo1.png", teamBg: true },
  { teamLogo: "/images/partners/team-logo2.png", teamBg: false },
  { teamLogo: "/images/partners/team-logo3.png", teamBg: false },
];

export const AlliancePartnerships = () => {
  const t = useTranslations();

  return (
    <section className="">
      {/* 标题 */}
      <div className="flex items-center gap-3 mb-5">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/40 to-primary/40" />
        <p className="text-sm font-bold uppercase text-base-content/50 shrink-0">
          {t("casino.alliancePartnerships")}
        </p>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent via-primary/40 to-primary/40" />
      </div>

      {/* 合作伙伴卡片 */}
      <div className="grid grid-cols-3 gap-2">
        {partners.map((partner, i) => (
          <div
            key={i}
              className="flex flex-col items-center gap-3 bg-base-200 rounded-lg p-3"
          >
            {/* 球队 Logo */}
            <div className="h-12 flex items-center justify-center">
              <img
                src={partner.teamLogo}
                alt="partner team"
                className={`h-full w-auto object-contain ${partner.teamBg ? "bg-base-content rounded p-0.5" : ""}`}
              />
            </div>

            {/* 分割线 */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-base-content/15 to-transparent" />

            {/* 品牌 Logo */}
            <img
              src="/images/partners/okvip.svg"
              alt="OKVIP"
              className="h-6 w-auto object-contain opacity-70"
            />
          </div>
        ))}
      </div>
    </section>
  );
};
