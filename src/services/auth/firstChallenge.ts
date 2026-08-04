import authAxiosInstance from "@/lib/authAxios";
import type { ApiResponse } from "@/types/auth";

export async function getFirstChallengeEligibility(): Promise<ApiResponse<any>> {
  const response = await authAxiosInstance.get("/FirstChallenge/eligibility");
  return response.data;
}

export async function getFirstChallengeTasks(deviceEnv = "other"): Promise<ApiResponse<any>> {
  const response = await authAxiosInstance.get("/FirstChallenge/tasks", {
    params: { device_env: deviceEnv }
  });
  return response.data;
}

export async function getFirstChallengeHistory(): Promise<ApiResponse<any>> {
  const response = await authAxiosInstance.get("/FirstChallenge/history");
  return response.data;
}

export async function claimFirstChallenge(user_task_id: string, device_env: string): Promise<ApiResponse<any>> {
  const response = await authAxiosInstance.post("/FirstChallenge/claim", { user_task_id, device_env });
  return response.data;
}

export async function collectFirstChallenge(currency: string): Promise<ApiResponse<any>> {
  const response = await authAxiosInstance.post("/FirstChallenge/collect", { currency });
  return response.data;
}

export async function firstChallengeMarkSeen(): Promise<ApiResponse<any>> {
  const response = await authAxiosInstance.post("/FirstChallenge/markSeen", { device_env: "other" });
  return response.data;
}
