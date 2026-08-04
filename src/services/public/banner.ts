import publicAxiosInstance from "@/lib/publicAxios";
import type { ApiResponse } from "@/types/auth";

export async function getMainBannerContent(lang: string): Promise<ApiResponse<any>> {
    const response = await publicAxiosInstance.get(`/Authentication/getBannerContent?lang=${lang}`);
    return response.data;
}

  /**
   * 获取全球实时奖励数据
   */

export async function getBannerContentList(): Promise<ApiResponse<any>> {
    const response = await publicAxiosInstance.get("/Banner/list");
    return response.data;
}

  // BuddyBalls/dailyCheckInConfig
