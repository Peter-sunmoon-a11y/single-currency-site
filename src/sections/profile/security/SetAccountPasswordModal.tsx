import { useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import type { Country } from "@/lib/phone";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/api/useAuth";
import { Modal } from "@/components/ui/Modal";
import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox";
import { ErrorMessageBox } from "@/components/modal/UserFinanceModal/c/ErrorMessageBox";
import { MotionContentBox } from "@/components/modal/UserFinanceModal/c/MotionContentBox";
import { DisplayContent } from "@/components/modal/UserFinanceModal/c/InnerComponents";
import { PhoneEmailInput } from "@/components/ui/PhoneEmailInput";
import { password_reg_exp } from "@/utils/regexp";
import { setTmaPassword } from "@/services/auth/user";
import { InnerImg } from "./ChangePassword";
import { useCountryCodeByIp } from "./helper";

type PasswordField = "password" | "confirmPassword";

const INITIAL_PASSWORD_STATE = {
  password: "",
  confirmPassword: "",
};

const INITIAL_VISIBILITY_STATE = {
  password: false,
  confirmPassword: false,
};

const INITIAL_TOUCHED_STATE = {
  account: false,
  password: false,
  confirmPassword: false,
};

export function SetAccountPasswordModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation(["common", "profile", "login"]);
  const { refetch } = useCurrentUser();
  const { data: countryCodeResponse } = useCountryCodeByIp();

  const [account, setAccount] = useState("");
  const [accountValid, setAccountValid] = useState(false);
  const [passwordState, setPasswordState] = useState(INITIAL_PASSWORD_STATE);
  const [visibility, setVisibility] = useState(INITIAL_VISIBILITY_STATE);
  const [touched, setTouched] = useState(INITIAL_TOUCHED_STATE);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const defaultPhoneCountry = useMemo(() => {
    const code = countryCodeResponse?.data?.country_code;
    return code ? (code.toUpperCase() as Country) : undefined;
  }, [countryCodeResponse?.data?.country_code]);

  const trimmedAccount = account.trim();
  const accountIsValid = trimmedAccount !== "" && accountValid;

  const passwordLengthError = useMemo(
    () => touched.password && (passwordState.password.length < 6 || passwordState.password.length > 64),
    [passwordState.password.length, touched.password],
  );

  const confirmPasswordError = useMemo(
    () =>
      touched.confirmPassword &&
      (passwordState.confirmPassword.length < 6 ||
        passwordState.confirmPassword.length > 64 ||
        passwordState.confirmPassword !== passwordState.password),
    [passwordState.confirmPassword, passwordState.password, touched.confirmPassword],
  );

  const accountError = useMemo(() => touched.account && !accountIsValid, [accountIsValid, touched.account]);

  const canSubmit = useMemo(
    () =>
      accountIsValid &&
      passwordState.password.length >= 6 &&
      passwordState.password.length <= 64 &&
      passwordState.confirmPassword.length >= 6 &&
      passwordState.confirmPassword.length <= 64 &&
      passwordState.confirmPassword === passwordState.password &&
      !loading,
    [accountIsValid, loading, passwordState.confirmPassword, passwordState.password],
  );

  useEffect(() => {
    if (!open) {
      setAccount("");
      setAccountValid(false);
      setPasswordState(INITIAL_PASSWORD_STATE);
      setVisibility(INITIAL_VISIBILITY_STATE);
      setTouched(INITIAL_TOUCHED_STATE);
      setLoading(false);
      setSuccess(false);
    }
  }, [open]);

  const handlePasswordChange = (field: PasswordField, value: string) => {
    const sanitized = value.replace(password_reg_exp, "");
    setPasswordState((prev) => ({
      ...prev,
      [field]: sanitized,
    }));

    if (field === "password" && sanitized.length >= 6 && sanitized.length <= 64) {
      setTouched((prev) => ({ ...prev, password: false }));
    }

    if (field === "confirmPassword" && sanitized.length >= 6 && sanitized === passwordState.password) {
      setTouched((prev) => ({ ...prev, confirmPassword: false }));
    }
  };

  const toggleVisibility = (field: PasswordField) => {
    setVisibility((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSubmit = () => {
    const nextTouched = { ...touched };
    let hasError = false;

    if (!accountIsValid) {
      nextTouched.account = true;
      hasError = true;
    }
    if (passwordState.password.length < 6 || passwordState.password.length > 64) {
      nextTouched.password = true;
      hasError = true;
    }
    if (
      passwordState.confirmPassword.length < 6 ||
      passwordState.confirmPassword.length > 64 ||
      passwordState.confirmPassword !== passwordState.password
    ) {
      nextTouched.confirmPassword = true;
      hasError = true;
    }

    setTouched(nextTouched);
    if (hasError) return;

    setLoading(true);
    void setTmaPassword({
      username: trimmedAccount,
      password: passwordState.password,
    })
      .then(async (res) => {
        if (res.code === 0) {
          setSuccess(true);
          await refetch();
          return;
        }

        if (res.code === 401) {
          toast.error(t("common:common.usernameMustBeValidEmailOrMobileNumber", "Username must be a valid email or mobile number."));
        } else if (res.code === 402) {
          toast.error(t("common:common.youCanNotSetYourOwnEmailOrMobileAsPassword", "You cannot set your own email or mobile as password."));
        } else if (res.code === 403) {
          toast.error(t("common:common.emailOrMobileIsUsed", "Email or mobile is already used."));
        } else {
          toast.error(res.msg || t("common:common.setAccountAndPasswordFailed", "Failed to set account and password."));
        }
      })
      .catch(() => {
        toast.error(t("common:common.setAccountAndPasswordFailed", "Failed to set account and password."));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-primary" />
          <p className="text-base font-bold">{t("profile:setAccountAndPassword", "Set Account and Password")}</p>
        </div>
      }
      isOpen={open}
      onClose={onClose}
      position="modal-middle"
    >
      <DisplayContent status={!success}>
        <div className="flex flex-col gap-4">
          <p className="text-sm text-base-content/70">
            {t("profile:setOtherDevices", "Set an account and password for sign-in on other devices.")}
          </p>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-base-content/50 font-semibold">
              {t("profile:account", "Account")}
            </label>
            <PhoneEmailInput
              placeholder={t("login:emailOrPhoneNumber", "Email or phone number")}
              value={account}
              defaultCountry={defaultPhoneCountry}
              onChange={(value) => {
                setAccount(value);
                if (touched.account) {
                  setTouched((prev) => ({ ...prev, account: false }));
                }
              }}
              onValidationChange={(isValid) => {
                setAccountValid(isValid);
              }}
            />
            <ErrorMessageBox
              className="!mt-0"
              content={t("common:common.usernameMustBeValidEmailOrMobileNumber", "Username must be a valid email or mobile number.")}
              show={accountError}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-base-content/50 font-semibold">
              {t("profile:password", "Password")}
            </label>
            <div className="relative flex items-center">
              <input
                type={visibility.password ? "text" : "password"}
                className="input w-full bg-base-200 !outline-0 border-0 font-semibold px-4"
                placeholder={t("profile:enterPassword", "Enter password")}
                value={passwordState.password}
                onChange={(e) => handlePasswordChange("password", e.target.value)}
                minLength={6}
                maxLength={64}
              />
              <PasswordViewToggle active={visibility.password} onClick={() => toggleVisibility("password")} />
            </div>
            <ErrorMessageBox
              className="!mt-0"
              content={t("profile:passwordLengthRequirement", "Please enter a password between 6 and 64 characters.")}
              show={passwordLengthError}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-base-content/50 font-semibold">
              {t("profile:confirmPassword", "Confirm Password")}
            </label>
            <div className="relative flex items-center">
              <input
                type={visibility.confirmPassword ? "text" : "password"}
                className="input w-full bg-base-200 !outline-0 border-0 font-semibold px-4"
                placeholder={t("profile:confirmPassword", "Confirm Password")}
                value={passwordState.confirmPassword}
                onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                minLength={6}
                maxLength={64}
              />
              <PasswordViewToggle
                active={visibility.confirmPassword}
                onClick={() => toggleVisibility("confirmPassword")}
              />
            </div>
            <ErrorMessageBox
              className="!mt-0"
              content={t("profile:passwordDoNotMatch", "Passwords do not match.")}
              show={confirmPasswordError}
            />
          </div>

          <ConfirmBox disabled={!canSubmit} loading={loading} onClick={handleSubmit}>
            {t("common:common.continue", "Continue")}
          </ConfirmBox>
        </div>
      </DisplayContent>

      <DisplayContent status={success}>
        <MotionContentBox
          sample
          show={success}
          content={
            <div className="flex flex-col gap-4 items-center font-semibold">
              <InnerImg name="security-verification-ok" className="md:w-auto md:h-auto w-25 h-25" />
              <div className="flex flex-col gap-3 items-center">
                <p className="text-sm">
                  {t("common:common.setAccountAndPasswordSuccessfully", "Account and password set successfully.")}
                </p>
                <p className="text-base-content/50 text-xs text-center">
                  {t(
                    "common:common.setAccountAndPasswordSuccessfullyDescription",
                    "You can now sign in on other devices with this account and password.",
                  )}
                </p>
              </div>
              <ConfirmBox onClick={onClose}>{t("common:common.close", "Close")}</ConfirmBox>
            </div>
          }
        />
      </DisplayContent>
    </Modal>
  );
}

const PasswordViewToggle = ({ active, onClick }: { active: boolean; onClick: () => void }) => (
  <button type="button" className="absolute right-4 rtl:left-4 rtl:right-auto" onClick={onClick}>
    {active ? <Eye className="w-4 h-4 text-primary" /> : <EyeOff className="w-4 h-4 text-base-content/50" />}
  </button>
);
