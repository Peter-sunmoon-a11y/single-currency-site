import { ReactNode } from "react";
import { Trans, useTranslation } from "@/lib/i18n/react-i18next";
import type { ITournament } from "@/types/tournament";
import { useGameCategories } from "@/hooks/api/usePublic.ts";
import Decimal from "decimal.js";
import { useTournamentPoolPrize } from "@/hooks/api/useAuth.ts";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext.tsx";
import { TOURNAMENT_PRIZE_POOL } from "@/sections/tournament/components/prizePool.ts";

interface TournamentRulesSectionProps {
  data: ITournament | null;
}

/**
 * 非通用版本
 * @param data
 * @constructor
 */
export function TournamentRulesSectionV3({ data }: TournamentRulesSectionProps) {
  const { t } = useTranslation("tournament");

  const { formatWithConversion } = useDisplayCurrencyFormatter();

  const { data: categories } = useGameCategories();

  const { data: livePrize } = useTournamentPoolPrize(data?.user_info?.tournament_id, data?.user_info?.tournament_level);

  const prize = livePrize ?? data?.user_info?.prize ?? 0;

  const formattedPrize = formatWithConversion(prize, "USD", {
    showCode: false,
    showSymbol: true
  });

  return (
    <div className="space-y-4">
      <InnerArticle
        title={t("tournament:beginnerDescription")}
        content={
          <p className={"text-xs text-base-content/50 whitespace-pre-line"}><Trans
            i18nKey={"tournament:rakerace.desc"}
            values={{ prize: formattedPrize.formatted, players: "1000" }}
            components={[<span className="text-primary" />]} /></p>
        } />

      <InnerArticle
        title={t("tournament:rakerace.p0_title")}
        content={<p className={"text-xs text-base-content/50 whitespace-pre-line"}><Trans
          i18nKey={"tournament:rakerace.p0_desc"}
          values={{ start: "(00:00 GMT)", end: "(23:59 GMT)" }}
          components={[<span className="text-primary" />]} /></p>} />

      <InnerArticle
        title={t("tournament:rakerace.p1_title")}
        content={<p className={"text-xs text-base-content/50 whitespace-pre-line"}><Trans
          i18nKey={"tournament:rakerace.p1_desc"} /></p>} />

      <InnerArticle
        title={t("tournament:rakerace.p2_title")}
        content={<div className={"grid grid-cols-2 gap-1"}>
          {(categories?.data ?? []).map((r: Record<string, any>) => {
            if (r?.parent_name_key !== "-") return;
            const label = String(t(`explore:${r.name_key}`, r.name || r.categoryName || r.title || ""));
            return <div key={label}
                        className={"rounded-md p-2 bg-base-200 text-xs flex justify-between text-base-content/50"}>
              <span className="flex-1 mr-2 break-words">{label}</span>
              <span
                className="font-bold whitespace-nowrap">{Decimal(r?.group_rate || 0).mul(100).toDP(8).toString()}%</span>
            </div>;
          })}
        </div>} />

      <InnerArticle
        title={t("tournament:rakerace.p3_title")}
        content={<p className={"text-xs text-base-content/50 whitespace-pre-line"}><Trans
          i18nKey={"tournament:rakerace.p3_desc"} values={{ places: "1000", players: "1000" }}
          components={[<span className="text-primary" />]} /></p>} />

      <InnerArticle
        className="hidden sm:block"
        title={t("tournament:rakerace.p4_title")}
        content={<p className={"text-xs text-base-content/50 whitespace-pre-line"}><Trans
          i18nKey={"tournament:rakerace.p4_desc"} /></p>} />

      <InnerArticle
        className="hidden sm:block"
        title={t("tournament:rakerace.p5_title")}
        content={<p className={"text-xs text-base-content/50 whitespace-pre-line"}><Trans
          i18nKey={"tournament:rakerace.p5_desc"} /></p>} />

      <InnerArticle
        className="hidden sm:block"
        title={t("tournament:rakerace.p6_title")}
        content={<p className={"text-xs text-base-content/50 whitespace-pre-line"}><Trans
          i18nKey={"tournament:rakerace.p6_desc"} values={{ token: "USDT" }} /></p>} />

      <InnerArticle
        title={<div className={"flex justify-between"}>
          <span>{t("tournament:rank")}</span>
          <span>{t("tournament:prize")}</span>
        </div>}
        content={<div className={"grid grid-cols-2 gap-1"}>
          {TOURNAMENT_PRIZE_POOL.map((r: Record<string, any>, index: number) => {
            return <div
              key={index}
              className={`text-base-content/50 rounded-md p-2 text-xs flex justify-between bg-base-200`}>
              <span>{r.rank}</span>
              <span className={"font-bold"}>{formatWithConversion(r.prize, "USD", {
                showCode: false,
                showSymbol: true,
                compact: true
              }).formatted}</span>
            </div>;
          })}
        </div>} />

      <InnerArticle
        className="sm:hidden"
        title={t("tournament:rakerace.p4_title")}
        content={<p className={"text-xs text-base-content/50 whitespace-pre-line"}><Trans
          i18nKey={"tournament:rakerace.p4_desc"} /></p>} />

      <InnerArticle
        className="sm:hidden"
        title={t("tournament:rakerace.p5_title")}
        content={<p className={"text-xs text-base-content/50 whitespace-pre-line"}><Trans
          i18nKey={"tournament:rakerace.p5_desc"} /></p>} />

      <InnerArticle
        className="sm:hidden"
        title={t("tournament:rakerace.p6_title")}
        content={<p className={"text-xs text-base-content/50 whitespace-pre-line"}><Trans
          i18nKey={"tournament:rakerace.p6_desc"} values={{ token: "USDT" }} /></p>} />
    </div>
  );
}

export const InnerArticle = ({ title, content, className }: { title: ReactNode, content: ReactNode, className?: string }) => {
  return (<div className={className}>
    <h3 className="text-sm font-bold text-base-content mb-2">{title}</h3>
    {content}
  </div>);
};
