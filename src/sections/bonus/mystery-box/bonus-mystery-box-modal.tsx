import { Modal } from "@/components/ui/Modal";
import { useState } from "react";

import { useTranslation } from "@/lib/i18n/react-i18next";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { CurrencyIcon } from "@/components/ui/CurrencyIcon";
import { useHasMysteryBox } from "@/query/bouns";
import { useClaimBonusMutation } from "@/hooks/api/useAuth";
import { IVipBonusClaim } from "@/types/bonus";
import { InnerCoinBox } from "@/sections/dollars/bonus-claim-modal.tsx";
import {ConfirmBox} from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";

interface MysteryBoxModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MysteryBoxCurrencyReward = ({ boxData, formatWithoutConversion }: {
  boxData: IVipBonusClaim;
  formatWithoutConversion: ReturnType<typeof useDisplayCurrencyFormatter>["formatWithoutConversion"];
}) => (
  <div className="flex flex-col items-center">
    <CurrencyIcon currency={boxData?.claim?.currency ?? "BUCK"} className="h-10 w-10" />
    <span className="text-primary text-4xl">
      {formatWithoutConversion(boxData?.claim?.value ?? 0, boxData?.claim?.currency ?? "BUCK", {
        showSymbol: false,
        showCode: false
      }).formatted}
    </span>
  </div>
);

const MysteryBoxFreeSpinsReward = ({ t }: {
  t: ReturnType<typeof useTranslation>["t"];
}) => (
  <div className="flex flex-col items-center text-primary">
    <span className="text-4xl">50</span>
    {t("casino:freeSpins")}
  </div>
);

const MysteryBoxTrigger = ({ isLoading, onClick, t }: {
  isLoading: boolean;
  onClick: () => void;
  t: ReturnType<typeof useTranslation>["t"];
}) => (
  <div
    className="flex flex-col items-center gap-4 cursor-pointer select-none"
    onClick={!isLoading ? onClick : undefined}
  >
    <div className="relative flex flex-col justify-center w-full gap-4">
      <img src="/images/bonus_mysterybox/gift.png" alt="" className={"w-50 m-auto animate-gift-shake"} />
      <ConfirmBox className="m-auto w-fit text-xl uppercase" loading={isLoading}>
        {t("mysteryBox:open_box")}{" "}?
      </ConfirmBox>
    </div>
  </div>
);

export function MysteryBoxModal({ isOpen, onClose }: MysteryBoxModalProps) {
  const { t } = useTranslation(["bonus", "mysteryBox"]);
  const { refetch } = useHasMysteryBox();
  const { formatWithoutConversion } = useDisplayCurrencyFormatter();

  const { mutate: claimBonus, isPending: isLoading } = useClaimBonusMutation();

  const [boxData, setBoxData] = useState<IVipBonusClaim | null>(null);

  const handle = async () => {
    claimBonus(
      { item: "vip_bonus_mystery_box" },
      {
        onSuccess: (response) => {
          if (response.code === 0) {
            setBoxData(response.data);
            refetch();
          }
        }
      }
    );
  };

  return (
    <Modal
      title={t("mysteryBox:mystery_box")}
      isOpen={isOpen}
      onClose={onClose}
      position="modal-middle"
    >
      {boxData !== null
        ? <div className="relative">
          <InnerCoinBox />
          <div className="flex flex-col items-center justify-center gap-4 mt-4">
            <h2 className="font-bold text-xl text-center">
              {/*神秘盒子有可能是免费旋转的*/}
              {boxData?.free_spin_record_id
                ? <MysteryBoxFreeSpinsReward t={t} />
                : <MysteryBoxCurrencyReward boxData={boxData} formatWithoutConversion={formatWithoutConversion} />}
            </h2>
          </div>
        </div>
        : <MysteryBoxTrigger isLoading={isLoading} onClick={handle} t={t} />}
    </Modal>
  );
}
