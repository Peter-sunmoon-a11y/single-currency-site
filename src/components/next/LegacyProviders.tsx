"use client";

import "@/i18n";
import dynamic from "next/dynamic";
import { CurrencyStateSync } from "@/contexts/CurrencyStateSync";
import { AuthProvider } from "@/contexts/AuthContext";
import { MqttServiceProvider } from "@/contexts/mqtt";
import { AppBootstrapEffects } from "@/components/next/AppBootstrapEffects";
import { TelegramBootstrap } from "@/components/providers/TelegramBootstrap";
import { Provider as QueryProvider } from "@/integrations/tanstack-query/root-provider";
import type { DehydratedState } from "@tanstack/react-query";

const WebPushBootstrapEntry = dynamic(
  () => import("@/components/next/WebPushBootstrapEntry").then((m) => m.WebPushBootstrapEntry),
  { ssr: false }
);
const AdAttributionTracker = dynamic(
  () => import("@/features/attribution/AdAttributionTracker.tsx").then((m) => m.AdAttributionTracker),
  { ssr: false }
);
const MqttSubscriptionsEntry = dynamic(
  () => import("@/contexts/mqtt/MqttSubscriptions").then((m) => m.MqttSubscriptionsEntry),
  { ssr: false }
);

export function LegacyProviders({ children, dehydratedState }: { children: React.ReactNode; dehydratedState?: DehydratedState }) {
  return (
    <QueryProvider dehydratedState={dehydratedState}>
      <AppBootstrapEffects />
      {/* 邀请注册推荐码落地：延后挂载即可，不占用首屏关键渲染路径。 */}
      <AdAttributionTracker />
      <AuthProvider>
        <TelegramBootstrap />
        {/* 同步登录态币种到本地 store；依赖 AuthProvider 和 React Query。 */}
        <CurrencyStateSync />
        {/* 站点级 WebPush 启动副作用：需依赖 AuthProvider，同时懒加载以避免拖累首屏关键 bundle。 */}
        <WebPushBootstrapEntry />
        <MqttServiceProvider>
          {/* 体育首屏会消费实时数据；这里只延后订阅入口挂载，不延后 Provider 初始化。 */}
          <MqttSubscriptionsEntry />
          {children}
        </MqttServiceProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
