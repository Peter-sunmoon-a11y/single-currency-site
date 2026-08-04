import { useState } from "react";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { cn } from "@/utils/cn";
import type { ITournament } from "@/types/tournament";

interface TournamentRulesSectionProps {
  tournament: ITournament | null;
}

export function TournamentRulesSection({ tournament }: TournamentRulesSectionProps) {
  const { t } = useTranslation('tournament');
  const [isExpanded, setIsExpanded] = useState(false);

  if (!tournament) return null;

  const provider = (tournament.game_provider || "").toLowerCase();
  
  // 根据提供商获取对应的翻译key
  let titleKey = "";
  let descriptionKey = "";
  let contentKey = "";
  
  if (provider === "jili") {
    titleKey = "tournament:jiliTitle";
    descriptionKey = "tournament:jiliDescription";
    contentKey = "tournament:jiliContent";
  } else if (provider === "pg") {
    titleKey = "tournament:pgTitle";
    descriptionKey = "tournament:pgDescription";
    contentKey = "tournament:pgContent";
  } else if (provider === "pp" || provider === "pragmatic") {
    titleKey = "tournament:pragmaticTitle";
    descriptionKey = "tournament:pragmaticDescription";
    contentKey = "tournament:pragmaticContent";
  } else if (provider === "0" || provider === "newbie") {
    titleKey = "tournament:beginnerTitle";
    descriptionKey = "tournament:beginnerDescription";
    contentKey = "tournament:beginnerContent";
  } else if (provider === "lucky") {
    titleKey = "tournament:luckyNumberSeven";
    descriptionKey = "tournament:luckyNumberSevenDescription";
    contentKey = "tournament:luckyNumberSevenContent";
  } else {
    // 默认使用通用翻译
    titleKey = "tournament:tournament";
    descriptionKey = "tournament:rulesAndTerms";
    contentKey = "";
  }

  const title = String(t(titleKey, tournament.name || "Tournament"));
  const description = String(t(descriptionKey, "Rules & Terms"));
  const content = contentKey ? String(t(contentKey, "")) : "";

  return (
    <div className="bg-base-200 rounded-b-2xl overflow-hidden">
      {/* Header - Clickable */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-5 py-4 flex items-center justify-between"
      >
        <div className="text-left">
          <h2 className="text-base leading-6 font-bold text-base-content mb-0.5">
            {title}
          </h2>
          <p className="text-sm leading-5 text-base-content/70">
            {description}
          </p>
        </div>
        <div
          className={cn(
            "transition-transform duration-200 flex-shrink-0 ml-2",
            isExpanded && "rotate-180"
          )}
        >
          <svg width="8" height="6" viewBox="0 0 8 6" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M0.184136 0.767599C0.422999 0.537923 0.802824 0.54537 1.0325 0.784233L4 3.93443L6.9675 0.784233C7.19718 0.54537 7.577 0.537923 7.81587 0.767599C8.05473 0.997275 8.06218 1.3771 7.8325 1.61596L4.4325 5.21596C4.31938 5.33361 4.16321 5.4001 4 5.4001C3.83679 5.4001 3.68062 5.33361 3.5675 5.21596L0.167501 1.61596C-0.0621751 1.3771 -0.0547276 0.997275 0.184136 0.767599Z"
              fill="currentColor"
              className="text-base-content/50"
            />
          </svg>
        </div>
      </button>

      {/* Expandable Content */}
      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          {content ? (
            <div 
              className="px-5 pb-4 text-base-content/80"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          ) : (
            <div className="px-5 pb-4 space-y-3 text-sm text-base-content/80">
              {/* 默认规则内容 */}
              <div>
                <h3 className="font-bold text-base-content mb-2">
                  {t("tournament:howToParticipate", "How to Participate")}
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>{t("tournament:rule1", "Play any participating game during the tournament period")}</li>
                  <li>{t("tournament:rule2", "Each bet contributes to your total wagered amount")}</li>
                  <li>{t("tournament:rule3", "Climb the leaderboard by wagering more")}</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-base-content mb-2">
                  {t("tournament:prizeDistribution", "Prize Distribution")}
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>{t("tournament:prize1", "Prizes are distributed based on your final rank")}</li>
                  <li>{t("tournament:prize2", "Winners will be notified after the tournament ends")}</li>
                  <li>{t("tournament:prize3", "Prize pool is progressive and increases with participation")}</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-base-content mb-2">
                  {t("tournament:termsAndConditions", "Terms and Conditions")}
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>{t("tournament:term1", "Only real money bets count towards the tournament")}</li>
                  <li>{t("tournament:term2", "Management reserves the right to modify or cancel the tournament")}</li>
                  <li>{t("tournament:term3", "General terms and conditions apply")}</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
