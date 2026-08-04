import { useMemo } from "react";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { useClaimReward } from "@/query/free-spins";
import { useToggle } from "@/hooks/useToggle";
import { Trans, useTranslation } from "@/lib/i18n/react-i18next";
import { useBoundStore } from "@/store";
import {
  getImgCompressParams
} from "@/utils/helper";
import { FreeSpinStatus, resolveFreeSpinStatus } from "@/types/freeSpins";
import { Info } from "@/sections/bonus/components/Info.tsx";
import { TextBaseContent } from "@/components/standard/TextBaseContent.tsx";
import { Code2, Gamepad, GlobeLock, LockKeyhole } from "lucide-react";
import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { CountdownTimer } from "@/sections/dollars/CountdownTimer.tsx";
import { useAppNavigate } from "@/hooks/useAppNavigate";
import { useBanGameList } from "@/query/game.ts";
import { BonusClaimModal } from "@/sections/dollars/bonus-claim-modal.tsx";

const FreeSpinGameIcon = ({ src, alt, w, h, className }: {
  src: string;
  alt: string;
  w?: number;
  h?: number;
  className?: string;
}) => {
  const compressed = useMemo(() => getImgCompressParams(src, w ?? 56, 100, h), [src, w, h]);
  return (
    <img
      src={compressed}
      crossOrigin="anonymous"
      referrerPolicy="no-referrer"
      alt={alt}
      className={`object-cover aspect-[3/4]${className ? ` ${className}` : ""}`}
    />
  );
};

interface FreeSpinsProps {
  gameTitle?: string;
  gameIcon?: string;
  available?: number;
  total?: number;
  maxWin?: number;
  expiration?: number;
  gameId?: string; // 游戏ID，用于跳转
  innerGameId?: string; // 游戏ID，用于跳转
  isAvailable?: boolean; // 是否可玩
  handleStatus?: number | string;
  freeSpinCode?: string;
  turnoverLimit?: number;
  currentTurnover?: number;
  winAmount?: number;
  currency?: string;
  isExpired?: boolean;
  recordId?: string | number;
  isTurnoverMet?: boolean;
}

