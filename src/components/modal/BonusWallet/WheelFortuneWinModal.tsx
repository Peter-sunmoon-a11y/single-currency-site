import { Modal } from "@/components/ui/Modal.tsx";
import { useTranslation } from "@/lib/i18n/react-i18next";
import {
  getPrizeImageUrl,
  InnerPrizeDisplay
} from "@/sections/lucky-spin/components.tsx";
import { InnerCoinBox } from "@/sections/dollars/bonus-claim-modal.tsx";
import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { bg_colors } from "@/sections/lucky-spin/spin-wheel.tsx";

export const WheelFortuneWinModal = (
  {
    data,
    open,
    onClose
  }: {
    data: Record<string, any>;
    open: boolean;
    onClose: () => void;
  }) => {
  const { t } = useTranslation(["luckySpin", "bonus", "buddyBalls"]);
  const titleBySpinType: Record<string, string> = {
    normal: t("luckySpin:lucky"),
    mega: t("luckySpin:mega"),
  };

  return (
    <Modal
      title={titleBySpinType[data?.type] ?? t("luckySpin:fortune")}
      isOpen={open}
      onClose={onClose}
      position="modal-middle"
    >
      <div className="relative flex flex-col gap-4">
        <InnerCoinBox />
        <div className="flex items-center justify-center gap-2">
          <img src={getPrizeImageUrl(data?.extra_data)} alt="" className={"w-10 h-10"} />
          <InnerPrizeDisplay data={data?.extra_data} className={"text-xl !text-base-content"} />
        </div>
        <ConfirmBox
          onClick={onClose}
          className={`${bg_colors[data?.type] ?? "bg-primary"} border-none text-base-content`}
        >
          {t("bonus:gotIt")}
        </ConfirmBox>
      </div>
    </Modal>
  );
};

export default WheelFortuneWinModal;
