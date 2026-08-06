import { getSocialLogoUrl, siteConfig } from "@/lib/env";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { isIOS } from "@/utils/browser";
import { toast } from "sonner";
import { useReferralLink } from "@/hooks/useReferralLink";
import qr from "qr.js";
import { getImgCompressParams } from "@/utils/helper";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import Iconify from "@/components/iconify";
import { Modal } from "@/components/ui/Modal";
import { Trans, useTranslation } from "@/lib/i18n/react-i18next";
import { useMqttTopicMessagesReadonly, useMqttService } from "@/contexts/mqtt";
import { useBoundStore } from "@/store";
import { uploadShareImage } from "@/services/auth/referral";
import { shareTo } from "@/features/social/lib/socialShare";
import type { SocialNavigationResult } from "@/features/social/lib/socialNavigation";
import { useTelegramContext } from "@/hooks/useTelegramContext";
import {
  openExternalUrl as openExternalUrlInTMA,
} from "@/utils/telegramWebApp";

const loadImage = (src: string, crossOrigin?: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    if (crossOrigin) img.crossOrigin = crossOrigin;
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

const WIN_IMAGE_CONFIG: Record<string, { image: string; color: string }> = {
  bigwin: { image: "/images/game_pages/big-win.png", color: "#008E31" },
  mega: { image: "/images/game_pages/mega-win.png", color: "#E72B2B" },
  supermega: { image: "/images/game_pages/super-win.png", color: "#D102BD" }
};

const QR_LOGO = `/favicon/web-app-manifest-192x192.png`;
const WEBSITE_NICKNAME = siteConfig.nickname;

const SCALE = 2;
const s = (v: number) => v * SCALE;

const CANVAS_SIZE = s(335);
const QR_SIZE = s(80);
const QR_MARGIN_RIGHT = s(35);
const QR_MARGIN_BOTTOM = s(29);
const QR_RADIUS = s(12);
const QR_PADDING = s(4);
const LOGO_SIZE = s(18);

const GAME_IMG_X = s(13);
const GAME_IMG_Y = s(89);
const GAME_IMG_W = s(87);
const GAME_IMG_H = s(117);
const GAME_IMG_RADIUS = s(12);

const LIGHTNING_IMAGE = "/images/game_pages/lightning.png";
const LIGHTNING_WIDTH = s(221);
const LIGHTNING_HEIGHT = s(125);
const LIGHTNING_MARGIN_RIGHT = s(12);
const LIGHTNING_Y = s(85);

const PERCENTAGE_FONT_SIZE = s(28);
const PRIZE_FONT_SIZE = s(24);
const TEXT_GAP = s(6);
const TEXT_SHADOW_OFFSET_PCT = s(2);
const TEXT_SHADOW_OFFSET_PRIZE = s(4);
const STROKE_WIDTH = s(4);

const SHARE_TEXT_BLOCK_WIDTH = s(180);
const SHARE_TEXT_GAP = s(8);
const LINE_HEIGHT = s(20);
const SHARE_TEXT_FONT_SIZE = s(16);

const DOWNLOAD_PLATFORMS = new Set(["youtube", "instagram", "download"]);

const WIN_TYPE_IMAGE_TYPE_MAP: Record<string, string> = {
  bigwin: "Big Win",
  mega: "Mega Win",
  supermega: "Super Mega Win"
};

const SOCIAL_ICONS = [
  { id: "facebook", icon: "facebook.svg" },
  { id: "instagram", icon: "instagram.svg" },
  { id: "whatsapp", icon: "whatsapp.svg" },
  { id: "x", icon: "twitter.svg" },
  { id: "telegram", icon: "telegram.svg" },
  { id: "download", icon: "download.svg" }
] as const;

const getPercentage = (multiplier: number) => `${multiplier} X`;

const drawGameImage = (ctx: CanvasRenderingContext2D, gameImg: HTMLImageElement) => {
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(GAME_IMG_X, GAME_IMG_Y, GAME_IMG_W, GAME_IMG_H, GAME_IMG_RADIUS);
  ctx.clip();
  ctx.drawImage(gameImg, GAME_IMG_X, GAME_IMG_Y, GAME_IMG_W, GAME_IMG_H);
  ctx.restore();
};

const drawLightningWithText = (
  ctx: CanvasRenderingContext2D,
  lightningImg: HTMLImageElement,
  multiplier: number,
  winAmountUsdt: string,
  winColor: string,
  canvasWidth: number
) => {
  const lightningX = canvasWidth - LIGHTNING_WIDTH - LIGHTNING_MARGIN_RIGHT;
  ctx.drawImage(lightningImg, lightningX, LIGHTNING_Y, LIGHTNING_WIDTH, LIGHTNING_HEIGHT);

  const textX = lightningX + LIGHTNING_WIDTH / 2;
  const lightningCenterY = LIGHTNING_Y + LIGHTNING_HEIGHT / 2;
  const combinedHeight = PERCENTAGE_FONT_SIZE + TEXT_GAP + PRIZE_FONT_SIZE;
  const startY = lightningCenterY - combinedHeight / 2;

  const percentageY = startY + PERCENTAGE_FONT_SIZE / 2;
  const percentageText = getPercentage(multiplier);

  ctx.font = `italic 900 ${PERCENTAGE_FONT_SIZE}px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillStyle = "#000000";
  ctx.fillText(percentageText, textX, percentageY + TEXT_SHADOW_OFFSET_PCT);

  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = STROKE_WIDTH;
  ctx.strokeText(percentageText, textX, percentageY);

  ctx.fillStyle = winColor;
  ctx.fillText(percentageText, textX, percentageY);

  const prizeY = startY + PERCENTAGE_FONT_SIZE + TEXT_GAP + PRIZE_FONT_SIZE / 2;

  ctx.font = `italic 900 ${PRIZE_FONT_SIZE}px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;

  ctx.fillStyle = "#000000";
  ctx.fillText(winAmountUsdt, textX, prizeY + TEXT_SHADOW_OFFSET_PRIZE);

  ctx.fillStyle = "#FFE500";
  ctx.fillText(winAmountUsdt, textX, prizeY);
};

const drawQrCode = (
  ctx: CanvasRenderingContext2D,
  referralLink: string,
  logoImg: HTMLImageElement,
  canvasWidth: number,
  canvasHeight: number
) => {
  const { modules } = qr(referralLink, { errorCorrectionLevel: "H" });
  const moduleCount = modules.length;
  const cellSize = QR_SIZE / moduleCount;

  const qrX = canvasWidth - QR_SIZE - QR_MARGIN_RIGHT;
  const qrY = canvasHeight - QR_SIZE - QR_MARGIN_BOTTOM;

  const bgX = qrX - QR_PADDING;
  const bgY = qrY - QR_PADDING;
  const bgSize = QR_SIZE + QR_PADDING * 2;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(bgX, bgY, bgSize, bgSize, QR_RADIUS);
  ctx.fillStyle = "#FFFFFF";
  ctx.fill();
  ctx.closePath();
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(qrX, qrY, QR_SIZE, QR_SIZE, QR_RADIUS - 2);
  ctx.clip();
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(qrX, qrY, QR_SIZE, QR_SIZE);
  ctx.fillStyle = "#000000";
  modules.forEach((row: boolean[], i: number) => {
    row.forEach((cell: boolean, j: number) => {
      if (cell) ctx.fillRect(qrX + j * cellSize, qrY + i * cellSize, cellSize, cellSize);
    });
  });
  ctx.restore();

  const logoX = qrX + (QR_SIZE - LOGO_SIZE) / 2;
  const logoY = qrY + (QR_SIZE - LOGO_SIZE) / 2;
  ctx.drawImage(logoImg, logoX, logoY, LOGO_SIZE, LOGO_SIZE);

  return { bgX, qrY };
};

const drawShareText = (ctx: CanvasRenderingContext2D, shareLang: string, bgX: number, qrY: number) => {
  const textColor = "#FFFFFF";
  const websiteColor = getComputedStyle(document.documentElement).getPropertyValue("--color-primary").trim();

  const shareLangWords = shareLang.split(" ").filter(Boolean).map(w => ({ text: w, color: textColor }));
  const nicknameWords = WEBSITE_NICKNAME
    ? WEBSITE_NICKNAME.split(" ").filter(Boolean).map((w: string) => ({ text: w, color: websiteColor }))
    : [];
  const allWords = [...shareLangWords, ...nicknameWords];

  ctx.font = `bold ${SHARE_TEXT_FONT_SIZE}px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";

  const lines: { text: string; color: string }[][] = [];
  let currentLineWords: { text: string; color: string }[] = [];
  let currentLineWidth = 0;

  for (const word of allWords) {
    const wordWidth = ctx.measureText(word.text).width;
    const gapWidth = currentLineWords.length > 0 ? ctx.measureText(" ").width : 0;
    if (currentLineWidth + gapWidth + wordWidth > SHARE_TEXT_BLOCK_WIDTH && currentLineWords.length > 0) {
      lines.push(currentLineWords);
      currentLineWords = [word];
      currentLineWidth = wordWidth;
    } else {
      currentLineWords.push(word);
      currentLineWidth += gapWidth + wordWidth;
    }
  }
  if (currentLineWords.length > 0) lines.push(currentLineWords);

  const textX = bgX - SHARE_TEXT_GAP - SHARE_TEXT_BLOCK_WIDTH;
  const textCenterY = qrY + QR_SIZE / 2;
  const totalTextHeight = lines.length * LINE_HEIGHT;
  const textStartY = textCenterY - totalTextHeight / 2 + LINE_HEIGHT / 2;

  lines.forEach((lineWords, i) => {
    let x = textX;
    lineWords.forEach((word, j) => {
      ctx.fillStyle = word.color;
      ctx.fillText(word.text, x, textStartY + i * LINE_HEIGHT);
      x += ctx.measureText(word.text).width;
      if (j < lineWords.length - 1) {
        ctx.fillText(" ", x, textStartY + i * LINE_HEIGHT);
        x += ctx.measureText(" ").width;
      }
    });
  });
};

export const ReferralShareModalBigWin = ({ open, closeModal }: { open: boolean, closeModal: () => void }) => {
  const { t } = useTranslation(["referral", "common", "conquest"]);
  const { referralLink } = useReferralLink();
  const isTelegram = useTelegramContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [uploadedShareUrl, setUploadedShareUrl] = useState<string | null>(null);
  const [winTypeLabel, setWinTypeLabel] = useState("Big Win");
  const { formatWithConversion } = useDisplayCurrencyFormatter();
  const [, setIsOpen] = useState(false);
  const user = useBoundStore((state) => state.user);

  const bigWinTopic = user?.id ? `user/${user.id}/big_win_share` : undefined;

  const { parsedMessages } = useMqttTopicMessagesReadonly<any>(bigWinTopic ?? null);
  const { clearMessages } = useMqttService();

  const latest = useMemo(() => {
    if (!parsedMessages?.length) return null;
    return parsedMessages.reduce((max: any, msg: any) => {
      if (!max) return msg.parsed;
      return (msg.parsed?.multiplier ?? 0) > (max.multiplier ?? 0) ? msg.parsed : max;
    }, null);
  }, [parsedMessages]);

  const shareLang = t("gameDetail:come_join_me_now_at");

  const lastProcessedRecordIdRef = useRef<string | null>(null);
  const currentWinTypeRef = useRef<string>("");
  const uploadAttemptedIdRef = useRef<string | null>(null);

  const processedImageUrl = useMemo(() => {
    if (!uploadedShareUrl) return "";
    setIsOpen(true);
    return getImgCompressParams(uploadedShareUrl, 335);
  }, [uploadedShareUrl]);

  const generateCompositeImage = useCallback(async (
    multiplier: number,
    winAmountUsdt: string,
    shareLang: string,
    referralLink: string,
    gameImageUrl: string,
    winImageUrl: string,
    winColor: string,
    winType: string
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error("[generateCompositeImage] canvas is null");
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("[generateCompositeImage] ctx is null");
      return;
    }

    try {
      const [bigWinImg, logoImg, gameImg, lightningImg] = await Promise.all([
        loadImage(winImageUrl, "anonymous"),
        loadImage(QR_LOGO, "anonymous"),
        loadImage(gameImageUrl, "anonymous"),
        loadImage(LIGHTNING_IMAGE, "anonymous")
      ]);

      canvas.width = CANVAS_SIZE;
      canvas.height = CANVAS_SIZE;

      ctx.drawImage(bigWinImg, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
      drawGameImage(ctx, gameImg);
      drawLightningWithText(ctx, lightningImg, multiplier, winAmountUsdt, winColor, canvas.width);

      const { bgX, qrY } = drawQrCode(ctx, referralLink, logoImg, canvas.width, canvas.height);
      drawShareText(ctx, shareLang, bgX, qrY);

      currentWinTypeRef.current = winType;
      setWinTypeLabel(WIN_TYPE_IMAGE_TYPE_MAP[winType] || "Big Win");
      setUploadedShareUrl(null);

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.6));
      if (blob && uploadAttemptedIdRef.current !== lastProcessedRecordIdRef.current) {
        uploadAttemptedIdRef.current = lastProcessedRecordIdRef.current;
        const file = new File([blob], "big-win-share.webp", { type: "image/webp" });
        try {
          const imageType = WIN_TYPE_IMAGE_TYPE_MAP[winType] || "Big Win";
          const res = await uploadShareImage(file, imageType);
          if (res.code === 0 && res.data?.image_url) {
            setUploadedShareUrl(res.data.image_url);
          }
        } catch (uploadErr) {
          console.error("Failed to upload share image:", uploadErr);
        }
      }
    } catch (error) {
      console.error("Failed to generate composite image:", error);
    }
  }, [t]);

  const processAndGenerateImage = useCallback((parsed: any) => {
    const winConfig = WIN_IMAGE_CONFIG[parsed?.win_type];
    if (!parsed?.image || !parsed?.multiplier || !parsed?.win_amount_usdt || !referralLink || !winConfig) {
      return false;
    }

    const gameImageUrl = parsed.image?.replace(
      "pub-6345c6c916b94c12be067bfdadc5e526.r2.dev",
      "cdn-a.imgix.net"
    );

    const MAX_RETRIES = 3;
    let retryCount = 0;

    const tryLoad = () => {
      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        const formattedPrize = "+" + formatWithConversion(parsed.win_amount_usdt, "USDT", {
          showCode: false,
          showSymbol: true
        }).formatted;

        generateCompositeImage(
          parsed.multiplier,
          formattedPrize,
          shareLang,
          referralLink,
          gameImageUrl,
          winConfig.image,
          winConfig.color,
          parsed.win_type
        );
      };

      img.onerror = () => {
        retryCount++;
        if (retryCount < MAX_RETRIES) {
          console.warn(`[processAndGenerateImage] Retry ${retryCount}/${MAX_RETRIES} for ${gameImageUrl}`);
          tryLoad();
        } else {
          console.error(`[processAndGenerateImage] Failed after ${MAX_RETRIES} retries:`, gameImageUrl);
        }
      };

      img.src = gameImageUrl;
    };

    tryLoad();
    return true;
  }, [referralLink, shareLang, formatWithConversion, generateCompositeImage, t]);

  useEffect(() => {
    const newRecordId = latest?.id;
    if (newRecordId && newRecordId !== lastProcessedRecordIdRef.current) {
      lastProcessedRecordIdRef.current = newRecordId;
      processAndGenerateImage(latest);
    }
  }, [latest, processAndGenerateImage]);

  const downloadImage = useCallback(async () => {
    if (!canvasRef.current) return;

    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvasRef.current!.toBlob(resolve, "image/webp", 0.6)
      );

      if (!blob) throw new Error("Failed to create blob from canvas");

      if (isIOS() && navigator.share && navigator.canShare?.({ files: [new File([blob], "big-win-share.webp", { type: "image/webp" })] })) {
        const file = new File([blob], "big-win-share.webp", { type: "image/webp" });
        await navigator.share({
          files: [file],
          text: t("gameDetail:share_text_1", { multiplier: latest?.multiplier })
        });
      } else if (isIOS()) {
        const url = URL.createObjectURL(blob);
        const newWindow = window.open(url, "_blank");
        if (!newWindow) toast.error(t("gameDetail:download_failed"));
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } else if (isTelegram) {
        if (uploadedShareUrl) {
          openExternalUrlInTMA(uploadedShareUrl);
        }
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "big-win-share.webp";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    } catch (error) {
      if ((error as Error).name === "AbortError") return;
      toast.error(t("gameDetail:download_failed"));
    }
  }, [isTelegram, t, latest?.multiplier, uploadedShareUrl]);

  const notifyShareIssue = useCallback((result?: SocialNavigationResult) => {
    if (!result) {
      toast.error(t("referral:shareLinkUnavailable", "Share link isn't ready yet. Please try again."));
      return;
    }

    if (result.status === "blocked") {
      toast.error(
        t(
          "referral:sharePopupBlocked",
          "Unable to open the share target. Please allow pop-ups or open it in your browser."
        )
      );
      return;
    }

    if (result.status === "failed" && result.reason === "telegram-open-failed") {
      toast.error(
        t(
          "referral:shareTelegramFailed",
          "Unable to open this share target from Telegram right now."
        )
      );
      return;
    }

    if (result.status === "failed" && result.reason === "clipboard-failed") {
      toast.error(
        t(
          "referral:copyFailed",
          "Unable to copy the link right now. Please try again."
        )
      );
      return;
    }

    toast.error(t("common:error", "Something went wrong. Please try again."));
  }, [t]);

  const handleSocialShare = useCallback(async (platform: string, shareText: string, shareUrl: string) => {
    try {
      if (DOWNLOAD_PLATFORMS.has(platform)) {
        downloadImage();
        return;
      }

      const effectiveShareUrl = uploadedShareUrl || shareUrl;
      const effectiveShareText = shareText + " " + shareUrl;

      if (platform !== "facebook" && platform !== "whatsapp" && platform !== "telegram" && platform !== "x" && platform !== "instagram") {
        return;
      }

      const result = await shareTo(platform, {
        url: effectiveShareUrl,
        text: effectiveShareText,
      });

      if (!result.handled) {
        notifyShareIssue();
        return;
      }

      if (result.copied) {
        toast.success(t("referral:linkCopiedOpenInstagram", "Link copied! Open Instagram to share."));
        return;
      }

      if (result.result?.status !== "opened") {
        notifyShareIssue(result.result);
      }
    } catch (error) {
      console.error("Share error:", error);
      toast.error(t("common:error", "Something went wrong. Please try again."));
    }
  }, [downloadImage, notifyShareIssue, t, uploadedShareUrl]);

  const onClose = useCallback(() => {
    setIsOpen(false);
    setUploadedShareUrl(null);
    clearMessages(bigWinTopic);
    closeModal();
  }, [closeModal, clearMessages, user?.id]);

  return (
    <>
      <canvas ref={canvasRef} className="hidden" />

      <Modal
        title={t('conquest:conquest_big_win_title')}
        isOpen={open}
        onClose={onClose}
        position="modal-middle">
        <div className="mb-4">
          {processedImageUrl && (
            <img
              src={processedImageUrl}
              alt={winTypeLabel}
              className="max-w-full m-auto"
            />
          )}
        </div>

        <div className="font-bold border-t-1 border-base-content/10 pt-4">
          <div className="flex flex-col items-center justify-center gap-1">
            <p className="text-base-content text-sm text-center">{t("gameDetail:invite_friends_to_join_play")}</p>
            <p className="text-base-content text-sm text-center">
              <Trans
                i18nKey={"gameDetail:earn_up_to_50_commission_bonus"}
                components={[<span className="text-primary" />]}
                values={{
                  bonus: formatWithConversion(1200, "USD", {
                    showCode: false,
                    showSymbol: true
                  }).formatted
                }}
              />
            </p>
          </div>
          <div className="flex items-center justify-center gap-1 mt-4">
            {SOCIAL_ICONS.map((social) => (
              <button
                key={social.id}
                onClick={() => handleSocialShare(social.id, t("gameDetail:share_text_1", { multiplier: latest?.multiplier }), referralLink)}
                className="btn btn-sm btn-square btn-primary btn-soft"
                aria-label={`Share on ${social.id}`}
              >
                {social.id === "download" ? (
                  <Iconify icon="custom:down_load" width={20} height={20} className="text-neutral-content" />
                ) : (
                  <img
                    src={getSocialLogoUrl(social.icon)}
                    alt={social.id}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </Modal>
    </>
  );
};
