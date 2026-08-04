import {
  EBonus
} from "@/sections/dollars/components.tsx";
import clsx from "clsx";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { SelectDropdown } from "@/components/modal/UserFinanceModal/c/SelectDropdown.tsx";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { Paginate } from "@/sections/tournament/components/Paginate.tsx";
import { useBonusWalletHistory } from "@/hooks/api/useAuth.ts";
import { Decimal } from "decimal.js";
import { parser } from "@/components/header/message-v2/c/InnerMsgLink.tsx";
import { useCurrencyData } from "@/hooks/useCurrency.ts";
import { useBoundStore } from "@/store";
import { NothingFound } from "@/components/ui/NothingFound.tsx";
import { InnerSlogan } from "@/standard/modals/DemoLazyInfoModal.tsx";
import { DataLoading } from "@/components/standard/DataLoading.tsx";

function History() {
  const { t } = useTranslation(["bonusStore", "transaction"]);

  const user = useBoundStore((state) => state.user);

  const { convertCurrency, formatCurrency, exchangeRates } = useCurrencyData();

  const currency_fiat = (user?.currency_fiat ?? "USD");

  const [status, setStatus] = useState<Record<string, any>>({
    data: [],
    page: 1,
    limit: 10,
    option: 0,
    last_id: "",
    is_jump_page: false
  });

  const { data, isFetching } = useBonusWalletHistory({
    page: status.page,
    limit: status.limit,
    status: status.option,
    last_id: ""
  });

  const options = useMemo(() => {
    return [
      {
        id: "0",
        value: 0,
        label: t(EBonusStatus["0"]) // "进行中"
      },
      {
        id: "1",
        value: 1,
        label: t(EBonusStatus["1"]) // "进行中"
      },
      {
        id: "2",
        value: 2,
        label: t(EBonusStatus["2"]) // "过期"
      },
      {
        id: "3",
        value: 3,
        label: t(EBonusStatus["3"]) // "待领取"
      },
      {
        id: "4",
        value: 4,
        label: t(EBonusStatus["4"]) // "已领取"
      },
      {
        id: "5",
        value: 5,
        label: t(EBonusStatus["5"]) // "失败结束"
      }
    ];
  }, [t]);

  /**
   * TODO: 快速点击分页的时候会导致数据更新出问题,需要限制更新频率
   *       isFetching
   */
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
        title={t("bonus:slotBonus")}
        // 根据设计稿自行修改图片
        picture="/images/bonus_store/bonus-store.png"
      />

      <div className={"flex flex-col gap-2 mt-4"}>
        <SelectDropdown
          title={t("transaction:filters.status")}
          options={options}
          value={status.option}
          onChange={(option) => setStatus((v) => ({ ...v, option }))}
        />

        <div className={"relative rounded-lg bg-base-200 p-2 min-h-[125px]"}>
          <div className="space-y-1">
            {status.data.map((data: Record<string, any>, index: number) => {
              const parsed_data = parser(data?.extra_data);
              const wager = formatCurrency({
                amount: convertCurrency({
                  amount: data?.wager || 0,
                  fromCurrency: EBonus.TOKEN,
                  toCurrency: currency_fiat,
                  exchangeRates
                }),
                currency: currency_fiat,
                showSymbol: false, showCode: false
              }).formatted;
              const wager_require = formatCurrency({
                amount: convertCurrency({
                  amount: data?.wager_require || 0,
                  fromCurrency: EBonus.TOKEN,
                  toCurrency: currency_fiat,
                  exchangeRates
                }),
                currency: currency_fiat,
                showSymbol: false, showCode: true
              }).formatted;

              return (
                <div
                  key={index}
                  className={clsx("flex flex-col gap-1 rounded-lg p-2 bg-base-300")}
                >
                  {/* 彩金打码状态 */}
                  <InnerItemWrap
                    label={t("bonus:bonusStore")}
                    value={<InnerStatusWrap value={data?.status} />}
                    className={'italic'}
                  />

                  {/* 花了多少钱购买彩金 */}
                  <InnerItemWrap
                    label={t("bonusStore:buyAmount")}
                    value={<div className={"flex flex-col items-end"}>
                      <span
                        className="text-base-content font-bold">
                        {Decimal(parsed_data?.purchase_amount).toDP(18, Decimal.ROUND_DOWN).toString()}{" "}{parsed_data?.purchase_currency}
                      </span>
                    </div>}
                  />

                  {/* 购买的彩金数量 */}
                  <InnerItemWrap
                    label={t("bonus:bonus")}
                    value={
                      <div className={"flex flex-col items-end"}>
                        <span
                          className="text-base-content font-bold">{Decimal(parsed_data?.bonus_amount).toDP(2, Decimal.ROUND_DOWN).toString()}{" "}{EBonus.TOKEN}</span>
                      </div>}
                  />

                  {/* 打码要求 */}
                  <InnerItemWrap
                    label={t("transaction:rollover.wagerRequirement")}
                    value={
                      <div className={"flex flex-col items-end"}>
                      <span
                        className="text-base-content font-bold">{wager_require}</span>
                      </div>}
                  />

                  {/* 打码进度 */}
                  {data?.status !== 4 && <InnerItemWrap
                    className={"text-base-content font-bold"}
                    value={<span>{wager}{" "}/{" "}{wager_require}</span>}
                  />}

                  {/* 奖励领取 */}
                  {data?.status === 4 && <InnerItemWrap
                    label={t("bonus:claimed")}
                    value={
                      <span
                        className="text-base-content font-bold">{Decimal(data?.claim_amount || 0).toDP(18, Decimal.ROUND_DOWN).toString()}{" "}{data?.claim_currency}</span>
                    }
                  />}
                </div>
              );
            })}
          </div>

          {isFetching && <DataLoading />}
          {!isFetching && Number(data?.total || 0) === 0 && <NothingFound />}
        </div>

        {/* Pagination */}
        <Paginate
          page={status.page}
          limit={status.limit}
          disabled={isFetching}
          className="mb-4 mt-2"
          pageCount={Math.ceil((data?.total || 0) / status.limit)}
          onJumpPage={(page) => {
            setStatus((v) => ({
              ...v,
              page,
              is_jump_page: true
            }));
          }}
          onPaginate={(page) => {
            setStatus((v) => ({ ...v, page, is_jump_page: false }));
          }} />
      </div>
    </div>
  );
}

