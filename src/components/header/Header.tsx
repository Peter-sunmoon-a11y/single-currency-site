import { useTranslation } from "@/lib/i18n/react-i18next";
import { useBonusClaimCount } from "@/hooks/api/useAuth.ts";
import { useAppNavigate } from "@/hooks/useAppNavigate";
import { useAuthAction } from "@/hooks/useAuthAction";
import { useTelegramContext } from "@/hooks/useTelegramContext";
import { localizeHref } from "@/lib/navigation";
import { ChevronLeft, Gamepad2, Gift, UserRound } from "lucide-react";
import dynamic from "next/dynamic";
import { useLocale } from "next-intl";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { isSupportedLocale } from "@/lib/i18n/config";
import { useBoundStore } from "@/store";
import { cn } from "@/utils/cn";
import { getImgCompressParams, useRumSdkUserLog } from "@/utils/helper.ts";
import {
  setTelegramBackButtonVisible,
  subscribeTelegramBackButtonClick,
} from "@/utils/telegramWebApp";
import { useCallback, useEffect } from "react";
import Logo from "../Logo";
import { WalletFinance } from "./WalletFinance";
import GoogleAuth from "@/components/socialLogin/GoogleAuth.tsx";
import { useAuth } from "@/contexts/AuthContext.tsx";

const InternalMessageEntry = dynamic(
  () => import("@/components/header/message-v2/InternalMessageEntry.tsx").then((mod) => mod.InternalMessageEntry),
  { ssr: false, loading: () => null }
);

const AUTH_PAGES = ["/signin", "/signup"];

const isDirectPlayPath = (pathname: string) => {
  const [, maybeLocale, route, ...rest] = pathname.split("/");
  if (isSupportedLocale(maybeLocale) && route === "games") {
    return rest[0] === "play";
  }

  return pathname.startsWith("/games/play/");
};

function ProfileEntry({ locale }: { profileInitial?: string; locale: string }) {
  const { t } = useTranslation();

  const { user } = useAuth();

  return (
    <Link
      href={localizeHref("/profile", locale)}
      aria-label={t("profile:profile", "Profile")}
      className="btn btn-primary btn-soft btn-circle w-9 h-9 relative overflow-hidden"
    >
      {
        user?.avatar
          ? <img src={getImgCompressParams(user?.avatar ?? "", 68, undefined, 68)} alt="" />
          : <UserRound
            size={20}
            aria-hidden="true"
            className="absolute inset-0 m-auto text-primary pointer-events-none"
          />
      }
    </Link>
  );
}

function GuestEntryActions() {
  const { t } = useTranslation();
  const { openAuth } = useAuthAction();

  return (
    <>
      <GoogleAuth enabled />
      <button className="btn btn-primary h-9"
              onClick={() => openAuth("signin")}>
        {t("login:signIn")}
      </button>
    </>
  );
}

function InGameBadge() {
  const { t } = useTranslation();

  return (
    <div
      className="w-full text-success flex h-9 min-w-30 gap-1 items-center justify-center rounded-field bg-[color-mix(in_oklab,var(--color-primary)_8%,var(--color-base-100))] px-2 text-sm font-bold uppercase">
      <Gamepad2 size={20} className={"animate-pulse"} />{t("common:inGame1", "In Game")}
    </div>
  );
}

function BonusEntry() {
  const { t } = useTranslation();
  const navigate = useAppNavigate();
  const { data } = useBonusClaimCount();
  const totalCount = data?.data?.total_count ?? 0;

  return (
    <button
      type="button"
      aria-label={t("menu:bonus", "Bonus")}
      className="indicator z-40 h-9 w-9 btn btn-primary btn-soft btn-square border-none"
      onClick={() => navigate({ to: "/bonus", search: { view: undefined, tab: undefined } })}
    >
      <Gift size={20} />
      {totalCount > 0 && (
        <span
          aria-hidden="true"
          className="absolute top-0 right-0 h-2 w-2 rounded-full bg-success z-20"
        />
      )}
    </button>
  );
}

