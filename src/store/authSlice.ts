import { runtimeConfig } from "@/lib/env";
import type { User, UserStatus } from "@/types/auth";
import { AUTH_STORAGE_KEY, AUTH_STORAGE_KEYS, USER_PREF_STORAGE_KEYS, userScopedKey } from "@/utils/storageKeys";
import type { SetStateAction } from "react";
import type { StateCreator } from "zustand";
import type { Store } from "./type";

export type AuthSessionStorage = {
  data?: {
    token?: string | null;
  } | null;
  user?: User | null;
  status?: UserStatus | null;
};

function isBrowser() {
  return typeof window !== "undefined";
}

function isInvalidStoredValue(value: string | null | undefined): boolean {
  return !value || value === "undefined" || value === "null";
}

function setStorageValue(key: string, value: string | null | undefined) {
  if (!isBrowser()) return;

  const nextValue = value ?? "";
  if (isInvalidStoredValue(nextValue)) {
    localStorage.removeItem(key);
    return;
  }

  localStorage.setItem(key, nextValue);
}

function getStorageValue(key: string) {
  if (!isBrowser()) return null;
  const value = localStorage.getItem(key);
  return isInvalidStoredValue(value) ? null : value;
}

function readJsonStorage<T>(key: string): T | null {
  const value = getStorageValue(key);
  if (!value) return null;

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function writeUserAndStatus(user: User | null | undefined, status: UserStatus | null | undefined) {
  if (user) {
    localStorage.setItem(AUTH_STORAGE_KEY.user, JSON.stringify(user));
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY.user);
  }
  if (status) {
    localStorage.setItem(AUTH_STORAGE_KEY.status, JSON.stringify(status));
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY.status);
  }
}

export const authStorage = {
  getToken: () => getStorageValue(AUTH_STORAGE_KEY.token),
  getUser: <T = User>() => readJsonStorage<T>(AUTH_STORAGE_KEY.user),
  getStatus: <T = UserStatus>() => readJsonStorage<T>(AUTH_STORAGE_KEY.status),
  hasAuth: () => Boolean(getStorageValue(AUTH_STORAGE_KEY.token)),
  persistSession: (session: AuthSessionStorage) => {
    if (!isBrowser()) return;
    setStorageValue(AUTH_STORAGE_KEY.token, session.data?.token);
    writeUserAndStatus(session.user, session.status);
  },
  persistUserState: (user: User | null, status: UserStatus | null) => {
    if (!isBrowser()) return;
    writeUserAndStatus(user, status);
  },
  clear: (reason?: string) => {
    if (runtimeConfig.isDev && reason) {
      console.log(`🗑️ Clearing auth - Reason: ${reason}`);
    }

    if (!isBrowser()) return;

    AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
    USER_PREF_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));

    if (reason) {
      window.dispatchEvent(new CustomEvent("auth:expired", { detail: { reason } }));
    }
  },
  clearUserScoped: (userId?: string | number) => {
    if (!isBrowser() || !userId) return;

    Object.values(userScopedKey).forEach((fn) => {
      try {
        localStorage.removeItem(fn(userId));
      } catch {
        // ignore
      }
    });
  },
};

export interface IAuthSlice {
  user: User | null;
  status: UserStatus | null;
  isInitialized: boolean;
  setUser: (user: SetStateAction<User | null>) => void;
  setStatus: (status: SetStateAction<UserStatus | null>) => void;
  setAuthSession: (session: { user: User; status: UserStatus; token: string }) => void;
  clearAuthSession: () => void;
  setAuthInitialized: (isInitialized: boolean) => void;
}

export const createAuthSlice: StateCreator<Store, [], [], IAuthSlice> = (set) => ({
  user: authStorage.getUser<User>(),
  status: authStorage.getStatus<UserStatus>(),
  isInitialized: false,
  setUser: (user) =>
    set((state) => {
      const nextUser = typeof user === "function" ? user(state.user) : user;
      authStorage.persistUserState(nextUser, state.status);
      return { user: nextUser };
    }),
  setStatus: (status) =>
    set((state) => {
      const nextStatus = typeof status === "function" ? status(state.status) : status;
      authStorage.persistUserState(state.user, nextStatus);
      return { status: nextStatus };
    }),
  setAuthSession: ({ user, status, token }) => {
    authStorage.persistSession({ data: { token }, user, status });
    set({ user, status });
  },
  clearAuthSession: () => {
    authStorage.clear();
    set({ user: null, status: null });
  },
  setAuthInitialized: (isInitialized) => set({ isInitialized }),
});
