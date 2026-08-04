import { useIdleEnabled } from "@/hooks/useIdleEnabled";
import { getPaymentGatewayByUser, getPaymentIcons } from "@/services/auth/wallet";
import { useBoundStore } from "@/store";
import { ICachePaymentIcons } from "@/types/game";
import { useQuery } from "@tanstack/react-query";

export const usePaymentGatewayByUser = () => {
  const user = useBoundStore((state) => state.user);
  const enabled = useIdleEnabled(!!user);

  const { data, refetch } = useQuery<{ data: ICachePaymentIcons; code: number }>({
    queryKey: ["paymentGatewayByUser"],
    queryFn: () => getPaymentGatewayByUser(),
    enabled,
  });

  return {
    paymentGatewayByUser: data?.code === 0 ? data.data : undefined,
    refetch,
  };
};

export const usePaymentIcons = () => {
  const user = useBoundStore((state) => state.user);
  const enabled = useIdleEnabled(!user);

  const { data, refetch } = useQuery<{ data: ICachePaymentIcons; code: number }>({
    queryKey: ["paymentIcons"],
    queryFn: () => getPaymentIcons(),
    enabled,
  });

  return { paymentIcons: data?.code === 0 ? data.data : undefined, refetch };
};
