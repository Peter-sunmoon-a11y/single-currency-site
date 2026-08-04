import { lazy, Suspense } from "react";
import { useBoundStore } from "@/store";

const AuthModal = lazy(() => import("./AuthModal.tsx").then((m) => ({ default: m.AuthModal })));
const BetSlipModal = lazy(() => import("./BetSlipModal.tsx").then((m) => ({ default: m.BetSlipModal })));
const UserFinanceModal = lazy(() => import("./UserFinanceModal").then((m) => ({ default: m.UserFinanceModal })));
const InternalMessageModal = lazy(() => import("@/components/header/message-v2/InternalMessageModal.tsx"));

export const AuthModalWrapper = () => {
  const data = useBoundStore((state) => state.modals.OPEN_AUTH_MODAL?.data);
  const open = useBoundStore((state) => "OPEN_AUTH_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);

  if (!open) return null;

  return (
    <Suspense fallback={null}>
      <AuthModal
        isOpen={open}
        onClose={() => closeModal("OPEN_AUTH_MODAL")}
        initialTab={data?.initialTab ?? "signin"}
      />
    </Suspense>
  );
};

export const BetSlipModalWrapper = () => {
  const data = useBoundStore((state) => state.modals.OPEN_BET_SLIP_MODAL?.data);
  const open = useBoundStore((state) => "OPEN_BET_SLIP_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);

  if (!open) return null;

  return (
    <Suspense fallback={null}>
      <BetSlipModal isOpen={open} onClose={() => closeModal("OPEN_BET_SLIP_MODAL")} order={data?.order} />
    </Suspense>
  );
};

export const UserFinanceModalWrapper = () => {
  const data = useBoundStore((state) => state.modals.OPEN_USER_FINANCE_MODAL?.data);
  const open = useBoundStore((state) => "OPEN_USER_FINANCE_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);

  if (!open) return null;

  return (
    <Suspense fallback={null}>
      <UserFinanceModal isOpen={open} onClose={() => closeModal("OPEN_USER_FINANCE_MODAL")} initialTab={data?.initialTab} />
    </Suspense>
  );
};

export const InternalMessageModalWrapper = () => {
  const open = useBoundStore((state) => "OPEN_INTERNAL_MESSAGE_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);

  if (!open) return null;

  return (
    <Suspense fallback={null}>
      <InternalMessageModal open={open} onClose={() => closeModal("OPEN_INTERNAL_MESSAGE_MODAL")} />
    </Suspense>
  );
};
