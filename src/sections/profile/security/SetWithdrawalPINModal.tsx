import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { ErrorMessageBox } from "@/components/modal/UserFinanceModal/c/ErrorMessageBox.tsx";
import { Modal } from "@/components/ui/Modal.tsx";
import { updateWithdrawalPin } from "@/services/auth/user";
import { useMemo, useRef, useState } from "react";
import { Trans, useTranslation } from "@/lib/i18n/react-i18next";
import { MotionContentBox } from "@/components/modal/UserFinanceModal/c/MotionContentBox.tsx";
import { toast } from "sonner";
import { InnerImg } from "@/sections/profile/security/ChangePassword.tsx";
import { ChevronLeft } from "lucide-react";
import { OTPInput } from 'input-otp'
import { matchResponseCodeError } from "@/sections/profile/security/response_code.ts";
import md5 from "@/utils/md5";
import { DisplayContent } from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";
import { useBoundStore } from "@/store";
import { emitter } from "@/store/emitter.ts";
import { useQueryClient } from "@tanstack/react-query";
import { AUTH_QUERY_KEYS } from "@/hooks/api/useAuth.ts";

interface IStatus {
  step: "STEP1" | "STEP2" | "STEP3",
  new_pin: string,
  confirm_pin: string,
  success: boolean
  bind_pin_loading: boolean
}

const initStatus: IStatus = {
  step: "STEP1",
  new_pin: "",
  confirm_pin: "",
  success: false,
  bind_pin_loading: false
};

