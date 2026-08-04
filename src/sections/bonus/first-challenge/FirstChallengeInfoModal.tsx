"use client";

import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext.tsx";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { useFirstChallengeEligibility } from "@/query/firstChallenge";
import { ChevronRight } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import {
  InnerContainer,
  InnerContent,
  InnerHeader,
  InnerSlogan
} from "@/standard/modals/DemoLazyInfoModal.tsx";

interface FirstChallengeInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirstChallengeInfoModal = ({ isOpen, onClose }: FirstChallengeInfoModalProps) => {
  const { t } = useTranslation("bonus");
  const { data: eligibility } = useFirstChallengeEligibility();
  const { formatWithConversion } = useDisplayCurrencyFormatter();

  const duration = eligibility?.data?.branch_config?.duration_days ?? 30;
  const targetAmount = formatWithConversion(
    eligibility?.data?.branch_config?.min_collect_usdt ?? 10,
    "USDT",
    { showSymbol: false }
  ).formatted;

  const items = Array.from({ length: 8 }).map((_, index) => ({
    id: `faq-${index + 1}`,
    question: t(`first_challenge.faq.q${index + 1}.question`),
    answer: t(`first_challenge.faq.q${index + 1}.answer`, {
      duration,
      target_amount: targetAmount
    })
  }));

  return (
    <Modal
      hideTitle
      isOpen={isOpen}
      onClose={onClose}
      position="modal-middle"
      className="bg-transparent p-0"
    >
      <InnerSlogan
        title={t("firstChallenge.entry.title")}
        picture="/images/bonus_first_challenge/entry-icon.webp"
      />

      <InnerContainer>
        <InnerHeader title={t("first_challenge.faq.heading")} onClose={onClose} />

        <InnerContent>
          <div className="space-y-2">
            {items.map((item) => (
              <details
                key={item.id}
                className="group cursor-pointer rounded-lg bg-base-200 p-2 text-[14px] text-base-content/50"
              >
                <summary className="list-none select-none">
                  <h4 className="flex items-center justify-between gap-4 font-bold">
                    {item.question}
                    <div className="btn btn-primary btn-sm btn-soft btn-square shrink-0">
                      <ChevronRight className="h-3 w-3 transition-transform duration-200 group-open:rotate-90" strokeWidth={3} />
                    </div>
                  </h4>
                </summary>
                <p className="mt-2 whitespace-pre-line p-0 font-normal">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </InnerContent>
      </InnerContainer>
    </Modal>
  );
};

