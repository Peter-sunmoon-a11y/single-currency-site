import { useDisplayCurrency } from "@/contexts/DisplayCurrencyContext.tsx";
import { localizeHref } from "@/lib/navigation";
import { useBoundStore } from "@/store";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

const decodeBannerEntities = (text: string) =>
  text
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&amp;/gi, "&");

export const renderBannerText = (text: string, values: Record<string, string> = {}) => {
  // 先替换 {{key}} 占位符
  let processed = decodeBannerEntities(text);
  for (const [key, val] of Object.entries(values)) {
    processed = processed.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), val);
  }

  // 再解析 <0>...</0>（含闭合）或 <0>...（行尾截止）→ text-primary span
  return processed.split(/(<0>[\s\S]*?<\/0>|<0>[^\n]*)/).map((part, i) => {
    const match = part.match(/^<0>([\s\S]*?)(?:<\/0>)?$/);
    if (match) return <span key={i} className="text-primary">{match[1]}</span>;
    return <span key={i}>{part}</span>;
  });
};

export const InnerDataTranslation = ({
  text,
  value,
  percent,
  fiat_bonus = 0,
  crypto_bonus = 0,
}: {
  text: string;
  value: string;
  percent: number;
  fiat_bonus?: number;
  crypto_bonus?: number;
}) => {
  const user = useBoundStore((state) => state.user);

  const { selectedCurrency, convertCurrency, exchangeRates, formatCurrency } = useDisplayCurrency();

  const displayCurrency = (user?.currency_fiat || selectedCurrency) ?? "USD";
  const normalizedText = normalizeBannerText(text);

  const values: Record<string, string> = {
    percent: `${percent * 100}%`,
    value: formatCurrency({
      amount: convertCurrency({
        amount: value,
        fromCurrency: "USDT",
        toCurrency: displayCurrency,
        exchangeRates,
      }),
      currency: displayCurrency,
      showSymbol: true,
      showCode: false,
    }).formatted,
    fiat_bonus: `+${fiat_bonus * 100}%`,
    crypto_bonus: `+${crypto_bonus * 100}%`,
  };

  return (
    <p className={"whitespace-pre-line text-lg"}>
      {renderBannerText(normalizedText, values)}
      {/*Enter the world of 1st.fun - your premier crypto entertainment hub. */}
    </p>
  );
};

export const normalizeBannerText = (text?: string) => {
  if (!text) return "";

  return decodeBannerEntities(text)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?(?!\d+>)[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .trim();
};

export const isProbablyHtmlBannerText = (text?: string) => Boolean(text && /<\/?[a-z][\s\S]*>/i.test(text));

export const useNavigateGuard = () => {
  const router = useRouter();

  const isAuthenticated = useBoundStore((state) => !!state.user);

  const openModal = useBoundStore((state) => state.openModal);

  const fn1 = useCallback(
    (path?: string | null, auth = false) => {
      if (auth) {
        if (!isAuthenticated) return openModal("OPEN_AUTH_MODAL");
        if (!path) return;
        if (path.includes("/vip-monday")) return openModal("OPEN_VIP_MONDAY_BONUS_MODAL");
        if (path.includes("/referral/bonus")) return openModal("OPEN_EXTRA_REFERRAL_BONUS_MODAL");
        if (path.includes("deposit")) return router.push(localizeHref("/finance"));
        if (path.includes("referral")) return router.push(localizeHref("/referral"));
        if (path.includes("vip")) return router.push(localizeHref("/vip-club"));
        if (path.includes("tournament")) return router.push(localizeHref("/tournament"));

        // 解析path为路径和查询参数
        const url = new URL(decodeURIComponent(path), window.location.origin);
        const pathname = url.pathname.replace("/main", ""); // 移除/main前缀
        router.push(localizeHref(`${pathname || "/"}${url.search}`));
      }
    },
    [isAuthenticated, openModal, router],
  );

  const fn2 = useCallback(
    (callback: () => void, auth = false) => {
      if (auth) {
        if (!isAuthenticated) return openModal("OPEN_AUTH_MODAL");
        callback();
      }
    },
    [isAuthenticated, openModal],
  );

  return { navigate: fn1, navigateCallback: fn2 };
};
