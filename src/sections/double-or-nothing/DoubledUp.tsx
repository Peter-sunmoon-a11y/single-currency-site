import { Modal } from "@/components/ui/Modal";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { IDoubledUpProps } from "@/types/double-or-nothing";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import Decimal from "decimal.js";
import { InnerCoinBox } from "@/sections/dollars/bonus-claim-modal.tsx";

export const DoubledUp = ({ open, onClose, donData }: {
  open: boolean;
  onClose: () => void;
  donData?: IDoubledUpProps
}) => {
  const { t } = useTranslation("doubleOrNothing");
  const { formatWithConversion } = useDisplayCurrencyFormatter();


  return (
    <Modal
      isOpen={open}
      title={t("doubleOrNothing:you_doubled_up")}
      onClose={onClose}
      position={"modal-middle"}
    >
      <div className="flex flex-col gap-4">
        <InnerCoinBox />

        <div className="text-primary text-4xl font-bold text-center">
          {formatWithConversion(new Decimal(donData?.final_amount ?? 0).mul(2).toNumber(), "BUCK", {
            showSymbol: true,
            showCode: false
          }).formatted}
        </div>

        <p className="text-base-content text-base font-bold text-center">{t("doubleOrNothing:cheers_to_your_courage")}</p>

        <button className="m-auto btn btn-primary btn-soft" onClick={onClose}>{t("bonus:gotIt")}</button>
      </div>
    </Modal>
  );
};
