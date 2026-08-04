import i18n from "@/i18n";
import authAxiosInstance from "@/lib/authAxios";
import publicAxiosInstance from "@/lib/publicAxios";

import type { ApiResponse, LoginCredentials, LoginResponse } from "@/types/auth";

export async function signIn(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await publicAxiosInstance.post<LoginResponse>("/Authentication/login", credentials);

    if (response.data.code !== 0) {
      if (response.data.code === 11 || response.data.code === 5004) {
        throw new Error(i18n.t("toast:login_error_code_1"));
      }
      if (response.data.code === 5002 ) {
        throw new Error(i18n.t("toast:user_not_found_or_password_incorrect"));
      }

      throw new Error(response.data.msg || "Login failed");
    }

    return response.data;
}

export async function signupRoiBest(credentials: LoginCredentials): Promise<ApiResponse<any>> {
    const response = await publicAxiosInstance.post<ApiResponse<any>>("/Authentication/signupRoiBest", credentials);

    if (response.data.code !== 0) {
      const error: Error & { code?: number; responseData?: ApiResponse<any> } = new Error(
        response.data.msg || "Login failed"
      );
      error.code = response.data.code;
      error.responseData = response.data;
      throw error;
    }

    return response.data;
}

export async function signUp(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await publicAxiosInstance.post<LoginResponse>("/Authentication/signup", credentials, {
      headers: {
        "Accept-Language": i18n.language
      }
    });

    if (response.data.code !== 0) {
      if (response.data.code === 11 || response.data.code === 5004) {
        throw new Error(i18n.t("toast:login_error_code_1"));
      }
      const error: Error & { code?: number; responseData?: LoginResponse } = new Error(
        response.data.msg || "Sign up failed"
      );
      error.code = response.data.code;
      error.responseData = response.data;
      throw error;
    }

    return response.data;
}

export async function signOut(): Promise<void> {
    await authAxiosInstance.post("/user/logout");
}

export async function refreshToken(refreshToken: string): Promise<LoginResponse> {
    const response = await authAxiosInstance.post<ApiResponse<LoginResponse>>("/auth/refresh", {
      refreshToken
    });

    if (response.data.code !== 0) {
      throw new Error(response.data.msg || "Token refresh failed");
    }

    return response.data.data;
}

export async function sendPasswordResetCode(data: any): Promise<void> {
    const response = await publicAxiosInstance.post("/authentication/forgetPasswordToSendCode", data);

    if (response.data.code !== 0) {
      const error: Error & { code?: number; responseData?: any } = new Error(
        response.data.msg || "Failed to send reset code"
      );
      error.code = response.data.code;
      error.responseData = response.data;
      throw error;
    }
}

  /**
   * 重置密码
   * @param emailOrPhone 邮箱或手机号
   * @param verificationCode 验证码
   * @param newPassword 新密码
   */

export async function resetPassword(emailOrPhone: string, verificationCode: string, newPassword: string): Promise<any> {
    const response = await publicAxiosInstance.post("/Authentication/resetPassword", {
      username: emailOrPhone,
      code: verificationCode,
      password: newPassword
    });
    return response.data;
    // if (response.data.code !== 0) {
    //   throw new Error(response.data.msg || "Failed to reset password");
    // }
}

  /**
   * 获取数字货币的充值地址
   */
