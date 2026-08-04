import { type SelectOption } from "@/components/ui/Select";
import { useBoundStore } from "@/store";
import { useDisplayCurrency } from "@/contexts/DisplayCurrencyContext";
import { useGameCategories, useVipConfig } from "@/hooks/api/usePublic";
import { cn } from "@/utils/cn";
import { formatInputDisplay, isValidNumberInput } from "@/utils/format-number";
import Decimal from "decimal.js";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { ReferralHeroSection } from "@/sections/referral/referral-hero-section.tsx";
import { ReferralGuard } from "@/sections/referral/referral-guard.tsx";
import { TextBaseContent } from "@/components/standard/TextBaseContent.tsx";
import { SelectDropdown } from "@/components/modal/UserFinanceModal/c/SelectDropdown.tsx";
import { FormBox } from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";

type GameSelectOption = SelectOption & {
  spare?: string | number;
  name_key?: string;
};

type VipSelectOption = SelectOption & {
  spare?: string | number;
  vipLevel?: string;
};

const BASE_COMMISSION_RATE = new Decimal(0.01);

export const ReferralRatesAndRules = () => {
  const { t } = useTranslation(["referral", "common"]);
  const user = useBoundStore((state) => state.user);
  const status = useBoundStore((state) => state.status);
  const { selectedCurrency, getCurrencySymbol } = useDisplayCurrency();

  const [selectedReferralType, setSelectedReferralType] = useState<"direct" | "indirect">("direct");
  const [selectedWager, setSelectedWager] = useState<string>("1000");
  const [selectedGameCategory, setSelectedGameCategory] = useState<string>("");
  const [selectedDirectVip, setSelectedDirectVip] = useState<string>("");
  const [selectedIndirectSelfVip, setSelectedIndirectSelfVip] = useState<string>("");
  const [selectedIndirectHighestVip, setSelectedIndirectHighestVip] = useState<string>("");
  const infographicByType = useMemo(
    () => ({
      direct: "/images/referral_pages/direct-commission.png",
      indirect: "/images/referral_pages/indirect-commission.png"
    }),
    []
  );
  const activeInfographicSrc = infographicByType[selectedReferralType] ?? infographicByType.direct;
  const activeInfographicAlt =
    selectedReferralType === "indirect"
      ? t("referral:indirectInfographic", "Indirect referral commissions infographic")
      : t("referral:directInfographic", "Direct referral commissions infographic");

  const currencySymbol = getCurrencySymbol(selectedCurrency) || selectedCurrency;

  const {
    data: gameCategoriesData
  } = useGameCategories();
  const { data: vipConfigData, error: vipConfigError } = useVipConfig();

  const handleWagerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (!isValidNumberInput(inputValue, 2)) {
      return;
    }

    const numericValue = inputValue.replace(/,/g, "");
    if (numericValue === ".") {
      setSelectedWager("0.");
      return;
    }

    // remove leading 0s if not a decimal
    // Example: "02" -> "2", "002" -> "2", but "0.2" -> "0.2", "00.2" -> "0.2"
    let processedValue = numericValue;
    const dotIndex = numericValue.indexOf(".");
    if (dotIndex === -1) {
      // No dot: remove leading 0s
      // Example: "02" -> "2", "002" -> "2", "0" -> "0"
      processedValue = numericValue.replace(/^0+/, "") || "0";
    } else if (dotIndex > 0) {
      // If there is a dot: remove leading 0s from the integer part, keep "0" if needed
      // Example: "00.2" -> "0.2", "002.5" -> "2.5"
      const integerPart = numericValue.substring(0, dotIndex);
      const decimalPart = numericValue.substring(dotIndex);
      const cleanedInteger = integerPart.replace(/^0+/, "") || "0";
      processedValue = cleanedInteger + decimalPart;
    }
    // If it starts with "0." then keep it (dotIndex === 0)

    setSelectedWager(processedValue);
  };

  const gameOptions = useMemo(() => {
    return (gameCategoriesData?.data ?? [])
      .filter((gameType: any) => gameType?.parent_name_key === "-")
      .map((gameType: any) => {
        const baseLabel = String(t(`explore:${gameType.name_key}`, gameType.name || gameType.categoryName || gameType.title || ""));

        return {
          id: gameType.id,
          value: String(gameType.id),
          label: baseLabel,
          spare: gameType.group_rate,
          name_key: gameType.name_key
        };
      });
  }, [gameCategoriesData?.data, t]);

  const vipOptions = useMemo<VipSelectOption[]>(() => {
    if (vipConfigError || !vipConfigData?.data) {
      return [];
    }

    return (vipConfigData.data as any[]).map(
      (vipLevel) =>
        ({
          value: String(vipLevel.id),
          label: `VIP ${vipLevel.vip}`,
          spare: vipLevel.group,
          vipLevel: String(vipLevel.vip)
        }) satisfies VipSelectOption
    );
  }, [vipConfigData?.data, vipConfigError]);

  const defaultVipOption = useMemo(() => {
    if (!vipOptions.length) return undefined;
    const userVipLevel = status?.vip ? String(status.vip) : undefined;
    if (userVipLevel) {
      const matched = vipOptions.find((option) => option.vipLevel === userVipLevel);
      if (matched) {
        return matched;
      }
    }
    return vipOptions[0];
  }, [status?.vip, vipOptions]);

  useEffect(() => {
    if (!selectedGameCategory && gameOptions.length > 0) {
      setSelectedGameCategory(String(gameOptions[0].value));
    }
  }, [gameOptions, selectedGameCategory]);

  useEffect(() => {
    if (!vipOptions.length) {
      return;
    }

    if (!selectedDirectVip && defaultVipOption) {
      setSelectedDirectVip(String(defaultVipOption.value));
    }

    if (!selectedIndirectSelfVip && defaultVipOption) {
      setSelectedIndirectSelfVip(String(defaultVipOption.value));
    }

    if (!selectedIndirectHighestVip) {
      setSelectedIndirectHighestVip(String(vipOptions[0].value));
    }
  }, [defaultVipOption, selectedDirectVip, selectedIndirectSelfVip, selectedIndirectHighestVip, vipOptions]);

  const selectedGameOption = useMemo(
    () => gameOptions.find((option: any) => String(option.value) === selectedGameCategory),
    [gameOptions, selectedGameCategory]
  );
  const directVipOption = useMemo(
    () => vipOptions.find((option) => String(option.value) === selectedDirectVip),
    [vipOptions, selectedDirectVip]
  );
  const indirectSelfVipOption = useMemo(
    () => vipOptions.find((option) => String(option.value) === selectedIndirectSelfVip),
    [vipOptions, selectedIndirectSelfVip]
  );
  const indirectHighestVipOption = useMemo(
    () => vipOptions.find((option) => String(option.value) === selectedIndirectHighestVip),
    [vipOptions, selectedIndirectHighestVip]
  );

  const wagerDecimal = useMemo(() => {
    if (!selectedWager || selectedWager === "0." || selectedWager === ".") {
      return new Decimal(0);
    }

    try {
      return new Decimal(selectedWager);
    } catch (error) {
      console.warn("Invalid wager input", error);
      return new Decimal(0);
    }
  }, [selectedWager]);

  const gameRateDecimal = useMemo(() => {
    if (!selectedGameOption?.spare) return undefined;
    try {
      return new Decimal(selectedGameOption.spare);
    } catch (error) {
      console.warn("Invalid game rate", error);
      return undefined;
    }
  }, [selectedGameOption?.spare]);

  const directCommission = useMemo(() => {
    if (!directVipOption?.spare || !gameRateDecimal) {
      return new Decimal(0);
    }

    try {
      const vipRate = new Decimal(directVipOption.spare);
      if (vipRate.lte(0) || gameRateDecimal.lte(0) || wagerDecimal.lte(0)) {
        return new Decimal(0);
      }

      return wagerDecimal.mul(BASE_COMMISSION_RATE).mul(vipRate).mul(gameRateDecimal);
    } catch (error) {
      console.warn("Failed to calculate direct commission", error);
      return new Decimal(0);
    }
  }, [directVipOption?.spare, gameRateDecimal, wagerDecimal]);

  const indirectRateDifference = useMemo(() => {
    if (!indirectSelfVipOption?.spare || !indirectHighestVipOption?.spare) {
      return new Decimal(0);
    }

    try {
      const myRate = new Decimal(indirectSelfVipOption.spare);
      const highestRate = new Decimal(indirectHighestVipOption.spare);
      const diff = myRate.minus(highestRate);
      return diff.gt(0) ? diff : new Decimal(0);
    } catch (error) {
      console.warn("Failed to calculate indirect rate difference", error);
      return new Decimal(0);
    }
  }, [indirectHighestVipOption?.spare, indirectSelfVipOption?.spare]);

  const indirectCommission = useMemo(() => {
    if (!gameRateDecimal || wagerDecimal.lte(0) || indirectRateDifference.lte(0)) {
      return new Decimal(0);
    }

    return wagerDecimal.mul(BASE_COMMISSION_RATE).mul(indirectRateDifference).mul(gameRateDecimal);
  }, [gameRateDecimal, indirectRateDifference, wagerDecimal]);

  const commissionDecimal = selectedReferralType === "direct" ? directCommission : indirectCommission;

  const formattedCommissionValue = useMemo(() => {
    const value = commissionDecimal.gt(0) ? Number(commissionDecimal.toFixed(5)).toString() : "0.00";
    return formatInputDisplay(value, 5);
  }, [commissionDecimal]);

  const indirectSelfPercent = indirectSelfVipOption?.spare ? new Decimal(indirectSelfVipOption.spare).mul(100).toFixed(1) : undefined;
  const indirectHighestPercent = indirectHighestVipOption?.spare
    ? new Decimal(indirectHighestVipOption.spare).mul(100).toFixed(1)
    : undefined;
  const indirectDifferencePercent = indirectRateDifference.mul(100).toFixed(1);

  const showIndirectBreakdown = selectedReferralType === "indirect" && indirectSelfPercent && indirectHighestPercent;

  return (
    <ReferralGuard>
      {(referral_enable: boolean) => (
        <div className="p-4 flex flex-col gap-4">
          {/* 公共头部 */}
          <ReferralHeroSection referralEnable={referral_enable} />

          <h3 className="text-base font-bold">{t("referral:commissionCalculator")}</h3>

          <div className="relative flex flex-col gap-4">
            {/* ── 共用：类型切换 + 游戏选择 ── */}
            <div role="tablist" className="tabs tabs-box w-full">
              {(["direct", "indirect"] as const).map((type) => (
                <button
                  key={type}
                  role="tab"
                  className={cn("tab flex-1 font-bold text-sm", selectedReferralType === type && "tab-active text-primary")}
                  onClick={() => setSelectedReferralType(type)}
                >
                  {t(`referral:${type}`)}
                </button>
              ))}
            </div>

            <FormBox label={t("referral:gameType")}>
              <div className="relative">
                <SelectDropdown
                  title={t("referral:gameType")}
                  value={selectedGameCategory}
                  options={gameOptions as any}
                  onChange={(value) => setSelectedGameCategory(String(value))}
                  renderOption={(option) => {
                    const gameOption = option as GameSelectOption;
                    return (
                      <div className="flex justify-bwtween w-full">
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col">
                            <b className="font-bold text-sm">{gameOption.label}</b>
                          </div>
                        </div>
                        <div className="ml-auto text-xs text-base-content tabular-nums shrink-0 font-bold">
                          {gameOption.spare && new Decimal(gameOption.spare).mul(100).toFixed(2) + "%"}
                        </div>
                      </div>
                    );
                  }}
                />
                <div className="top-1/2 -translate-y-1/2 right-12 absolute text-xs text-primary font-bold">
                  {selectedGameOption?.spare && new Decimal(selectedGameOption?.spare ?? 0).mul(100).toFixed(2) + "%"}
                </div>
              </div>
            </FormBox>

            {/* ── Direct / Indirect 各自独立区块 ── */}
            {selectedReferralType === "direct" ? (
              <div className="flex flex-col gap-4">
                <TextBaseContent className={"text-primary text-xs"}
                                 text={t("referral:calculatorDirectDescription")} />

                <FormBox label={t("referral:wager")}>
                  <div className="flex items-center gap-4">
                    <label
                      className="font-bold input h-10 border-none flex items-center pr-1 bg-base-200">
                      <span className="text-primary text-sm">{user?.currency_fiat || selectedCurrency}</span>
                      <input
                        type="text"
                        value={formatInputDisplay(selectedWager, 2)}
                        onChange={handleWagerChange}
                        placeholder="0.00"
                      />
                    </label>
                    <p className={"italic text-lg font-bold"}>x1%</p>
                  </div>
                </FormBox>

                <FormBox label={t("referral:commissionRate")}>
                  <div className="relative">
                    <SelectDropdown
                      title={t("referral:gameType")}
                      value={selectedDirectVip}
                      options={vipOptions as any}
                      onChange={(value) => setSelectedDirectVip(String(value))}
                      renderOption={(option) => {
                        const gameOption = option as GameSelectOption;
                        return (
                          <div className="flex justify-bwtween w-full">
                            <div className="flex items-center gap-2">
                              <div className="flex flex-col">
                                <b className="font-bold text-sm">{gameOption.label}</b>
                              </div>
                            </div>
                            <div className="ml-auto text-xs text-base-content tabular-nums shrink-0 font-bold">
                              {gameOption.spare && new Decimal(gameOption.spare).mul(100).toFixed(2) + "%"}
                            </div>
                          </div>
                        );
                      }}
                    />
                    <div className="top-1/2 -translate-y-1/2 right-12 absolute text-xs text-primary font-bold">
                      {directVipOption?.spare && new Decimal(directVipOption?.spare ?? 0).mul(100).toFixed(2) + "%"}
                    </div>
                  </div>
                </FormBox>

                <div
                  className="text-primary badge badge-soft text-sm font-bold flex items-center justify-center w-full py-5">
                  {t("referral:commission")} = {currencySymbol}{formattedCommissionValue}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <FormBox label={t("referral:myCommissionRate")}>
                  <div className="relative">
                    <SelectDropdown
                      title={t("referral:gameType")}
                      value={selectedIndirectSelfVip}
                      options={vipOptions as any}
                      onChange={(value) => setSelectedIndirectSelfVip(String(value))}
                      renderOption={(option) => {
                        const gameOption = option as GameSelectOption;
                        return (
                          <div className="flex justify-bwtween w-full">
                            <div className="flex items-center gap-2">
                              <div className="flex flex-col">
                                <b className="font-bold text-sm">{gameOption.label}</b>
                              </div>
                            </div>
                            <div className="ml-auto text-xs text-base-content tabular-nums shrink-0 font-bold">
                              {gameOption.spare && new Decimal(gameOption.spare).mul(100).toFixed(2) + "%"}
                            </div>
                          </div>
                        );
                      }}
                    />
                    <div className="top-1/2 -translate-y-1/2 right-12 absolute text-xs text-primary font-bold">
                      {indirectSelfVipOption?.spare && new Decimal(indirectSelfVipOption?.spare ?? 0).mul(100).toFixed(2) + "%"}
                    </div>
                  </div>
                </FormBox>

                <FormBox label={t("referral:highestLevelInChain")}>
                  <div className="relative">
                    <SelectDropdown
                      title={t("referral:gameType")}
                      value={selectedIndirectHighestVip}
                      options={vipOptions as any}
                      onChange={(value) => setSelectedIndirectHighestVip(String(value))}
                      renderOption={(option) => {
                        const gameOption = option as GameSelectOption;
                        return (
                          <div className="flex justify-bwtween w-full">
                            <div className="flex items-center gap-2">
                              <div className="flex flex-col">
                                <b className="font-bold text-sm">{gameOption.label}</b>
                              </div>
                            </div>
                            <div className="ml-auto text-xs text-base-content tabular-nums shrink-0 font-bold">
                              {gameOption.spare && new Decimal(gameOption.spare).mul(100).toFixed(2) + "%"}
                            </div>
                          </div>
                        );
                      }}
                    />
                    <div className="top-1/2 -translate-y-1/2 right-12 absolute text-xs text-primary font-bold">
                      {indirectHighestVipOption?.spare && new Decimal(indirectHighestVipOption?.spare ?? 0).mul(100).toFixed(2) + "%"}
                    </div>
                  </div>
                </FormBox>

                <div className="text-xs text-primary space-y-2">
                  <p>{t("referral:yourIndirectCommissionIsBasedOnTwoKeyFactors")}</p>
                  <ol className="space-y-1">
                    <li>1. {t("referral:yourVIPLevelAndCommissionRate")}</li>
                    <li>2. {t("referral:theLevelOfReferrersBetweenYouAndThePlayer")}</li>
                  </ol>
                </div>

                <div className="flex flex-col lg:flex-row lg:flex-nowrap gap-3">
                  <FormBox label={t("referral:wager")}>
                    <div className="flex items-center gap-4">
                      <label
                        className="font-bold input h-10 border-none flex items-center pr-1 bg-base-200">
                        <span className="text-primary text-sm">{user?.currency_fiat || selectedCurrency}</span>
                        <input
                          type="text"
                          value={formatInputDisplay(selectedWager, 2)}
                          onChange={handleWagerChange}
                          placeholder="0.00"
                        />
                      </label>
                      <p className={"italic text-lg font-bold"}>x1%</p>
                    </div>
                  </FormBox>

                  <div
                    className="h-10 text-sm flex items-center justify-center gap-2">
                    <TextBaseContent text={t("referral:commissionRate")} />
                    {showIndirectBreakdown && (
                      <span>{indirectSelfPercent}% − {indirectHighestPercent}% = {indirectDifferencePercent}%</span>
                    )}
                  </div>

                  <div
                    className="text-primary badge badge-soft text-sm font-bold flex items-center justify-center w-full py-5">
                    {t("referral:commission")} = {currencySymbol}{formattedCommissionValue}
                  </div>
                </div>

                <TextBaseContent text={t("referral:calculatorDescription")} />
              </div>
            )}

            {/* ── 共用：infographic ── */}
            <div className="divider divider-start text-base font-bold text-primary italic gap-2">
              {t(`referral:${selectedReferralType}`)} {t("referral:referralCommissions")}
            </div>
            <div className="flex justify-center" data-infographic-container>
              <img
                key={selectedReferralType}
                src={activeInfographicSrc}
                loading="eager"
                decoding="async"
                alt={activeInfographicAlt}
              />
            </div>
            <TextBaseContent text={selectedReferralType === "direct"
              ? t("referral:referralCommissionsDirectDescription")
              : t("referral:referralCommissionsIndirectDescription")} />
          </div>

        </div>
      )}
    </ReferralGuard>
  );
};
