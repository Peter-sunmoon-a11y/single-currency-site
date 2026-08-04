"use client";

import { NextIntlClientProvider } from "next-intl";
import { PropsWithChildren, useEffect, useState } from "react";
import { defaultLocale, defaultTimeZone, IntlMessages } from "./config";
import { i18nRuntime } from "./runtime";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

export function AppIntlProvider({
  children,
  locale = defaultLocale,
  messages
}: PropsWithChildren<{ locale?: string; messages: IntlMessages }>) {
  const [currentLocale, setCurrentLocale] = useState(locale);

  useEffect(() => {
    setCurrentLocale(locale);
  }, [locale]);

  useEffect(() => {
    i18nRuntime.setState(currentLocale, messages, setCurrentLocale);
  }, [currentLocale, messages]);

  return (
    <NextIntlClientProvider locale={currentLocale} messages={messages} timeZone={defaultTimeZone}>
      {/* 全局注册最小 PWA Service Worker，并在有新版本时提示刷新 */}
      <ServiceWorkerRegister />
      {children}
    </NextIntlClientProvider>
  );
}
