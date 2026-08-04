import { useQuery } from "@tanstack/react-query";
import { getBannerContentList } from "@/services/public/banner";

export const special_activity_set = new Set(["1st_game_bonus_wallet"]);

export const useBannerContentList = () => {
  return useQuery({
    queryKey: ["bannerContentList"],
    queryFn: () => getBannerContentList(),
    refetchOnMount: true,
    placeholderData: (previousData) => previousData,
  });
};
