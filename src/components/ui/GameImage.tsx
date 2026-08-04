import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/utils/cn";
import { GameAvailabilityStatus } from "@/components/GameAvailabilityStatus.tsx";
import { getImgCompressParams, getNetworkType } from "@/utils/helper.ts";
import { useAppNavigate } from "@/hooks/useAppNavigate";

// 已请求/成功加载过的图片 URL，组件重新 mount 时直接跳过加载动画。
// Virtuoso 会卸载离屏元素，用户往回滚动时不能再出现首屏加载效果。
const requestedUrlCache = new Set<string>();
const loadedUrlCache = new Set<string>();
const failedUrlCache = new Set<string>();
const GAME_IMAGE_FALLBACK_SRC = "/favicon/favicon-96x96.png";

interface Game {
  inner_game_id?: string;
  game_provider?: string;
  game_name?: string;
  title?: string;
  image?: string;
  imageUrl?: string;
}

interface GameImageProps {
  src?: string;
  alt?: string;
  gameId?: string;
  size?: number;
  game?: Game;
  className?: string;
  containerClassName?: string;
  onLoad?: () => void;

  disableNavigation?: boolean;
  onClick?: () => void;
  data: Record<string, any>;
  sample?: boolean;
  isActive?: boolean;
  hideLock?: boolean;
  enabledBanGameList?: boolean;
  showHoverEffects?: boolean;
  gameName?: string;
  imageLoading?: "eager" | "lazy";
  imageDecoding?: "sync" | "async" | "auto";
}

type LoadState = "idle" | "loaded" | "error";

export function GameImage({
  src,
  alt,
  data,
  size,
  gameId,
  game,
  className,
  containerClassName,
  onLoad,
  isActive = false,
  disableNavigation = false,
  onClick,
  hideLock = false,
  enabledBanGameList = false,
  sample = false,
  imageLoading,
  imageDecoding,
}: GameImageProps) {
  const navigate = useAppNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const imageSrc = game?.image || game?.imageUrl || src || "/images/game-placeholder.jpg";
  const hasSeenImage = requestedUrlCache.has(imageSrc) || loadedUrlCache.has(imageSrc);
  const hasFailedImage = failedUrlCache.has(imageSrc);

  const [imgUrl, setImgUrl] = useState("");
  const [imgSrcSet, setImgSrcSet] = useState("");
  const [loadState, setLoadState] = useState<LoadState>(() => (hasFailedImage ? "error" : hasSeenImage ? "loaded" : "idle"));
  const [containerWidth, setContainerWidth] = useState(size ?? 140);

  const onLoadRef = useRef(onLoad);
  onLoadRef.current = onLoad;

  useLayoutEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const updateWidth = () => {
      const measuredWidth = node.offsetWidth || 140;
      setContainerWidth((prev) => {
        const nextWidth = Math.max(size ?? 0, measuredWidth);
        return prev === nextWidth ? prev : nextWidth;
      });
    };

    updateWidth();

    if (typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(() => updateWidth());
    observer.observe(node);

    return () => observer.disconnect();
  }, [size]);

  // 浏览器绘制前测量容器真实宽度，生成精确 URL，避免二次请求
  useEffect(() => {
    const w = Math.max(1, Math.round(containerWidth));
    const h = Math.round(Number(w) * 4 / 3);
    const network = getNetworkType();
    const url = getImgCompressParams(imageSrc, w, 100, h, network, 1);
    const srcSet = network === "4g"
      ? [
        `${url} 1x`,
        `${getImgCompressParams(imageSrc, w, 100, h, network, 1.5)} 1.5x`,
        `${getImgCompressParams(imageSrc, w, 90, h, network, 2)} 2x`,
      ].join(", ")
      : network === "3g"
        ? [
          `${url} 1x`,
          `${getImgCompressParams(imageSrc, w, 85, h, network, 1.5)} 1.5x`,
        ].join(", ")
        : "";
    const isKnownLoaded = loadedUrlCache.has(imageSrc);
    const isKnownRequested = requestedUrlCache.has(imageSrc);
    const isKnownFailed = failedUrlCache.has(imageSrc);

    requestedUrlCache.add(imageSrc);
    setImgUrl(isKnownFailed ? GAME_IMAGE_FALLBACK_SRC : url);
    setImgSrcSet(isKnownFailed ? "" : srcSet);
    // 用原始 imageSrc 做缓存 key，避免因容器宽度不同生成不同压缩 URL 导致缓存失效
    setLoadState(isKnownFailed ? "error" : isKnownLoaded || isKnownRequested ? "loaded" : "idle");
  }, [containerWidth, imageSrc]);

  const navigationGameId = game
    ? game.game_provider
      ? `${game.game_provider}:${game.inner_game_id}`
      : game.inner_game_id
    : gameId;

  const isClickable = !!(onClick || (!disableNavigation && navigationGameId));

  const handleClick = () => {
    if (onClick) return onClick();
    if (!disableNavigation && navigationGameId) {
      void navigate({ to: "/games/$gameId", params: { gameId: navigationGameId }, search: {} });
    }
  };

  const handleImageError = () => {
    if (imgUrl === GAME_IMAGE_FALLBACK_SRC) {
      failedUrlCache.add(imageSrc);
      setLoadState("error");
      return;
    }

    if (imgUrl !== imageSrc && imageSrc !== GAME_IMAGE_FALLBACK_SRC) {
      setImgUrl(imageSrc);
      return;
    }

    failedUrlCache.add(imageSrc);
    setImgUrl(GAME_IMAGE_FALLBACK_SRC);
    setLoadState("error");
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full overflow-hidden rounded-lg bg-base-200 aspect-[3/4]",
        loadState === "idle" && "animate-pulse",
        isClickable && "cursor-pointer",
        containerClassName
      )}
      onClick={isClickable ? handleClick : undefined}
    >
      {imgUrl && (
        <img
          src={imgUrl}
          srcSet={imgSrcSet || undefined}
          alt={game?.game_name || game?.title || alt || "Game"}
          loading={imageLoading}
          decoding={imageDecoding}
          onLoad={() => {
            if (imgUrl === GAME_IMAGE_FALLBACK_SRC) {
              failedUrlCache.add(imageSrc);
              setLoadState("error");
              return;
            }

            loadedUrlCache.add(imageSrc);
            setLoadState("loaded");
            onLoadRef.current?.();
          }}
          onError={handleImageError}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-300",
            loadState === "loaded" || loadState === "error" ? "opacity-100" : "opacity-0",
            loadState === "error" && "object-contain p-6 opacity-60",
            className,
          )}
        />
      )}

      {!hideLock && (
        <GameAvailabilityStatus data={data} sample={sample} enabledBanGameList={enabledBanGameList} />
      )}

      {isActive && (
        <div className="pointer-events-none absolute inset-0 z-[1] rounded-lg shadow-[inset_0_0_0_2px_rgba(255,184,0,0.95)]" />
      )}
    </div>
  );
}