export function BonusFreeSpinsCardV2({
                                       gameTitle = "",
                                       gameIcon = "",
                                       available = 20,
                                       total = 20,
                                       maxWin = 570.47,
                                       expiration = 0,
                                       gameId,
                                       innerGameId,
                                       handleStatus,
                                       freeSpinCode,
                                       turnoverLimit = 0,
                                       currentTurnover = 0,
                                       winAmount = 0,
                                       currency = "USDT",
                                       isExpired = false,
                                       isAvailable = false,
                                       recordId,
                                       isTurnoverMet
                                     }: FreeSpinsProps) {
  const navigate = useAppNavigate();
  const { t } = useTranslation(["common","bonus", "transaction", "gameDetail", "luckySpin"]);
  const { formatWithConversion } = useDisplayCurrencyFormatter();
  const openModal = useBoundStore((state) => state.openModal);
  const { mutate: claimReward, isPending: isClaiming } = useClaimReward();
  const [finished, { set }] = useToggle<boolean>(false);
  const [isClaimOpen, { setTrue: openClaimModal, setFalse: closeClaimModal }] = useToggle(false);

  const parsedTurnoverLimit = Math.max(0, Number(turnoverLimit ?? 0));
  const parsedCurrentTurnover = Math.max(0, Number(currentTurnover ?? 0));

  const normalizedHandleStatus = Number.isFinite(Number(handleStatus)) ? Number(handleStatus) : undefined;
  const resolvedStatus = resolveFreeSpinStatus({
    handle_status: normalizedHandleStatus as FreeSpinStatus | undefined,
    status: normalizedHandleStatus as FreeSpinStatus | undefined,
    is_turnover_requirement_met: isTurnoverMet,
    turnover_limit_usdt: String(parsedTurnoverLimit || 0),
    current_turnover_limit_usdt: String(parsedCurrentTurnover || 0)
  });
  const isPlayState = Boolean(isAvailable && available > 0);
  const hasExpiration = Boolean(expiration);
  const expired = finished || isExpired || (hasExpiration && expiration * 1000 <= Date.now());

  // 处理Play按钮点击
  const handlePlayClick = () => {
    if (!gameId) return;

    const trimmedCurrency = typeof currency === "string" ? currency.trim() : "";
    const mobileSearchParams = trimmedCurrency ? { currency: trimmedCurrency } : undefined;

    void navigate({
      to: "/games/play/$gameId",
      params: { gameId },
      search: mobileSearchParams
    });
  };

  const handleClaimReward = (currency: string) => {
    const payload = freeSpinCode
      ? { free_spin_code: freeSpinCode }
      : recordId
        ? { record_id: String(recordId) }
        : null;
    if (!currency || !payload) return;

    claimReward(
      { ...payload, currency },
      {
        onSuccess: () => {
        }
      }
    );
  };

  const formattedMaxWin = formatWithConversion(maxWin ?? 0, currency, {
    showSymbol: true,
    showCode: false
  }).formatted;

  const formattedWinAmount = formatWithConversion(winAmount ?? 0, currency, {
    showSymbol: true,
    showCode: false
  }).formatted;

  const turnoverCurrency = "USDT";

  const formattedTurnoverCurrent = formatWithConversion(parsedCurrentTurnover, turnoverCurrency, {
    showSymbol: true,
    showCode: false
  }).formatted;

  const formattedTurnoverTotal = formatWithConversion(parsedTurnoverLimit, turnoverCurrency, {
    showSymbol: true,
    showCode: false,
    compact: true
  }).formatted;

  const isProgressCard = !isPlayState;

  // 状态 badge（只展示，不触发操作）
  const statusLabel = (() => {
    switch (resolvedStatus) {
      case FreeSpinStatus.CLAIM:
        return t("bonus:claim");
      case FreeSpinStatus.ONGOING:
        return t("bonus:ongoing");
      case FreeSpinStatus.CLAIMED:
        return t("bonus:status.claimed");
      case FreeSpinStatus.CANCELLED:
        return t("bonus:status.cancelled");
      default:
        return t("bonus:ongoing");
    }
  })();

  // 实际操作：仅 CLAIM 状态可执行
  const isClaimable = resolvedStatus === FreeSpinStatus.CLAIM;

  // 游戏是否被禁止的辅助数据
  const { data: banGameList } = useBanGameList(true);

  // 结算币禁止
  const is_currency_settlement_prohibited = useMemo(() => {
    // method 1: 如果提供的游戏数据中没有提供 ban_support_settlement_currencies 字段的时候需要使用辅助判断方式 useBanGameList(enabledBanGameList)
    if (banGameList?.data) {
      const ban_currency_games = banGameList?.data?.ban_currency_games ?? [];
      return ban_currency_games.find((inner_game_id: string) => inner_game_id === innerGameId);
    }
  }, [
    gameId,
    banGameList?.data
  ]);

  // 地区禁止
  const is_regional_access_prohibited = useMemo(() => {
    // method 1: 如果提供的游戏数据中没有提供 ban_regions 字段的时候需要使用辅助判断方式 useBanGameList(enabledBanGameList)
    if (banGameList?.data) {
      const ban_ip_games = banGameList?.data?.ban_ip_games ?? [];
      return ban_ip_games.find((inner_game_id: string) => inner_game_id === (innerGameId ?? gameId));
    }
  }, [gameId, banGameList?.data]);

  const isGameUnavailable = Boolean(is_currency_settlement_prohibited || is_regional_access_prohibited);
  const unavailableText = is_regional_access_prohibited
    ? t("common:common.gameNotAccessibleInYourRegion")
    : t("common:common.gameAccessibleToCurrencies");

  return (
    <div className="relative w-full overflow-hidden rounded-lg bg-base-100 p-4">
      {isProgressCard ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-start gap-4">
            <FreeSpinGameIcon src={gameIcon} alt={gameTitle} w={56} className="w-14 rounded-md" />
            <div className="flex flex-col gap-2 flex-1">
              <p className="text-sm font-bold text-base-content">
                {gameTitle}
              </p>

              <p className={"flex items-center text-sm gap-1 text-base-content/60"}>
                <Code2 size={18} />
                {freeSpinCode}
              </p>

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center">
                  <span className="text-primary text-sm">{formattedTurnoverCurrent}</span>
                  <span className={"text-sm text-base-content/70"}>/</span>
                  <span className={"text-sm text-base-content/70"}>{formattedTurnoverTotal}</span>
                </div>
                {/* 实际操作按钮：仅 CLAIM 状态渲染 */}
                {isClaimable
                  ? (<ConfirmBox
                    loading={isClaiming}
                    className="w-fit btn-sm text-sm"
                    onClick={openClaimModal}>
                    {t("bonus:claim")}
                  </ConfirmBox>)
                  : (<div
                    className={`border-1 border-base-content/30 border-dashed rounded-sm px-1 flex items-center gap-1 uppercase text-xs text-base-content/60`}>
                    <Gamepad size={18} />{statusLabel}
                  </div>)}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <TextBaseContent
              text={<Trans
                i18nKey="luckySpin:wager_free_spin"
                values={{ value1: formattedTurnoverTotal, value2: formattedWinAmount }}
                components={[<span className="text-primary font-semibold" />]} />} />

            <Info
              className=""
              onClick={(e) => {
                e.stopPropagation();
                openModal("OPEN_FREE_SPINS_HELP_MODAL");
              }} />
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex items-start gap-4">
            <FreeSpinGameIcon src={gameIcon} alt={gameTitle} w={60} h={80} className="w-14 rounded-field" />
            <div className="flex flex-col w-full text-base-content/60 gap-2 flex-1">
              <p className="text-sm font-bold text-base-content">
                {gameTitle}
              </p>
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-base-content">
                    <span className="text-primary">{available}</span><span
                    className="text-base-content/60">/{total}</span>{" "}<span
                    className="font-normal text-base-content/60">{t("bonus:available")}</span>
                  </p>
                  <p className="text-sm flex items-center gap-1 mt-1">
                    <span className="text-primary">{formattedMaxWin}</span>
                    <span>{t("gameDetail:maxWin")}</span>
                  </p>
                </div>

                <button onClick={handlePlayClick} className="text-sm btn btn-primary btn-sm self-center">
                  {t("bonus:go")}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <div className={"flex items-center gap-1 text-[13px] justify-center text-base-content/60"}>
              {expired && <span className={"font-bold"}>{t("transaction:transactionStatus.expired")}</span>}
              {!expired && hasExpiration && <CountdownTimer
                onFinished={(v) => v && set(true)}
                expireTime={expiration} />}
            </div>

            <Info
              onClick={(e) => {
                e.stopPropagation();
                openModal("OPEN_FREE_SPINS_HELP_MODAL");
              }} />
          </div>
        </div>
      )}

      {isGameUnavailable ? (
        <div className="absolute inset-0 z-1 flex items-center justify-center px-4 text-center bg-base-200/85">
          <div className="flex flex-col items-center gap-2 text-base-content/50">
            {is_regional_access_prohibited ? (
              <GlobeLock className="h-6 w-6 drop-shadow-md" />
            ) : (
              <LockKeyhole className="h-6 w-6 drop-shadow-md" />
            )}
            <p className="text-sm italic">{unavailableText}</p>
          </div>
        </div>
      ) : null}

      <BonusClaimModal
        open={isClaimOpen}
        bonus={formattedWinAmount}
        loading={isClaiming}
        onClose={closeClaimModal}
        onClick={handleClaimReward}
      />
    </div>
  );
}
