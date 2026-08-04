import publicAxiosInstance from "@/lib/publicAxios";
import type { ApiResponse } from "@/types/auth";

export async function getGreatestGameOrder(lang?: string): Promise<ApiResponse<any>> {
    const response = await publicAxiosInstance.get<ApiResponse<any>>("/GameOrderBigWin/binWinList", {
      params: {
        lang: lang || "en"
      }
    });

    if (response.data.code !== 0) {
      throw new Error(response.data.msg || "Failed to get greatest game order");
    }

    return response.data;
}

  /**
   * 获取所有支持的游戏币列表
   */

export async function getCasinoHomeGameList(): Promise<ApiResponse<any>> {
    const response = await publicAxiosInstance.get<ApiResponse<any>>("/GameList/getGameHomeCacheV3");

    if (response.data.code !== 0) {
      throw new Error(response.data.msg || "Failed to get game list");
    }

    return response.data;
}

  /**
   * 获取Casino游戏提供商列表
   */

export async function getGameProviders(): Promise<ApiResponse<any>> {
    const response = await publicAxiosInstance.get<ApiResponse<any>>("/GameProvider/getProvidersV1");

    if (response.data.code !== 0) {
      throw new Error(response.data.msg || "Failed to get game providers");
    }

    return response.data;
}

  /**
   * 获取Chatwoot Inbox ID
   */

export async function getLatestWins(lang?: string): Promise<ApiResponse<any>> {
    const response = await publicAxiosInstance.get<ApiResponse<any>>("/GameOrder/newestV3", {
      params: {
        lang: lang || "en",
        _t: Date.now() // 添加时间戳参数强制获取新数据
      }
    });

    if (response.data.code !== 0) {
      throw new Error(response.data.msg || "Failed to get latest wins");
    }

    return response.data;
}

  /**
   * 获取Latest bets (所有投注记录)
   */

export async function getLatestBets(): Promise<ApiResponse<any>> {
    const response = await publicAxiosInstance.get<ApiResponse<any>>("/GameOrder/newestV2Timer", {
      params: {
        _t: Date.now() // 添加时间戳参数强制获取新数据
      }
    });

    if (response.data.code !== 0) {
      throw new Error(response.data.msg || "Failed to get latest bets");
    }

    return response.data;
}

  /**
   * 获取Greatest bets
   */

export async function getGreatestBets(lang?: string): Promise<ApiResponse<any>> {
    const response = await publicAxiosInstance.get<ApiResponse<any>>("/GameOrderBigWin/binWinList", {
      params: {
        _t: Date.now(), // 添加时间戳参数强制获取新数据
        lang: lang || "en"
      }
    });

    if (response.data.code !== 0) {
      throw new Error(response.data.msg || "Failed to get greatest bets");
    }

    return response.data;
}

  /**
   * 获取Casino游戏列表
   * @param game_category_1 游戏分类
   * @param game_category_2 游戏子分类
   * @param keyword 搜索关键词
   * @param lang 语言
   * @param limit 页大小
   * @param page 页码
   * @param providers 游戏提供商
   * @param sort 排序
   * @param type 游戏类型
   */

export async function getCasinoGameList(data: any): Promise<ApiResponse<any>> {
    let final_data = { ...data };

    if (data?.game_category_1 === "bonus") {
      // bonus 作为一级分类：实际请求 slots + Bonus Wager tag
      final_data = { ...final_data, game_category_1: "slots", game_category_2: "", tag: "Bonus Wager" };
    } else if (data?.game_category_2 === "bonus") {
      final_data = { ...final_data, game_category_2: "", tag: "Bonus Wager" };
    } else {
      final_data = { ...final_data, tag: "" };
    }

    const response = await publicAxiosInstance.post<ApiResponse<any>>("/GameList/getCommonGameListV2", {
      ...final_data,
      sort: "popular"
    });

    if (response.data.code !== 0) {
      throw new Error(response.data.msg || "Failed to get casino game list");
    }

    return response.data;
}

  /**
   * 获取游戏详情
   * @param inner_game_id  内部游戏ID
   * @param provider  游戏提供商
   * @param lang  语言
   */

export async function getGameDetail(data: any): Promise<ApiResponse<any>> {
    const response = await publicAxiosInstance.post<ApiResponse<any>>("/GameList/getGameV2", data);

    if (response.data.code !== 0) {
      throw new Error(response.data.msg || "Failed to get game detail");
    }

    return response.data;
}

  /**
   * Get deposit bonus config
   */
