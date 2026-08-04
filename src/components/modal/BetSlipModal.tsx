import { useTranslation } from "@/lib/i18n/react-i18next";
import { Modal } from "../ui/Modal";
import { formatDateTime } from "@/utils/formatDateTime";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { getImgCompressParams } from "@/utils/helper.ts";
import { useAppNavigate } from "@/hooks/useAppNavigate";

type BetSlipModalProps = {
  isOpen: boolean
  onClose: () => void
  order: any
}

export const BetSlipModal = ({ isOpen, onClose, order }: BetSlipModalProps) => {
  const navigate = useAppNavigate();
  const { t } = useTranslation("casino");
  const { formatWithoutConversion, formatWithConversion } = useDisplayCurrencyFormatter();

  if (!order) return null;

  const handlePlayClick = () => {
    // Navigate to game detail page with game_provider:inner_game_id format if provider exists
    if (order?.inner_game_id) {
      // If game_provider exists, use format: provider:inner_game_id
      // Otherwise just use inner_game_id
      const gameId = order.game_provider
        ? `${order.game_provider}:${order.inner_game_id}`
        : order.inner_game_id;

      void navigate({ to: "/games/$gameId", params: { gameId }, search: {} });

      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      position="modal-middle"
      title={t("casino:betSlip")}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <img src={`/images/vip/levels/${order?.vip}.png`} alt={order?.vip || "1"}
               className="w-10 h-10 sm:w-12 sm:h-12" />
          <div className="flex flex-col justify-between">
            <span className="text-base font-bold">{order?.nickname ?? "Anonymous"}</span>
            <p className="text-xs text-base-content/50 flex items-center gap-1">
              <span>{order?.created_at ? formatDateTime(order.created_at * 1000, "DD MMM [']YY · HH:mm") : "--"}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center mb-2 gap-1">
          <div className="flex items-center gap-2">
            <p className="font-bold text-3xl text-primary">
              {formatWithoutConversion(order?.real_win_amount, order?.real_currency, {
                compact: false,
                showCode: true,
                showSymbol: false,
                minimizeDecimals: true
              }).formatted}
            </p>
          </div>
          <p className="text-lg text-base-content/40 font-bold">
            {formatWithConversion(order?.real_win_amount, order?.real_currency, {
              compact: false,
              showCode: false,
              minimizeDecimals: true
            }).formatted}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-base-200 rounded-lg p-2 flex flex-col">
            <p className="text-sm text-base-content/50">{t("casino:betAmount")}</p>
            <p className="font-bold text-base">
              {formatWithoutConversion(order?.real_bet_amount, order?.real_currency, {
                compact: false,
                showCode: false,
                minimizeDecimals: true
              }).formatted}
            </p>
          </div>

          <div className="bg-base-200 rounded-lg p-2 flex flex-col">
            <p className="text-sm text-base-content/50">X</p>
            <p className="font-bold text-base">
              {Number(order.real_bet_amount) === 0
                ? 0
                : (Number(order.real_win_amount) / Number(order.real_bet_amount)).toLocaleString()}x
            </p>
          </div>
        </div>

        <div className="p-2 rounded-lg bg-base-200 flex items-center gap-2">
          <div className={'w-[72px]'}>
            <img src={getImgCompressParams(order.image, 72, 100)} className="aspect-3/4 rounded-md" />
          </div>
          <div className="flex-1 flex flex-col gap-2 w-full">
            <p className="font-bold text-base text-primary">{order.game_name}</p>
            <div className="flex gap-2 justify-between items-start">
              <p
                className="font-bold text-sm flex items-center gap-1 italic">{t(`explore:${order.game_category_1}`)}</p>
            </div>
            <button
              className="btn btn-primary btn-sm text-base uppercase w-fit"
              onClick={handlePlayClick}
            >
              {t("common:common.play")}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
