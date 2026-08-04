import { useCurrentUser, useLogin, useLogout } from "@/hooks/api/useAuth";
import { normalizeLocale } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { localizeHref, setLocaleCookie } from "@/lib/navigation";
import { useBoundStore } from "@/store";
import type { User, UserStatus } from "@/types/auth";
import { clearUserSpecificStorage } from "@/utils/auth";
import { uuidv4Generate } from "@/utils/helper.ts";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createContext, Dispatch, SetStateAction, useCallback, useContext, useEffect, useMemo, useRef } from "react";

type AuthContextType = {
  user: User | null;
  status: UserStatus | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loginError?: string;
  isLoginLoading: boolean;
  setUser: Dispatch<SetStateAction<User | null>>;
  setStatus: Dispatch<SetStateAction<UserStatus | null>>;
  setAuthSession: (session: { user: User; status: UserStatus; token: string }) => void;
  refetchUser: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const pathname = usePathname();

  const searchParams = useSearchParams();

  const loginMutation = useLogin();

  const logoutMutation = useLogout();

  const user = useBoundStore((s) => s.user);
  const status = useBoundStore((s) => s.status);
  const setUser = useBoundStore((s) => s.setUser);
  const setStatus = useBoundStore((s) => s.setStatus);
  const isInitialized = useBoundStore((s) => s.isInitialized);
  const setAuthSession = useBoundStore((s) => s.setAuthSession);
  const clearAuthSession = useBoundStore((s) => s.clearAuthSession);
  const setAuthInitialized = useBoundStore((s) => s.setAuthInitialized);
  const stopDepositBalanceSync = useBoundStore((s) => s.stopDepositBalanceSync);

  const { i18n } = useTranslation();

  const { data: currentUser, isLoading: isUserLoading, refetch: refetchUser } = useCurrentUser();

  // ref 读取最新路径，避免加入 effect 依赖数组导致任何导航都触发语言重置
  const pathnameRef = useRef(pathname);
  const searchParamsRef = useRef(searchParams);
  useEffect(() => {
    pathnameRef.current = pathname;
  });
  useEffect(() => {
    searchParamsRef.current = searchParams;
  });

  const setUserCompat = useCallback<Dispatch<SetStateAction<User | null>>>(
    (value) => {
      setUser(value);
    },
    [setUser],
  );

  const setStatusCompat = useCallback<Dispatch<SetStateAction<UserStatus | null>>>(
    (value) => {
      setStatus(value);
    },
    [setStatus],
  );

  const clearLocalAuthState = useCallback(() => {
    // 会话级兜底清理：depositBalanceSync 是全局 store 状态，
    // 用户登出 / 认证过期时必须主动关闭，避免残留到下一次登录会话。
    stopDepositBalanceSync();

    clearAuthSession();
  }, [clearAuthSession, stopDepositBalanceSync]);

  // 设置初始化状态
  useEffect(() => {
    if (!isUserLoading) {
      setAuthInitialized(true);
    }
  }, [isUserLoading, setAuthInitialized]);

  // 监听认证过期事件
  useEffect(() => {
    const handleAuthExpired = () => {
      clearLocalAuthState();

      // 可以在这里显示提示信息或进行其他处理
    };

    window.addEventListener("auth:expired", handleAuthExpired);

    return () => {
      window.removeEventListener("auth:expired", handleAuthExpired);
    };
  }, [clearLocalAuthState]);

  // 将服务端最新用户数据同步回 store，确保后台刷新后 store 不过期
  useEffect(() => {
    if (!currentUser?.user) return;
    setUser(currentUser.user);
    if (currentUser.status) setStatus(currentUser.status);
  }, [currentUser?.user, currentUser?.status, setUser, setStatus]);

  // 语言优先级: 用户个人语言 > 用户主动选择标记 > i18next 默认流程
  // 仅依赖服务端返回的 language_code，pathname/searchParams 通过 ref 读取避免触发自激
  useEffect(() => {
    const userLanguage = currentUser?.user?.language_code;
    const locale = normalizeLocale(userLanguage);
    if (!userLanguage || locale === i18n.language) return;

    /** 写 NEXT_LOCALE cookie，让 middleware 在后续无 locale 前缀的导航中自动补全 */
    setLocaleCookie(locale);

    void i18n.changeLanguage(locale);
    const search = searchParamsRef.current.toString();
    const currentHref = search ? `${pathnameRef.current}?${search}` : pathnameRef.current;
    router.replace(localizeHref(currentHref, locale));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.user?.language_code]);

  const login = useCallback(
    async (username: string, password: string) => {
      const device_id = uuidv4Generate();

      await loginMutation.mutateAsync({ username, password, device_id });
    },
    [loginMutation],
  );

  const logout = useCallback(async () => {
    const userId = user?.id;
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("logout_intent", "1");
    }
    try {
      await logoutMutation.mutateAsync();
    } finally {
      clearLocalAuthState();
      clearUserSpecificStorage(userId);
      router.replace(localizeHref("/casino"));
    }
  }, [clearLocalAuthState, logoutMutation, router, user?.id]);

  const value = useMemo(
    () => ({
      user,
      status,
      isAuthenticated: !!user,
      isLoading: isUserLoading,
      isInitialized,
      login,
      logout,
      loginError: loginMutation.error?.message,
      isLoginLoading: loginMutation.isPending,
      setUser: setUserCompat,
      setStatus: setStatusCompat,
      setAuthSession,
      refetchUser,
    }),
    [
      user,
      status,
      isUserLoading,
      isInitialized,
      login,
      logout,
      loginMutation.error?.message,
      loginMutation.isPending,
      setAuthSession,
      setStatusCompat,
      setUserCompat,
      refetchUser,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
