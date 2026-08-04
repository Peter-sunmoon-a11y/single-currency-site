import { useBoundStore } from "@/store";
import { authStorage } from "@/store/authSlice";
import type { User, UserStatus } from "@/types/auth";
import md5 from "@/utils/md5";

export function randomString(length: number) {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

export interface Auth {
  username: string;
  key: string;
  timestamp: number;
  token: string;
  userid?: string | number;
  noMd5?: string;
}

export type AuthSession = {
  data?: {
    token?: string | null;
  } | null;
  user?: User | null;
  status?: UserStatus | null;
};

export function getAuth(): Auth {
  const user = useBoundStore.getState().user;
  const userId = user?.id;
  const username = user?.username || "";

  const storedToken = authStorage.getToken();

  const auth: Auth = {
    key: randomString(20),
    token: "",
    userid: userId,
    username: username || "",
    timestamp: Date.now(),
  };
  auth.token = md5((storedToken || "") + auth.key + auth.timestamp);
  return auth;
}

/**
 * 清除认证凭证 + 用户偏好数据
 * 所有退出登录路径（主动退出、token 过期、强制踢下线）都应调用此函数
 */
export function clearAuth(reason?: string) {
  authStorage.clear(reason);
}

/**
 * 清除带 userId 前缀的用户特定数据
 * 在主动退出登录时调用（需要在 setUser(null) 之前取得 userId）
 */
export function clearUserSpecificStorage(userId?: string | number) {
  authStorage.clearUserScoped(userId);
}

/**
 * Check if user has authentication data
 */
export function hasAuth(): boolean {
  return authStorage.hasAuth();
}
