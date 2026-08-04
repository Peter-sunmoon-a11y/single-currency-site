import clsx from "clsx";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { useEffect, useState } from "react";
import { Paginate } from "@/sections/tournament/components/Paginate.tsx";
import { useUserSpinChance } from "@/hooks/api/useAuth.ts";
import dayjs from "dayjs";
import { NothingFound } from "@/components/ui/NothingFound.tsx";
import { parser } from "@/components/header/message-v2/c/InnerMsgLink.tsx";
import { DataLoading } from "@/components/standard/DataLoading.tsx";

export function SpinsHistory() {
  const { t } = useTranslation(["buddyBalls"]);

  const [status, setStatus] = useState<Record<string, any>>({
    data: [],
    page: 1,
    limit: 10,
    last_id: "",
    is_jump_page: false
  });

  const { data, isFetching } = useUserSpinChance({
    page: status.page,
    limit: status.limit
  });

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
    <>
      <div className={"relative rounded-lg bg-base-200 p-2 min-h-[200px]"}>
        <div className="space-y-1">
          {status.data.map((data: Record<string, any>, index: number) => {
            const parsed_data = parser(data?.extra_data);
            return (
              <div
                key={index}
                className={clsx("flex rounded-field p-2 bg-base-300 text-sm justify-between font-semibold")}
              >
                <div className="flex items-center gap-2">
                  <img src={
                    parsed_data?.pool_level === "normal" ? "/images/game_lucky_spin/roulette1.png" : "/images/game_lucky_spin/roulette2.png"
                  } alt="" className={"w-5 h-5"} />
                  <div className="text-primary font-bold">
                    +{data?.times}{" "}{t(parsed_data?.pool_level ?? "")}
                  </div>
                </div>
                <span
                  className="text-xs text-base-content/50">
                    {dayjs((data?.created_at ?? 0) * 1000).format("DD MMM [']YY · HH:mm")}</span>
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
        className="my-5"
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
    </>
  );
}

