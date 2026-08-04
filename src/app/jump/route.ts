import { defaultLocale, isSupportedLocale } from "@/lib/i18n/config";
import { NextRequest, NextResponse } from "next/server";

export function GET(request: NextRequest) {
  const localeCookie = request.cookies.get("NEXT_LOCALE")?.value;
  const locale = isSupportedLocale(localeCookie) ? localeCookie : defaultLocale;
  const url = request.nextUrl.clone();

  url.pathname = `/${locale}/jump`;

  return NextResponse.redirect(url, 307);
}
