import { buildHref } from "@/lib/navigation";
import { API_PATHS_UNNECESSARY_RUM_LOG } from "@/services/apiPaths";

type AuthGuardContext = {
  auth: {
    isAuthenticated: boolean;
    isLoading: boolean;
  };
};

// 缓存排除路径数组，避免每次调用都展开 Set
const EXCLUDED_PATHS = [...API_PATHS_UNNECESSARY_RUM_LOG];

// 检查URL是否在RUM日志排除列表中
export const shouldExcludeFromRumLog = (url: string): boolean => {
  return EXCLUDED_PATHS.some((path) => url.includes(path));
};

/**
 * 认证守卫 - 要求用户必须登录
 *
 * 使用方式：
 * ```typescript
 * beforeLoad: requireAuth
 * ```
 *
 * @param context - Router context，包含认证状态
 * @param location - 当前路由位置
 */
export const requireAuth = ({ context, location }: { context: AuthGuardContext; location: { href: string } }) => {
  // 从 Router Context 获取认证状态（而不是从 localStorage）
  const { isAuthenticated, isLoading } = context.auth;

  // 如果还在加载中，暂时不重定向（等待认证状态确定）
  if (isLoading) {
    return;
  }

  // 如果未认证，重定向到首页并触发登录对话框
  if (!isAuthenticated) {
    // 从完整 URL 中提取路径部分
    const redirectPath = location.href.replace(window.location.origin, "");
    const isLogoutIntent = window.sessionStorage.getItem("logout_intent") === "1";

    if (isLogoutIntent) {
      window.sessionStorage.removeItem("logout_intent");
    }

    const error = new Error("APP_CLIENT_REDIRECT") as Error & { href?: string };
    error.href = String(
      buildHref({
        to: "/",
        search: {
          redirect: isLogoutIntent ? undefined : redirectPath,
          startapp: undefined,
        },
      }),
    );
    throw error;
  }
};
