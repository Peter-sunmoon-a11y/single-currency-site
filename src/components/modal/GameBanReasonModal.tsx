import { GlobeLock, LockKeyhole } from "lucide-react";
import { Modal } from "@/components/ui/Modal.tsx";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { getImgCompressParams } from "@/utils/helper.ts";

type GameBanReasonModalProps = {
  open: boolean;
  onClose: () => void;
  reason?: "region" | "currency";
  image?: string;
  gameName?: string;
};

export const GameBanReasonModal = ({ open, onClose, reason, image, gameName }: GameBanReasonModalProps) => {
  const { t } = useTranslation();

  const isRegion = reason === "region";

  return (
    <Modal
      title={t("common:common.gameRestricted", "Game Restricted")}
      isOpen={open}
      onClose={onClose}
      position="modal-middle"
    >
      <div className="flex flex-col items-center gap-2 py-2">
        {image && (
          <div className="w-20 aspect-[3/4] rounded-lg overflow-hidden shrink-0">
            <img src={getImgCompressParams(image, 80)} alt={gameName} className="w-full h-full object-cover grayscale brightness-75" />
          </div>
        )}
        {gameName && (
          <p className="text-sm font-bold text-base-content text-center">{gameName}</p>
        )}
        <div className="flex flex-col items-center gap-2">
          {isRegion ? (
            <GlobeLock className="w-5 h-5 text-warning" />
          ) : (
            <LockKeyhole className="w-5 h-5 text-warning" />
          )}
          <p className="text-sm text-center text-warning font-bold">
            {isRegion
              ? t("common:common.gameNotAccessibleInYourRegion")
              : t("common:common.gameAccessibleToCurrencies")}
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default GameBanReasonModal;
