"use client";

import { isTelegramPlatform } from "@/utils/telegramPlatform";

export function useTelegramContext() {
  return isTelegramPlatform();
}
