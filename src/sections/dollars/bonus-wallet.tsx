import { useMemo } from "react";
import { useBaseConfig } from "@/hooks/api/usePublic.ts";
import clsx from "clsx";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext.tsx";
import { useUserBalance } from "@/hooks/api/useAuth.ts";
import { useBoundStore } from "@/store";
import { Gift } from "lucide-react";
import { useAppNavigate } from "@/hooks/useAppNavigate";

// TODO: 每个彩金活动币种的开关key配置
const bonus_switch_config_key: Record<string, any> = {
  "BONUS": "slot_bonus_wallet",
  "SPORT": "sports_bonus_wallet"
};

export const BonusWallet = (
  {
    currency,
    onSelect,
    selected
  }: {
    currency: Record<string, any>
    onSelect: (v: string) => void
    selected: string
  }
) => {
  const { data: baseConfig } = useBaseConfig();

  // bonus 的总开关是否开启
  const is_bonus_open = baseConfig?.data?.bonus_switch?.[bonus_switch_config_key[currency?.currency]] !== 0;

  return is_bonus_open
    ? <InnerTokenInfo
      currency={currency}
      onSelect={() => onSelect(currency?.currency)}
      selected={selected}
    />
    : null;
};

export const bonus_dollars_router_path: Record<string, any> = {
  "BONUS": "/dollars/bonus",
  "SPORT": "/dollars/sports-bonus"
};

const InnerTokenInfo = (
  {
    currency,
    onSelect,
    selected
  }: {
    currency: Record<string, any>
    onSelect: (v: string) => void
    selected: string
  }
) => {

  const navigate = useAppNavigate();
  const closeModal = useBoundStore((state) => state.closeModal);

  // 币种余额统计
  const { data: balances = [] } = useUserBalance();

  // 余额格式化函数
  const { formatWithConversion, formatWithoutConversion } = useDisplayCurrencyFormatter();

  // 彩金币种余额
  const balance = useMemo(() => balances.find((b: {
    currency: string
  }) => b.currency === currency.currency), [balances])?.balance ?? 0;

  // 格式化输出余额转换
  const output_balance = useMemo(() => {
    const balance_transfer = formatWithConversion(balance, currency.currency, {
      showSymbol: true,
      showCode: false,
      compact: false
    }).formatted;

    const balance_origin = formatWithoutConversion(balance, currency.currency, {
      showSymbol: true,
      compact: false,
      showCode: false,
      minimizeDecimals: true
    }).formatted;

    return [balance_transfer, balance_origin];
  }, [balance, currency]);

  return <div
    className={clsx("flex items-center justify-between w-full pl-1 pr-2 py-1.5 rounded-md transition-colors border-l-2 border-transparent",
      selected === currency?.currency
        ? "bg-primary/10 text-primary to-primary/8 !border-primary"
        : "hover:bg-primary/5"
    )}
    onClick={(e) => {
      e.stopPropagation();
      onSelect(currency.currency);
    }}>
    <div className="flex justify-between w-full">
      <div className="flex items-center gap-2">
        <img src={`/images/currency/${currency?.currency?.toLowerCase()}.png`} className="rounded-full w-8 h-8" />
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <b className="font-bold text-base">{currency.currency}</b>
            <Gift className="w-4.5 h-4.5 text-primary animate-gift-shake" />
          </div>
          <p className="text-sm text-base-content/60 font-bold">{output_balance[1]}</p>
        </div>
        <button
          className="btn btn-primary btn-soft btn-square btn-sm"
          onClick={(e) => {
            e.stopPropagation();
            closeModal("OPEN_CURRENCY_SELECTOR_MODAL");
            void navigate({ to: bonus_dollars_router_path[currency.currency] });
          }}>
          <span className="text-lg">?</span>
        </button>
      </div>

      <p className="text-base-content text-base font-bold">{output_balance[0]}</p>
    </div>
  </div>
};