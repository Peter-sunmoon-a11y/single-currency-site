"use client";

import { useAggregationBootstrap } from "@/hooks/api/usePublic";

// 只负责挂载全局启动副作用：聚合配置预热和推荐码落地。
export function AppBootstrapEffects() {
  useAggregationBootstrap();

  return null
}
