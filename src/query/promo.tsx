import { useTranslation } from "@/lib/i18n/react-i18next";
import { choicePromo, getPromoByPageV2 } from "@/services/auth/promo";
import { useBoundStore } from "@/store";
import { hasAuth } from "@/utils/auth.ts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useChoicePromo = () => {
  const { t } = useTranslation();

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (promo_record_id: number) => choicePromo({ promo_record_id }),
    onSuccess: (result) => {
      if (result.code === 0) {
        void queryClient.invalidateQueries({ queryKey: ["getPromoByPage"] });
      } else {
        toast.error(t("common:operationFailed"));
      }
    },
  });
};

export const useGetPromoByPage = (options?: { enabled?: boolean }) => {
  const user = useBoundStore((state) => state.user);
  const enabled = (options?.enabled ?? true) && !!user && hasAuth();

  const {
    data: currentPromoData = { data: null },
    isLoading,
    refetch,
  } = useQuery<any>({
    queryKey: ["getPromoByPage"],
    queryFn: () => getPromoByPageV2(),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled,
  });

  const data: any[] = Array.isArray(currentPromoData?.data) ? currentPromoData.data : [];

  return {
    currentPromo: data[0] ?? null,
    isFetching: isLoading,
    total: data.length,
    data,
    refetch,
  };
};
