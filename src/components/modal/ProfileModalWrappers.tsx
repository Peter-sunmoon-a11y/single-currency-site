import { lazy, Suspense, type ReactNode } from "react";
import { useBoundStore } from "@/store";

const ChangePasswordModal = lazy(() => import("@/sections/profile/security/ChangePasswordModal.tsx"));
const EmailVerificationModal = lazy(() => import("@/sections/profile/security/EmailVerificationModal.tsx"));
const SetWithdrawalPINModal = lazy(() => import("@/sections/profile/security/SetWithdrawalPINModal.tsx"));
const PhoneVerificationModal = lazy(() => import("@/sections/profile/security/PhoneVerificationModal.tsx"));
const PhoneAreaCodeModal = lazy(() => import("@/sections/profile/security/PhoneAreaCodeModal").then((m) => ({ default: m.PhoneAreaCodeModal })));
const RolloverDetailsDialog = lazy(() => import("@/sections/profile/rollover/RolloverDetailsDialog").then((m) => ({ default: m.RolloverDetailsDialog })));
const ExploreSearchDialog = lazy(() => import("@/sections/explore/ExploreSearchDialog").then((m) => ({ default: m.ExploreSearchDialog })));

const ModalSuspense = ({ children }: { children: ReactNode }) => (
  <Suspense fallback={null}>{children}</Suspense>
);

export const ChangePasswordModalWrapper = () => {
  const open = useBoundStore((state) => "OPEN_CHANGE_PASSWORD_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);
  if (!open) return null;
  return <ModalSuspense><ChangePasswordModal open={open} onClose={() => closeModal("OPEN_CHANGE_PASSWORD_MODAL")} /></ModalSuspense>;
};

export const EmailVerificationModalWrapper = () => {
  const open = useBoundStore((state) => "OPEN_EMAIL_VERIFICATION_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);
  if (!open) return null;
  return <ModalSuspense><EmailVerificationModal open={open} onClose={() => closeModal("OPEN_EMAIL_VERIFICATION_MODAL")} /></ModalSuspense>;
};

export const SetWithdrawalPINModalWrapper = () => {
  const data = useBoundStore((state) => state.modals.OPEN_SET_WITHDRAWAL_PIN_MODAL?.data);
  const open = useBoundStore((state) => "OPEN_SET_WITHDRAWAL_PIN_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);
  if (!open) return null;
  return <ModalSuspense><SetWithdrawalPINModal open={open} data={data} onClose={() => closeModal("OPEN_SET_WITHDRAWAL_PIN_MODAL")} /></ModalSuspense>;
};

export const PhoneVerificationModalWrapper = () => {
  const open = useBoundStore((state) => "OPEN_PHONE_VERIFICATION_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);
  if (!open) return null;
  return <ModalSuspense><PhoneVerificationModal open={open} onClose={() => closeModal("OPEN_PHONE_VERIFICATION_MODAL")} /></ModalSuspense>;
};

export const PhoneAreaCodeModalWrapper = () => {
  const data = useBoundStore((state) => state.modals.OPEN_PHONE_AREA_CODE_MODAL?.data);
  const open = useBoundStore((state) => "OPEN_PHONE_AREA_CODE_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);
  if (!open) return null;
  return (
    <ModalSuspense>
      <PhoneAreaCodeModal
        isOpen={open}
        onClose={() => closeModal("OPEN_PHONE_AREA_CODE_MODAL")}
        selectedCode={data?.selectedCode ?? ""}
        onSelect={(code) => {
          data?.onSelect?.(code);
          closeModal("OPEN_PHONE_AREA_CODE_MODAL");
        }}
      />
    </ModalSuspense>
  );
};

export const RolloverDetailsDialogWrapper = () => {
  const data = useBoundStore((state) => state.modals.OPEN_ROLLOVER_DETAILS_MODAL?.data);
  const open = useBoundStore((state) => "OPEN_ROLLOVER_DETAILS_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);
  if (!open) return null;
  return <ModalSuspense><RolloverDetailsDialog isOpen={open} onClose={() => closeModal("OPEN_ROLLOVER_DETAILS_MODAL")} detail={data?.detail ?? null} /></ModalSuspense>;
};

export const ExploreSearchDialogWrapper = () => {
  const data = useBoundStore((state) => state.modals.OPEN_EXPLORE_SEARCH_MODAL?.data);
  const open = useBoundStore((state) => "OPEN_EXPLORE_SEARCH_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);
  if (!open) return null;
  return <ModalSuspense><ExploreSearchDialog isOpen={open} onClose={() => closeModal("OPEN_EXPLORE_SEARCH_MODAL")} baseFilters={data ?? {}} /></ModalSuspense>;
};
