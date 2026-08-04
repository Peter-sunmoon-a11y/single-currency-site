import { Modal } from "@/components/ui/Modal.tsx";
import { useBoundStore } from "@/store";
import { Trans, useTranslation } from "@/lib/i18n/react-i18next";
import {
  InnerContainer,
  InnerContent,
  InnerDescription, InnerHeader,
  InnerSlogan, InnerTitle
} from "@/standard/modals/DemoLazyInfoModal.tsx";

type CryptoSettlementModalProps = {
  open: boolean;
  onClose: () => void;
};

export const CryptoSettlementModal = ({ open, onClose }: CryptoSettlementModalProps) => {
  const { t } = useTranslation();

  const user = useBoundStore((state) => state.user);

  // from data store, share common data
  const { depositCrypto } = useBoundStore();

  return (
    <Modal
      hideTitle
      isOpen={open}
      onClose={onClose}
      position="modal-middle"
      className="p-0 bg-transparent"
    >
      <InnerSlogan
        // 根据设计稿自行修改文字
        title={<Trans i18nKey="finance:crypto_settlement" components={[<span className="text-primary" />]} />}
        // 根据设计稿自行修改图片
        picture="/images/deposit_promotion/settlement.png"
      />

      <InnerContainer>
        <InnerHeader
          title={<Trans i18nKey="finance:crypto_settlement" components={[<b className="text-primary" />]} />}
          onClose={onClose}
        />

        <InnerContent>
          <InnerTitle title={t("finance:settle_in_crypto.title")} />
          <InnerDescription>
            {t("finance:settle_in_crypto.part1")}
          </InnerDescription>
          <InnerDescription>
            {t("finance:settle_in_crypto.part2")}
          </InnerDescription>
          <InnerTitle title={t("finance:your_balance.title")} />
          <InnerDescription>
            <Trans
              i18nKey="finance:your_balance.part1"
              values={{
                from: depositCrypto.currency?.currency,
                to: user?.currency_fiat
              }}
              components={[<b className="text-primary" />]}
            />
          </InnerDescription>
          <InnerDescription>
            <Trans
              i18nKey="finance:your_balance.part2"
              values={{
                from: depositCrypto.currency?.currency,
                to: user?.currency_fiat
              }}
              components={[<b className="text-primary" />, <b className="text-primary" />]}
            />
          </InnerDescription>
        </InnerContent>
      </InnerContainer>
    </Modal>
  );
};

export default CryptoSettlementModal;