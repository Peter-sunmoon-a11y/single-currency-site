import createMiddleware from "next-intl/middleware";
import { defaultLocale, supportedLanguages } from "./lib/i18n/config";

export default createMiddleware({
  locales: supportedLanguages,
  defaultLocale,
  localePrefix: "always",
});

export const config = {
  matcher: ["/((?!api|_next|vendor|.*\\..*).*)"],
};
