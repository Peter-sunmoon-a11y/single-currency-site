import authAxiosInstance from "@/lib/authAxios";

import type { ApiResponse } from "@/types/auth";
import type { BetHistoryQueryParams } from "@/types/bet-history";
import type { UserGameListParams, UserGameListResponse } from "@/types/game";

export async function launchGameV2(params: {
    inner_game_id: string;
    game_provider: string;
    game_currency: string;
    lang: string;
    name_key?: string;
    home_url?: string;
    close_url?: string;
    deposit_url?: string;
    history_url?: string;
    is_support_demo_game?: string;
  }): Promise<
    ApiResponse<string> & {
    launch_type: "url" | "html";
  }
  > {
    const response = await authAxiosInstance.post("/Game/playV2", params);
    return response.data;
}

  /**
   * 启动试玩游戏（需要登录）
   */

export async function launchDemoGame(params: {
    inner_game_id: string;
    game_provider: string;
    game_currency: string;
    lang: string;
    name_key?: string;
    home_url?: string;
    close_url?: string;
    deposit_url?: string;
    history_url?: string;
  }): Promise<
    ApiResponse<string> & {
    launch_type: "url" | "html";
  }
  > {
    const response = await authAxiosInstance.post("/Game/playDemo", params);
    return response.data;
}

  /**
   * 检查游戏是否支持演示模式
   */

export async function checkDemoSupport(params: {
    inner_game_id: string;
    game_provider: string;
    game_currency?: string;
    lang?: string;
    name_key?: string;
  }): Promise<
    ApiResponse<{
      support_demo: boolean;
      inner_game_id: string;
      game_provider: string;
      game_name: string;
    }>
  > {
    const response = await authAxiosInstance.get("/Game/isSupportDemo", { params });
    return response.data;
}

  /**
   * 获取用户游戏默认货币
   */

export async function likeGameV2(inner_game_id: string): Promise<
    ApiResponse<{
      action: "added" | "removed";
      is_favorite: boolean;
    }>
  > {
    const response = await authAxiosInstance.post("/Game/likeV2", { inner_game_id });
    return response.data;
}

  /*
   * Create a swap order
   */

export async function getUserBetHistory(params: BetHistoryQueryParams): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/GameOrder/getBetHistoryV4", params);
    return response.data;
}

export async function getUserSportsBetHistory(params: BetHistoryQueryParams): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/GameOrder/getBetHistoryV4", params);
    return response.data;
}

  // 用户存款记录

export async function getUserFreeGameRecords(
    data: { page?: number; page_size?: number } = {
      page: 1,
      page_size: 20
    }
  ): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/FreeSpin/getGameDetailsByUserFreeSpinRecord", {
      page: 1,
      page_size: 20,
      ...data
    });
    return response.data;
}

  /**
   * 激活用户的rakeback加速器
   */

export async function getTopWageredGames(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get("/GameList/getTopWageredGamesV2");
    return response.data;
}

export async function getUserGameList(params: UserGameListParams): Promise<UserGameListResponse> {
    const response = await authAxiosInstance.get<UserGameListResponse>("/GameList/getUserGameListV2", {
      params
    });
    return response.data;
}

  /**
   * 获取 Tournament 列表（需登录）
   */

export async function getDefaultAdTag(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get("/AdTag/getDefault");
    return response.data;
}

  /**
   * 获取当前用户的成就列表
   * @params sort: 'asc' | 'desc' - 排序方式
   */

export async function getEarliestPendingRecord(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/FreeSpin/getEarliestPendingRecord");
    return response.data;
}

  /**
   * 领取Free Spin奖励
   */

export async function claimFreeSpinReward(data: any): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/FreeSpin/claimReward", data);
    return response.data;
}

  /**
   * 获取支持的Free Spin游戏列表
   */

export async function getSupportedFreeSpinGames(data: any): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/FreeSpin/getSupportedGamesV1", data);
    return response.data;
}

  /**
   * 取消Free Spin记录
   */

export async function cancelFreeSpinRecord(recordId: string): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post(`/FreeSpin/cancelFreeSpinRecord?record_id=${recordId}`);
    return response.data;
}

  /**
   * 启用Free Spin记录
   */

export async function enableFreeSpinRecord(data: any): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/FreeSpin/enableRecordV1", data);
    // const response = await authAxiosInstance.post("/FreeSpin/enableRecord", data);
    return response.data;
}

  /**
   * 获取活跃的Free Spin记录
   */

export async function getActiveFreeSpinRecords(data: any): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/FreeSpin/getActiveRecords", data);
    return response.data;
}

  /**
   * 发送邮箱验证码
   */

export async function getBanGameList(currency: string) {
    const response = await authAxiosInstance.get(`/GameList/getBanGameList?currency=${currency}`);
    return response.data;
}

  // 获取彩金账户信息

export async function applyFreeSpin(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/FreeSpin/applyFreeSpin", {});
    return response.data;
}

  /**
   * Free Spins 可申请：查询是否展示申请入口
   */

export async function getFreeSpinApplyEntry(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/FreeSpin/getApplyEntry");
    return response.data;
}
