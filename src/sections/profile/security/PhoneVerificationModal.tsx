import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { ErrorMessageBox } from "@/components/modal/UserFinanceModal/c/ErrorMessageBox.tsx";
import { Modal } from "@/components/ui/Modal.tsx";
import { bindMobile, sendMobileCode } from "@/services/auth/user";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { MotionContentBox } from "@/components/modal/UserFinanceModal/c/MotionContentBox.tsx";
import { toast } from "sonner";
import { ChevronLeft, CheckCircle2 } from "lucide-react";
import { OTPInput } from "input-otp";
import Countdown from "@/sections/profile/security/Countdown.tsx";
import dayjs from "dayjs";
import { matchResponseCodeError } from "@/sections/profile/security/response_code.ts";
import { PhoneAreaCodeSelect } from "@/sections/profile/security/PhoneAreaCodeSelect.tsx";
import { Country, isValidPhoneNumber, getCountryCallingCode } from "@/lib/phone";
import { useCountryCodeByIp } from "@/sections/profile/security/helper.ts";
import { useQueryClient } from "@tanstack/react-query";
import { DisplayContent, FormBox } from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";
import { useAuth } from "@/contexts/AuthContext";

interface IStatus {
  step: "STEP1" | "STEP2" | "STEP3",
  phone: string,
  country: string,
  country_code: string,
  opt_code: string,
  success: boolean
  send_code_loading: boolean
  bind_phone_loading: boolean
  finished: boolean
  countdown: number
  end_timestamp: number
}

function maskPhone(phone?: string, country?: string) {
  if (!phone) return "";

  const normalizedPhone = phone.replace(/\s+/g, "");

  if (normalizedPhone.length <= 4) {
    return country ? `+${getCountryCallingCode(country as Country)}-${normalizedPhone}` : normalizedPhone;
  }

  const maskedPhone = `${normalizedPhone.slice(0, 3)}******${normalizedPhone.slice(-4)}`;
  return country ? `+${getCountryCallingCode(country as Country)}-${maskedPhone}` : maskedPhone;
}

const initStatus: IStatus = {
  step: "STEP1",
  phone: "",
  opt_code: "",
  country: "",
  country_code: "",
  success: false,
  send_code_loading: false,
  bind_phone_loading: false,
  finished: false,
  countdown: 60,
  end_timestamp: 0
};

