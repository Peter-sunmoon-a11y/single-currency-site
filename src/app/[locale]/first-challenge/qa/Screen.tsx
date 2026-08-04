"use client";

import {requireAuth} from "@/lib/auth-guards";
import {useTranslation} from "@/lib/i18n/react-i18next";
import {useFirstChallengeEligibility} from "@/query/firstChallenge";
import {InnerSlogan} from "@/standard/modals/DemoLazyInfoModal.tsx";
import {ChevronRight} from "lucide-react";
import {useDisplayCurrencyFormatter} from "@/contexts/DisplayCurrencyContext.tsx";

function Screen() {
  const {t} = useTranslation("bonus");

  const {data: eligibility} = useFirstChallengeEligibility();

  const { formatWithConversion } = useDisplayCurrencyFormatter();
  console.info(eligibility)
  const items = Array.from({length: 8}).map((_, index) => ({
    id: `faq-${index + 1}`,
    question: t(`first_challenge.faq.q${index + 1}.question`),
    answer: t(`first_challenge.faq.q${index + 1}.answer`, {
      duration: eligibility?.data?.branch_config?.duration_days ?? 30,
      target_amount: formatWithConversion(eligibility?.data?.branch_config?.min_collect_usdt, 'USDT',{showSymbol:false}).formatted
    })
  }));

  return (
    <div className="p-4 flex flex-col gap-4">
      <InnerSlogan
        title={t("firstChallenge.entry.title")}
        picture="/images/bonus_first_challenge/entry-icon.webp"
      />
      <div className="flex flex-col gap-4">
        <section className="space-y-2">
          <div className={"mb-3"}>
            <h4 className={"text-base font-bold flex items-center justify-between gap-4 mb-4"}>
              {t("first_challenge.faq.heading")}
            </h4>
          </div>

          <div className="space-y-2">
            {items.map((item) => (
              <details
                key={item.id}
                className="cursor-pointer group collapse text-[14px] bg-base-200 !rounded-lg p-2 text-base-content/50"
              >
                <summary className="list-none select-none">
                  <h4 className="font-bold flex items-center justify-between gap-4">
                    {item.question}
                    <div className="btn btn-soft btn-square btn-primary btn-sm shrink-0">
                      <ChevronRight className="w-3 h-3 transition-transform duration-200 group-open:rotate-90"
                                    strokeWidth={3}/>
                    </div>
                  </h4>
                </summary>
                <p className="whitespace-pre-line collapse-content p-0 mt-2 font-normal">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export const beforeLoad = requireAuth;

export default Screen;
