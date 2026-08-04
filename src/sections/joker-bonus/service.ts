import authAxiosInstance from "@/lib/authAxios";
import type { JokerApiResponse, JokerCurrentData, JokerInstancePayload } from "./types";

function unwrap<T>(response: { data: JokerApiResponse<T> }): JokerApiResponse<T> {
  const body = response.data;
  return {
    ...body,
    ok: body.ok ?? body.code === 0,
    reason: body.reason ?? body.msg ?? "",
  };
}

export const jokerBonusService = {
  async current() {
    return unwrap<JokerCurrentData>(await authAxiosInstance.get("/JokerBonus/current"));
  },

  async reserve(instanceId: number, displayToken = "", clientContext: Record<string, string> = {}) {
    return unwrap<JokerInstancePayload>(await authAxiosInstance.post("/JokerBonus/reserve", {
      instance_id: instanceId,
      display_token: displayToken,
      client_context: clientContext,
    }));
  },

  async click(instanceId: number, displayToken = "") {
    return unwrap<JokerInstancePayload>(await authAxiosInstance.post("/JokerBonus/click", {
      instance_id: instanceId,
      display_token: displayToken,
    }));
  },

  async display(instanceId: number, displayToken = "", displayEventId = "") {
    return unwrap<JokerInstancePayload>(await authAxiosInstance.post("/JokerBonus/display", {
      instance_id: instanceId,
      display_token: displayToken,
      display_event_id: displayEventId,
    }));
  },

  async open(instanceId: number, boxIndex: number, displayToken = "") {
    return unwrap<JokerInstancePayload>(await authAxiosInstance.post("/JokerBonus/open", {
      instance_id: instanceId,
      display_token: displayToken,
      box_index: boxIndex,
    }));
  },

  async claim(instanceId: number, displayToken = "", claimCurrency = "") {
    return unwrap<JokerInstancePayload>(await authAxiosInstance.post("/JokerBonus/claim", {
      instance_id: instanceId,
      display_token: displayToken,
      claim_currency: claimCurrency,
    }));
  },
};
