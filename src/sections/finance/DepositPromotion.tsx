import { useGetPromoByPage } from "@/query/promo.tsx";
import { useCallback, useEffect } from "react";
import { userAddDailyFirstDepositBonus } from "@/services/auth/bonus";
import { useBoundStore } from "@/store";
import { scheduleIdle } from "@/utils/helper";
import { useQueryClient } from "@tanstack/react-query";

const getDepositPromotionHandledKey = (userId: number | string) => ["depositPromotionHandled", String(userId)] as const;

export const DepositPromotion = () => {
  const user = useBoundStore((state) => state.user);
  const queryClient = useQueryClient();

  const { refetch: refetchPromotion } = useGetPromoByPage({ enabled: false });

  // promo code - DFD
  const handle = useCallback(async () => {
    if (!user?.id) return;

    // TODO: 这个就是防止多次触发这个接口的措施
    // 用 React Query cache 做会话内去重，避免路由切换导致组件重挂载后重复触发。
    const handledKey = getDepositPromotionHandledKey(user.id);
    // 用 React Query cache 做会话内去重，避免路由切换导致组件重挂载后重复触发。
    if (queryClient.getQueryData(handledKey)) return;

    queryClient.setQueryData(handledKey, true);

    try {
      await userAddDailyFirstDepositBonus();

      await refetchPromotion();
    } catch (error) {
      queryClient.removeQueries({ queryKey: handledKey, exact: true });
      console.info(error);
    }
  }, [queryClient, refetchPromotion, user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    return scheduleIdle(() => {
      void handle();
    });
  }, [handle, user?.id]);


  return null;
};
