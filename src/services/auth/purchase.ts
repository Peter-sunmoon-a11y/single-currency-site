import authAxiosInstance from "@/lib/authAxios";

import type { ApiResponse } from "@/types/auth";

export async function userPurchaseBonus(purchase_amount: string, purchase_currency: string, bonus_config_id: string): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post(`/BonusWallet/purchase`, {
      purchase_amount,
      purchase_currency,
      bonus_config_id
    });
    return response.data;
}

  // 获取最近锦标赛排行榜
