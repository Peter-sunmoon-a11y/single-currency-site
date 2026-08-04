import { useMemo } from "react";
import i18n from "@/i18n";
import { ChevronDown, ChevronRight } from "lucide-react";
import { InnerCountdown, msg_type_need_countdown } from "./InnerCountdown.tsx";
import { parser, InnerMsgLink } from "./InnerMsgLink.tsx";
import { Trans, useTranslation } from "@/lib/i18n/react-i18next";
import { Decimal } from "decimal.js";
import { useFiatSymbol } from "@/utils/currencySymbol";
import { useBoundStore } from "@/store";
import { useCurrencyData } from "@/hooks/useCurrency.ts";
import {
  InnerCustomIcon,
  InnerDisplayContent,
  InnerIsRead
} from "@/components/header/message-v2/c/InnerComponents.tsx";

// 提取硬编码常量
const ACHIEVEMENT_COUNT_TYPES_TIMES = [
  "achievement_bet_count",
  "achievement_deposit_count",
  "achievement_slots_win_count",
  "achievement_talkative",
  "achievement_slots_multiplier",
] as const;

const ACHIEVEMENT_COUNT_TYPES_LEVEL = [
  "achievement_game_explorer",
  "achievement_super_spreader",
  "achievement_conquistador",
] as const;

const ALL_ACHIEVEMENT_TYPES = [...ACHIEVEMENT_COUNT_TYPES_TIMES, ...ACHIEVEMENT_COUNT_TYPES_LEVEL] as const;

export const InnerMsgItem = ({ item, handle, statement, onClose, dataMatching }: {
  i: number,
  item: Record<string, any>,
  handle: () => void,
  statement: Record<string, any> | null,
  dataMatching: Record<string, any> | null,
  resetAnimate: boolean
  onClose?: () => void
}) => {
  // 根据用户的语言匹配相应的模版内容
  const language_match = useMemo(() => {
    const keys = Object.keys(item?.content?.information || "");
    return keys.find((l) => l === i18n.language) ?? (keys[0] || "en");
  }, [i18n.language]);

  const content_match = useMemo(() => item?.content?.information?.[language_match] ?? null, [language_match]);

  const is_read = useMemo(() => {
    if (!item?.is_global) return item?.is_read;
    return !!dataMatching?.find((m: Record<string, any>) => m.message_id === item?.id);
  }, [item, dataMatching]);

  const hasDetail = !!(content_match?.detail_user || content_match?.images?.length || item?.content?.jump_url);

  return (<div key={item.id} className={'relative px-2 py-2 bg-base-200 rounded-lg overflow-hidden'}>
    <div className="flex items-center gap-2 w-full" onClick={(e) => {
      e.stopPropagation();
      handle();
    }}>
      <InnerIsRead read={is_read || statement?.["read_" + item.id]} />
      <InnerCustomIcon icon={content_match?.icon} />
      <div className="flex flex-col gap-1 w-full flex-1">
        <DisplayDifferentMessages
          type={item?.content?.name_key}
          content={content_match}
          payload={item?.content?.payload}
          language_match={language_match}
        />
        <InnerDisplayContent show={msg_type_need_countdown.includes(item?.content?.name_key)}>
          <InnerCountdown
            type={item?.content?.name_key}
            status={item?.content?.handle_status}
            content={item?.content}
            payload={item?.content?.payload}
            jump_url={item?.content?.jump_url}
            expired_at={item?.content?.expired_at}
            onClose={onClose}
          />
        </InnerDisplayContent>
      </div>
      {hasDetail && (
        <button className="btn btn-primary btn-soft btn-sm btn-square shrink-0">
          {statement?.["view_" + item.id]
            ? <ChevronDown className="w-4 h-4" strokeWidth={3} />
            : <ChevronRight className="w-4 h-4" strokeWidth={3} />}
        </button>
      )}
    </div>
    {hasDetail && statement?.["view_" + item.id] && (
      <div className="text-sm mt-2 text-base-content/80">
        {content_match?.images?.map((img: string) => (
          <img src={img} alt="" className="rounded-xl mx-auto mb-2" />))}
        <DisplayDifferentMessages
          type={item?.content?.name_key}
          display={2}
          content={content_match}
          payload={item?.content?.payload}
          language_match={language_match}
        />
        <InnerDisplayContent
          show={item?.content?.jump_url}>
          <InnerMsgLink
            type={item?.content?.name_key}
            status={item?.content?.handle_status}
            jump_url={item?.content?.jump_url}
            expired_at={item?.content?.expired_at || 0}
            onClose={onClose} />
        </InnerDisplayContent>
      </div>
    )}
  </div>);
};

