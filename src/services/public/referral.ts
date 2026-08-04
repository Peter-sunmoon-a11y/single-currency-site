import publicAxiosInstance from "@/lib/publicAxios";
import type { ApiResponse } from "@/types/auth";

export async function getGlobalCommissions(): Promise<ApiResponse<any>> {
    const response = await publicAxiosInstance.get<ApiResponse<any>>("/RewardGroupLog/indexTimer", {
      params: {
        _t: Date.now() // 添加时间戳参数强制获取新数据
      }
    });

    if (response.data.code !== 0) {
      throw new Error(response.data.msg || "Failed to get global commissions");
    }

    return response.data;
}
