import authAxiosInstance from "@/lib/authAxios";

import type { ApiResponse } from "@/types/auth";

export async function getCryptoDepositAddress(network: string): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/UserWallet", { network });
    return response.data;
}

  /**
   * Get supported crypto withdraw gateways
   */

export async function getSupportedCryptoWithdrawGateways(currency: string): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get(`/PaymentGateway/getWithdrawCryptoGatewayList`, {
      params: { currency }
    });
    return response.data;
}

  /**
   * Get supported fiat deposit gateways
   */

export async function getSupportedFiatDepositGateways(currency: string): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/PaymentGateway/getFiatGatewayList", { currency });
    return response.data;
}

  /**
   * Get supported crypto deposit gateways
   */

export async function getSupportedCryptoDepositGateways(currency: string): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get(`/PaymentGateway/getCryptoGatewayList`, {
      params: { currency }
    });
    return response.data;
}

  // 获取法币提款网关的必填项

export async function getFiatGatewayWithdrawParams(gateway_id: string, pay_bankcode: string): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/PaymentGateway/getFiatGatewayWithdrawParamsV2", {
      gateway_id,
      pay_bankcode
    });
    return response.data;
}

  /**
   * 获取用户余额
   */

export async function getUserBalance(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get("/UserBalance/indexTimer");
    return response.data;
}

  /**
   * 获取当前用户是否有待领取的Bonus
   * @params item: cashback | rakeback | tournament | referral | group
   */

export async function createFiatDepositOrder(params: Record<string, any>): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/UserDeposit/fiat_deposit", params);
    return response.data;
}

  /**
   * Get the required fields for a fiat deposit order
   */

export async function getFiatGatewayDepositParams(gateway_id: string, pay_bankcode: string): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/PaymentGateway/getFiatGatewayDepositParamsV2", {
      gateway_id,
      pay_bankcode
    });
    return response.data;
}

  /**
   * Get user balance extension
   */

export async function getUserBalanceExtension(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get("/UserBalanceExtension");
    return response.data;
}

  // 创建法币取款订单

export async function createWithdrawFiatOrder(params: any): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/UserWithdraw/fiat_withdraw", params);
    return response.data;
}

  /**
   * 获取用户bonus 领取详细记录
   */

export async function createSwapOrder(params: any): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/UserSwap/new", params);
    return response.data;
}

export async function getUserDepositOrders(query?: Record<string, any>): Promise<ApiResponse<any>> {
    const endpoint = query ? `/UserDeposit?${new URLSearchParams(query)}` : "/UserDeposit";
    const response = await authAxiosInstance.get(endpoint);
    return response.data;
}

  // 用户取款记录

export async function getUserWithdrawOrders(query?: Record<string, any>): Promise<ApiResponse<any>> {
    const endpoint = query ? `/UserWithdraw?${new URLSearchParams(query)}` : "/UserWithdraw";
    const response = await authAxiosInstance.get(endpoint);
    return response.data;
}

  // 获取数字货币提款钱包地址

export async function getUserWithdrawWallet(network?: string): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get(`/UserWithdrawWallet${network ? `?network=${network}` : ""}`);
    return response.data;
}

  // 添加数字货币钱包收款地址

export async function addUserWithdrawWallet(params: Record<string, any>): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/UserWithdrawWallet/new", params);
    return response.data;
}

  // 删除数字货币钱包收款地址

export async function deleteUserWithdrawWallet(network: string, address: string): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get(`/UserWithdrawWallet/delete?network=${network}&address=${address}`);
    return response.data;
}

  // 创建数字货币取款订单

export async function createWithdrawCryptoOrder(params: Record<string, any>): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/UserWithdraw/new", params);
    return response.data;
}

export async function getUserWithdrawGiftDetail(claim_key: string): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get("/UserWithdrawGift/detail", {
      params: { claim_key }
    });
    return response.data;
}

export async function submitUserWithdrawGift(params: Record<string, any>): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/UserWithdrawGift/submit", params);
    return response.data;
}

  /**
   * 根据用户Free Spin记录获取游戏详情列表
   */

export async function getUserSwapRecords(query?: Record<string, any>): Promise<ApiResponse<any>> {
    const endpoint = query ? `/UserSwap?${new URLSearchParams(query)}` : "/UserSwap";
    const response = await authAxiosInstance.get(endpoint);
    return response.data;
}

export async function getUserWithdrawInfo(currency: string): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get(`/UserWithdrawInfo/getUserWithdrawInfo?currency=${currency}`);
    return response.data;
}

export async function addUserWithdrawInfo(data: any): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/UserWithdrawInfo/addUserWithdrawInfo", data);
    return response.data;
}

export async function getSupportedFiatWithdrawGatewaysV2(currency: string): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get(`/PaymentChannelClass/getWithdrawChannelClassList?currency=${currency}`);
    return response.data;
}

export async function getSupportedFiatWithdrawGatewaysV1(currency: string): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get(`/PaymentGateway/getWithdrawFiatGatewayList?currency=${currency}`);
    return response.data;
}

export async function setUserWithdrawInfoDefaultById(data: any): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/UserWithdrawInfo/setUserWithdrawInfoDefaultById", data);
    return response.data;
}

export async function deleteUserWithdrawInfo(data: any): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/UserWithdrawInfo/deleteUserWithdrawInfo", data);
    return response.data;
}

export async function createWithdrawFiatOrderV2(data: any): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/UserWithdraw/fiat_withdraw_V2", data);
    return response.data;
}

export async function getSupportedCurrencyV2(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get("/Currency/index_V2");
    return response.data;
}

export async function getPaymentIcons() {
    const response = await authAxiosInstance.get("/PaymentGateway/getPaymentIcons");
    return response.data;
}

export async function getPaymentGatewayByUser() {
    const response = await authAxiosInstance.get("/PaymentGateway/getPaymentIconsByUser");
    return response.data;
}

  // 周六充值奖励激活

export async function getDepositChannelClassList(currency: string): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get(`/PaymentChannelClass/getDepositChannelClassList?currency=${currency}`);
    return response.data;
}
  // 球游戏 -> 获取球袋倍率配置
