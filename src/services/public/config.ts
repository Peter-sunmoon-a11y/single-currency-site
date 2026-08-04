import publicAxiosInstance from "@/lib/publicAxios";
import type { ApiResponse } from "@/types/auth";

export async function getAggregationConfig(lang?: string): Promise<ApiResponse<any>> {
    const params: Record<string, string> = {};

    if (lang) {
      params.lang = lang;
    }

    const response = await publicAxiosInstance.get<ApiResponse<any>>("/TelegramBot/baseUrlAgg", { params });
    return response.data;
}

export async function getSupportedLanguages(): Promise<any> {
    const response = await publicAxiosInstance.get<any>("/Language/getLanguageList");

    if (response.data.code !== 0) {
      throw new Error(response.data.msg || "Failed to get supported languages");
    }

    return response.data.data;
}

  /**
   * 获取最大赢家游戏订单
   * @param lang 语言，默认英文
   * @returns 最大赢家游戏订单
   */

export async function getSupportedGameCurrencies(): Promise<ApiResponse<any>> {
    const response = await publicAxiosInstance.get<ApiResponse<any>>("/Currency/gameCurrency");

    if (response.data.code !== 0) {
      throw new Error(response.data.msg || "Failed to get supported game currencies");
    }

    return response.data;
}

  /**
   * 获取所有支持的结算币列表
   */

export async function getSupportedSettlementCurrencies(): Promise<ApiResponse<any>> {
    const response = await publicAxiosInstance.get<ApiResponse<any>>("/Currency");

    if (response.data.code !== 0) {
      throw new Error(response.data.msg || "Failed to get supported settlement currencies");
    }

    return response.data;
}

  /**
   * 获取所有币汇率
   */

export async function getExchangeRates(): Promise<ApiResponse<any>> {
    const response = await publicAxiosInstance.get<ApiResponse<any>>("/Config/getExchangeRates");

    if (response.data.code !== 0) {
      throw new Error(response.data.msg || "Failed to get currency exchange rate");
    }

    return response.data;
}

  /**
   * 获取casino首页游戏列表
   */

export async function getGameCategories(): Promise<ApiResponse<any>> {
    const response = await publicAxiosInstance.get("/GameCategory/gameCategoryList");
    return response.data;
}

export async function getVipConfig(): Promise<ApiResponse<any>> {
    const response = await publicAxiosInstance.get("/VipConfig/index");
    return response.data;
}

export async function getCountryCodeByIp(): Promise<ApiResponse<any>> {
    const response = await publicAxiosInstance.get("/Authentication/getCountryCodeByIp");
    return response.data;
}

export async function getFirebaseClientConfig(): Promise<ApiResponse<any>> {
    const response = await publicAxiosInstance.get("/FcmConfig/getConfigClient");
    return response.data;
}

export async function dailyCheckInConfig(): Promise<ApiResponse<any>> {
    const response = await publicAxiosInstance.get(`/BuddyBalls/dailyCheckInConfig`);
    return response.data;
}

export async function getChatwootInboxId(): Promise<ApiResponse<any>> {
    const response = await publicAxiosInstance.get<ApiResponse<any>>("/chat/getInboxId");

    if (response.data.code !== 0) {
      throw new Error(response.data.msg || "Failed to get chatwoot inbox id");
    }

    return response.data;
}

  /**
   * 获取Latest Wins (只返回赢钱的记录)
   */
