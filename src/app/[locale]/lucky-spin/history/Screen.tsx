import {
  getPrizeImageUrl,
  InnerPrizeDisplay, maskUsername
} from "@/sections/lucky-spin/components.tsx";
import clsx from "clsx";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { useEffect, useState } from "react";
import { Paginate } from "@/sections/tournament/components/Paginate.tsx";
import { useAllSpinWinList } from "@/hooks/api/useAuth.ts";
import { parser } from "@/components/header/message-v2/c/InnerMsgLink.tsx";
import { NothingFound } from "@/components/ui/NothingFound.tsx";
import { DataLoading } from "@/components/standard/DataLoading.tsx";
import { InnerSlogan } from "@/standard/modals/DemoLazyInfoModal.tsx";

function History() {
  const { t } = useTranslation();

  const [status, setStatus] = useState<Record<string, any>>({
    data: [],
    page: 1,
    limit: 10,
    last_id: "",
    is_jump_page: false
  });

  const { data, isFetching } = useAllSpinWinList({
    page: status.page,
    limit: status.limit,
    sort_type: "latest"
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
    <div className="p-4">
      <InnerSlogan
        // 根据设计稿自行修改文字
        title={t("luckySpin:fortune")}
        // 根据设计稿自行修改图片
        picture="/images/game_lucky_spin/spins.png"
      />

      <div className={"flex flex-col gap-2 mt-4"}>
        <div className={"relative rounded-lg bg-base-200 p-2 min-h-[125px]"}>
          <div className="space-y-1">
            {/*<div className={"flex justify-between text-base-content/50 text-xs font-bold"}>*/}
            {/*  <span>USER</span>*/}
            {/*  <span>CLAIM</span>*/}
            {/*</div>*/}
            {status.data.map((data: Record<string, any>, index: number) => {
              const parsed_data = parser(data?.extra_data);
              return (
                <div
                  key={index}
                  className={clsx("flex rounded-field p-2 bg-base-300 text-sm justify-between font-semibold")}
                >
                  <div className="flex items-center gap-2">
                    <img src={getPrizeImageUrl(parsed_data)} alt="" className={"w-5 h-5"} />
                    <InnerPrizeDisplay data={parsed_data} />
                  </div>
                  <span className={"text-base-content/50"}>{maskUsername(data?.user_name)}</span>
                </div>
              );
            })}
          </div>

          {isFetching && <DataLoading />}
          {!isFetching && Number(data?.data?.total || 0) === 0 &&
            <NothingFound />}
        </div>

        {/* Pagination */}
        <Paginate
          page={status.page}
          limit={status.limit}
          disabled={isFetching}
          pageCount={Math.ceil((data?.data?.total || 0) / status.limit)}
          className="my-2"
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
export default History;

export const beforeLoad = undefined;
