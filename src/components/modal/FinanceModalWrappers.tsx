import { lazy, Suspense, type ReactNode } from "react";
import { useBoundStore } from "@/store";

const FinanceAMLModal = lazy(() => import("./UserFinanceModal/c/FinanceAMLModal.tsx"));
const CryptoSettlementModal = lazy(() => import("./UserFinanceModal/c/CryptoSettlementModal.tsx").then((m) => ({ default: m.CryptoSettlementModal })));
const DepositMinAmountModal = lazy(() => import("./UserFinanceModal/c/DepositMinAmountModal.tsx").then((m) => ({ default: m.DepositMinAmountModal })));
const CurrencySelectorModal = lazy(() => import("./UserFinanceModal/c/CurrencySelectorModal.tsx"));
const WithdrawOkModal = lazy(() => import("./UserFinanceModal/c/WithdrawOkModal.tsx").then((m) => ({ default: m.WithdrawOkModal })));
const DepositFiatViewModal = lazy(() => import("./UserFinanceModal/c/DepositFiatViewModal.tsx"));
const WithdrawMethodInfoAddModal = lazy(() => import("./UserFinanceModal/c/WithdrawMethodInfoAddModal.tsx"));
const WithdrawPinModal = lazy(() => import("./UserFinanceModal/c/WithdrawPinModal.tsx"));
const WithdrawMinAmountModal = lazy(() => import("./UserFinanceModal/c/WithdrawMinAmountModal.tsx"));
const WithdrawAddressAddModal = lazy(() => import("./UserFinanceModal/c/WithdrawAddressAddModal.tsx"));

const ModalSuspense = ({ children }: { children: ReactNode }) => (
  <Suspense fallback={null}>{children}</Suspense>
);

export const WithdrawOkModalWrapper = () => {
  const open = useBoundStore((state) => "OPEN_WITHDRAW_ORDER_OK_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);
  if (!open) return null;
  return <ModalSuspense><WithdrawOkModal open={open} onClose={() => closeModal("OPEN_WITHDRAW_ORDER_OK_MODAL")} /></ModalSuspense>;
};

export const DepositFiatViewModalWrapper = () => {
  const open = useBoundStore((state) => "OPEN_DEPOSIT_FIAT_VIEW_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);
  if (!open) return null;
  return <ModalSuspense><DepositFiatViewModal open={open} onClose={() => closeModal("OPEN_DEPOSIT_FIAT_VIEW_MODAL")} /></ModalSuspense>;
};

export const WithdrawMethodInfoAddModalWrapper = () => {
  const open = useBoundStore((state) => "OPEN_WITHDRAW_METHOD_ADD_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);
  if (!open) return null;
  return <ModalSuspense><WithdrawMethodInfoAddModal open={open} onClose={() => closeModal("OPEN_WITHDRAW_METHOD_ADD_MODAL")} /></ModalSuspense>;
};

export const WithdrawMinAmountModalWrapper = () => {
  const open = useBoundStore((state) => "OPEN_WITHDRAW_MIN_AMOUNT_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);
  if (!open) return null;
  return <ModalSuspense><WithdrawMinAmountModal open={open} onClose={() => closeModal("OPEN_WITHDRAW_MIN_AMOUNT_MODAL")} /></ModalSuspense>;
};

export const WithdrawAddressAddModalWrapper = () => {
  const open = useBoundStore((state) => "OPEN_WITHDRAW_ADDRESS_ADD_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);
  if (!open) return null;
  return <ModalSuspense><WithdrawAddressAddModal open={open} onClose={() => closeModal("OPEN_WITHDRAW_ADDRESS_ADD_MODAL")} /></ModalSuspense>;
};

export const WithdrawPinModalWrapper = () => {
  const openWithdrawCryptoPin = useBoundStore((state) => "OPEN_WITHDRAW_CRYPTO_PIN_MODAL" in state.modals);
  const openWithdrawFiatPin = useBoundStore((state) => "OPEN_WITHDRAW_FIAT_PIN_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);
  const open = openWithdrawCryptoPin || openWithdrawFiatPin;
  if (!open) return null;
  return (
    <ModalSuspense>
      <WithdrawPinModal
        open={open}
        data={openWithdrawCryptoPin ? "OPEN_WITHDRAW_CRYPTO_PIN_MODAL" : "OPEN_WITHDRAW_FIAT_PIN_MODAL"}
        onClose={() => closeModal(openWithdrawCryptoPin ? "OPEN_WITHDRAW_CRYPTO_PIN_MODAL" : "OPEN_WITHDRAW_FIAT_PIN_MODAL")}
      />
    </ModalSuspense>
  );
};

export const FinanceAMLModalWrapper = () => {
  const open = useBoundStore((state) => "OPEN_FINANCE_AML_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);
  if (!open) return null;
  return <ModalSuspense><FinanceAMLModal open={open} onClose={() => closeModal("OPEN_FINANCE_AML_MODAL")} /></ModalSuspense>;
};

export const CryptoSettlementModalWrapper = () => {
  const open = useBoundStore((state) => "OPEN_CRYPTO_SETTLEMENT_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);
  if (!open) return null;
  return <ModalSuspense><CryptoSettlementModal open={open} onClose={() => closeModal("OPEN_CRYPTO_SETTLEMENT_MODAL")} /></ModalSuspense>;
};

export const DepositMinAmountModalWrapper = () => {
  const open = useBoundStore((state) => "OPEN_DEPOSIT_MIN_AMOUNT_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);
  if (!open) return null;
  return <ModalSuspense><DepositMinAmountModal open={open} onClose={() => closeModal("OPEN_DEPOSIT_MIN_AMOUNT_MODAL")} /></ModalSuspense>;
};

export const CurrencySelectorModalWrapper = () => {
  const data = useBoundStore((state) => state.modals.OPEN_CURRENCY_SELECTOR_MODAL?.data);
  const open = useBoundStore((state) => "OPEN_CURRENCY_SELECTOR_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);
  if (!open) return null;
  return <ModalSuspense><CurrencySelectorModal open={open} data={data} onClose={() => closeModal("OPEN_CURRENCY_SELECTOR_MODAL")} /></ModalSuspense>;
};