const InnerItemWrap = ({ label, value, className }: { label?: string, value: ReactNode, className?: string }) => {
  return <div className="flex items-center justify-between text-sm font-semibold text-base-content/50">
    <span className={"truncate"}>{label}</span>
    <span className={clsx("text-end", className)}>{value}</span>
  </div>;
};

const InnerStatusWrap = ({ value }: { value: string }) => {
  const { t } = useTranslation("bonusStore");
  return <div
    className={clsx("text-sm", STATUS_DESC[`status_${value}`]?.style ?? STATUS_DESC.status_default.style)}>
    {t(STATUS_DESC[`status_${value}`]?.label ?? value)}
  </div>;
};

enum EBonusStatus {
  "transaction:filters.all" = 0,
  "bonus:status.ongoing" = 1,
  "bonus:expires" = 2,
  "bonus:status.claim" = 3,
  "bonus:status.claimed" = 4,
  "bonus:bonus_failure_end" = 5,
  "bonus:bonus_give_up" = 7,
}

const STATUS_DESC: Record<string, any> = {
  status_1: {
    style: "border-info text-info",
    label: EBonusStatus["1"]
  },
  status_2: {
    style: "border-error text-error",
    label: EBonusStatus["2"]
  },
  status_3: {
    style: "border-primary text-primary-content bg-primary",
    label: EBonusStatus["3"]
  },
  status_4: {
    style: "border-primary text-primary",
    label: EBonusStatus["4"]
  },
  status_5: {
    style: "border-error text-error",
    label: EBonusStatus["5"]
  },
  status_7: {
    style: "border-error text-error",
    label: EBonusStatus["7"]
  },
  status_default: {
    style: "border-error text-error px-2",
    label: undefined
  }
};

export const beforeLoad = undefined;

export default History;
