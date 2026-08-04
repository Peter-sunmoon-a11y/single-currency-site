import type { InternalAxiosRequestConfig } from "axios";
import { AxiosHeaders } from "axios";

let lastTs = 0;
let sameMsCounter = 0;

export function createTraceId(): string {
  const now = Date.now();
  if (now === lastTs) {
    sameMsCounter += 1;
  } else {
    lastTs = now;
    sameMsCounter = 0;
  }
  const suffix = sameMsCounter ? `-${sameMsCounter}` : "";
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${crypto.randomUUID()}-${now}${suffix}`;
  }
  return `${now.toString()}-${Math.random().toString(16).slice(2)}${suffix}`;
}

export function setTraceIdHeader(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
  const headers = AxiosHeaders.from(config.headers);
  headers.set("X-Trace-Id", createTraceId());
  config.headers = headers;
  return config;
}
