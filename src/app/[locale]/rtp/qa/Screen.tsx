import { useTranslation } from "@/lib/i18n/react-i18next";
import { TextBaseContent } from "@/components/standard/TextBaseContent.tsx";
import { ChartNoAxesCombined, ChevronRight } from "lucide-react";

function Index() {
  const { t } = useTranslation("rtp");
  const items = [
    {
      id: "what-is-rtp",
      question: t("faqWhatIsRtpQuestion"),
      answers: [t("faqWhatIsRtpAnswer1"), t("faqWhatIsRtpAnswer2")]
    },
    {
      id: "why-rtp-matters",
      question: t("faqWhyRtpMattersQuestion"),
      answers: [t("faqWhyRtpMattersAnswer1"), t("faqWhyRtpMattersAnswer2")]
    },
    {
      id: "are-these-live",
      question: t("faqAreTheseLiveQuestion"),
      answers: [t("faqAreTheseLiveAnswer1"), t("faqAreTheseLiveAnswer2")]
    },
    {
      id: "help-choose-games",
      question: t("faqHelpChooseGamesQuestion"),
      answers: [t("faqHelpChooseGamesAnswer1"), t("faqHelpChooseGamesAnswer2")]
    },
    {
      id: "what-are-trends",
      question: t("faqWhatAreTrendsQuestion"),
      answers: [t("faqWhatAreTrendsAnswer1"), t("faqWhatAreTrendsAnswer2")]
    },
    {
      id: "what-do-the-boxes-mean",
      question: t("faqWhatDoTheBoxesMeanQuestion"),
      answers: [t("faqWhatDoTheBoxesMeanAnswer1"), t("faqWhatDoTheBoxesMeanAnswer2")]
    },
    {
      id: "why-this-page-exists",
      question: t("faqWhyThisPageExistsQuestion"),
      answers: [t("faqWhyThisPageExistsAnswer1"), t("faqWhyThisPageExistsAnswer2")]
    }
  ];

  return (
    <div className="p-4 flex flex-col gap-4">
      <section className="relative rounded-lg bg-base-200 p-4 flex flex-col gap-2">
        <p className="text-base font-bold">
          {t("heroTitle")}
        </p>
        <TextBaseContent className="text-base font-bold" text={`- ${t("title")}`} />
        <TextBaseContent text={`- ${t("subtitle")}`} />
        <TextBaseContent text={`- ${t("disclaimer")}`} />

        <ChartNoAxesCombined size={160} className={'top-0 right-0 absolute text-primary opacity-10'} />
      </section>

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
                  <ChevronRight
                    className="w-3 h-3 transition-transform duration-200 group-open:rotate-90"
                    strokeWidth={3}
                  />
                </div>
              </h4>
            </summary>
            <div className="whitespace-pre-line collapse-content p-0 mt-2 font-normal space-y-3">
              {item.answers.map((answer, index) => (
                <p key={`${item.id}:${index}`}>{answer}</p>
              ))}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

export const beforeLoad = undefined;

export default Index;
