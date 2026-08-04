import { Modal } from "@/components/ui/Modal";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { checkDonPromo } from "@/services/auth/promo";
import { useBoundStore } from "@/store";
import { useChoicePromo } from "@/query/promo.tsx";


export const NothingModal = ({ open, onClose, don_record_id }: {
  open: boolean;
  onClose: () => void;
  don_record_id: string
}) => {
  const { t } = useTranslation("doubleOrNothing");
  const { mutate: choicePromo } = useChoicePromo();
  const { formatWithConversion } = useDisplayCurrencyFormatter();
  const openModal = useBoundStore((state) => state.openModal);

  const handleBoost = async () => {
    const response = await checkDonPromo(don_record_id);
    if (response.code !== 0 && response.code !== 51005) return;

    if (response?.data?.id) {
      choicePromo(response?.data?.id);

      openModal("OPEN_BOOST_MODAL", response.data);

      onClose();
    }
  };

  return (
    <Modal
      title={t("doubleOrNothing:you_got_nothing")}
      isOpen={open}
      onClose={onClose}
      position="modal-middle"
    >
      <div className="flex flex-col gap-4 items-center">
        <img src="/images/double_nothing/nothing.png" alt="" className="w-60 animate-coin-pulse" />

        <div className="text-primary text-4xl font-bold text-center">
          {formatWithConversion(0, "BUCK", {
            showSymbol: true,
            showCode: false
          }).formatted}
        </div>

        <p className="text-base-content text-sm font-bold text-center">
          {t("doubleOrNothing:better_luck_next_time")}
        </p>

        <button className="btn btn-primary" onClick={handleBoost}>{t("bonus:continue")}</button>
      </div>
    </Modal>
  );
};