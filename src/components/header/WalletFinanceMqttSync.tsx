"use client";

import { useUserBalanceMqttSync } from "@/query/dollars";

export const WalletFinanceMqttSync = () => {
  useUserBalanceMqttSync();
  return null;
};
