import Iconify from "@/components/iconify";
import { TextBaseContent } from "@/components/standard/TextBaseContent.tsx";
import { FavoriteButton } from "@/components/ui/FavoriteButton.tsx";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { useLikeGameMutation } from "@/hooks/api/useAuth.ts";
import { buildConfig } from "@/lib/env";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { localizeHref } from "@/lib/navigation";
import { useBoundStore } from "@/store";
import { getImgCompressParams, getPathInROIBEST } from "@/utils/helper.ts";
import clsx from "clsx";
import { ArrowRight, GlobeLock, LockKeyhole } from "lucide-react";
import { useLocale } from "next-intl";
import Link from "next/link";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

// ‼️
// 游戏面板容器：从 header 底部向下铺满屏幕（fixed 定位，覆盖主内容区）
// 用于 gaming-guard 加载态、isDirectPlay 模式、非全屏游戏运行态
export const GAME_PANEL_CLS = "fixed inset-x-0 bottom-0 z-[1000] bg-base-200";
export const GAME_PANEL_STYLE = { top: "calc(var(--safe-area-inset-top) + var(--app-header-height))" };

export const CurrencySettlementProhibited = () => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-2 rounded-md bg-base-100 p-2 text-sm">
      <LockKeyhole className="w-4 h-4 text-warning" />
      <TextBaseContent text={t("common.gameAccessibleToCurrencies")} />
    </div>
  );
};

export const RegionalAccessProhibited = () => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-2 rounded-md bg-base-100 p-2 text-sm">
      <GlobeLock className="w-4 h-4 text-warning" />
      <TextBaseContent text={t("common.gameNotAccessibleInYourRegion")} />
    </div>
  );
};

export const InsufficientBalance = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  return (
    <div className="flex items-center gap-2 rounded-md bg-base-100 p-2 text-sm">
      <Iconify icon="mdi:wallet-outline" className="h-4 w-4 shrink-0 text-warning" />
      <span className="text-sm flex-1 text-base-content/70">{t("finance:insufficient_balance")}</span>
      <Link href={localizeHref("/finance/deposit", locale)}
            className="btn btn-primary btn-sm shrink-0 uppercase">
        {t("common.deposit")}
      </Link>
    </div>
  );
};

