import publicAxiosInstance from "@/lib/publicAxios";
import type { ApiResponse } from "@/types/auth";

export async function getDepositBonusConfig(): Promise<ApiResponse<any>> {
    const response = await publicAxiosInstance.get("/DepositBonusConfig/indexTimer");
    return response.data;
}

export async function getLuckyNumberConfig(): Promise<ApiResponse<any>> {
    const response = await publicAxiosInstance.get("/LuckyNumber/getConfig");
    return response.data;
}

export async function getMembersDayConfig(): Promise<ApiResponse<any>> {
    const response = await publicAxiosInstance.get("/MembersDay/getConfig");
    return response.data;
}
