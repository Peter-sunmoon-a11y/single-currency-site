import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { ErrorMessageBox } from "@/components/modal/UserFinanceModal/c/ErrorMessageBox.tsx";
import { MotionContentBox } from "@/components/modal/UserFinanceModal/c/MotionContentBox.tsx";
import { Modal } from "@/components/ui/Modal.tsx";
import { useBoundStore } from "@/store";
import { useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { TActions } from "@/store/type.ts";
import { OTPInput } from 'input-otp'
import { DisplayContent } from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";
import { emitter } from "@/store/emitter.ts";

export const WithdrawPinModal = (
  {
    open,
    data,
    onClose
  }: {
    open: boolean;
    data: any
    onClose: () => void;
  }) => {
  const { t } = useTranslation();

  const user = useBoundStore((state) => state.user);

  return (
    <Modal
      isOpen={open}
      title={
        <span className="text-sm font-semibold">
          {user?.pin_setted ? t("finance:enter_withdrawal_pin") : t("finance:setWithdrawalPin")}
        </span>
      }
      onClose={onClose}
      className="bg-base-400 md:max-w-[360px]"
      position="modal-middle"
    >
      <MotionContentBox sample show={!user?.pin_setted} content={<NoPinCode data={data} onClose={onClose} />} />
      <MotionContentBox sample show={!!user?.pin_setted} content={<HavePinCode data={data} show={open} onClose={onClose} />} />
    </Modal>
  );
};

// 未设置PIN码，去设置
const NoPinCode = ({ data, onClose }: { data: string, onClose: () => void }) => {
  const { t } = useTranslation();

  const openModal = useBoundStore((state) => state.openModal);
  const closeModal = useBoundStore((state) => state.closeModal);

  return (
    <div className="flex flex-col gap-4">
      <div
        className="p-4 flex items-center gap-4 rounded-lg"
        style={{
          background: `
        radial-gradient(100% 157.05% at 0% 46.47%, 
        color-mix(in oklch, var(--color-info), transparent 60%) 50%,
        color-mix(in oklch, var(--color-base-300), transparent 30%)`
        }}
      >
        <img src="/icons/isometric/38.svg" alt="" />
        <p className="text-xs leading-4 font-semibold">{t("finance:setWithdrawalPinDescription")}</p>
      </div>

      <ConfirmBox
        onClick={() => {
          onClose();
          /**
           * 自定义行为 - 来源于用户提款操作但是未设置PIN码
           * 前提：用户操作提款但是未设置PIN码
           * PIN码设置成功则立即执行提现订单创建
           *
           * @params: ty = syncAction.type -》 用户正在操作什么类型的提款
           *
           * OPEN_WITHDRAW_CRYPTO_PIN_MODAL 加密提款
           * OPEN_WITHDRAW_FIAT_PIN_MODAL   法币提款
           */
          closeModal(data as TActions);
          openModal("OPEN_SET_WITHDRAWAL_PIN_MODAL", data);
        }}
      >
        {t("common:common.confirm")}
      </ConfirmBox>
    </div>
  );
};

// 已设置PIN码，去交易
const HavePinCode = ({ data, show, onClose }: { data: string, show: boolean; onClose: () => void }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const { t } = useTranslation();

  const [pin, setPin] = useState<string>("");

  const isError = pin !== "" && !/^[0-9]{6}$/.test(pin);

  // 默认focus input
  useLayoutEffect(() => {
    if (!show) return
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, [show]);

  return (
    <div className="flex flex-col gap-4 items-center">
      <img src="/images/profile/security-verification-lock.png" className="w-25 h-25" />
      <div className="relative flex flex-col gap-2 w-full" autoFocus>
        <p className="text-xs font-semibold text-base-content/50">{t("common.confirmNewPlaceholder")}</p>
        <OTPInput
          ref={inputRef}
          autoFocus
          maxLength={6}
          inputMode='numeric'
          containerClassName="group flex items-center has-[:disabled]:opacity-50"
          render={({ slots }) => (
            <div className="flex gap-2 justify-between flex-1">
              {slots.map((slot, idx) => (
                <div key={idx} className="flex-1 min-w-10 min-h-12 rounded-md flex items-center justify-center bg-base-200 text-2xl font-extrabold font-sans">
                  {slot.char}
                  {slot.hasFakeCaret && <div className="w-px h-4 bg-primary animate-caret-blink" />}
                </div>
              ))}
            </div>
          )}
          placeholder="-"
          value={pin}
          onChange={(v) => {
            if (v === "" || /^\d+$/.test(v))
              setPin(v)
          }}
        />
        <DisplayContent status={isError}>
          <ErrorMessageBox sample content={t("common.pinMustBeAtLeast6Digits")} show={isError} />
        </DisplayContent>
      </div>
      <ConfirmBox
        disabled={pin === "" || isError}
        onClick={() => {
          if (data === "OPEN_WITHDRAW_FIAT_PIN_MODAL") {
            emitter.emit("SYNC_WITHDRAW_FIAT_CREATE", pin);
          }
          if (data === "OPEN_WITHDRAW_CRYPTO_PIN_MODAL") {
            emitter.emit("SYNC_WITHDRAW_CRYPTO_CREATE", pin);
          }
          setPin("");
          onClose();
        }}
      >
        {t("common.confirmPIN")}
      </ConfirmBox>
    </div>
  );
};

export default WithdrawPinModal;
