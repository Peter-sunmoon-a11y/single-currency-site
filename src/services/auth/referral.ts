import authAxiosInstance from "@/lib/authAxios";

import type { ApiResponse } from "@/types/auth";
import type { AdTag, AdTagListResponse, CommissionListResponse, CreateAdTagParams, GetCommissionListParams, GetReferralListParams, GetReferralRewardsListParams, ReferralListResponse, ReferralRewardsListResponse, SetDefaultAdTagParams, SetDefaultAdTagResponse } from "@/types/referral";

export async function getReferralList(params: GetReferralListParams): Promise<ReferralListResponse> {
    const response = await authAxiosInstance.post<ReferralListResponse>("/RewardReferUnlockLog/getReferralList", params);

    if (response.data.code !== 0) {
      throw new Error(response.data.msg || "Failed to get referral list");
    }

    return response.data;
}

  /**
   * 获取广告标签列表（Campaigns）
   */

export async function getAdTagList(): Promise<AdTagListResponse> {
    const response = await authAxiosInstance.get<AdTagListResponse>("/AdTag");

    if (response.data.code !== 0) {
      throw new Error(response.data.msg || "Failed to get ad tag list");
    }

    return response.data;
}

export async function setDefaultAdTag(params: SetDefaultAdTagParams): Promise<SetDefaultAdTagResponse> {
    const response = await authAxiosInstance.post("/AdTag/setDefault", params);
    if (response.data.code !== 0) {
      throw new Error(response.data.msg || "Failed to set default ad tag");
    }

    return response.data;
}

  /**
   * 发送手机验证码
   */

export async function createAdTag(params: CreateAdTagParams): Promise<ApiResponse<AdTag>> {
    const response = await authAxiosInstance.post<ApiResponse<AdTag>>("/AdTag/create", params);

    if (response.data.code !== 0) {
      const { data, msg } = response.data;
      const errorMessage = (typeof data === "string" && data) || msg || "Failed to create ad tag";
      throw new Error(errorMessage);
    }

    return response.data;
}

  /**
   * 获取佣金记录列表
   */

export async function getCommissionList(params: GetCommissionListParams): Promise<CommissionListResponse> {
    const response = await authAxiosInstance.get<CommissionListResponse>("/RewardGroupLog/myList", {
      params
    });

    if (response.data.code !== 0) {
      throw new Error(response.data.msg || "Failed to get commission list");
    }

    return response.data;
}

  /**
   * 获取推荐奖励记录列表
   */

export async function getReferralRewardsList(params: GetReferralRewardsListParams): Promise<ReferralRewardsListResponse> {
    const response = await authAxiosInstance.post<ReferralRewardsListResponse>("/RewardReferUnlockLog/getReferralRewardListTotal", params);

    if (response.data.code !== 0) {
      throw new Error(response.data.msg || "Failed to get rewards list");
    }

    return response.data;
}

  /**
   * 当前账号绑定手机号
   */

export async function getUserReferralRecords(query?: Record<string, any>): Promise<ApiResponse<any>> {
    const searchParams = query ? new URLSearchParams(query) : undefined;
    const endpoint = searchParams && Array.from(searchParams.keys()).length > 0
      ? `/ClaimLog/index?${searchParams.toString()}`
      : "/ClaimLog/index";
    const response = await authAxiosInstance.get(endpoint);
    return response.data;
}

export async function getUserCommissionRecords(query?: Record<string, any>): Promise<ApiResponse<any>> {
    const searchParams = query ? new URLSearchParams(query) : undefined;
    const endpoint = searchParams && Array.from(searchParams.keys()).length > 0
      ? `/ClaimLog/index?${searchParams.toString()}`
      : "/ClaimLog/index";
    const response = await authAxiosInstance.get(endpoint);
    return response.data;
}

export async function getReferralDetail(data: any): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/RewardReferUnlockLog/getReferralDetail", data);
    return response.data;
}

export async function getRewardGroupLogDetail(data: any): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/RewardGroupLog/detail", data);
    return response.data;
}

export async function getReferralRewardDetail(data: any): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/RewardReferUnlockLog/getReferralRewardListTotalDetail", data);
    return response.data;
}

export async function uploadShareImage(file: File, imageType: string): Promise<ApiResponse<{
    number: number;
    image_url: string;
  }>> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("image_type", imageType);
    const response = await authAxiosInstance.post("/Images/uploadShareImage", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return response.data;
}

  /**
   * Free Spins 可申请：提交申请
   */
