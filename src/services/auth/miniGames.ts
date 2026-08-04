import authAxiosInstance from "@/lib/authAxios";

import type { ApiResponse } from "@/types/auth";

export async function userBuddyBallsHome(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get(`/BuddyBalls/index`);
    return response.data;
}

  // BuddyBalls

export async function getBuddyBalls(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get(`/BuddyBalls/index`);
    return response.data;
}

  // BuddyBalls/dailyCheckin

export async function userBuddyBallsClaim(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post(`/BuddyBalls/claim`);
    return response.data;
}

  // 球游戏 -> 球的消耗记录

export async function getBuddyBallsPlayList(params: {
    page?: number;
    limit?: number;
    last_id?: string;
  }): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get("/BuddyBalls/playList", { params });
    return response.data;
}

  // 球游戏 -> 收益提取操作记录

export async function getBuddyBallsClaimList(params: {
    page?: number;
    limit?: number;
    last_id?: string;
    source_group?: string;
  }): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get("/BuddyBalls/claimList", { params });
    return response.data;
}

  // 球游戏 -> 签到来获取球游戏的球

export async function userBuddyBallsDailyCheck(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get(`/BuddyBalls/dailyCheckIn`);
    return response.data;
}

  // 球游戏 -> 获取BuddyBalls玩球数据

export async function getBuddyBallsPlay(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post<ApiResponse<any>>("/BuddyBalls/play");
    /*if (response.data.code !== 0) {
      throw new Error(response.data.msg || "Failed to get game baddy balls play");
    }*/
    return response.data;
}
  // 球游戏 -> 获取BuddyBalls球数量

export async function getBuddyBallsCount(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get("/BuddyBalls/index");
    return response.data;
}

  // 幸运盘 -> 主页信息

export async function userLuckySpinHome(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get("/LuckySpin/index");
    return response.data;
}

  // 幸运盘 -> 用户抽奖

export async function userLuckySpinLottery(type: string): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/LuckySpin/lottery", { type });
    return response.data;
}

  // 幸运盘 -> 奖池详情接口

export async function getPoolPrizeList(type: string): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get(`/LuckySpin/getPoolPrizeList?type=${type}`);
    return response.data;
}

  // 幸运盘 -> 我的中奖列表接口

export async function getUserSpinWinList(params: {
    page: number;
    limit: number;
    sort_type: string;
  }): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get(`LuckySpin/myWinList?limit=${params.limit}&page=${params.page}&sort_type=${params.sort_type}`);
    return response.data;
}

  // 幸运盘 -> 用户的抽奖机会获得

export async function getUserSpinChance(params: {
    page: number;
    limit: number;
  }): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get(`LuckySpin/chanceList?limit=${params.limit}&page=${params.page}`);
    return response.data;
}

  // 幸运盘 -> 所有人中奖列表接口

export async function getAllSpinWinList(params: {
    page: number;
    limit: number;
    sort_type: string;
  }): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get(`LuckySpin/winList?limit=${params.limit}&page=${params.page}&sort_type=${params.sort_type}`);
    return response.data;
}

  // TODO: 法币存款通道分类支持

export async function buddyBallConfigList(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get("/BuddyBalls/buddyBallConfigList");
    return response.data;
}

  /**
   * 上传玩家分享图片（Big Win / Mega Win 等）
   * @param file 图片文件（jpg/png/jpeg/gif，≤2MB）
   * @param imageType 图片类型，如 'Big Win' / 'Mega Win' / 'Super Mega Win'
   */
