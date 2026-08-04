import { Modal } from "@/components/ui/Modal";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { Trans, useTranslation } from "@/lib/i18n/react-i18next";
import {
  InnerContainer,
  InnerContent,
  InnerDescription,
  InnerHeader,
  InnerSlogan, InnerTitle
} from "@/standard/modals/DemoLazyInfoModal.tsx";
import { useLuckyNumberConfig } from "@/hooks/api/usePublic";
import { Decimal } from "decimal.js";

const normalizeList = (value: unknown) => (Array.isArray(value) ? value : []);
const normalizeRecord = (value: unknown) => (value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {});
const toNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

interface BonusLuckyNumberHelpModalProps {
  data: Record<string, any>;
  isOpen: boolean;
  onClose: () => void;
}

export const BonusLuckyNumberHelpModal = ({ data, isOpen, onClose }: BonusLuckyNumberHelpModalProps) => {
  const { t } = useTranslation(["popup", "bonus", "mysteryBox"]);
  const { formatWithConversion } = useDisplayCurrencyFormatter();
  const { data: configResponse } = useLuckyNumberConfig();
  const luckyNumberConfig = configResponse?.data ?? {};
  const luckyDigit = toNumber(luckyNumberConfig?.lucky_digit);
  const rewardExpireDays = toNumber(luckyNumberConfig?.reward_expire_days);
  const levels = normalizeList(luckyNumberConfig?.levels);
  const returnRates = luckyNumberConfig?.return_rates;
  const ruleRows = levels.map((level) => ({
    level: toNumber(level),
    returnRates: toNumber(returnRates[level])
  }));
  console.info(luckyNumberConfig);
  const maxRewards = normalizeRecord(luckyNumberConfig?.max_rewards);
  console.info(maxRewards);
  const maxRewardLevel = Object.keys(maxRewards)
    .map((key) => toNumber(key))
    .sort((a, b) => a - b)
    .at(-1);
  console.info(maxRewards[String(maxRewardLevel)]);
  const maxRewardEntry = normalizeRecord(maxRewardLevel ? maxRewards[String(maxRewardLevel)] : undefined);
  console.info(maxRewardEntry); // {PHP: '200.00000000'}
  const maxReward = toNumber(maxRewardEntry?.[luckyNumberConfig?.cap_currency]);
  console.info(maxReward);
  return (
    <Modal
      hideTitle
      isOpen={isOpen}
      onClose={onClose}
      position="modal-middle"
      className="p-0 bg-transparent"
    >
      <InnerSlogan
        title={t("mysteryBox:lucky_number_title", { digit: "" })}
        picture={`/images/bonus_lucky7/number${luckyDigit}.png`}
      />

      <InnerContainer>
        <InnerHeader
          title={<>
            {t("bonus:bonus_details")}
          </>}
          onClose={onClose}
        />

        <InnerContent>
          <InnerDescription>
            <Trans i18nKey={"popup:luckySeven.description"} values={{ digit: luckyDigit }}
                   components={[<span className={"font-bold text-primary"} />]} />
          </InnerDescription>

          <InnerTitle title={t("popup:claim_distribution")} />
          <InnerDescription>{t("popup:luckySeven.generalTermsDesc5")}</InnerDescription>

          <InnerTitle title={t("popup:luckySeven.winningConditions")} />
          <InnerDescription>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs text-base-content/50 mb-1 px-2">
                <span>{t("popup:luckySeven.betIdEnding")}</span>
                <span>{t("popup:luckySeven.bonusReward")}</span>
              </div>
              {ruleRows.map((row) => (
                <div key={row.level}
                     className="bg-base-300 rounded-field px-2 py-1 flex justify-between items-center gap-3">
                  <span className="text-sm text-base-content/50 font-medium italic">
                    {String(luckyDigit).repeat(Math.max(1, row.level))}
                  </span>
                  <span className="text-sm text-primary font-semibold text-right">
                    {t("popup:luckySeven.condition1", { percent: Decimal(row.returnRates).div(100).toDP(2, Decimal.ROUND_DOWN) +' x' })}
                  </span>
                </div>
              ))}
            </div>
          </InnerDescription>

          <InnerTitle title={t("popup:deposit.expiration")} />

          <InnerDescription>
            {t("popup:luckySeven.generalTermsDesc6", { days: rewardExpireDays })}
          </InnerDescription>

          <InnerTitle title={t("popup:deposit.generalTerms")} />
          <InnerDescription>{t("popup:luckySeven.generalTermsDesc1",{digit:luckyDigit})}</InnerDescription>
          <InnerDescription>
            <Trans
              i18nKey="popup:luckySeven.generalTermsDesc2"
              values={{ money: formatWithConversion(maxReward, luckyNumberConfig?.cap_currency, { showCode: true, showSymbol: false }).formatted }}
              components={[<span className="font-bold text-primary" />]}
            />
          </InnerDescription>
          <InnerDescription>{t("popup:luckySeven.generalTermsDesc7",{level:data?.level })}</InnerDescription>
          <InnerDescription>{t("popup:luckySeven.generalTermsDesc3")}</InnerDescription>
          <InnerDescription>{t("popup:luckySeven.generalTermsDesc4")}</InnerDescription>
        </InnerContent>
      </InnerContainer>
    </Modal>
  );
};
