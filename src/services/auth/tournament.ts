import authAxiosInstance from "@/lib/authAxios";

import type { ApiResponse } from "@/types/auth";
import type { TournamentPoolPrizeParams } from "@/types/tournament";

export async function getTournamentList(data: Record<string, any> = {}): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/Tournament/getTournamentList", data);
    return response.data;
}

  /**
   * 获取 Tournament 排行榜
   */

export async function getTournamentLeaderboard(params: {
    tournament_id: string;
    tournament_level: string;
    limit?: number;
    page?: number;
    last_id?: string;
    last_wagered?: string;
  }): Promise<ApiResponse<any>> {
    const filteredParams = Object.fromEntries(
      Object.entries(params || {}).filter(([_, v]) => v != null && v !== "")
    );
    const response = await authAxiosInstance.post("/Tournament/getTournamentLeaderboard", filteredParams);
    return response.data;
}

export async function getTournamentPoolPrize(params: TournamentPoolPrizeParams): Promise<ApiResponse<number>> {
    const response = await authAxiosInstance.post<ApiResponse<number>>("/Tournament/getPoolPrizeTimer", params);

    if (response.data.code !== 0) {
      throw new Error(response.data.msg || "Failed to get tournament pool prize");
    }

    return response.data;
}

export async function getUserLastTournamentInfo(tournament_id: any): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get(`/Tournament/getUserLastTournamentInfo`, {
      params: {
        tournament_id
      }
    });
    return response.data;
}

  // 用户购买彩金

export async function getLastTournamentLeaderboard(tournament_id: string, page: number, limit: number): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get(`/Tournament/getLastTournamentLeaderboard`, {
      params: {
        tournament_id,
        page,
        limit
      }
    });
    return response.data;
}

  // 获取用户彩金记录
