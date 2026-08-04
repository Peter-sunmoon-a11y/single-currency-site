import { analyticsConfig, promotionConfig } from "@/lib/env";
import { useAuth } from "@/contexts/AuthContext";
import { resetPassword, sendPasswordResetCode } from "@/services/auth/session";
import { useSignUp } from "@/hooks/api/useAuth";
import { useBaseConfig } from "@/hooks/api/usePublic.ts";
import { useCountryCodeByIp } from "@/sections/profile/security/helper.ts";
import { ErrorMessageBox } from "@/components/modal/UserFinanceModal/c/ErrorMessageBox.tsx";
import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox";
import { getAuthErrorMessageKey } from "@/components/modal/errorCodes";
import { getCookie } from "@/utils/browser";
import { password_reg_exp } from "@/utils/regexp";
import { trackCustomEvent, uuidv4Generate } from "@/utils/helper.ts";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { X, Eye, EyeOff } from "lucide-react";
import { useCallback, useRef, useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { toast } from "sonner";
import type { Country } from "@/lib/phone";
import Iconify from "@/components/iconify";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { PhoneEmailInput } from "@/components/ui/PhoneEmailInput";
import SocialLogin from "@/components/socialLogin";
import { useAppNavigate } from "@/hooks/useAppNavigate";
import { DEVICE_STORAGE_KEY } from "@/utils/storageKeys";

export type AuthTab = "signin" | "signup";

// ── Promo card ────────────────────────────────────────────────
const PROMO_STYLE = {
  isolation: "isolate",
  background: `linear-gradient(135deg,
    var(--color-base-300) 0%,
    color-mix(in oklch, var(--color-primary) 70%, black) 100%
  )`
} as const;

const PromoCard = ({ activeTab }: { activeTab: AuthTab }) => {
  const { t } = useTranslation("login");
  const isSignIn = activeTab === "signin";
  return (
    <div style={PROMO_STYLE} className="relative h-[180px] overflow-hidden">
      <div className="h-full font-extrabold text-2xl pl-7 whitespace-pre-line flex flex-col justify-center">
        <div className="text-base-content leading-5">
          {t(isSignIn ? "signInModal.promoTitle1" : "signUpModal.promoTitle1")}
        </div>
        <div className="text-primary leading-5">
          {t(isSignIn ? "signInModal.promoTitle2" : "signUpModal.promoTitle2")}
        </div>
      </div>
      <img
        src="/images/sign_in/picture.png"
        className={`absolute right-0 top-0 h-[300px] object-cover -z-1 ${isSignIn ? "block" : "hidden"}`}
      />
      <img
        src="/images/sign_up/picture.png"
        className={`absolute -right-10 top-0 h-[300px] object-cover -z-1 ${isSignIn ? "hidden" : "block"}`}
      />
    </div>
  );
};

// ── Password eye toggle ───────────────────────────────────────
const PasswordEye = ({ onClick }: { onClick: (v: boolean) => void }) => {
  const [show, setShow] = useState(false);
  return (
    <div
      className="absolute right-3 z-10 cursor-pointer rtl:left-4 rtl:right-auto"
      onClick={() => {
        setShow(s => !s);
        onClick(!show);
      }}
    >
      {show ? <Eye className="w-4 h-4 text-primary" /> : <EyeOff className="w-4 h-4 text-base-content/50" />}
    </div>
  );
};

// ── Reset-password state ──────────────────────────────────────
type FormMode = "signin" | "forgot-password" | "reset-password";

interface ResetStatus {
  current_password: string;
  confirm_password: string;
  is_pending: boolean;
  current_password_view: boolean;
  confirm_password_view: boolean;
}

const INIT_RESET: ResetStatus = {
  current_password: "", confirm_password: "", is_pending: false,
  current_password_view: false, confirm_password_view: false
};

// ── AuthContent ───────────────────────────────────────────────
export type AuthContentProps = {
  initialTab?: AuthTab;
  onClose: () => void;
  isActive: boolean;
};

export function AuthContent({ initialTab = "signin", onClose, isActive }: AuthContentProps) {
  const navigate = useAppNavigate();
  const { t } = useTranslation(["login", "profile", "common", "toast"]);
  const { login } = useAuth();
  const { data: countryCodeResponse } = useCountryCodeByIp();
  const { data: baseConf } = useBaseConfig();

  const defaultPhoneCountry = useMemo(() => {
    const code = countryCodeResponse?.data?.country_code;
    return code ? (code.toUpperCase() as Country) : undefined;
  }, [countryCodeResponse?.data?.country_code]);

  // ── Tab ──────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<AuthTab>(initialTab);
  useEffect(() => {
    if (isActive) setActiveTab(initialTab);
  }, [isActive, initialTab]);

  // ── Sign In form state ────────────────────────────────────────
  const [formMode, setFormMode] = useState<FormMode>("signin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUsernameValid, setIsUsernameValid] = useState(false);

  // Forgot / reset password
  const [resetUsername, setResetUsername] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [isResetUsernameValid, setIsResetUsernameValid] = useState(false);
  const [resetStatus, setResetStatus] = useState<ResetStatus>(INIT_RESET);
  const resetCaptchaRef = useRef<HCaptcha>(null);

  // ── Sign Up form state ────────────────────────────────────────
  const [signUpUsername, setSignUpUsername] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [agreeMarketing, setAgreeMarketing] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const captchaRef = useRef<HCaptcha>(null);
  const signupMutation = useSignUp();

  // ── Redirect path ─────────────────────────────────────────────
  const redirectPath = useMemo(() => {
    try {
      return new URL(window.location.href).searchParams.get("redirect") || "/";
    } catch {
      return "/";
    }
  }, []);

  // ── Reset all ─────────────────────────────────────────────────
  const resetAll = useCallback(() => {
    setFormMode("signin");
    setUsername("");
    setPassword("");
    setIsLoading(false);
    setIsUsernameValid(false);
    setResetUsername("");
    setVerificationCode("");
    setIsResetLoading(false);
    setIsResetUsernameValid(false);
    resetCaptchaRef.current?.resetCaptcha?.();
    setResetStatus(INIT_RESET);
    setSignUpUsername("");
    setSignUpPassword("");
    setIsSubmitting(false);
    setAgreeTerms(true);
    setAgreeMarketing(true);
  }, []);

  useEffect(() => {
    if (!isActive) {
      const id = window.setTimeout(resetAll, 250);
      return () => window.clearTimeout(id);
    }
  }, [isActive, resetAll]);

  // ── Sign In handlers ──────────────────────────────────────────
  const handleSignIn = async () => {
    if (!isUsernameValid || !username.trim()) {
      toast.error(t("login:pleaseEnterValidUsernameOrEmail"));
      return;
    }
    if (!password.trim()) {
      toast.error(t("login:pleaseEnterPassword"));
      return;
    }
    if (password.length < 6) {
      toast.error(t("login:passwordTooShort"));
      return;
    }
    try {
      setIsLoading(true);
      await login(username, password);
      toast.success(t("toast:signInSuccess"));
      onClose();
      if (redirectPath && redirectPath !== "/" && redirectPath !== "/casino") {
        setTimeout(() => navigate({ to: redirectPath as any }), 100);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendResetCode = async () => {
    if (!resetUsername.trim() || !isResetUsernameValid) {
      toast.error(t("login:pleaseEnterValidUsernameOrEmail"));
      return;
    }
    setIsResetLoading(true);
    try {
      resetCaptchaRef.current?.execute?.();
    } catch (e) {
      console.error(e);
      setIsResetLoading(false);
    }
  };

  const handleResetCaptchaVerify = async (token: string) => {
    if (!token) {
      setIsResetLoading(false);
      return;
    }
    const data: any = { username: resetUsername, hcaptcha_token: token };
    if (promotionConfig.isRoiBest) {
      data.url = window.location.origin + window.location.pathname + "#";
    }
    try {
      await sendPasswordResetCode(data);
      toast.success(t("common:common.submissionSuccessful"));
      setFormMode("reset-password");
    } catch (error: any) {
      const code = error?.code ?? error?.responseData?.code;
      const msgMap: Record<number, string> = {
        20014: "login:forgotPasswordUserNotFound",
        20015: "login:forgotPasswordUsernameInvalid",
        1002: "login:forgotPasswordUsernameInvalid",
        20016: "login:forgotPasswordHostInvalid",
        20017: "login:forgotPasswordContactNotBound",
        20018: "login:forgotPasswordSendCodeFailed"
      };
      toast.error(t(msgMap[code] ?? "login:pleaseTryAgainLater"));
    } finally {
      setIsResetLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setResetStatus(s => ({ ...s, is_pending: true }));
    try {
      const res = await resetPassword(resetUsername, verificationCode, resetStatus.current_password);
      if (res.code === 0 || res.code === 200) {
        toast.success(t("login:passwordResetSuccess"));
        setFormMode("signin");
        setResetUsername("");
        setVerificationCode("");
        setResetStatus(INIT_RESET);
      } else {
        toast.error(t(getAuthErrorMessageKey(res.code)));
        setResetStatus(s => ({ ...s, is_pending: false }));
      }
    } catch (error) {
      console.error(error);
      toast.error(t("login:failed_to_reset_password"));
      setResetStatus(s => ({ ...s, is_pending: false }));
    }
  };

  const handlePasteCode = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.trim()) setVerificationCode(text.trim());
    } catch { /* no-op */ }
  };

  // ── Sign Up handlers ──────────────────────────────────────────
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      toast.error(t("login:must_agree"));
      return;
    }
    if (!signUpUsername.trim()) {
      toast.error(t("login:pleaseEnterValidUsernameOrEmail"));
      return;
    }
    if (signUpUsername.length < 6) {
      toast.error(t("login:usernameTooShort"));
      return;
    }
    if (!signUpPassword.trim()) {
      toast.error(t("login:pleaseEnterPassword"));
      return;
    }
    if (signUpPassword.length < 6) {
      toast.error(t("login:passwordTooShort"));
      return;
    }
    setIsSubmitting(true);
    try {
      captchaRef.current?.execute?.();
    } catch (e) {
      console.error(e);
      setIsSubmitting(false);
    }
  };

  const handleSignUpWithToken = async (token: string) => {
    if (!token) {
      setIsSubmitting(false);
      return;
    }
    const device_id = uuidv4Generate();
    let ad_param = "";
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("__rb_") && key.endsWith("_params")) {
        ad_param = localStorage.getItem(key) || "";
        break;
      }
    }
    let pixelId = "";
    try {
      const norm = ad_param.startsWith("?") ? ad_param.slice(1) : ad_param;
      pixelId = new URLSearchParams(norm).get("pixel_id") || "";
    } catch { /* no-op */ }

    const base = {
      username: signUpUsername, password: signUpPassword, hcaptcha_token: token,
      email_subscription_flag: agreeMarketing,
      startapp: localStorage.getItem(DEVICE_STORAGE_KEY.startapp) || "",
      ad_param, device_id
    };
    const signupData = promotionConfig.isRoiBest
      ? base
      : {
        ...base,
        fbp: getCookie("_fbp") || "",
        fbc: getCookie("_fbc") || "",
        pixel_id: pixelId || analyticsConfig.facebookPixelId || ""
      };

    try {
      await signupMutation.mutateAsync(signupData);
      try {
        await login(signUpUsername, signUpPassword);
        toast.success(t("toast:account_created_and_logged_in_successfully", { defaultValue: "Account created and logged in successfully!" }));
        const { password: _p, hcaptcha_token: _t, ...trackData } = signupData as any;
        trackCustomEvent("signup", "userSignUp", trackData);
      } catch {
        toast.success("Account created successfully! Please sign in.");
      }
      onClose();
    } catch {
      // error toast handled in useSignUp.onError
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Derived ───────────────────────────────────────────────────
  const verificationCodeNullError = !verificationCode;
  const input_null_error = !resetStatus.current_password || !resetStatus.confirm_password;
  const confirm_password_match_error = !!resetStatus.confirm_password && resetStatus.confirm_password !== resetStatus.current_password;
  const current_password_length_error = !!resetStatus.current_password && (resetStatus.current_password.length < 6 || resetStatus.current_password.length > 64);
  const resetDisabled = verificationCodeNullError || input_null_error || confirm_password_match_error || current_password_length_error;

  // ── Sign In form ──────────────────────────────────────────────
  const renderSignInForm = () => (
    <div
      className="p-4 flex flex-col gap-4 flex-1"
      onFocusCapture={(e) => {
        const target = e.target as HTMLElement;
        window.setTimeout(() => target.scrollIntoView({ block: "center" }), 50);
      }}
    >
      <form
        className="flex flex-col gap-4 w-full"
        onSubmit={(e) => {
          e.preventDefault();
          void handleSignIn();
        }}
      >
        <div className="flex flex-col gap-2">
          <PhoneEmailInput
            placeholder={t("login:emailOrPhoneNumber")}
            value={username}
            onChange={setUsername}
            onValidationChange={setIsUsernameValid}
            defaultCountry={defaultPhoneCountry}
          />
          <PasswordInput value={password} onChange={setPassword} />
        </div>
        <p className="text-sm text-base-content/50 text-end hover:underline cursor-pointer font-semibold">
          <span onClick={() => setFormMode("forgot-password")}>{t("login:forgotPassword")}</span>
        </p>
        <button type="submit" className="btn btn-primary btn-md sm:btn-lg" disabled={isLoading}>
          {isLoading
            ? <><span className="loading loading-spinner loading-sm" />{t("login:signIn")}</>
            : t("login:signIn")}
        </button>
      </form>
      <SocialLogin enabled={isActive && activeTab === "signin"} />
      <p className="text-sm text-center text-base-content/50 pb-2">
        {t("login:dontHaveAccount")}{" "}
        <span
          className="text-primary font-bold cursor-pointer hover:underline"
          onClick={() => navigate({ to: "/signup", search: undefined })}
        >
          {t("login:signUp")}
        </span>
      </p>
    </div>
  );

  const renderForgotPasswordForm = () => (
    <div className="flex flex-col gap-4 flex-1">
      <div className="border-b border-base-content/10">
        <div className="px-4 py-2 flex items-center flex-shrink-0 justify-between">
          <div className="flex items-center gap-2">
            <Iconify icon="custom:password-check" className="w-4 h-4 text-primary" />
            <h2 className="text-sm text-primary font-bold">{t("login:recoverPassword")}</h2>
          </div>
          <button className="btn btn-sm btn-square" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="px-4 flex flex-col gap-4 flex-1">
        <p className="text-sm text-base-content/70">{t("login:forgotPasswordDescription")}</p>
        <form
          className="flex flex-col gap-4 w-full"
          onSubmit={(e) => {
            e.preventDefault();
            void handleSendResetCode();
          }}
        >
          <PhoneEmailInput
            placeholder={t("login:emailOrPhoneNumber")}
            value={resetUsername}
            onChange={setResetUsername}
            onValidationChange={setIsResetUsernameValid}
            defaultCountry={defaultPhoneCountry}
          />
          <button type="submit" className="btn btn-primary btn-md" disabled={isResetLoading}>
            {isResetLoading
              ? <><span className="loading loading-spinner loading-sm" />{t("login:recoverPassword")}</>
              : t("login:recoverPassword")}
          </button>
        </form>
        <div className="flex items-center gap-2 text-sm font-bold">
          <div className="w-full h-px bg-linear-to-r from-base-content/0 to-base-content/10" />
          <p className="text-nowrap text-base-content/50">{t("login:or")}</p>
          <div className="w-full h-px bg-linear-to-r from-base-content/10 to-base-content/0" />
        </div>
        <button type="button" className="self-center btn btn-primary btn-soft btn-md"
                onClick={() => setFormMode("signin")}>
          {t("login:backToSignIn")}
        </button>
      </div>
    </div>
  );

  const renderResetPasswordForm = () => (
    <div className="flex flex-col gap-4 flex-1">
      <div className="border-b border-base-content/10">
        <div className="px-4 py-2 flex items-center flex-shrink-0 justify-between">
          <div className="flex items-center gap-2">
            <Iconify icon="custom:password-check" className="w-4 h-4 text-primary" />
            <h2 className="text-sm text-primary font-bold">{t("login:resetPassword")}</h2>
          </div>
          <button className="btn btn-sm btn-square" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
      </div>
      <div className="px-4 flex flex-col gap-4 flex-1">
        <label className="relative flex items-center">
          <input
            type="text"
            placeholder={t("login:OTPCode")}
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            className="w-full input input-md input-ghost bg-base-300 text-base-content flex-1"
          />
          <button type="button" className="absolute btn btn-primary btn-soft btn-sm right-1" onClick={handlePasteCode}>
            <Iconify icon="custom:paste" />
            <p>{t("profile:paste")?.toUpperCase() ?? "PASTE"}</p>
          </button>
        </label>
        <div className="flex flex-col gap-2">
          <div className="relative">
            <div className="relative flex items-center">
              <input
                type={resetStatus.current_password_view ? "text" : "password"}
                value={resetStatus.current_password}
                onChange={(e) => setResetStatus(s => ({ ...s, current_password: e.target.value.trim() }))}
                placeholder={t("login:newPassword")}
                className="input input-md input-ghost bg-base-300 text-base-content w-full pr-8"
              />
              <PasswordEye onClick={(v) => setResetStatus(s => ({ ...s, current_password_view: v }))} />
            </div>
            <ErrorMessageBox sample content={t("profile:passwordLengthRequirement")}
                             show={current_password_length_error} />
          </div>
          <div className="relative">
            <div className="relative flex items-center">
              <input
                type={resetStatus.confirm_password_view ? "text" : "password"}
                value={resetStatus.confirm_password}
                onChange={(e) => setResetStatus(s => ({ ...s, confirm_password: e.target.value.trim() }))}
                placeholder={t("login:confirmPassword")}
                className="input input-md sm:input-lg input-ghost bg-base-300 text-base-content w-full pr-8"
              />
              <PasswordEye onClick={(v) => setResetStatus(s => ({ ...s, confirm_password_view: v }))} />
            </div>
            <ErrorMessageBox sample content={t("profile:passwordDoNotMatch")} show={confirm_password_match_error} />
          </div>
        </div>
        <ConfirmBox
          loading={resetStatus.is_pending}
          onClick={() => {
            if (!resetDisabled) void handleResetPassword();
          }}
          disabled={resetDisabled}
        >
          {t("login:resetPassword")}
        </ConfirmBox>
      </div>
      <p className="text-sm text-base-content/70 text-center">
        <span>{t("login:dontReceiveCode")}</span>{" "}
        <span className="font-bold text-primary hover:underline cursor-pointer" onClick={void handleSendResetCode}>
          {t("login:resend")}
        </span>
      </p>
    </div>
  );

  // ── Sign Up form ──────────────────────────────────────────────
  const renderSignUpForm = () => (
    <div className="p-4 flex flex-col gap-4 flex-1 overflow-hidden">
      <form className="flex flex-col gap-2 w-full" onSubmit={handleSignUpSubmit}>
        <PhoneEmailInput
          placeholder={t("login:emailOrPhoneNumber")}
          value={signUpUsername}
          onChange={setSignUpUsername}
          defaultCountry={defaultPhoneCountry}
        />
        <PasswordInput value={signUpPassword} onChange={(v) => setSignUpPassword(v.replace(password_reg_exp, ""))} />
        <div className="flex flex-col gap-y-2 mt-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="checkbox checkbox-sm md:checkbox-md checkbox-primary rounded-sm"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
            />
            <p className="text-sm text-base-content/50 leading-4">{t("login:userAgreementConfirm")}</p>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="checkbox checkbox-sm md:checkbox-md checkbox-primary rounded-sm"
              checked={agreeMarketing}
              onChange={(e) => setAgreeMarketing(e.target.checked)}
            />
            <p className="text-sm text-base-content/50 leading-4">
              {t("login:marketingPromotions", { siteName: `[${baseConf?.data?.h5?.replace(/^https?:\/\//, "")}]` })}
            </p>
          </label>
        </div>
        <button type="submit" className="btn btn-primary btn-md sm:btn-lg mt-4" disabled={isSubmitting}>
          {isSubmitting
            ? <><span className="loading loading-spinner loading-sm" />{t("login:signUp")}</>
            : t("login:signUp")}
        </button>
      </form>
      <SocialLogin enabled={isActive && activeTab === "signup"} />
      <p className="text-sm text-center text-base-content/50 pb-2">
        {t("login:alreadyHaveAccount")}{" "}
        <span
          className="text-primary font-bold cursor-pointer hover:underline"
          onClick={() => navigate({ to: "/signin", search: undefined })}
        >
          {t("login:signIn")}
        </span>
      </p>
    </div>
  );

  // ── Tab bar visible only in normal sign-in/sign-up flows ──────
  const isForgotFlow = activeTab === "signin" && formMode !== "signin";

  return (
    <>
      <div className="w-full">
        <div className="flex flex-col">
          <PromoCard activeTab={activeTab} />

          <div className="flex flex-col">
            {/* Title bar + close — hidden during forgot/reset password flows */}
            {!isForgotFlow && (
              <div className="flex items-center justify-between border-b border-base-content/10 pl-4 pr-2 py-2 flex-shrink-0">
                <h2 className="text-sm font-bold text-primary">
                  {activeTab === "signin" ? t("login:signIn") : t("login:signUp")}
                </h2>
                <button className="btn btn-sm btn-square" onClick={onClose}>
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Form area */}
            <div>
              {activeTab === "signin" && (
                <>
                  {formMode === "signin" && renderSignInForm()}
                  {formMode === "forgot-password" && renderForgotPasswordForm()}
                  {formMode === "reset-password" && renderResetPasswordForm()}
                </>
              )}
              {activeTab === "signup" && renderSignUpForm()}
            </div>
          </div>
        </div>
      </div>

      {/* hCaptcha portals — rendered outside to avoid z-index issues */}
      {isActive && createPortal(
        <>
          <HCaptcha
            sitekey="3c365144-fab8-43b8-812a-8af04e8cf134"
            size="invisible"
            onVerify={handleSignUpWithToken}
            onError={(err) => console.error("hCaptcha error:", err)}
            onClose={() => setIsSubmitting(false)}
            ref={captchaRef}
            custom
            theme="dark"
          />
          {isForgotFlow && (
            <HCaptcha
              sitekey="3c365144-fab8-43b8-812a-8af04e8cf134"
              size="invisible"
              onVerify={handleResetCaptchaVerify}
              onError={(err) => {
                console.error(err);
                setIsResetLoading(false);
              }}
              onClose={() => setIsResetLoading(false)}
              ref={resetCaptchaRef}
              custom
              theme="dark"
            />
          )}
        </>,
        document.body
      )}
    </>
  );
}