export const PhoneVerificationModal = (
  {
    open,
    onClose
  }: {
    open: boolean;
    onClose: () => void;
  }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();

  const { t } = useTranslation("profile");

  const { refetchUser: refetch } = useAuth();

  /**
   * 当前用户IP对应的地区
   */
  const { data: defaultCode, isLoading } = useCountryCodeByIp();

  const [status, setStatus] = useState<IStatus>(initStatus);

  /**
   * 手机号格式错误
   */
  const phone_format_error = status.phone !== "" && status.country !== "" && !isValidPhoneNumber(status.phone, status.country as Country);

  /**
   * 验证码格式错误
   */
  const phone_opt_code_error = status.opt_code !== "" && !/^[0-9]{6}$/.test(status.opt_code);

  /**
   * 发送手机验证码
   */
  const sendCode = () => {
    setStatus((old) => ({
      ...old,
      send_code_loading: true
    }));
    sendMobileCode({ mobile: "+" + getCountryCallingCode(status.country as Country) + "-" + status.phone })
      .then((res) => {
        if (res.code === 0) {
          toast.success(t(matchResponseCodeErrorForPhone(0)));
          setStatus((old) => ({
            ...old,
            step: "STEP2",
            finished: false,
            end_timestamp: dayjs().add(status.countdown * 1000).valueOf()
          }));
          void queryClient.refetchQueries({ queryKey: ["auth", "currentUser"] });
        } else {
          toast.error(t(matchResponseCodeErrorForPhone(res.code)));
        }
      }).catch((error) => {
      console.info(error);
    })
      .finally(() => {
        setStatus((old) => ({
          ...old,
          send_code_loading: false
        }));
      });
  };

  /**
   * 绑定手机号
   */
  const bindPhone = () => {
    setStatus((old) => ({
      ...old,
      bind_phone_loading: true
    }));
    bindMobile({
      mobile: "+" + getCountryCallingCode(status.country as Country) + "-" + status.phone,
      code: status.opt_code
    })
      .then((res) => {
        if (res.code === 0) {
          void refetch();
          setStatus((old) => ({ ...old, step: "STEP3", opt_code: "" }));
        } else if (res.code === 1002) {
          toast.error(t("common:invalid_or_expired_verification_code"));
        } else {
          toast.error(t(matchResponseCodeError(res.code)));
        }
      }).catch((error) => {
      console.info(error);
    })
      .finally(() => {
        setStatus((old) => ({ ...old, bind_phone_loading: false }));
      });
  };

  /**
   * 根据用户IP默认地区码
   */
  useEffect(() => {
    if (open && defaultCode?.data?.country_code) {
      const code = defaultCode?.data?.country_code?.toUpperCase();
      setStatus((v) => ({ ...v, country: code }));
    }
  }, [defaultCode, open]);

  /**
   * 到STEP2输入验证码步骤时默focus输入框
   */
  useLayoutEffect(() => {
    if (status.step !== "STEP2") return;

    const timer = setInterval(() => {
      const dom = document.getElementById("PHONE_CODE") as HTMLElement | null;
      if (!dom) return;

      (dom as any).focus?.();
      dom.click?.();
      clearInterval(timer);
    }, 200);

    return () => {
      clearInterval(timer);
    };
  }, [status.step]);

  return (
    <Modal
      title={<InnerModalHeader step={status.step} onClick={() => setStatus((v) => ({ ...v, step: "STEP1" }))} />}
      isOpen={open}
      onClose={onClose}
      position="modal-middle"
    >
      {/* send phone verification code form */}
      <DisplayContent status={status.step === "STEP1"}>
        <div className="flex flex-col gap-4">
          <p className="text-base-content/50 text-sm">
            {t("profile:enter_phone_number_to_receive_verification_code")}
          </p>

          <FormBox label={t("profile:enterPhoneNumber")}>
            <PhoneAreaCodeSelect
              loading={isLoading}
              defaultCode={defaultCode?.data?.country_code}
              onPhoneChange={(v) => setStatus((old) => ({ ...old, phone: v }))}
              onCodeChange={(v) => setStatus((old) => ({ ...old, country: v }))}
            />
          </FormBox>

          {/* confirm */}
          <ConfirmBox disabled={!status.phone || phone_format_error} onClick={sendCode}
                      loading={status.send_code_loading}>
            {t("common:common.continue")}
          </ConfirmBox>
        </div>
      </DisplayContent>

      {/* enter phone verification code form */}
      <DisplayContent status={status.step === "STEP2"}>
        <div className="flex flex-col gap-4">
          <h2 className="text-base-content/50 text-sm">
            {t("profile:codeSentTo")}
          </h2>

          <p className="text-primary text-base font-bold text-center">
            {maskPhone(status.phone, status.country)}
          </p>

          <div className="relative flex flex-col gap-2 w-full overflow-hidden">
            {/* 输入手机验证码 */}
            <OTPInput
              ref={inputRef}
              autoFocus
              maxLength={6}
              inputMode="numeric"
              containerClassName="group flex items-center has-[:disabled]:opacity-50"
              render={({ slots }) => (
                <div className="flex gap-2 justify-between flex-1">
                  {slots.map((slot, idx) => (
                    <div key={idx}
                         className="flex-1 min-w-10 min-h-12 rounded-md flex items-center justify-center bg-base-200 text-base-content text-2xl font-extrabold font-sans">
                      {slot.char}
                      {slot.hasFakeCaret && <div className="w-px h-4 bg-primary animate-caret-blink" />}
                    </div>
                  ))}
                </div>
              )}
              placeholder="-"
              value={status.opt_code}
              onChange={(v) => {
                if (v === "" || /^\d+$/.test(v))
                  setStatus((old) => ({
                    ...old,
                    opt_code: v
                  }));
              }}
            />

            {/* 验证码 - 格式 - 错误 */}
            <ErrorMessageBox sample content={t("profile:verificationCodeDescription")} show={phone_opt_code_error} />
          </div>

          {/* confirm */}
          <ConfirmBox disabled={!status.phone || !status.opt_code || phone_opt_code_error} onClick={bindPhone}
                      loading={status.bind_phone_loading}>
            {t("common:common.continue")}
          </ConfirmBox>

          {/* 验证码发送倒计时 */}
          <div className="text-sm text-base-content/50 flex items-center gap-1 justify-center">
            {t("profile:notReceiveCode")}
            {status.finished && <div className="text-primary cursor-pointer flex items-center gap-1"
                                     onClick={sendCode}>{t("profile:resend")} {status.send_code_loading && (
              <span className="loading loading-spin w-2.5 h-2.5" />)}.</div>}
            {!status.finished && status.end_timestamp > 0 && (<div className="inline-flex items-center gap-1">
              {t("profile:resendIn")}
              <Countdown end={status.end_timestamp} onFinished={(v) => {
                if (v) setStatus((old) => ({
                  ...old,
                  finished: v
                }));
              }} />
            </div>)}
          </div>
        </div>
      </DisplayContent>

      {/* verify phone verification success */}
      <DisplayContent status={status.step === "STEP3"}>
        <MotionContentBox
          sample
          show={status.step === "STEP3"}
          content={<div className="flex flex-col gap-4 items-center font-semibold">
            <CheckCircle2 className="w-12 h-12 text-success" />
            <p className="text-base">{t("profile:verificationSuccess")}</p>
            <ConfirmBox onClick={() => {
              setStatus(initStatus);
              onClose();
            }}>{t("profile:understand_key")}</ConfirmBox>
          </div>} />
      </DisplayContent>
    </Modal>
  );
};

export default PhoneVerificationModal;

const InnerModalHeader = ({ step, onClick }: { step?: string, onClick?: () => void }) => {
  const { t } = useTranslation("profile");
  return (
    <div className="flex items-center gap-x-2">
      {step === "STEP2" &&
        <button className="btn btn-square btn-sm" onClick={onClick}><ChevronLeft className="w-4 h-4" /></button>}
      <p className="text-base font-bold">{t("profile:phoneVerification")}</p>
    </div>
  );
};

function matchResponseCodeErrorForPhone(code: number): string {
  switch (code) {
    case 0:
      return "common:common.verificationCodeSent";
    case 402:
      return "common:common.mobileHasBeenUsed";
    case 409:
    case 60001:
      return "common:common.mobileAlreadyBound";
    case 60020:
      return "common:common.phoneSendError";
    case 1003:
    case 1004:
      return "common:common.tooManyRequests";
    default:
      return "common:common.phoneSendError";
  }
}
