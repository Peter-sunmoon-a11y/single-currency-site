import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";
import { groupBy } from "es-toolkit";
import { InnerMsgItem } from "./c/InnerMsgItem.tsx";
import { useNotificationMessage, useUnreadNotificationCounter } from "@/hooks/api/useAuth.ts";
import { setNotificationMessageRead } from "@/services/auth/notification";
import {
  InnerContentVisible,
  InnerDataLabel,
  InnerDisplayContent,
} from "@/components/header/message-v2/c/InnerComponents.tsx";
import { NothingFound } from "@/components/ui/NothingFound.tsx";

dayjs.extend(isToday);
dayjs.extend(isYesterday);

const today = (timestamp: number) => dayjs(timestamp).isToday();
const yesterday = (timestamp: number) => dayjs(timestamp).isYesterday();

type TView = `view_${number}`;
type TRead = `read_${number}`;

const Index = ({ status, className, onClose }: { status: boolean, className?: string, onClose?: () => void }) => {
  const observerTarget = useRef<HTMLDivElement>(null);

  const { data: data, isFetching, fetchNextPage } = useNotificationMessage({ read: -1 }, status);

  const { refetch: unreadCounterRefetch } = useUnreadNotificationCounter();

  const [statement, setStatement] = useState<{
    [key: TView | TRead]: boolean;
  } | null>(null);

  const combine = useMemo(() => {
    const a = data?.pages?.flatMap((page: any) => page?.messages ?? []) ?? [];
    const b = groupBy(a, (v) => {
      if (yesterday(v?.created_at * 1000)) return "older";
      if (today(v?.created_at * 1000)) return "today";
      return "earlier";
    });
    return [a, b];
  }, [data]) as [
    Record<string, any>[],
    {
      today: Record<string, any>[],
      earlier: Record<string, any>[],
      older: Record<string, any>[]
    }];

  // 全局消息的读取状态匹配
  const global_read_messages = useMemo(() => {
    return data?.pages?.flatMap((page: any) => page?.global_read_messages ?? []) ?? [];
  }, [data]);

  const handle = useCallback((notification: Record<string, any>) => {
    setStatement((v) => ({
      ...v,
      ["view_" + notification.id]: !v?.[("view_" + notification.id) as TView],
      ["read_" + notification.id]: true
    }));

    // 全局消息处理已读
    if (notification.is_global) {
      const find = global_read_messages?.find((m: Record<string, any>) => m.message_id === notification?.id);
      if (!find) func(notification.id);
      return;
    }

    // 普通消息处理已读
    if (!notification.is_read) {
      func(notification.id);
      return;
    }
  }, [global_read_messages]);

  const func = (id: string) => {
    setNotificationMessageRead({ ids: id }).then((res) => { // 已读
      if (res.success) void unreadCounterRefetch();
    });
  };

  // 触底加载，交叉观察
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const has_more = (data?.pages ?? []).at(-1)?.meta?.has_more; // 还有更多数据
        if (entries[0].isIntersecting && has_more && !isFetching) void fetchNextPage();
      }, {
        threshold: 0.1
      }
    );

    if (observerTarget.current) observer.observe(observerTarget.current);

    return () => {
      observerTarget.current && observer.unobserve(observerTarget.current);
    };
  }, [data, isFetching]);

  return (
    <div className={clsx("overflow-y-auto hide-scrollbar ", className)}>
      {combine[0].length === 0 && !isFetching && <NothingFound className={"static h-25"} />}

      <div className="flex flex-col gap-2">
        {Object.keys(combine[1]).map((key) => (
          <div key={key} className="flex flex-col gap-1">
            <InnerDisplayContent show={(combine[1]?.[key as "today" | "earlier" | "older"] ?? []).length > 0}>
              <InnerDataLabel label={key} />
            </InnerDisplayContent>
            {((combine[1] as any)?.[key] ?? []).map((item: Record<string, any>, i: number) => {
              return (
                <InnerMsgItem
                  i={i}
                  key={item.id}
                  item={item}
                  handle={() => handle(item)}
                  statement={statement}
                  resetAnimate={true}
                  dataMatching={global_read_messages}
                  onClose={onClose}
                />
              );
            })}
          </div>))}
        <div ref={observerTarget} className="h-25">
          <InnerContentVisible show={isFetching} className={"flex justify-center h-full"}>
            <div className="loading loading-spinner loading-xs"></div>
          </InnerContentVisible>
        </div>
      </div>
    </div>
  );
};

export default Index;
