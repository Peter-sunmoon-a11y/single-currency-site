import { useAllSpinWinList } from "@/hooks/api/useAuth.ts";
import {
  getPrizeImageUrl,
  InnerDataCard, InnerPrizeDisplay, maskUsername
} from "@/sections/lucky-spin/components.tsx";
import { parser } from "@/components/header/message-v2/c/InnerMsgLink.tsx";
import { useState, useEffect } from "react";
import { useAppNavigate } from "@/hooks/useAppNavigate";

export function SpinsNotify() {

  const navigate = useAppNavigate();
  // 幸运盘 -> 奖池详情接口
  const { data: spinWinList } = useAllSpinWinList({ page: 1, limit: 20, sort_type: "latest" });

  const [index, setIndex] = useState<number>(0);

  const spin_win_list = spinWinList?.data?.list ?? [];

  useEffect(() => {
    if (spin_win_list.length <= 1) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % spin_win_list.length);
    }, 3_000);

    return () => clearInterval(interval);
  }, [spin_win_list.length]);

  return (
    spin_win_list.length > 0 && <div className="relative h-[52px] overflow-hidden">
      <div
        className="transition-transform duration-700 ease-in-out"
        style={{ transform: `translateY(-${index * 52}px)` }}
      >
        {spin_win_list.map((item: Record<string, any>) => {
          const parsed_data = parser(item?.extra_data);
          return (
            <div key={item?.id} className={'cursor-pointer'} onClick={() => void navigate({ to: "/lucky-spin/history" })}>
              <InnerDataCard className="text-sm">
                <div className="text-base-content/70">
                  {maskUsername(item?.user_name)}
                </div>
                <div className="text-primary flex items-center gap-2">
                  <img src={getPrizeImageUrl(parsed_data)} alt="" className={"w-5 h-5"} />
                  <InnerPrizeDisplay data={parsed_data} />
                </div>
              </InnerDataCard>
            </div>
          );
        })}
      </div>
    </div>
  );
}