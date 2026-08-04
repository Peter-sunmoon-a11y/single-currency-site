import authAxiosInstance from "@/lib/authAxios";

import type { ApiResponse } from "@/types/auth";

export type BountySortBy = "created" | "reward";
export type BountyTab = "active" | "completed";
export type BountyClaimStatus = "" | 0 | 1;

export interface GetBountyChallengeListParams {
  page: number;
  limit: number;
  sort_by: BountySortBy;
  sort_order: "asc" | "desc";
  tab: BountyTab;
  keyword?: string;
}

export interface GetBountyMyWinListParams {
  page: number;
  limit: number;
  claim_status: BountyClaimStatus;
}

export interface ClaimBountyRewardParams {
  winner_id: number;
  claim_currency: string;
}

export async function getBountyStatus(): Promise<ApiResponse<{ is_forbidden: boolean; branch_enabled: boolean }>> {
  const response = await authAxiosInstance.get("/Bounty/getBountyStatus");
  return response.data;
}

export async function getBountyChallengeList(params: GetBountyChallengeListParams): Promise<ApiResponse<any>> {
  const response = await authAxiosInstance.post("/Bounty/getChallengeList", params);
  return response.data;
}

export async function getBountyMyWinList(params: GetBountyMyWinListParams): Promise<ApiResponse<any>> {
  const response = await authAxiosInstance.post("/Bounty/getMyWinList", params);
  return response.data;
}

export async function claimBountyReward(params: ClaimBountyRewardParams): Promise<ApiResponse<any>> {
  const response = await authAxiosInstance.post("/Bounty/claimReward", params);
  return response.data;
}
