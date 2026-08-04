"use client";

import { Modal } from "@/components/ui/Modal";
import { useTieredFirstDepositSummary } from "@/hooks/api/useAuth.ts";
import { useCurrencyData } from "@/hooks/useCurrency.ts";
import { Trans, useTranslation } from "@/lib/i18n/react-i18next";
import { normalizeTieredFirstDepositSummary } from "./tiered-first-deposit-shared";
import {
  InnerContainer,
  InnerContent,
  InnerDescription,
  InnerHeader,
  InnerSlogan,
  InnerTitle
} from "@/standard/modals/DemoLazyInfoModal.tsx";
import { TextBaseContent } from "@/components/standard/TextBaseContent.tsx";

interface TieredFirstDepositInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TieredFirstDepositInfoModal = ({ isOpen, onClose }: TieredFirstDepositInfoModalProps) => {
  const { t } = useTranslation("bonus");
  const { data } = useTieredFirstDepositSummary();
  const { formatCurrency } = useCurrencyData();
  const summary = normalizeTieredFirstDepositSummary(data?.data);

  const tiers = [...(summary?.tiers ?? [])].sort((a, b) => Number(a.threshold_amount) - Number(b.threshold_amount));

  return (
    <Modal
      hideTitle
      isOpen={isOpen}
      onClose={onClose}
      position="modal-middle"
      className="bg-transparent p-0"
    >
      <InnerSlogan
        // 根据设计稿自行修改文字
        title={t("tieredFirstDeposit.deposit_prompt.title")}
        // 根据设计稿自行修改图片
        picture="/images/bonus_deposit_tiered/logo.png"
      />


      <InnerContainer>
        <InnerHeader
          title={<>
            {/* 根据设计稿自行修改文字 */}
            {t("bonus:bonus_details")}
          </>}
          onClose={onClose}
        />

        <InnerContent>
          <InnerDescription cls={"!mt-0"}>
            {t("tieredFirstDeposit.details.intro_desc")}
          </InnerDescription>

          <InnerTitle title={t("tieredFirstDeposit.details.reward_tiers_title")} />

          <InnerDescription>
            <div className="grid grid-cols-2 gap-0.5">
              {tiers.length > 0 ? tiers.map((tier) => (
                <div key={tier.seq} className="rounded-lg bg-base-200 p-2">
                  <div className="flex flex-col gap-1">
                    <div className="flex gap-0.5 items-center">
                      <TextBaseContent className={"text-xs"} text={t("tieredFirstDeposit.deposit")} />
                      /
                      <TextBaseContent className={"text-xs"} text={t("tieredFirstDeposit.reward")} />
                    </div>
                    <div className="flex gap-0.5 items-center">
                      <div className="text-sm font-bold">
                        {formatCurrency({
                          amount: tier.threshold_amount,
                          currency: summary?.config_currency || "USDT",
                          showCode: false,
                          showSymbol: true
                        }).formatted}
                      </div>
                      /
                      <div className="text-sm font-bold text-primary">
                        {formatCurrency({
                          amount: tier.reward_amount,
                          currency: summary?.config_currency || "USDT",
                          showCode: false,
                          showSymbol: true
                        }).formatted}
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <TextBaseContent text={t("tieredFirstDeposit.no_tiers")} className="rounded-lg bg-base-200 p-2" />
              )}
            </div>
          </InnerDescription>

          <InnerTitle title={t("tieredFirstDeposit.details.how_it_works_title")} />
          <InnerDescription>
            <Trans i18nKey={"bonus:tieredFirstDeposit.details.how_it_works_desc"} />
          </InnerDescription>

          <InnerTitle title={t("tieredFirstDeposit.details.claim_distribution_title")} />
          <InnerDescription>
            <Trans i18nKey={"bonus:tieredFirstDeposit.details.claim_distribution_desc"} />
          </InnerDescription>

          <InnerTitle title={t("tieredFirstDeposit.details.general_terms_title")} />
          <InnerDescription>
            <Trans i18nKey={"bonus:tieredFirstDeposit.details.general_terms_1"} />
          </InnerDescription>

        </InnerContent>
      </InnerContainer>

    </Modal>
  );
};
