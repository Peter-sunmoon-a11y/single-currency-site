import authAxiosInstance from "@/lib/authAxios";

import type { ApiResponse } from "@/types/auth";

export async function getSportsBonusWallet(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get(`/SportsBonusWallet/index`);
    return response.data;
}

  // 体育彩金类型列表

export async function getSportsBonusConfigList(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get("/SportsBonusWallet/purchaseConfigList");
    return response.data;
}

  // 体育彩金禁区判断(按请求 IP 所在区域)

export async function getSportsBonusIsRegionBanned(): Promise<ApiResponse<{ is_region_banned: 0 | 1 }>> {
    const response = await authAxiosInstance.get("/SportsBonusWallet/isRegionBanned");
    return response.data;
}

  // 用户购买体育彩金

export async function userPurchaseSportsBonus(purchase_amount: string, purchase_currency: string, bonus_config_id: string): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post(`/SportsBonusWallet/purchase`, {
      purchase_amount,
      purchase_currency,
      bonus_config_id
    });
    return response.data;
}

  // 提取体育彩金账户收益

export async function claimSportsBonusWallet(id: string, currency: string): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get(`/SportsBonusWallet/claim?id=${id}&claim_currency=${currency}`);
    return response.data;
}

  // 用户放弃体育彩金

export async function userAbandonSport(id: string): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get(`/SportsBonusWallet/abandonBonus?id=${id}`);
    return response.data;
}

  // 体育彩金最近操作记录

export async function userSportsBonusLatestHistory(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get(`/SportsBonusWallet/latestHistoryData`);
    return response.data;
}

  // 体育彩金完整记录

export async function getSportsBonusWalletHistory(params: {
    page: number;
    limit: number;
    status: string;
    last_id?: string;
  }): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get(`/SportsBonusWallet/historyList?limit=${params.limit}&page=${params.page}&last_id=${params.last_id}&status=${params.status}`);
    return response.data;
}

  // 体育彩金购买/领取流水(Transactions 页面用)

export async function getSportsBonusWalletRecords(query?: Record<string, any>): Promise<ApiResponse<any>> {
    const endpoint = query
      ? `/SportsBonusWallet/transactionsList?${new URLSearchParams(query)}`
      : "/SportsBonusWallet/transactionsList";
    const response = await authAxiosInstance.get(endpoint);
    return response.data;
}

  // 球游戏 -> 球游戏的主页信息
