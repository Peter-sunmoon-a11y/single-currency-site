import clsx from "clsx";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { useEffect, useState } from "react";
import { Paginate } from "@/sections/tournament/components/Paginate.tsx";
import { useBuddyBallsPlayList, useUserBuddyBallsHome } from "@/hooks/api/useAuth.ts";
import { useCurrencyData } from "@/hooks/useCurrency.ts";
import { useBoundStore } from "@/store";
import {
  InnerItemWrap
} from "@/sections/buddy-balls/components.tsx";
import dayjs from "dayjs";
import { NothingFound } from "@/components/ui/NothingFound.tsx";
import Decimal from "decimal.js";
import { DataLoading } from "@/components/standard/DataLoading.tsx";

export function RewardsHistory() {
  const { t } = useTranslation();

  const user = useBoundStore((state) => state.user);

  const { convertCurrency, formatCurrency, exchangeRates } = useCurrencyData();

  // 球游戏 -> 球游戏的主页信息
  const { data: buddy } = useUserBuddyBallsHome();

  const currency_fiat = (user?.currency_fiat ?? "USD");

  const [status, setStatus] = useState<Record<string, any>>({
    data: [],
    page: 1,
    limit: 10,
    last_id: "",
    is_jump_page: false
  });

  const { data, isFetching } = useBuddyBallsPlayList({
    page: status.page,
    limit: status.limit,
    last_id: ""
  });

  const bonus_amount_convert = formatCurrency({
    amount: convertCurrency({
      amount: Decimal(buddy?.data?.claimed_total_amount || 0).plus(buddy?.data?.processing_total_amount || 0).toString(),
      fromCurrency: "USDT",
      toCurrency: currency_fiat,
      exchangeRates
    }),
    currency: currency_fiat,
    showSymbol: false, showCode: true
  }).formatted;

  /**
   * TODO: 快速点击分页的时候会导致数据更新出问题,需要限制更新频率
   *       isFetching
   */
  useEffect(() => {
    if (isFetching) return;
    setStatus((v) => ({
      ...v,
      data: data?.data?.list ?? [],
      last_id: data?.last_id,
      is_jump_page: false
    }));
  }, [data, isFetching]);

  return (
    <div className="mb-20">
      <div className="px-2 flex items-center justify-between gap-1 text-sm font-semibold">
        {t("buddyBalls:rewards")}
        <div
          className={"text-primary font-bold text-base"}>
          <span>{bonus_amount_convert}</span>
        </div>
      </div>

      <div className={"relative rounded-lg bg-base-200 p-2 min-h-[180px]"}>
        <div className="space-y-1">
          {status.data.map((data: Record<string, any>, index: number) => {
            const bonus_amount = (data?.times || 0) * 0.01;
            const bonus_amount_convert = formatCurrency({
              amount: convertCurrency({
                amount: bonus_amount,
                fromCurrency: "USDT",
                toCurrency: currency_fiat,
                exchangeRates
              }),
              currency: currency_fiat,
              showSymbol: false, showCode: true
            }).formatted;

            return (
              <div
                key={index}
                className={clsx("flex flex-col gap-1 rounded-lg bg-base-300 p-2")}
              >
                {/* 彩金打码状态 */}
                <InnerItemWrap
                  label={t("buddyBalls:buddyBalls")}
                  value={
                    <div className={"flex flex-col text-primary"}>
                      ≈{" "}{bonus_amount_convert}
                    </div>
                  }
                />
                <span
                  className="text-xs text-base-content/50">
                    {dayjs((data?.play_time ?? 0) * 1000).format("DD MMM [']YY · HH:mm")}</span>
              </div>
            );
          })}
        </div>

        {isFetching && <DataLoading />}
        {!isFetching && Number(data?.data?.total || 0) === 0 && <NothingFound />}
      </div>

      {/* Pagination */}
      <Paginate
        page={status.page}
        limit={status.limit}
        disabled={isFetching}
        pageCount={Math.ceil((data?.data?.total || 0) / status.limit)}
        className="my-4"
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
  );
}