function AuthSection({ isAuthPage }: { isAuthPage: boolean }) {
  const user = useBoundStore((state) => state.user);
  const isLoading = !useBoundStore((state) => state.isInitialized);
  const headerBackAction = useBoundStore((state) => state.headerBackAction);
  const locale = useLocale();
  const pathname = usePathname();

  const isTelegram = useTelegramContext();
  const profileInitial = user?.nickname?.trim()?.slice(0, 4) || user?.username?.trim()?.slice(0, 4);
  const isInGame = isDirectPlayPath(pathname) || Boolean(headerBackAction);

  return (
    <div className="flex items-center gap-2 w-full justify-end">
      {!isLoading && user && (
        <div className="flex flex-row items-center gap-1.5 w-full justify-end">
          {isInGame ? <InGameBadge /> : <WalletFinance />}
          {/* 奖励领取 */}
          <BonusEntry />
          {/* 站内信 */}
          <InternalMessageEntry />
          <ProfileEntry profileInitial={profileInitial} locale={locale} />
        </div>
      )}

      {!isTelegram && !isLoading && !user && !isAuthPage && (
        <GuestEntryActions />
      )}
    </div>
  );
}

export default function Header() {
  // const { openModal: openLanguageModal } = useLanguageModal();
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const locationSearchParams = useSearchParams();
  const location = {
    pathname,
    search: locationSearchParams.toString() ? `?${locationSearchParams.toString()}` : "",
    href: locationSearchParams.toString() ? `${pathname}?${locationSearchParams.toString()}` : pathname,
    hash: typeof window === "undefined" ? "" : window.location.hash
  };
  const isCasino = location.pathname === "/casino";
  const isAuthPage = AUTH_PAGES.some((p) => location.pathname.includes(p));
  const isTelegram = useTelegramContext();

  const handleBack = useCallback(() => {
    const { headerBackAction } = useBoundStore.getState();
    if (headerBackAction) {
      headerBackAction();
    } else {
      router.back();
    }
  }, [router]);

  const { rumSetConfig } = useRumSdkUserLog();
  useEffect(() => {
    rumSetConfig();
  }, [rumSetConfig]);

  useEffect(() => {
    if (!isTelegram) return;

    const shouldShowBackButton = !isCasino;
    setTelegramBackButtonVisible(shouldShowBackButton);

    if (!shouldShowBackButton) {
      return () => {
        setTelegramBackButtonVisible(false);
      };
    }

    const unsubscribe = subscribeTelegramBackButtonClick(handleBack);
    return () => {
      unsubscribe();
      setTelegramBackButtonVisible(false);
    };
  }, [handleBack, isCasino, isTelegram]);

  return (
    <div
      className={cn(
        "app-header",
        "px-1 w-full bg-base-300 fixed top-0 left-0 right-0 z-[1001] pt-[var(--safe-area-inset-top)] border-b-2 border-b-primary/15"
      )}
    >
      <div className="w-full h-12 flex gap-1.5 items-center justify-between">
        <div className="flex items-center gap-1.5" style={{ zIndex: 40 }}>
          {/* 返回按钮：casino 页透明占位，auth 页隐藏，其他页正常显示 */}
          <button
            className={cn(
              "group shrink-0 w-8 h-8 flex items-center justify-center transition-[transform,opacity] duration-300 active:scale-90",
              isCasino ? "opacity-0 pointer-events-none" : "opacity-100"
            )}
            onClick={(e) => {
              e.preventDefault();
              handleBack();
            }}
            type="button"
            style={{ zIndex: 50 }}
          >
            <ChevronLeft
              className="w-5 h-5 pointer-events-none text-base-content/40 transition-transform duration-200 group-hover:-translate-x-0.5" />
          </button>

          {/* Logo：casino 页向左平移覆盖透明按钮的空间，贴近左边 */}
          <div
            className={cn("transition-transform duration-300 ease-out", isCasino ? "-translate-x-[38px]" : "translate-x-0")}>
            <Link href={localizeHref("/casino", locale)}>
              <Logo />
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-1 w-full" style={{ zIndex: 40 }}>
          <AuthSection isAuthPage={isAuthPage} />
        </div>
      </div>
    </div>
  );
}
