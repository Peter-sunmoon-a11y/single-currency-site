import { useCallback, useEffect } from "react";
import { useBoundStore } from "@/store";
import { useEarliestPendingRecord } from "@/query/free-spins";
import { useMqttEvent } from "@/contexts/mqtt";
import { useQueryClient } from "@tanstack/react-query";
import { AUTH_QUERY_KEYS } from "@/hooks/api/useAuth.ts";
import { useIdleEnabled } from "@/hooks/useIdleEnabled";

type FreeSpinEventPayload = {
  record_id?: string;
};

export const FreeSpinContainer = () => {
  const user = useBoundStore((state) => state.user);
  const queryClient = useQueryClient();
  const idleReady = useIdleEnabled(!!user);
  const {
    data: earliestPendingRecord,
    refetch: refetchEarliestPendingRecord
  } = useEarliestPendingRecord("home", idleReady);

  const openModal = useBoundStore((s) => s.openModal);

  useEffect(() => {

    if (!user?.id || !earliestPendingRecord?.can_enable) return;

    const key = `free_spin_shown_${earliestPendingRecord.id}`;

    if (sessionStorage.getItem(key)) return;

    sessionStorage.setItem(key, "1");

    openModal("OPEN_FREE_SPIN_MODAL", {
      freeSpinData: earliestPendingRecord || undefined
    });
  }, [user?.id, earliestPendingRecord?.can_enable, earliestPendingRecord?.id]);

  // TODO: 事件通知
  //       服务于bonus页面手动优惠码需求,确保FreeSpins有数据了再完成跳转,用户可以第一时间在首页看到FreeSpins
  //       EMQX - 优惠码使用结果通知
  const handleRefetch = useCallback(() => {
    void refetchEarliestPendingRecord();
    void queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.userFreeGameRecords });
  }, [queryClient, refetchEarliestPendingRecord]);

  useMqttEvent<FreeSpinEventPayload>(
    user?.id ? `user/${user.id}/free_spin` : null,
    (message) => {
      if (!message.parsed?.record_id) return;
      handleRefetch();
    }
  );

  useMqttEvent<FreeSpinEventPayload>(
    user?.id ? `user/${user.id}/createFreespin` : null,
    (message) => {
      if (!message.parsed?.record_id) return;
      handleRefetch();
    }
  );

  return null;
};
