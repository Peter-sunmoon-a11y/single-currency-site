import clsx from "clsx";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { useEffect, useState } from "react";
import { Paginate } from "@/sections/tournament/components/Paginate.tsx";
import { useBuddyBallsClaimList, useUserBuddyBallsHome } from "@/hooks/api/useAuth.ts";
import dayjs from "dayjs";
import { InnerItemWrap } from "@/sections/buddy-balls/components.tsx";
import { NothingFound } from "@/components/ui/NothingFound.tsx";
import { DataLoading } from "@/components/standard/DataLoading.tsx";

export function BallsHistory() {
  const { t } = useTranslation(["buddyBalls"]);

  // 球游戏 -> 球游戏的主页信息
  const { data: buddy } = useUserBuddyBallsHome();

  const [status, setStatus] = useState<Record<string, any>>({
    data: [],
    page: 1,
    limit: 10,
    last_id: "",
    is_jump_page: false
  });

  const { data, isFetching } = useBuddyBallsClaimList({
    page: status.page,
    limit: status.limit,
    last_id: ""
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
    <div className="mb-20">
      <div className="px-2 flex items-center justify-between gap-1 text-sm font-semibold">
        {t("buddyBalls:records")}
        <span
          className={"text-primary font-bold text-base"}>{buddy?.data?.total_claimed_balls || 0}</span>
      </div>

      <div className={"relative rounded-lg bg-base-200 p-2 min-h-[180px]"}>
        <div className="space-y-1">
          {status.data.map((data: Record<string, any>, index: number) => {
            return (
              <div
                key={index}
                className={clsx("flex flex-col gap-1 rounded-lg bg-base-300 p-2")}
              >
                <InnerItemWrap
                  label={t(`type_${data?.source}`)}
                  value={
                    <div className={"flex items-center gap-1 text-primary"}>
                      +{data?.ball}
                      <img src="/images/game_buddy_balls/ball.png" alt="" className={"w-4 h-4"} />
                    </div>
                  }
                />
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

