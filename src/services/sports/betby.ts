/**
 * Betby Sports API 服务
 * 提供 Betby 体育游戏集成相关的 API 调用
 */

import authAxiosInstance from '@/lib/authAxios';
import publicAxiosInstance from '@/lib/publicAxios';
import { useBoundStore } from '@/store';
import type { ApiResponse } from '@/types/auth';
import {
  BetbyAccessDeniedError,
  BetbyNoAccessError,
  BetbyNotAllowedError,
  type BetbyAuthResponse,
  type BetbyAuthTokenParams,
} from '@/types/betby';

// Betby 错误码常量
const BETBY_RESTRICTED_CODE = 10001;
const BETBY_NO_ACCESS_CODE = 10002;
const BETBY_NOT_ALLOWED_CODE = 80004;

/**
 * 获取 Betby 配置（游客模式，无需认证）
 * @returns brand_id
 */
export async function getBetByConfig(): Promise<string | number> {
  const response = await publicAxiosInstance.get<ApiResponse<string | number>>('/BetBy/getBetByConfig');
  
  if (response.data.code !== 0) {
    throw new Error(response.data.msg || 'Failed to get BetBy config');
  }
  
  return response.data.data;
}

/**
 * 生成 Betby 认证令牌（登录用户）
 * @param params 包含币种和语言的参数
 * @returns Betby 认证响应数据
 */
export async function fetchBetbyAuthToken(params: BetbyAuthTokenParams): Promise<BetbyAuthResponse> {
  // 从统一 store 获取 username，确保请求体中包含用户登录信息
  const username = useBoundStore.getState().user?.username;
  
  // 构建请求体，包含用户信息和参数
  const requestBody = {
    ...params,
    ...(username && { username }), // 如果存在 username，则添加到请求体中
  };
  
  const response = await authAxiosInstance.post<ApiResponse<BetbyAuthResponse>>(
    '/BetBy/generateAuthJwt',
    requestBody
  );

  // 检查嵌套的错误码
  const nestedCode = response?.data?.data?.code;

  // 币种不支持错误
  if (response?.data?.code === BETBY_RESTRICTED_CODE || nestedCode === BETBY_RESTRICTED_CODE) {
    throw new BetbyAccessDeniedError('The user is not allowed to access BetBy sports.');
  }

  // 无访问权限错误
  if (response?.data?.code === BETBY_NO_ACCESS_CODE || nestedCode === BETBY_NO_ACCESS_CODE) {
    throw new BetbyNoAccessError('User is not permitted to access sports.');
  }

  // Betby 不允许访问错误（错误码 80004）
  if (response?.data?.code === BETBY_NOT_ALLOWED_CODE || nestedCode === BETBY_NOT_ALLOWED_CODE) {
    throw new BetbyNotAllowedError(response?.data?.msg || 'Betby is not allowed');
  }

  // 其他错误
  if (response?.data?.code !== 0) {
    throw new Error(response?.data?.msg || 'Failed to generate BetBy auth token');
  }

  return response.data.data;
}
