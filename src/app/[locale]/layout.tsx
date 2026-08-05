import { AppIntlProvider } from "@/lib/i18n/NextIntlProvider";
import { siteConfig, uiConfig } from "@/lib/env";
import { defaultLocale, isSupportedLocale, supportedLanguages } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { siteUrl } from "@/lib/seo";
import type { Metadata, Viewport } from "next";
import { Athiti } from "next/font/google";
import { notFound } from "next/navigation";
import "../../styles.css";

const athiti = Athiti({
  weight: ["500", "700"],
  subsets: ["latin", "thai"], // 只加载 Athiti 字体里 拉丁字符 和 泰文字符 这两个字符集
  variable: "--font-athiti",
  display: "swap",
  preload: false,
});

const siteName = siteConfig.name;

type SeoMessages = {
  site?: {
    title?: string;
    description?: string;
  };
};

const interpolate = (value: string, params: Record<string, string>) =>
  value.replace(/\{\{(\w+)\}\}/g, (_, key: string) => params[key] ?? "");

// 告知 Next.js 构建时需要预渲染哪些 locale 变体（[locale] 是动态段，不声明则构建时跳过）
// 每个 locale 对应一套完整的页面树：/en/...、/th/... 等
export function generateStaticParams() {
  return supportedLanguages.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: requestedLocale } = await params;
  const locale = isSupportedLocale(requestedLocale) ? requestedLocale : defaultLocale;
  const messages = await getMessages(locale, ["seo"]);
  const seo = messages.seo as SeoMessages | undefined;
  const localizedSiteTitle = interpolate(seo?.site?.title ?? "", { name: siteName });
  const localizedSiteDescription = interpolate(seo?.site?.description ?? "", { name: siteName });

  return {
    metadataBase: siteUrl ? new URL(siteUrl) : undefined,
    manifest: "/manifest.webmanifest",
    icons: {
      icon: [{ url: "/favicon/favicon.png", type: "image/png" }],
      shortcut: "/favicon/favicon.png",
      apple: "/favicon/apple-touch-icon.png",
    },
    title: {
      default: localizedSiteTitle,
      template: `%s | ${localizedSiteTitle}`,
    },
    description: localizedSiteDescription,
    openGraph: {
      type: "website",
      siteName,
      title: localizedSiteTitle,
      description: localizedSiteDescription,
      locale,
      alternateLocale: supportedLanguages.filter((language) => language !== locale),
      images: [
        {
          url: "",
          width: 1200,
          height: 630,
          alt: localizedSiteTitle,
        },
      ],
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: uiConfig.pwaShellColor,
};

export default async function RootLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const messages = await getMessages(locale);

  return (
    <html lang={locale} data-theme="dark" className={`app-shell ${athiti.variable} ${athiti.className}`}>
      <head>
        {/* 图片 CDN 预连接：消除 DNS + TCP + TLS 握手耗时；img 标签不带 crossOrigin，不能用 anonymous */}
        <link rel="preconnect" href="https://cdn-l.imgix.net" />
        <link rel="dns-prefetch" href="https://cdn-l.imgix.net" />
        <link rel="preconnect" href="https://1stgame.imgix.net" />
        <link rel="dns-prefetch" href="https://1stgame.imgix.net" />
      </head>
      <body>
        <AppIntlProvider locale={locale} messages={messages}>
          {children}
        </AppIntlProvider>
      </body>
    </html>
  );
}
