import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { defaultLocale, supportedLanguages } from "./lib/i18n/config";

const handleI18n = createMiddleware({
  locales: supportedLanguages,
  defaultLocale,
  localePrefix: "always",
});

export function proxy(request: NextRequest) {
  return handleI18n(request);
}

export const config = {
  matcher: ["/((?!api|_next|vendor|.*\\..*).*)"],
};
