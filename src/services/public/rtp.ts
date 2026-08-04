import publicAxiosInstance from "@/lib/publicAxios";
import type { ApiResponse } from "@/types/auth";

export type RtpSummarySort = "highest" | "lowest";

export type RtpRequestParams = {
  lang: string;
  currency?: string;
};

export type RtpThreeDaySummaryParams = RtpRequestParams & {
  sort: RtpSummarySort;
};

export async function getRtpFourHourSnapshot(params: RtpRequestParams): Promise<ApiResponse<any>> {
  const response = await publicAxiosInstance.post<ApiResponse<any>>("/RtpActivity/getFourHourSnapshot", params);
  return response.data;
}

export async function getRtpThreeDaySummary(params: RtpThreeDaySummaryParams): Promise<ApiResponse<any>> {
  const response = await publicAxiosInstance.post<ApiResponse<any>>("/RtpActivity/getThreeDaySummary", params);
  return response.data;
}
