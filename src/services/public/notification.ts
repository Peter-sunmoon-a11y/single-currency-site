import publicAxiosInstance from "@/lib/publicAxios";
import type { ApiResponse } from "@/types/auth";

export async function refreshFcmToken(fcm_token: string): Promise<ApiResponse<any>> {
    const response = await publicAxiosInstance.post("/user/refreshFcmToken", { fcm_token });
    return response.data;
}
