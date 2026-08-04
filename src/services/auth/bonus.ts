import authAxiosInstance from "@/lib/authAxios";

import type { ApiResponse } from "@/types/auth";

export async function getClaimBonus(item: "cashback" | "rakeback" | "tournament" | "referral" | "group" | "level_up" | "vip_bonus_lucky_number_seven"): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get("/Claim/index", {
      params: { item }
    });
    return response.data;
}

  /**
   * Create a fiat deposit order
   */

export async function getUserClaimBonus(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get("/Claim/bonusDetailsV2");
    return response.data;
}

export async function getTieredFirstDepositSummary(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/TieredFirstDeposit/getSummary");
    return response.data;
}

export async function claimTieredFirstDeposit(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/TieredFirstDeposit/claim");
    return response.data;
}

  /**
   * 领取bonus
   * @param item - bonus类型 (必填)
   * @param currency - 货币类型 (可选)
   */

export async function claimBonus(item: string, currency?: string): Promise<ApiResponse<any>> {
    const params: Record<string, any> = { item };
    if (currency) {
      params.currency = currency;
    }
    const response = await authAxiosInstance.post("/Claim/claim", params);
    return response.data;
}

export async function getConquestsCompleted(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get("/Conquest/getConquestCompleted");
    return response.data;
}

export async function getConquestsReward(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get("/Conquest/getConquestReward");
    return response.data;
}

export async function claimConquest(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/Conquest/claimConquest");
    return response.data;
}

  /**
   * 获取征服任务列表
   */

export async function getConquestList(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get("/Conquest/index");
    return response.data;
}

  /**
   * 获取日历奖励数据
   */

export async function getCalendarBonus(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get("/Calendar/index");
    return response.data;
}

  /**
   * 领取日历奖励
   */

export async function claimCalendarBonus(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/Calendar/claim");
    return response.data;
}

  /**
   * 启动游戏 V2
   */

export async function activateBooster(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/Claim/activateBooster");
    return response.data;
}

export async function getUserBonusRecords(query?: Record<string, any>): Promise<ApiResponse<any>> {
    const endpoint = query ? `/UserBonus?${new URLSearchParams(query)}` : "/UserBonus";
    const response = await authAxiosInstance.get(endpoint);
    return response.data;
}

export async function getBonusWalletRecords(query?: Record<string, any>): Promise<ApiResponse<any>> {
    const endpoint = query ? `/BonusWallet/transactionsList?${new URLSearchParams(query)}` : "/BonusWallet/transactionsList";
    const response = await authAxiosInstance.get(endpoint);
    return response.data;
}

export async function getUserRolloverRecords(params: Record<string, any>): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/UserDeposit/rollover", params);
    return response.data;
}

export async function claimAchievementBonus(reward_achievement_log_id: number): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/Achievement/claim", { reward_achievement_log_id });
    return response.data;
}

  /*
* 统计可以提取的赏金分类个数
* */

export async function getClaimCount() {
    const response = await authAxiosInstance.get("/claim/getClaimCount");
    return response.data;
}

export async function getMondayVipBonus(): Promise<any> {
    const response = await authAxiosInstance.get("/MondayVipBonus/index");
    return response.data;
}

export async function claimMondayVipBonus(id: any, currency: string): Promise<any> {
    const response = await authAxiosInstance.post("/MondayVipBonus/claim", { id, currency });
    return response.data;
}

export async function getLuckyNumberRewards(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get("/LuckyNumber/rewards");
    return response.data;
}

export async function claimLuckyNumberRewards(currency: string, reward_ids: Array<string | number>): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/LuckyNumber/claim", { currency, reward_ids });
    return response.data;
}

export async function getMembersDayStatus(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get("/MembersDay/has");
    return response.data;
}

export async function claimMembersDay(currency: string): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/MembersDay/claim", { currency });
    return response.data;
}

export async function bonusSwitch() {
    const response = await authAxiosInstance.get("/branch/bonusSwitch");
    return response.data;
}

export async function hasMysteryBox() {
    const response = await authAxiosInstance.get("/Claim/hasMysteryBox");
    return response.data;
}

export async function userAddSundayBonus() {
    const response = await authAxiosInstance.post("/Promo/addSundayBonus");
    return response.data;
}

  // 周四充值奖励激活

export async function userAddThursdayBonus() {
    const response = await authAxiosInstance.post("/Promo/addThursdayBonus");
    return response.data;
}

  // 每日首存奖励（DFD）record 创建。后端根据 branch 配置 + 当天 eligibility 决定是否真正创建

export async function userAddDailyFirstDepositBonus() {
    const response = await authAxiosInstance.post("/Promo/addDailyFirstDepositBonus");
    return response.data;
}

export async function getBonusWallet(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get(`/BonusWallet/index`);
    return response.data;
}

  // 激活彩金账户

export async function activeBonusWallet(id: string): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get(`/BonusWallet/setClaimStatus?id=${id}`);
    return response.data;
}

  // 提取彩金账户收益

export async function claimBonusWallet(id: string, currency: string): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get(`/BonusWallet/claim?id=${id}&claim_currency=${currency}`);
    return response.data;
}

  // 彩金币种失效的时候用户应该设置为哪个结算币

export async function getCurrencyOtherThanBonusCoin(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get("/Currency/userDefaultCurrency");
    return response.data;
}

  // 选择彩金类型

export async function userActiveBonusWallet(bonus: string): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get(`/BonusWallet/welcomeBonus?bonus_wallet_name=${bonus}`);
    return response.data;
}

  // 彩金类型列表

export async function getBonusConfigList(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get("/BonusWallet/purchaseConfigList");
    return response.data;
}

  // 用户放弃彩金

export async function userAbandonBonus(id: string): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get(`/BonusWallet/abandonBonus?id=${id}`);
    return response.data;
}

  // 用户彩金操作记录

export async function userBonusLatestHistory(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get(`/BonusWallet/latestHistoryData`);
    return response.data;
}

  // 用户今日首冲次数

export async function getTodayDepositCount(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get(`/Promo/getUtcTodayDepositCount`);
    return response.data;
}

  // 用户获取优惠码

export async function userClaimPromoCode(promo_code: string, device_id: string): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post(`/PromoCode/claim`, { promo_code, device_id });
    return response.data;
}

  // 获取用户最近的锦标赛信息

export async function getBonusWalletHistory(params: {
    page: number;
    limit: number;
    status: string;
    last_id?: string;
  }): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get(`/BonusWallet/historyList?limit=${params.limit}&page=${params.page}&last_id=${params.last_id}&status=${params.status}`);
    return response.data;
}

  // ========== Sports Bonus Wallet（独立于 slots BonusWallet）==========

  // 获取体育彩金账户信息

export async function dailyCheckin(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post(`/BuddyBalls/dailyCheckin`);
    return response.data;
}


  // BuddyBalls/checkInHistory

export async function checkInHistory(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get(`/BuddyBalls/checkInHistory`);
    return response.data;
}
  // 球游戏 -> 提取球游戏的奖励
