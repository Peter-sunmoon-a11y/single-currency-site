enum AUTH_ERROR_CODES {
  TOO_MANY_REQUESTS_CODE = 429,

  // Input parameter error - invalid parameters that bypassed frontend validation
  INPUT_PARAM_ERROR = 60004,

  // Email or mobile type error - invalid email or phone number format
  EMAIL_OR_MOBILE_TYPE_ERROR = 60005,

  // Username or password error - incorrect credentials
  USERNAME_OR_PASSWORD_ERROR = 60006,

  // Default error - generic error without exposing sensitive information
  DEFAULT_ERROR = 60007,

  // Input PIN does not exist - PIN field is missing or empty
  INPUT_PIN_IS_NOT_EXIST = 60008,

  // Input confirm PIN does not exist - confirm PIN field is missing or empty
  INPUT_CONFIRM_PIN_IS_NOT_EXIST = 60009,

  // Input confirm PIN does not match - PIN and confirm PIN don't match
  INPUT_CONFIRM_PIN_DO_NOT_MATCH = 60010,

  // User not found - user does not exist in the system
  USER_NOT_FOUND = 60011,

  // Incorrect current password - current password is wrong
  INCORRECT_CURRENT_PASSWORD = 60012,

  // 两次输入的新密码不一致
  CODE_NEW_PASSWORD_AND_CONFIRM_PASSWORD_DO_NOT_MATCH = 60013,

  // 新旧密码一致
  CODE_NEW_PASSWORD_AND_CURRENT_PASSWORD_AS_SAME = 60014,

  // 无效的验证码
  CODE_INVALID_OR_EXPIRED_VERIFICATION_CODE = 60016,

  CODE_SMS_COUNTRY_NOT_SUPPORTED = 60018, // 国家不支持

  CODE_SMS_PROVIDER_NOT_AVAILABLE = 60019, // 短信提供商不可用

  CODE_SMS_SEND_FAILED = 60020,  // 短信发送失败

  CODE_SMS_INVALID_MOBILE_FORMAT = 60021 // 手机号格式错误
}

export function matchResponseCodeError(code: number): string {
  switch (code) {
    case AUTH_ERROR_CODES.INPUT_PARAM_ERROR:
      return "login:inputParamError";
    case AUTH_ERROR_CODES.EMAIL_OR_MOBILE_TYPE_ERROR:
      return "login:emailOrMobileTypeError";
    case AUTH_ERROR_CODES.USERNAME_OR_PASSWORD_ERROR:
      return "login:usernameOrPasswordError";
    case AUTH_ERROR_CODES.DEFAULT_ERROR:
      return "login:defaultError";
    case AUTH_ERROR_CODES.INPUT_PIN_IS_NOT_EXIST:
      return "login:inputPinNotExist";
    case AUTH_ERROR_CODES.INPUT_CONFIRM_PIN_IS_NOT_EXIST:
      return "login:inputConfirmPinNotExist";
    case AUTH_ERROR_CODES.INPUT_CONFIRM_PIN_DO_NOT_MATCH:
      return "login:inputConfirmPinDoNotMatch";
    case AUTH_ERROR_CODES.USER_NOT_FOUND:
      return "login:userNotFound";
    case AUTH_ERROR_CODES.INCORRECT_CURRENT_PASSWORD:
      return "login:incorrectCurrentPassword";
    case AUTH_ERROR_CODES.CODE_NEW_PASSWORD_AND_CONFIRM_PASSWORD_DO_NOT_MATCH:
      return "login:newPasswordNotMatch";
    case AUTH_ERROR_CODES.CODE_NEW_PASSWORD_AND_CURRENT_PASSWORD_AS_SAME:
      return "login:oldAndNewPasswordAreSame";
    case AUTH_ERROR_CODES.CODE_INVALID_OR_EXPIRED_VERIFICATION_CODE:
      return "login:invalidVerificationCode";
    case AUTH_ERROR_CODES.CODE_SMS_COUNTRY_NOT_SUPPORTED:
      return "login:code_sms_country_not_supported";
    case AUTH_ERROR_CODES.CODE_SMS_PROVIDER_NOT_AVAILABLE:
      return "login:code_sms_provider_not_available";
    case AUTH_ERROR_CODES.CODE_SMS_SEND_FAILED:
      return "login:code_sms_send_failed";
    case AUTH_ERROR_CODES.CODE_SMS_INVALID_MOBILE_FORMAT:
      return "login:phoneError";
    case AUTH_ERROR_CODES.TOO_MANY_REQUESTS_CODE:
      return "common:common.tooManyRequests";
    default:
      return "common:common.serverError";
  }
}
