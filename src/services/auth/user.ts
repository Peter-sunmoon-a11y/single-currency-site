import authAxiosInstance from "@/lib/authAxios";

import type { ApiResponse, LoginResponse } from "@/types/auth";
import type { ReferralListResponse } from "@/types/referral";

export async function getUserProfile(): Promise<LoginResponse> {
    const response = await authAxiosInstance.get<LoginResponse>("/User/profile");

    if (response.data.code !== 0) {
      throw new Error(response.data.msg || "Failed to get user info");
    }

    return response.data;
}

  /**
   * 更新用户的显示货币设置 (currency_fiat字段)
   * @param currency 显示货币代码
   */

export async function updateUserDisplayFiat(currency: string): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/User/updateCurrency", { currency_fiat: currency });
    return response.data;
}

  /**
   * 更新用户的结算货币设置 (currency字段)
   * @param currency 结算货币代码
   */

export async function updateUserSettlementCurrency(currency: string): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/User/updateCurrency", { currency: currency });
    return response.data;
}

  /**
   * 更新用户语言设置
   * @param language 语言代码
   *
   */

export async function updateUserLanguage(language: string): Promise<void> {
    await authAxiosInstance.post("/User/updateUser", { language_code: language });
}

  /**
   * 发送密码重置验证码
   * @param username 邮箱或手机号
   * @param hcaptchaToken hCaptcha验证令牌
   */

export async function getUserDefaultCurrency(params: { inner_game_id: string }): Promise<
    ApiResponse<{
      default_currency: string;
    }>
  > {
    const response = await authAxiosInstance.post("/GameList/getUserDefaultCurrency", params);
    return response.data;
}

  /**
   * 收藏/取消收藏游戏 V2
   * @param inner_game_id 内部游戏ID
   */

export async function getUserAchievements(sort: "asc" | "desc" = "asc"): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get("/Achievement/index", {
      params: { sort }
    });
    return response.data;
}

export async function getUserAchievementsV2(sort: "asc" | "desc" = "asc"): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get("/Achievement/indexV2", {
      params: { sort }
    });
    return response.data;
}

  /**
   * 获取当前用户已参与的成就记录
   */

export async function getMyAchievements(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get("/Achievement/myAchievement");
    return response.data;
}

export async function getVipConfig(level?: number): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get(`/VipConfig/index${level ? `?vip=${level}` : ""}`);
    return response.data;
}

export async function changePassword(params: Record<string, any>): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/Personal/changePassword", params);
    return response.data;
}

export async function setTmaPassword(params: { username: string; password: string }): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/Personal/setTmaPassword", params);
    return response.data;
}

  /**
   * 获取最早的待处理Free Spin记录
   */

export async function sendEmailCode(data: any): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/Personal/sendEmailCode", data);
    return response.data;
}

  /**
   * 当前账号绑定邮箱
   */

export async function bindEmail(data: any): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/Personal/bindEmail", data);
    return response.data;
}

  /**
   * 获取推荐列表
   */

export async function sendMobileCode(data: any): Promise<ReferralListResponse> {
    const response = await authAxiosInstance.post("/Personal/sendMobileCode", data);
    return response.data;
}

  /**
   * 创建广告标签（Campaign）
   */

export async function bindMobile(data: any): Promise<ReferralListResponse> {
    const response = await authAxiosInstance.post("/Personal/bindMobile", data);
    return response.data;
}

  /**
   * 获取通知消息
   */

export async function updateUser(data: any): Promise<any> {
    const response = await authAxiosInstance.post("/User/updateUser", data);
    return response.data;
}

export async function uploadPublicImage(data: any): Promise<any> {
    const response = await authAxiosInstance.post("/Images/uploadPublic", data);
    return response.data;
}

export async function uploadPrivateImage(data: any): Promise<any> {
    const response = await authAxiosInstance.post("/Images/uploadPrivate", data);
    return response.data;
}

export async function updateKyc(data: any): Promise<any> {
    const response = await authAxiosInstance.post("/UserKyc/update", data);
    console.log(response);
    return response.data;
}

export async function getKycDetail(): Promise<any> {
    const response = await authAxiosInstance.get("/UserKyc/getDetail");
    return response.data;
}

export async function updateWithdrawalPin(data: any): Promise<any> {
    const response = await authAxiosInstance.post("/user/updatePin", data);
    return response.data;
}

export async function getWalletSettingsCurrency(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get("/Currency/walletSettingsCurrency");
    return response.data;
}
