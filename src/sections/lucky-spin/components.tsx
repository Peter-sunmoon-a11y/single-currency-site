// 时尚深色配色，不重复
import { ComponentProps, ReactNode } from "react";
import clsx from "clsx";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { useCurrencyData } from "@/hooks/useCurrency.ts";
import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";

export const deepColors = [
  "#932F90",
  "#C95587",
  "#B64D62",
  "#DEAA6F",
  "#D9CB6D",
  "#ABBB5B",
  "#5A9F4C",
  "#58AD9C",
  "#53A5AA",
  "#4884B4",
  "#3F56A7",
  "#3F56A7",
  "#864FBE"
];

// 旋转动画配置常量
export const SPIN_BUFFER = 200;
export const SPIN_DURATION = 4000;
export const SPIN_WHEEL_CONFIG = {
  borderColor: "transparent",
  borderWidth: 20,
  lineColor: "rgba(255,255,255,0.18)",
  lineWidth: 1.5,
  radius: 0.86,
  itemLabelRadius: 0.5,
  itemLabelRadiusMax: 0.42,
  itemLabelFontSizeMax: 16,
  itemLabelColors: ["#ffffff"],
  itemLabelStrokeColors: ["transparent"],
  itemLabelStrokeWidth: 0,
  itemLabelAlign: "right",
  itemLabelBaselineOffset: -0.04,
  rotationSpeedMax: 700,
  pointerAngle: 90,
  isInteractive: false
};
export const SPIN_CURRENCY = new Set(["crypto", "fiat", "currency"]);
import { SPIN_RADIALS, SPIN_TYPE_ICON } from "@/sections/lucky-spin/constants.ts";
import { useAppNavigate } from "@/hooks/useAppNavigate";

export { SPIN_RADIALS, SPIN_TYPE_ICON };

export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

export function imageScale(p?: Record<string, any>) {
  return (p?.prize_type === "currency" || p?.prize_type === "crypto") ? 0.3 : 0.85;
}

// These balance types are displayed in the user's fiat preference in lucky spin UIs.
const LUCKY_SPIN_FIAT_FALLBACK_CURRENCIES = new Set(["BONUS", "SPORT"]);

export function resolveLuckySpinDisplayCurrency(user?: { currency?: string | null; currency_fiat?: string | null } | null): string | undefined {
  const currency = user?.currency;

  if (!currency) return undefined;

  if (LUCKY_SPIN_FIAT_FALLBACK_CURRENCIES.has(currency)) {
    return user?.currency_fiat ?? currency;
  }

  return currency;
}

export function getPrizeImageUrl(extra_data: Record<string, any>, user_currency?: string): string {
  // TODO: 用户的结算币
  if (user_currency && SPIN_CURRENCY.has(extra_data?.prize_type) && extra_data?.prize_name === "User Currency") {
    return `/images/currency/${user_currency?.toLowerCase()}.png`;
  }

  const prize_currency = extra_data?.prize_currency ?.toLowerCase()
  const final_prize_currency = prize_currency === 'ton' ? 'gram' : prize_currency

  return SPIN_CURRENCY.has(extra_data?.prize_type)
    ? `/images/currency/${final_prize_currency}.png`
    : extra_data?.prize_icon ?? "";
}

export function getPrizeLabel(extra_data: Record<string, any>): string {
  return SPIN_CURRENCY.has(extra_data?.prize_type)
    ? extra_data?.prize_currency
    : extra_data?.prize_type === "physical_item" ? extra_data?.prize_name?.toLowerCase() : extra_data?.prize_type;
}

export function getPrizePrefix(extra_data: Record<string, any>): string {
  return SPIN_CURRENCY.has(extra_data?.prize_type)
    ? "+"
    : "";
}

export const maskUsername = (username: string) => {
  if (!username || username.length <= 2) return username;
  const firstChar = username[0];
  const lastChar = username[username.length - 1];
  const maskLength = username.length - 2;
  return `${firstChar}${"*".repeat(maskLength)}${lastChar}`;
};

export const InnerConfirmBox = ({ $type, style, ...props }: ComponentProps<typeof ConfirmBox> & { $type: string }) => (
  <ConfirmBox
    style={{
      width: $type === "normal" ? "250px" : "288px",
      background: `url("${$type === "normal" ? "/images/game_lucky_spin/lucky-btn.png" : "/images/game_lucky_spin/mega-btn.png"}") no-repeat`,
      backgroundSize: "100% 100%",
      ...style
    }}
    {...props}
  />
);

export const InnerBonusContainer = ({ style, ...props }: ComponentProps<"div">) => (
  <div style={{
    backgroundImage: "url('/images/game_lucky_spin/spins.png')",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "top right",
    backgroundSize: "160px 160px",
    position: "relative", ...style
  }} {...props} />
);

export const InnerCoinsContainer = ({ style, ...props }: ComponentProps<"div">) => (
  <div style={{
    backgroundImage: "url('/images/game_lucky_spin/coins.png')",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center -30px", ...style
  }} {...props} />
);

