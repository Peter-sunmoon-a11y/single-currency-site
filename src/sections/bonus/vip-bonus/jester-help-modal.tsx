import { Modal } from "@/components/ui/Modal";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { useBaseConfig } from "@/hooks/api/usePublic";
import { useTranslation } from "@/lib/i18n/react-i18next";
import {
  InnerContainer,
  InnerContent,
  InnerDescription,
  InnerHeader,
  InnerSlogan,
} from "@/standard/modals/DemoLazyInfoModal.tsx";
import {
  formatJesterPrizeValue,
  getJesterPrizeAmountAndCurrency,
  getJesterPrizes,
  getJesterPrizeLabel,
  resolveJesterIntroConfig
} from "./jester-shared";

interface JesterHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JesterHelpModal = ({ isOpen, onClose }: JesterHelpModalProps) => {
  const { t } = useTranslation(["bonus", "vip"]);
  const { formatWithConversion } = useDisplayCurrencyFormatter();
  const { data: baseConfig } = useBaseConfig();

  const introConfig = resolveJesterIntroConfig(baseConfig?.data?.bonus_config?.joker_bonus?.intro_display);
  const prizes = getJesterPrizes(introConfig);

  return (
    <Modal
      hideTitle
      isOpen={isOpen}
      onClose={onClose}
      position="modal-middle"
      className="p-0 bg-transparent"
    >
      <InnerSlogan
        title={t("vip:jester")}
        picture="/images/bonus_jester/jester.svg"
      />

      <InnerContainer>
        <InnerHeader
          title={<>{t("bonus:bonus_details")}</>}
          onClose={onClose}
        />

        <InnerContent>
          <InnerDescription cls="!mt-0">{t("vip:jester_bonus_details_description")}</InnerDescription>

          <InnerDescription cls="">
            {t("vip:available_to_all_vips_level_and_above",{vip: baseConfig?.data?.bonus_config?.joker_bonus?.min_vip_level})}
          </InnerDescription>

          <div className="mt-2 grid grid-cols-2 gap-1">
            {prizes.map((item, index) => (
              <div key={`${getJesterPrizeLabel(item)}-${index}`} className="rounded-lg bg-base-200 p-2">
                <div className="text-xs uppercase text-base-content/50">
                  Prize
                </div>
                <div className="text-sm text-primary font-bold">
                  {(() => {
                    const prizeAmountAndCurrency = getJesterPrizeAmountAndCurrency(item);

                    if (prizeAmountAndCurrency) {
                      return formatWithConversion(prizeAmountAndCurrency.amount, prizeAmountAndCurrency.currency, {
                        compact: true,
                        showCode: true,
                        showSymbol: false
                      }).formatted;
                    }

                    return formatJesterPrizeValue(item);
                  })()}
                </div>
              </div>
            ))}
          </div>
        </InnerContent>
      </InnerContainer>
    </Modal>
  );
};
