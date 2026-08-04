import { ESport } from "@/sections/dollars/components.tsx";
import clsx from "clsx";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { SelectDropdown } from "@/components/modal/UserFinanceModal/c/SelectDropdown.tsx";
import { FormBox } from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { Paginate } from "@/sections/tournament/components/Paginate.tsx";
import { useSportsBonusWalletHistory } from "@/hooks/api/useAuth.ts";
import { Decimal } from "decimal.js";
import { parser } from "@/components/header/message-v2/c/InnerMsgLink.tsx";
import { useCurrencyData } from "@/hooks/useCurrency.ts";
import { useBoundStore } from "@/store";
import { NothingFound } from "@/components/ui/NothingFound.tsx";
import { InnerSlogan } from "@/standard/modals/DemoLazyInfoModal.tsx";
import { DataLoading } from "@/components/standard/DataLoading.tsx";
import { getSportsBonusCampaignLabel, getSportsBonusPicture } from "@/sections/sports-bonus/assets.ts";

function History() {
  const { t } = useTranslation(['sportsBonus']);
  const campaignLabel = getSportsBonusCampaignLabel();
  const user = useBoundStore((state) => state.user);
  const { convertCurrency, formatCurrency, exchangeRates } = useCurrencyData();

  const currency_fiat = user?.currency_fiat ?? "USD";

  const [status, setStatus] = useState<Record<string, any>>({
    data: [],
    page: 1,
    limit: 10,
    option: 0,
    last_id: "",
    is_jump_page: false
  });

  const { data, isFetching } = useSportsBonusWalletHistory({
    page: status.page,
    limit: status.limit,
    status: status.option,
    last_id: ""
  });

  const options = useMemo(() => {
    return [
      { id: "0", value: 0, label: t("transaction:filters.all") },
      { id: "1", value: 1, label: t("bonus:status.ongoing") },
      { id: "2", value: 2, label: t("bonus:expires") },
      { id: "3", value: 3, label: t("bonus:status.claim") },
      { id: "4", value: 4, label: t("bonus:status.claimed") },
      { id: "5", value: 5, label: t("bonus:bonus_failure_end") }
    ];
  }, [t]);

  useEffect(() => {
    if (isFetching) return;
    setStatus((v) => ({
      ...v,
      data: data?.data ?? [],
      last_id: data?.last_id,
      is_jump_page: false
    }));
  }, [data, isFetching]);

  return (
    <div className="p-4">
      <InnerSlogan
        // 根据设计稿自行修改文字
        title={<>
          {t("sportsBonus:bonus")}
          {campaignLabel ? <p className="mt-2 text-sm font-semibold text-primary italic">{campaignLabel}</p> : null}
        </>}
        // 根据设计稿自行修改图片
        picture={getSportsBonusPicture()}
      />

      <div className="flex flex-col gap-2 mt-4">
        <FormBox label={t("transaction:filters.status")}>
          <SelectDropdown
            title={t("transaction:filters.status")}
            options={options}
            value={status.option}
            onChange={(option) => setStatus((v) => ({ ...v, option }))}
          />
        </FormBox>

        <div className="relative rounded-lg bg-base-200 p-2 min-h-[125px]">
          <div className="space-y-1">
            {status.data.map((row: Record<string, any>, index: number) => {
              const parsed_data = parser(row?.extra_data);
              const wager = formatCurrency({
                amount: convertCurrency({
                  amount: row?.wager || 0,
                  fromCurrency: ESport.TOKEN,
                  toCurrency: currency_fiat,
                  exchangeRates
                }),
                currency: currency_fiat,
                showSymbol: false,
                showCode: false
              }).formatted;
              const wager_require = formatCurrency({
                amount: convertCurrency({
                  amount: row?.wager_require || 0,
                  fromCurrency: ESport.TOKEN,
                  toCurrency: currency_fiat,
                  exchangeRates
                }),
                currency: currency_fiat,
                showSymbol: false,
                showCode: true
              }).formatted;

              return (
                <div
                  key={index}
                  className={clsx("flex flex-col gap-1 rounded-lg p-2 bg-base-300")}
                >
                  <InnerItemWrap
                    label={t("sportsBonus:sportsBonusStore")}
                    value={<InnerStatusWrap value={row?.status} />}
                    className={'italic'}
                  />

                  <InnerItemWrap
                    label={t("bonusStore:buyAmount")}
                    value={
                      <div className="flex flex-col items-end">
                        <span className="text-base-content font-bold">
                          {Decimal(parsed_data?.purchase_amount).toDP(18, Decimal.ROUND_DOWN).toString()}{" "}
                          {parsed_data?.purchase_currency}
                        </span>
                      </div>
                    }
                  />

                  <InnerItemWrap
                    label={t("bonus:bonus")}
                    value={
                      <div className="flex flex-col items-end">
                        <span className="text-base-content font-bold">
                          {Decimal(parsed_data?.bonus_amount).toDP(2, Decimal.ROUND_DOWN).toString()}{" "}
                          {ESport.TOKEN}
                        </span>
                      </div>
                    }
                  />

                  <InnerItemWrap
                    label={t("transaction:rollover.wagerRequirement")}
                    value={
                      <div className="flex flex-col items-end">
                        <span className="text-base-content font-bold">{wager_require}</span>
                      </div>
                    }
                  />

                  {row?.status !== 4 && (
                    <InnerItemWrap
                      className="text-base-content font-bold"
                      value={
                        <span>
                          {wager}{" "}/{" "}{wager_require}
                        </span>
                      }
                    />
                  )}

                  {row?.status === 4 && (
                    <InnerItemWrap
                      label={t("bonus:claimed")}
                      value={
                        <span className="text-base-content font-bold">
                          {Decimal(row?.claim_amount || 0).toDP(18, Decimal.ROUND_DOWN).toString()}{" "}
                          {row?.claim_currency}
                        </span>
                      }
                    />
                  )}
                </div>
              );
            })}
          </div>

          {isFetching && <DataLoading />}
          {!isFetching && Number(data?.total || 0) === 0 && (
            <NothingFound />
          )}
        </div>

        <Paginate
          page={status.page}
          limit={status.limit}
          disabled={isFetching}
          pageCount={Math.ceil((data?.total || 0) / status.limit)}
          className="my-2"
          onJumpPage={(page) => {
            setStatus((v) => ({ ...v, page, is_jump_page: true }));
          }}
          onPaginate={(page) => {
            setStatus((v) => ({ ...v, page, is_jump_page: false }));
          }}
        />
      </div>
    </div>
  );
}