export const InnerBackgroundContainer = ({ style, ...props }: ComponentProps<"div">) => (
  <div style={{
    background: "linear-gradient(175deg, color(display-p3 0.226 0.2013 0.3357) -1.75%, color(display-p3 0.3059 0.0549 0.298) 54.33%)",
    boxShadow: "0 4px 250px 1000px color(display-p3 0 0 0 / 0.50)", ...style
  }} {...props} />
);

export const InnerWinnerContainer = ({ style, ...props }: ComponentProps<"div">) => (
  <div style={{
    backgroundImage: "url('/images/game_lucky_spin/board.png')",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "bottom center", ...style
  }} {...props} />
);

export const InnerTextClipContainer = ({ style, ...props }: ComponentProps<"div">) => (
  <div style={{
    background: "linear-gradient(180deg, color(display-p3 1 1 1) 0%, color(display-p3 1 0.9628 0.6815) 100%)",
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent", ...style
  }} {...props} />
);

export const InnerBonusSlogan = () => {
  const { t } = useTranslation();
  return <h3 className={"pl-3 font-extrabold text-[18px] text-base-content leading-5 whitespace-pre-line uppercase"}>
    {t("luckySpin:fortune")}
  </h3>;
};

export const InnerContainer = ({ $type, style, ...props }: { $type: string } & ComponentProps<"div">) => (
  <div
    style={{
      background: $type === "mega"
        ? "radial-gradient(104.83% 55.32% at 49.87% 44.68%, color(display-p3 0.4549 0.0672 0.4894) 0%, var(--d-color-base-200, color(display-p3 0.0941 0.1137 0.1412)) 100%)"
        : "radial-gradient(104.83% 55.32% at 49.87% 44.68%, color(display-p3 0 0.2784 0.1216) 0%, var(--d-color-base-200, color(display-p3 0.0941 0.1137 0.1412)) 100%)",
      ...style
    }}
    {...props}
  />
);

export const InnerBonusItem = ({ icon, value, extra, onClick }: {
  icon?: ReactNode,
  value?: ReactNode,
  extra?: ReactNode,
  onClick?: () => void
}) => {
  return <div
    onClick={onClick}
    className={"font-semibold flex items-center gap-1 text-sm text-base-content/50 rounded-lg px-2 py-1.5 bg-base-200 flex-shrink-0"}>
    {icon}
    {value}
    {extra}
  </div>;
};

export const InnerDataCard = ({ children, className }: { children?: ReactNode, className?: string }) => {
  return <div
    className={clsx("p-4 bg-base-300/50 rounded-xl flex justify-between items-center font-semibold", className)}>
    {children}
  </div>;
};

export const InnerSpinsData = ({ name, count }: { name?: string, count?: ReactNode }) => {

  const navigate = useAppNavigate();
  const { t } = useTranslation();

  return <div className="text-base-content flex flex-col gap-2">
    <span className="text-lg font-extrabold">{name}</span>
    <div className="flex items-center gap-1">
      <img src={SPIN_TYPE_ICON[name?.toLowerCase()?.includes("lucky") ? "normal" : "mega"]} className={"w-6 h-6"} />
      <span>x {count}</span>
    </div>
    <span className={"underline cursor-pointer text-sm font-semibold text-base-content/50"}
          onClick={() => void navigate({ to: "/lucky-spin/history" })}>{t("common:common.history")}</span>
  </div>;
};

export const InnerSpinsType = ({ icon, title, extra, onClick, className, disabled = false }: {
  icon?: ReactNode,
  title?: ReactNode,
  active?: boolean,
  extra?: ReactNode,
  onClick: () => void
  className?: string
  disabled?: boolean
}) => {
  return <div
    onClick={disabled ? undefined : onClick}
    className={clsx(
      "relative text-sm px-2 py-2 rounded-xl bg-base-300 flex gap-1 items-center justify-center",
      disabled ? "cursor-not-allowed opacity-60 pointer-events-none" : "cursor-pointer",
      className
    )}>
    {icon}<span className={"font-bold"}>{title}</span>
    {extra}
  </div>;
};

export const InnerCounterLabel = ({ data, className }: { data: Record<string, any>, className?: string }) => {
  const { t } = useTranslation();

  return <div
    className={clsx("text-primary font-bold", className)}>
    {t(`luckySpin:${getPrizeLabel(data)}`)}{" "}x{data?.prize_type === 'physical_item' ? 1 : data?.prize_value}</div>;
};

export const InnerPrizeDisplay = ({ data, className }: {
  data: Record<string, any>,
  className?: string,
}) => {
  const { t } = useTranslation();

  const { formatCurrency } = useCurrencyData();

  if (SPIN_CURRENCY.has(data?.prize_type)) {
    const format = formatCurrency({
      amount: data?.prize_value,
      currency: data?.prize_currency,
      showSymbol: false, showCode: true
    });

    return (
      <div className={clsx("text-primary font-bold", className)}>
        {getPrizePrefix(data) + format.formatted}
      </div>
    );
  }

  if (data?.prize_type === "free_spin") {
    return <div className={clsx("text-primary font-bold", className)}>{t(`luckySpin:${getPrizeLabel(data)}`)}</div>;
  }

  return <InnerCounterLabel data={data} className={className} />;
};
