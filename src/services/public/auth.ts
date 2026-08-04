import publicAxiosInstance from "@/lib/publicAxios";
import type { ApiResponse } from "@/types/auth";
import { getTelegramInitData } from "@/utils/telegramWebApp";

export async function loginByGoogle(data: Record<string, any>, signal?: AbortSignal, headers?: Record<string, any>): Promise<ApiResponse<any>> {
    const response = await publicAxiosInstance.post("/Authentication/loginByGoogle", data, {
      signal,
      headers
    });
    return response.data;
}

export async function loginByFacebook(data: Record<string, any>, signal?: AbortSignal, headers?: Record<string, any>): Promise<ApiResponse<any>> {
    const response = await publicAxiosInstance.post("/Authentication/loginByFacebook", data, {
      signal,
      headers
    });
    return response.data;
}

export async function loginByTMA(data: Record<string, any> = {}): Promise<ApiResponse<any>> {
    const telegramInitData = getTelegramInitData();
    const tmaToken = telegramInitData;
    const response = await publicAxiosInstance.post<ApiResponse<any>>("/Authentication/loginByTMA", data, {
      headers: {
        Authorization: `tma ${tmaToken}`
      }
    });

    return response.data;
}

export async function loginByParam(data: Record<string, any>): Promise<ApiResponse<any>> {
    const response = await publicAxiosInstance.post("/Authentication/loginByParam", data);
    return response.data;
}

export async function getSocialList(): Promise<any> {
    const response = await publicAxiosInstance.get("/Authentication/getSocialList");
    return response.data;
}

export async function resetPasswordByToken(data: any): Promise<ApiResponse<any>> {
    const response = await publicAxiosInstance.post("/authentication/resetPasswordByToken", data);
    return response.data;
}