export const HeroBanner = ({ image, display_game_name }: { image: string; display_game_name: string }) => {
  return (
    <>
      {/* ── Hero Banner ── */}
      <div className="relative w-full h-60 overflow-hidden shrink-0 bg-base-100">
        {/* 背景图低质量拉伸填充，无 filter */}
        <img
          src={getImgCompressParams(image, 240, 25)}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full object-cover w-60 aspect-[3/4]"
        />
        {/* 多层渐变蒙层模拟景深压暗，替代 blur */}
        <div className="absolute inset-0 bg-base-200/70" />
        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-base-200 to-transparent" />

        {/* 游戏封面居中 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src={getImgCompressParams(image, 120, 100, 160)}
            alt={display_game_name}
            loading="lazy"
            className="h-40 w-auto rounded-lg object-cover shadow-2xl"
          />
        </div>
      </div>
    </>
  );
};

const BountyShortcut = ({
  bounty,
  formattedBountyReward
}: {
  bounty?: Record<string, any> | null;
  formattedBountyReward: string;
}) => {
  const { t } = useTranslation(["gameDetail", "bonus", "bounty"]);
  const locale = useLocale();
  const hasBounty = bounty?.has_active_challenge;

  if (!hasBounty) return null;

  return (
    <Link
      href={localizeHref("/bounty/active", locale)}
      className="flex items-center gap-2 rounded-lg px-2 py-2 skeleton bg-base-100"
    >
      <img
        src="/images/bonus_bounty/bounty-card.png"
        alt=""
        aria-hidden
        className="w-8 animate-gift-shake"
      />
      <h2 className="text-sm font-bold uppercase">
        {t("bounty:bounty")}
      </h2>
      <div className="min-w-0 flex-1 text-xs text-primary italic">
        {t("gameDetail:bountyWin", { amount: formattedBountyReward })}
      </div>
      <span className="shrink-0 rounded-full bg-primary/10 p-2 text-primary transition-transform duration-200 group-hover:translate-x-0.5">
        <ArrowRight className="h-4 w-4" />
      </span>
    </Link>
  );
};

export const MainContent = ({ gamingGuide }: { gamingGuide: Record<string, any> }) => {
  const { t } = useTranslation(["gameDetail", "bonus"]);
  const { formatWithConversion } = useDisplayCurrencyFormatter();

  const [, setGameInfoTransLoaded] = useState(false);

  const { i18n } = useTranslation(["common", "menu", "gameDetail", "bonus"]);

  /**
   * TODO
   *  拆分游戏信息的翻译文件按需加载
   *  之前的文件体积过大,加载时间长,维护困难
   */
  useEffect(() => {
    const provider = gamingGuide?.game_provider;
    if (!provider) return;

    const namespace = `game_${provider}`;

    // 检查是否已经加载过
    if (i18n.hasResourceBundle(i18n.language, namespace)) {
      setGameInfoTransLoaded(false);
      return;
    }

    setGameInfoTransLoaded(true);

    fetch(`${getPathInROIBEST()}/locales/${i18n.language}/games/${namespace}.json?v=${buildConfig.version}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        i18n.addResourceBundle(i18n.language, namespace, data, true, true);
        setGameInfoTransLoaded(false);
      })
      .catch((error) => {
        console.error(`Failed to load ${namespace}:`, error);
        setGameInfoTransLoaded(false);
      });
  }, [i18n.language, gamingGuide?.game_provider]);

  const rawBounty = gamingGuide?.bounty;
  const formattedBountyReward = formatWithConversion(rawBounty?.reward_amount || 0, rawBounty?.reward_currency || "USDT", {
    showCode: true,
    showSymbol: false
  }).formatted;
  console.info(gamingGuide);
  return (
    <>
      {/* ── 主内容 ── */}
      <div className="flex flex-col gap-4 p-4">
        {/* 标题 + Provider */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <p className="text-lg font-bold">{gamingGuide?.display_game_name}</p>
            <FavoriteGame gameGuide={gamingGuide} />
          </div>
          <span className="font-bold italic text-sm text-primary">{gamingGuide?.provider_name}</span>
          {gamingGuide?.tags && (
            <div className="flex flex-wrap gap-1 mt-1">
              <InnerBadge value={gamingGuide.tags.split(",")} />
            </div>
          )}
        </div>

        {/* ── 统计数据 ── */}
        {(gamingGuide?.rtp || gamingGuide?.max_win) && (
          <div className="grid grid-cols-2 gap-1">
            {gamingGuide?.rtp && (
              <div className="flex flex-col gap-1 bg-base-100 px-2 py-2 rounded-lg">
                <span className="text-base-content/50 text-xs">{t("gameDetail:rtp")}</span>
                <div className="font-bold text-sm flex items-center gap-1">
                  <Iconify icon="custom:percent" className="w-4 h-4" />
                  {gamingGuide.live_rtp?`4H:${gamingGuide.live_rtp}%`:gamingGuide.rtp}
                </div>
              </div>
            )}
            {gamingGuide?.max_win && (
              <div className="flex flex-col gap-0.5 bg-base-100 px-2 py-2 rounded-lg">
                <span className="text-base-content/50 text-xs">{t("gameDetail:maxWin")}</span>
                <div className="font-bold text-sm flex items-center gap-1">
                  <Iconify icon="custom:max-win" className="w-4 h-4" />
                  {gamingGuide.max_win}
                </div>
              </div>
            )}
          </div>
        )}

        <BountyShortcut bounty={rawBounty} formattedBountyReward={formattedBountyReward} />

        {/* ── 游戏简介 ── */}
        <TextBaseContent
          text={t(`game_${gamingGuide?.game_provider}.${gamingGuide?.game_provider}_${gamingGuide?.inner_game_id}`)} />
      </div>
    </>
  );
};

const Badge = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div
    className={clsx("rounded-sm font-bold bg-base-100 px-2 py-1 text-base-content/50 text-[12px]", className)}>{children}</div>
);

const InnerBadge = ({ extra, value, className }: { extra?: ReactNode; value: any; className?: string }) => {
  if (value === undefined || value === null || value === "") return null;
  if (Array.isArray(value))
    return value.map((tag, i) => (
      <Badge key={i} className={className}>
        {tag}
      </Badge>
    ));
  return (
    <Badge className={className}>
      {extra}
      {value}
    </Badge>
  );
};

function FavoriteGame({ gameGuide }: { gameGuide: Record<string, any> }) {
  const { mutate: likeGame } = useLikeGameMutation();
  const { t } = useTranslation("toast");

  const status = useBoundStore((state) => state.status);
  const setUserLocalStatus = useBoundStore((state) => state.setStatus);

  // TODO: 检查游戏是否已收藏
  const isFavorite = useMemo(() => {
    if (!gameGuide?.inner_game_id || !status?.favorites_game) return false;
    const favoritesList = status.favorites_game.split(",").filter((item) => item.trim().length > 0);
    return favoritesList.includes(gameGuide.inner_game_id);
  }, [gameGuide?.inner_game_id, status?.favorites_game]);

  // TODO: 处理收藏切换
  const handleFavorite = useCallback(
    async (status: boolean) => {
      // TODO: 更新全局收藏状态 - user status data
      setUserLocalStatus((prev) => {
        if (!prev) return prev;

        const favorites = new Set(prev.favorites_game?.split(",").filter((item) => item.trim().length > 0));

        if (!favorites.has(gameGuide?.inner_game_id)) {
          favorites.add(gameGuide?.inner_game_id);

          if (status) toast.success(t("gameFavorited"));
        } else {
          favorites.delete(gameGuide?.inner_game_id);
        }

        return {
          ...prev,
          favorites_game: Array.from(favorites).join(",")
        };
      });

      // TODO: 乐观更新
      likeGame(gameGuide?.inner_game_id);
    },
    [gameGuide]
  );

  return <FavoriteButton initialLiked={isFavorite} onToggle={handleFavorite} size="sm"
                         className="btn-xs bg-base-100" />;
}