const InnerItemWrap = ({
  label,
  value,
  className
}: {
  label?: string;
  value: ReactNode;
  className?: string;
}) => {
  return (
    <div className="flex items-center justify-between text-sm font-semibold text-base-content/50">
      <span className="truncate font-normal">{label}</span>
      <span className={clsx("text-end", className)}>{value}</span>
    </div>
  );
};

const InnerStatusWrap = ({ value }: { value: string }) => {
  const { t } = useTranslation();
  const cfg = STATUS_DESC[`status_${value}`] ?? STATUS_DESC.status_default;
  return (
    <div className={clsx("text-sm", cfg.style)}>
      {cfg.label ? t(cfg.label) : value}
    </div>
  );
};

const STATUS_DESC: Record<string, { style: string; label?: string }> = {
  status_1: { style: "border-info text-info", label: "bonus:status.ongoing" },
  status_2: { style: "border-error text-error", label: "bonus:expires" },
  status_3: { style: "border-primary text-primary-content bg-primary", label: "bonus:status.claim" },
  status_4: { style: "border-primary text-primary", label: "bonus:status.claimed" },
  status_5: { style: "border-error text-error", label: "bonus:bonus_failure_end" },
  status_7: { style: "border-error text-error", label: "bonus:bonus_give_up" },
  status_default: { style: "border-error text-error px-2" }
};

export const beforeLoad = undefined;

export default History;