const DisplayDifferentMessages = ({ type, content, payload, display = 1, language_match }: {
  type: string, content: Record<string, any>,
  payload: string,
  display?: 1 | 2,
  language_match: string
}) => {
  const { t } = useTranslation();

  const user = useBoundStore((state) => state.user);

  const { convertCurrency, isLoading, formatCurrency, exchangeRates } = useCurrencyData();

  // TODO: 使用服务端提供的法币缩写符号
  const { showFiatSymbol } = useFiatSymbol();

  // 提取通用的货币转换逻辑
  const formatAmount = useMemo(() => {
    const targetCurrency = user?.currency_fiat ?? "USD";
    return (amount: number, fromCurrency: string = "USDT") => {
      if (isLoading) return "0.00";
      return formatCurrency({
        amount: convertCurrency({
          amount,
          fromCurrency,
          toCurrency: targetCurrency,
          exchangeRates
        }),
        currency: targetCurrency,
        showSymbol: true,
        showCode: false
      }).formatted;
    };
  }, [user?.currency_fiat, isLoading, convertCurrency, formatCurrency, exchangeRates]);

  const source = useMemo(() => {
    if (!payload) return;

    const parsed_payload = parser(payload);
    const targetCurrency = user?.currency_fiat ?? "USD";

    // 幸运盘模版
    if (type === "luck_spin_normal") {
      return {
        ...parsed_payload,
        number: parsed_payload?.times || 0
      };
    }

    // 成就送幸运球
    if (type === "achievement_bb") {
      return {
        ...parsed_payload,
        ball: parsed_payload?.reward_buddy_balls || 0
      };
    }

    if (type.includes("promo_code")) {
      const min_amount = convertCurrency({
        amount: parsed_payload?.extra_data?.min_amount || 0,
        fromCurrency: "USDT",
        toCurrency: targetCurrency,
        exchangeRates
      });
      const min_amount_final = targetCurrency !== "USD"
        ? `${showFiatSymbol(targetCurrency) ?? ""}${Decimal(String(min_amount).replace(/,/g, ""))
          .toDP(0, Decimal.ROUND_CEIL).toNumber().toLocaleString()}`
        : `$${min_amount}`;
      return {
        ...parsed_payload,
        min_amount: isLoading ? "0.00" : min_amount_final,
        bonus_amount: formatAmount(parsed_payload?.extra_data?.bonus_amount || 0),
        currency: targetCurrency
      };
    }

    if (type.includes("conquest")) {
      return {
        ...parsed_payload,
        reward_amount: formatAmount(parsed_payload?.reward_amount || 0),
        currency: "",
        conquest_key: i18n.getDataByLanguage(language_match)?.bonus?.item?.[parsed_payload?.key] ?? parsed_payload?.key
      };
    }

    if (type.includes("achievement")) {
      return {
        ...parsed_payload,
        step: ALL_ACHIEVEMENT_TYPES.includes(parsed_payload?.key as any)
          ? `${ACHIEVEMENT_COUNT_TYPES_LEVEL.includes(parsed_payload?.key as any) ? t("bonus:level") : ""} ${parsed_payload?.step}`
          : "",
        reward_amount: formatAmount(parsed_payload?.reward_amount || 0),
        currency: "",
        achievement_key: (i18n.getDataByLanguage(language_match)?.bonus?.[parsed_payload?.key] as any)?.name ?? parsed_payload?.key
      };
    }

    if (type.includes("withdraw")) {
      return {
        ...parsed_payload,
        amount: Decimal(parsed_payload?.amount || 0).toDP(8, Decimal.ROUND_DOWN)
      };
    }

    if (type.includes("deposit")) {
      return {
        ...parsed_payload,
        amount: Decimal(parsed_payload?.amount || 0).toDP(8, Decimal.ROUND_DOWN),
        pool_amount: formatAmount(parsed_payload?.rakeback_log?.amount || 0, parsed_payload?.rakeback_log?.currency ?? "USDT"),
        pool_currency: ""
      };
    }

    if (type.includes("recovery_bonus")) {
      return {
        ...parsed_payload,
        amount: formatAmount(parsed_payload?.extra_data?.bonus_amount || 0, parsed_payload?.extra_data?.currency ?? "USDT"),
        currency: ""
      };
    }

    // 彩金钱包站内信模版
    if (type.includes("bonus_wallet")) {
      return {
        ...parsed_payload,
        amount: formatAmount(parsed_payload?.init_amount || 0, parsed_payload?.currency ?? "USDT"),
        wagering: formatAmount(parsed_payload?.wager_require || 0, parsed_payload?.currency ?? "USDT"),
        currency: ""
      };
    }

    // 锦标赛站内信模版
    if (type.includes("rakerace")) {
      return {
        ...parsed_payload,
        rank: parsed_payload?.rank || 0,
        prize_amount: Decimal(parsed_payload?.prize_amount || 0).toDP(2, Decimal.ROUND_DOWN),
        currency: ""
      };
    }

    // 幸运球模版
    if (type.includes("buddyballs")) {
      return {
        ...parsed_payload,
        amount: parsed_payload?.amount || 0,
        reason: parsed_payload?.reason
      };
    }

    // 幸运球模版
    if (type.includes("first_challenge")) {
      return {
        ...parsed_payload,
        task_name: i18n.getDataByLanguage(language_match)?.firstChallenge?.tasks?.[parsed_payload?.task_type]?.name,
        reward_amount: formatAmount(parsed_payload?.reward_amount || parsed_payload?.reward_usdt || 0, parsed_payload?.currency ?? "USDT"),
      };
    }

    return {
      ...parsed_payload,
      amount: formatAmount(parsed_payload?.amount || 0, parsed_payload?.currency ?? "USDT"),
      reward_amount: formatAmount(parsed_payload?.reward_amount || 0, parsed_payload?.reward_currency ?? "USDT"),
      currency: ""
    };
  }, [i18n, formatAmount, language_match, payload, type, user?.currency_fiat]);

  return (display === 1
    ? (<>
      <p className="text-sm text-base-content text-left flex-1 font-bold">
        <Trans
          i18nKey={content?.title}
          values={source}
        />
      </p>
      <InnerDisplayContent show={content?.subtitle}>
        <p className="text-sm text-base-content/50 leading-4 text-left flex-1 font-normal">
          <Trans
            i18nKey={content?.subtitle}
            values={source}
          />
        </p>
      </InnerDisplayContent>
    </>)
    : (<Trans
      i18nKey={`<0>${content?.detail_user}</0>`}
      values={source}
      components={[<p className="whitespace-pre-line pr-8 pl-8" />]}
    />));
};
