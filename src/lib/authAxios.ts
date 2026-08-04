import { apiConfig, runtimeConfig } from "@/lib/env";
import { getUserFromCache } from "@/lib/publicAxios.ts";
import { clearAuth, getAuth } from "@/utils/auth";
import axios from "axios";
import { rumCustomLog, rumException, rumResource } from "../utils/helper";
import { shouldExcludeFromRumLog } from "./auth-guards";
import { setTraceIdHeader } from "./trace";

// Authenticated axios instance - includes custom auth headers
// Uses getAuth() to generate authentication parameters for each request
// For public APIs that don't require authentication, use publicAxios instead
const authAxiosInstance = axios.create({
  baseURL: apiConfig.url,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
  },
});

authAxiosInstance.interceptors.request.use(
  (config) => {
    try {
      const auth = getAuth();
      if (auth) {
        config.headers.Auth = JSON.stringify(auth);
      }
      if (config.data instanceof FormData) {
        config.headers["Content-Type"] = "multipart/form-data";
      }
    } catch (error) {
      // getAuth可能会抛出错误如果用户未认证
      console.warn("Failed to get auth credentials:", error);
    }

    config.params = {
      ...(config.params || {}),
    };

    // 每次请求生成新的 trace ID
    config.headers["X-Trace-Id"] = `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`;

    // 每次请求生成新的 trace ID
    setTraceIdHeader(config);

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

authAxiosInstance.interceptors.response.use(
  (response) => {
    // Log only in development
    if (runtimeConfig.isDev) {
      console.debug("✅ Auth request successful:", response.config.url);
    }

    if (response?.data?.code === 401) {
      // If we can't get auth, it means token is invalid, clear it
      clearAuth(`❌ Auth request failed:${response.config.url}`);
    }

    // TODO: rum ****************************
    // TODO: 服务于rum数据收集
    if (response.data && typeof response.data === "object") {
      response.data._request_url = (response.config.baseURL || "") + (response.config.url || "");
      response.data._request_name = response.config.url || "";
    }
    const user = getUserFromCache();
    if (user && !shouldExcludeFromRumLog(response.data._request_url)) {
      // TODO: 发送资源信息到 RUM
      rumResource(
        {
          url: response.data._request_url,
          name: "Auth Request ✅",
          event: "Auth Request ✅",
        },
        user,
      );

      // TODO: 发送常规日志到 RUM
      rumCustomLog(`Auth Request ✅`, { url: response.data._request_url }, user);
    }
    // TODO: rum ****************************

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Log errors only in development
    if (runtimeConfig.isDev) {
      console.error(`❌ Auth request failed: ${error.response?.status || "Network Error"} ${originalRequest?.url}`, error);
    }

    // TODO: rum ****************************
    const errorUrl = (error.config.baseURL || "") + error?.config?.url;
    const user = getUserFromCache();
    if (user && !shouldExcludeFromRumLog(errorUrl)) {
      // TODO: 发送资源信息到 RUM
      rumResource(
        {
          url: errorUrl,
          name: "Auth Request ❌",
          event: "Auth Request ❌",
        },
        user,
      );

      // TODO: 发送异常到 RUM
      rumException("Auth Request ❌", error, user);
    }
    // TODO: rum ****************************

    // Handle 401 unauthorized errors
    if (error.response?.status === 401) {
      clearAuth(`http_401:${originalRequest?.url}`);
      return Promise.reject(error);
    }

    return Promise.reject(error);
  },
);

export default authAxiosInstance;