export const SetWithdrawalPINModal = (
  {
    open,
    data,
    onClose
  }: {
    open: boolean;
    data: any
    onClose: () => void;
  }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const { t } = useTranslation();

  const user = useBoundStore((state) => state.user);
  const queryClient = useQueryClient();

  const [status, setStatus] = useState<IStatus>(initStatus);

  const operate_pin_type = useMemo(() => user?.pin_setted ? "UPDATE_PIN" : "BIND_PIN", [user?.pin_setted]);

  /**
   * PIN错误
   */
  const new_pin_code_error = useMemo(() => status.new_pin !== "" && !/^[0-9]{6}$/.test(status.new_pin), [status.new_pin]);
  const repeat_pin_code_error = useMemo(() => status.confirm_pin !== status.new_pin, [status.new_pin, status.confirm_pin]);
  const confirm_pin_code_error = useMemo(() => status.confirm_pin !== "" && !/^[0-9]{6}$/.test(status.confirm_pin), [status.confirm_pin]);

  /**
   * 绑定PIN
   */
  const bindPinCode = () => {
    setStatus((old) => ({
      ...old,
      bind_pin_loading: true
    }));
    updateWithdrawalPin({ new_pin: md5(status.new_pin), confirm_pin: md5(status.confirm_pin) })
      .then((res) => {
        if (res.code === 0) {
          setStatus((old) => ({ ...old, step: "STEP3", opt_code: "" }));

          // 更新 RQ 缓存，AuthContext sync effect 自动同步到 store
          queryClient.setQueryData(AUTH_QUERY_KEYS.currentUser, (old: any) =>
            old ? { ...old, user: { ...old.user, pin_setted: true } } : old
          );
        } else {
          toast.error(t(matchResponseCodeError(res.code)));
        }
      }).catch((error) => {
      console.info(error);
    })
      .finally(() => {
        setStatus((old) => ({ ...old, bind_pin_loading: false }));
      });
  };

  /**
   * 到STEP2输入验证码步骤时默focus输入框
   */
  // useLayoutEffect(() => {
  //   const timer1 = setInterval(() => {
  //     const dom = document.getElementById("NEW_PIN_CODE");
  //     if (status.step === "STEP1") dom?.click();
  //     clearInterval(timer1);
  //   }, 500);

  //   const timer2 = setInterval(() => {
  //     const dom = document.getElementById("CONFIRM_PIN_CODE");
  //     if (status.step === "STEP2") dom?.click();
  //     clearInterval(timer2);
  //   }, 500);

  //   return () => {
  //     clearInterval(timer1);
  //     clearInterval(timer2);
  //   };
  // }, [status.step]);

  return (
    <Modal
      title={
        <div className="flex items-center gap-x-2 truncate">
          {status.step === "STEP2" &&
            <button className="btn btn-square btn-sm mr-2" onClick={() => setStatus((v) => ({ ...v, step: "STEP1" }))}>
              <ChevronLeft className="w-4 h-4" /></button>}
          <p className="text-base font-bold truncate">
            {status.step === "STEP1" && (operate_pin_type === "BIND_PIN" ? t("profile:change_withdrawal_pin") : t("common.updateWithdrawalPin"))}
            {status.step === "STEP2" && t("profile:confirm_withdrawal_pin")}
          </p>
        </div>
      }
      isOpen={open}
      onClose={onClose}
      position="modal-middle"
      className="bg-base-400 md:max-w-[420px] shadow-lg"
    >
      {/* set withdrawal pin form */}
      <DisplayContent status={status.step === "STEP1"}>
        <div className="flex flex-col gap-6 items-center">
          <InnerImg name="security-verification-lock" className="md:w-auto md:h-auto w-25 h-25" />

          <div className="relative flex flex-col gap-2 w-full">
            {/* 输入PIN码 */}
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
              value={status.new_pin}
              onChange={(v) => {
                if (v === "" || /^\d+$/.test(v))
                  setStatus((old) => ({
                    ...old,
                    new_pin: v
                  }));
              }}
            />

            {/* PIN - 格式 - 错误 */}
            <ErrorMessageBox
              sample
              content={t("common.pinMustBeAtLeast6Digits")}
              show={new_pin_code_error} />
          </div>

          <div className="w-full">
            {/* confirm */}
            <ConfirmBox disabled={!status.new_pin || new_pin_code_error} onClick={() => setStatus((old) => ({
              ...old,
              step: "STEP2"
            }))}
            >
              {t("common:common.continue")}
            </ConfirmBox>
            <DisplayContent status={!!status.new_pin && !new_pin_code_error}>
              <div
                className={"text-[11px] font-semibold text-warning text-center mt-4"}>{t("common.confirmCodeEntered")}</div>
            </DisplayContent>
          </div>
        </div>
      </DisplayContent>

      {/* re-enter withdrawal pin form */}
      <DisplayContent status={status.step === "STEP2"}>
        <div className="relative flex flex-col gap-6 items-center">
          <InnerImg name="security-verification-lock" className="md:w-auto md:h-auto w-25 h-25" />

          <div className="flex flex-col gap-2 w-full">
            {/* 输入PIN码 */}
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
              value={status.confirm_pin}
              onChange={(v) => {
                if (v === "" || /^\d+$/.test(v))
                  setStatus((old) => ({
                    ...old,
                    confirm_pin: v
                  }));
              }}
            />
            {/* PIN - 格式 - 错误 */}
            <ErrorMessageBox
              sample
              content={t("common.pinMustBeAtLeast6Digits")}
              show={confirm_pin_code_error} />
            {/* PIN码 - 不一致 - 错误 */}
            <ErrorMessageBox sample content={t("common.ensureSameEntered")} show={repeat_pin_code_error} />
          </div>

          {/* confirm */}
          <ConfirmBox
            disabled={!status.new_pin || !status.confirm_pin || confirm_pin_code_error || new_pin_code_error || repeat_pin_code_error}
            onClick={bindPinCode}
            loading={status.bind_pin_loading}>
            {t("common:common.continue")}
          </ConfirmBox>
        </div>
      </DisplayContent>

      {/* withdrawal pin verification success */}
      <DisplayContent status={status.step === "STEP3"}>
        <MotionContentBox
          sample
          show={status.step === "STEP3"}
          content={<div className="flex flex-col gap-6 items-center font-semibold">
            <InnerImg name="security-verification-ok" className="md:w-30 md:h-30 w-25 h-25" />
            <div className="flex flex-col gap-4 items-center">
              <p className="text-base">
                {operate_pin_type === "BIND_PIN" ? t("common.pinSetUpSuccessfully") : t("common.pinUpdatedSuccessfully")}
              </p>
              <p className="text-base-content/50 text-sm text-center">
                <Trans i18nKey="pinSetUpSuccessfullyDescription" ns="common" />
              </p>
            </div>
            <ConfirmBox onClick={() => {
              onClose();

              // TODO: 自定义行为 - 来源于用户提款操作但是未设置PIN码，设置之后立即触发提款操作
              user_todo_withdraw_but_unset_pin_code(status.confirm_pin, data);
            }}>{t("common:common.close")}</ConfirmBox>
          </div>} />
      </DisplayContent>
    </Modal>
  );
};

export default SetWithdrawalPINModal;

/**
 * 自定义行为 - 来源于用户提款操作但是未设置PIN码
 * 前提：用户操作提款但是未设置PIN码
 * PIN码设置成功则立即执行提现订单创建
 */
function user_todo_withdraw_but_unset_pin_code(pin: string, data?: string) {
  if (data === "OPEN_WITHDRAW_FIAT_PIN_MODAL") emitter.emit("SYNC_WITHDRAW_FIAT_CREATE", pin);
  if (data === "OPEN_WITHDRAW_CRYPTO_PIN_MODAL") emitter.emit("SYNC_WITHDRAW_CRYPTO_CREATE", pin);
}
