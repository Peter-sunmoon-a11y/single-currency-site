import clsx from "clsx";
import { Trans, useTranslation } from "@/lib/i18n/react-i18next";
import { ArrowBigDownDash, ChevronRight, Lock, TrendingDown, TrendingUp, Trophy } from "lucide-react";
import { Decimal } from "decimal.js";
import { toast } from "sonner";
import { useCallback, useMemo, useState, ReactNode } from "react";

import { useBoundStore } from "@/store";
import { useUserSportWallet } from "@/query/sports-bonus.ts";
import { useCurrencyData } from "@/hooks/useCurrency.ts";
import { useUserBalance } from "@/hooks/api/useAuth.ts";
import { useUpdateSettlementCurrency } from "@/contexts/SettlementCurrencyContext.tsx";
import { claimSportsBonusWallet } from "@/services/auth/sportsBonus";
import { getCurrencyOtherThanBonusCoin } from "@/services/auth/bonus";
import { sleep } from "@/components/socialLogin/helper.ts";

import { InnerContentVisible } from "@/components/header/message-v2/c/InnerComponents.tsx";
import { InnerDisplayContent } from "@/components/modal/UserFinanceModal/c/WithdrawMethodInfoAdd.tsx";
import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { parser } from "@/components/modal/UserFinanceModal/c/WithdrawMethodInfoAddModal.tsx";
import { CountdownTimer } from "@/sections/dollars/CountdownTimer.tsx";

import {
  BonusDollarsState,
  BonusInProgress,
  BonusWaitingActive,
  BonusNotAvailable,
  InnerConfirmBox, ESport
} from "@/sections/dollars/components.tsx";
import { BonusClaimModal } from "@/sections/dollars/bonus-claim-modal.tsx";
import { useAppNavigate } from "@/hooks/useAppNavigate";
import { TextBaseContent } from "@/components/standard/TextBaseContent.tsx";

// 体育彩金钱包 - 进度+操作区
export const InnerSportsPlayToClaim = () => {
  const navigate = useAppNavigate();
  const { t } = useTranslation();
  const user = useBoundStore((state) => state.user);
  const { updateSettlementCurrency } = useUpdateSettlementCurrency();

  const { data: sportsBonusWallet, refetch } = useUserSportWallet();
  const { data: userBalance = [] } = useUserBalance();
  const { formatCurrency, convertCurrency, exchangeRates } = useCurrencyData();

  const [triggerClaim, setTriggerClaim] = useState(false);
  const [bonusExpired, setBonusExpired] = useState(false);
  const [bonusPending, setBonusPending] = useState(false);

  // 余额信息（用 SPORT 作为余额币种）
  const match = userBalance?.find((token: { currency: string }) => token?.currency === ESport.TOKEN);
  const status = sportsBonusWallet?.data;

  const progress2 = useMemo(() => {
    const a = Decimal(status?.wager || 0);
    const b = Decimal(status?.wager_require || 0);
    if (a.eq(0) || b.eq(0)) return 0;
    return Math.min(1, a.div(b).toNumber());
  }, [status?.wager, status?.wager_require]);

  const currency_fiat = user?.currency_fiat || "USD";

  const formattedClaimMax = formatCurrency({
    amount: convertCurrency({
      amount: status?.claim_max || 0,
      fromCurrency: "USDT",
      toCurrency: currency_fiat,
      exchangeRates
    }),
    currency: currency_fiat,
    showSymbol: true, showCode: false, displayDecimal: 6
  }).formatted;

  const formattedClaimMin = formatCurrency({
    amount: convertCurrency({
      amount: status?.claim_min || 0,
      fromCurrency: "USDT",
      toCurrency: currency_fiat,
      exchangeRates
    }),
    currency: currency_fiat,
    showSymbol: true, showCode: false, displayDecimal: 6
  }).formatted;

  const formattedWager = formatCurrency({
    amount: convertCurrency({
      amount: status?.wager || 0,
      fromCurrency: "USDT",
      toCurrency: currency_fiat,
      exchangeRates
    }),
    currency: currency_fiat,
    showSymbol: true, showCode: false, displayDecimal: 6
  }).formatted;

  const formattedWagerRequired = formatCurrency({
    amount: convertCurrency({
      amount: status?.wager_require || 0,
      fromCurrency: "USDT",
      toCurrency: currency_fiat,
      exchangeRates
    }),
    currency: currency_fiat,
    showSymbol: true, showCode: false, displayDecimal: 6
  }).formatted;

  const formattedClaimable = formatCurrency({
    amount: convertCurrency({
      amount: Decimal.min(match?.balance || 0, status?.claim_max || 0).toString(),
      fromCurrency: "USDT",
      toCurrency: currency_fiat,
      exchangeRates
    }),
    currency: currency_fiat,
    showSymbol: true, showCode: false
  }).formatted;

  // 提取奖励
  const handle = useCallback(
    async (currency: string) => {
      setBonusPending(true);
      setTriggerClaim(false);
      try {
        const response = await claimSportsBonusWallet(status?.id, currency);

        if (response.code === 0 || response.code === 200) {
          void refetch();
          toast.success(t("toast:bonusClaimedSuccessfully"), { duration: 3_000 });

          await sleep(3000);

          void navigate({
            to: "/sports",
            search: {
              openLogin: undefined,
              openSignUp: undefined,
              redirect: undefined,
              startapp: undefined,
              openFinance: undefined
            } as any
          });

          // 切换为非 SPORT 的结算币
          const currency = await getCurrencyOtherThanBonusCoin();

          if (currency?.data?.currency) {
            void updateSettlementCurrency(currency?.data?.currency);
          }
        } else {
          toast.error(t("toast:claimBonusFailed"));
        }
      } catch {
        toast.error(t("toast:claimBonusFailed"));
      } finally {
        setBonusPending(false);
      }
    },
    [status?.id]
  );

  return (
    <div className={"flex flex-col gap-4"}>
      <div className="grid grid-cols-1 gap-4">
        <div className="flex gap-1">
          <CompareInfoRow label={
            <span className="inline-flex items-center gap-1">
              <img
                loading="lazy"
                src={`/images/currency/${ESport.TOKEN.toLowerCase()}.png`}
                alt=""
                className="h-5 w-5 rounded-full shrink-0"
              />
              <span>{t("bonus:bo_balance")}</span>
            </span>
          }
                          value={BonusNotAvailable.has(status?.status) || BonusWaitingActive.has(status?.status) ? "0.00" : formattedClaimable} />
          <div className={"flex flex-col gap-1 flex-1"}>
            <div className={clsx("flex items-center gap-1")}>
              <TrendingUp className={"text-success"} size={20} />
              <CompareInfoRow label={t("bonus:max_claim")} value={formattedClaimMax} className={"w-full text-right"} />
            </div>
            {Decimal(status?.claim_min || 0).gt(0) && (
              <div className={clsx("flex items-center gap-1")}>
                <TrendingDown className={"text-error"} size={20} />
                <CompareInfoRow label={t("bonus:min_claim")} value={formattedClaimMin} className={"w-full"} />
              </div>
            )}
          </div>
        </div>

        <div className="isolate flex items-stretch overflow-hidden rounded-lg text-sm">
          <div
            className={clsx(
              "flex min-w-0 flex-1 flex-col p-2 pr-0 transition-colors bg-base-200"
            )}
            style={{ clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 100%, 0 100%)" }}
          >
            <div className="flex items-center gap-1">
              <TextBaseContent text={t("bonus:currentWager")} />
              {BonusInProgress.has(status?.status) && (
                <Trophy className="h-4 w-4 text-primary animate-gift-shake" />
              )}
            </div>
            <div className="truncate text-base font-extrabold transition-colors text-base-content">
              {formattedWager}
            </div>
          </div>
          <div
            className="flex min-w-0 flex-1 flex-col bg-base-200 p-2 text-right pl-0"
            style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 16px 100%)" }}
          >
            <TextBaseContent text={t("bonus:wagerRequired")} />
            <div className="truncate text-base font-extrabold text-base-content">{formattedWagerRequired}</div>
          </div>
        </div>

        <ArrowBigDownDash
          className={clsx("m-auto -my-3", {
            "text-primary animate-[zap-flash_1.2s_ease-in-out_infinite]": BonusInProgress.has(status?.status),
            "text-base-content": !BonusInProgress.has(status?.status)
          })}
        />

        <CompareInfoRow label={t("bonus:progress")} value={
          <div>
            <span className={clsx("text-base", { "text-success": progress2 >= 1 })}>{`${Math.round(progress2 * 100)}%`}</span>
            <sub className={"pl-2 font-normal text-xs text-base-content/60"}>
              {t("bonus:currentWager")} / {t("bonus:wagerRequired")}
            </sub>
          </div>
        } />
      </div>

      {/* 等待激活 */}
      <InnerContentVisible show={BonusWaitingActive.has(status?.status)}>
        <InnerConfirmBox className="btn-soft" loading={true}>
          {t("bonus:bonus")} {t("bonus:pending")}
        </InnerConfirmBox>
      </InnerContentVisible>

      {/* 不可用 */}
      <InnerContentVisible show={!status || BonusNotAvailable.has(status?.status) || bonusExpired}>
        <InnerConfirmBox className="btn-soft">
          <Lock className="w-4 h-4" />
          {t("bonus:activity_unavailable")}
        </InnerConfirmBox>
      </InnerContentVisible>

      {/* 跳转体育页 */}
      <InnerContentVisible
        show={[BonusDollarsState.in_progress].includes(status?.status) && !bonusExpired}
      >
        <InnerConfirmBox
          className="btn-soft flex-1"
          onClick={async () => {
            // TODO: 切换体育彩金币种
            try {
              await updateSettlementCurrency(ESport.TOKEN);

              void navigate({
                to: "/sports",
                search: {} as any
              });
            } catch (e) {
            }
          }}
        >
          <Lock className="w-4 h-4" />
          {t("bonus:play_to_claim")}
        </InnerConfirmBox>
      </InnerContentVisible>

      {/* 提取 */}
      <InnerContentVisible
        show={
          [BonusDollarsState.pending_collection].includes(status?.status) &&
          !bonusExpired &&
          Decimal(match?.balance || 0).gte(status?.claim_min || 0)
        }
      >
        <InnerConfirmBox onClick={() => setTriggerClaim(true)} loading={bonusPending}>
          {t("bonus:claim")}{" "}
          {
            formatCurrency({
              amount: convertCurrency({
                amount: Decimal.min(match?.balance || 0, status?.claim_max || 0).toString(),
                fromCurrency: "USDT",
                toCurrency: currency_fiat,
                exchangeRates
              }),
              currency: currency_fiat,
              showSymbol: true,
              showCode: false
            }).formatted
          }
        </InnerConfirmBox>
      </InnerContentVisible>

      {/* 不足领取门槛 */}
      <InnerContentVisible
        show={
          [BonusDollarsState.pending_collection].includes(status?.status) &&
          !bonusExpired &&
          Decimal(match?.balance || 0).lt(status?.claim_min || 0)
        }
      >
        <InnerConfirmBox sample>
          {t("bonus:min_claim")}:{" "}
          {
            formatCurrency({
              amount: convertCurrency({
                amount: status?.claim_min || 0,
                fromCurrency: "USDT",
                toCurrency: currency_fiat,
                exchangeRates
              }),
              currency: currency_fiat,
              showSymbol: true,
              showCode: false
            }).formatted
          }
        </InnerConfirmBox>
      </InnerContentVisible>

      {/* 已提取 */}
      <InnerContentVisible show={[BonusDollarsState.claimed].includes(status?.status)}>
        <InnerConfirmBox sample>
          {t("bonus:claimed")}{" "}
          {
            formatCurrency({
              amount: convertCurrency({
                amount: Decimal.min(match?.balance || 0, status?.claim_max || 0).toString(),
                fromCurrency: "USDT",
                toCurrency: currency_fiat,
                exchangeRates
              }),
              currency: currency_fiat,
              showSymbol: true,
              showCode: false
            }).formatted
          }
        </InnerConfirmBox>
      </InnerContentVisible>

      {/* 倒计时 */}
      <InnerContentVisible show={[BonusDollarsState.in_progress].includes(status?.status)}>
        <div className="flex items-center gap-1 text-sm justify-center text-base-content/60">
          {t("bonus:bonus_ends_in")}:{" "}
          <CountdownTimer
            onFinished={(v) => v && setBonusExpired(true)}
            expireTime={status?.expired_at}
          />
        </div>
      </InnerContentVisible>

      {/* claim 弹窗 */}
      <BonusClaimModal
        isBonus
        bonus={Decimal.min(match?.balance || 0, status?.claim_max || 0).toString()}
        open={triggerClaim}
        loading={bonusPending}
        onClick={handle}
        onClose={() => setTriggerClaim(false)}
      />
    </div>
  );
};

// 描述区域 - 使用体育彩金专属 FAQ 文案
const sports_bonus_rules_desc = (hide: boolean) => {
  return [
    {
      id: 1,
      title: "sportsBonus:sportsBonusFaq.q1.title",
      desc: "sportsBonus:sportsBonusFaq.q1.body"
    },
    {
      id: 2,
      title: "sportsBonus:sportsBonusFaq.q2.title",
      desc: "sportsBonus:sportsBonusFaq.q2.body"
    },
    {
      id: 3,
      title: "sportsBonus:sportsBonusFaq.q3.title",
      desc: "sportsBonus:sportsBonusFaq.q3.body"
    },
    {
      id: 4,
      title: "sportsBonus:sportsBonusFaq.q4.title",
      desc: "sportsBonus:sportsBonusFaq.q4.body"
    },
    {
      id: 5,
      title: "sportsBonus:sportsBonusFaq.q5.title",
      desc: "sportsBonus:sportsBonusFaq.q5.body"
    },
    hide ? {
      id: 6,
      title: "sportsBonus:sportsBonusFaq.q6.title",
      desc: "sportsBonus:sportsBonusFaq.q6.body"
    } : {},
    {
      id: 7,
      title: "sportsBonus:sportsBonusFaq.q7.title",
      desc: "sportsBonus:sportsBonusFaq.q7.body"
    },
    {
      id: 8,
      title: "sportsBonus:sportsBonusFaq.q8.title",
      desc: "sportsBonus:sportsBonusFaq.q8.body"
    },
    {
      id: 9,
      title: "sportsBonus:sportsBonusFaq.q9.title",
      desc: "sportsBonus:sportsBonusFaq.q9.body"
    },
    {
      id: 10,
      title: "sportsBonus:sportsBonusFaq.q10.title",
      desc: "sportsBonus:sportsBonusFaq.q10.body"
    },
    {
      id: 11,
      title: "sportsBonus:sportsBonusFaq.q11.title",
      desc: "sportsBonus:sportsBonusFaq.q11.body"
    },
    {
      id: 12,
      title: "sportsBonus:sportsBonusFaq.q12.title",
      desc: "sportsBonus:sportsBonusFaq.q12.body"
    },
    {
      id: 13,
      title: "sportsBonus:sportsBonusFaq.q13.title",
      desc: "sportsBonus:sportsBonusFaq.q13.body"
    }
  ];
};

type TView = `view_${number}`;

const CompareInfoRow = ({ label, value, className }: { label: ReactNode; value: ReactNode; className?: string }) => {
  return (
    <div className={clsx("flex flex-col justify-between gap-3 rounded-lg bg-base-200 p-2", className)}>
      <TextBaseContent text={label} />
      <div className="text-right text-base font-bold text-base-content">{value}</div>
    </div>
  );
};

export const InnerSportsDescription = (
  {
    data,
    hideId,
    className
  }: {
    data: Record<string, any> | undefined;
    hideId?: number;
    className?: string;
  }) => {
  console.info(data);

  const { t } = useTranslation();

  const [statement, setStatement] = useState<{ [key: TView]: boolean } | null>(null);

  // TODO: 体育彩金活动
  const { data: sports } = useUserSportWallet();

  const extra_data = parser(sports?.data?.extra_data);

  const handle = useCallback((rules: Record<string, any>) => {
    setStatement((v) => ({
      ...v,
      ["view_" + rules.id]: !v?.[("view_" + rules.id) as TView]
    }));
  }, []);

  return (
    <section className={clsx("flex flex-col gap-4", className)}>
      <div className="flex flex-col gap-2">
        <div className="mb-3">
          <h4 className="text-base font-bold flex items-center justify-between gap-4 mb-2">
            {t("common:common.challengeEverything")}
          </h4>
          <p className="text-base-content/50 text-sm">
            {t("sportsBonus:intro")}
          </p>
        </div>

        {sports_bonus_rules_desc(!!extra_data).map((rule) => {
          if (hideId === rule.id) return null;
          return (
            <InnerDescItem
              key={rule.id}
              desc={rule.desc}
              title={rule.title}
              values={{
                minOdds: extra_data?.min_odds,
                currency: ESport.TOKEN
              }}
              handle={() => handle(rule)}
              statement={statement}
            />
          );
        })}
      </div>
    </section>
  );
};

const InnerDescItem = ({
                         desc,
                         title,
                         values
                       }: {
  desc: ReactNode;
  title: ReactNode;
  values: Record<string, any>;
  handle: () => void;
  statement: Record<string, any> | null;
}) => {
  const { t } = useTranslation();
  return (
    <details className="cursor-pointer group collapse text-sm bg-base-200 !rounded-xl p-4 text-base-content/50">
      <summary className="list-none select-none">
        <h4 className="font-bold flex items-center justify-between gap-4">
          {t(title as string)}
          <div className="btn btn-soft btn-square btn-primary btn-sm">
            <ChevronRight
              className="w-3 h-3 transition-transform duration-200 group-open:rotate-90"
              strokeWidth={3}
            />
          </div>
        </h4>
      </summary>
      <p className="whitespace-pre-line collapse-content p-0 mt-2 font-normal">
        <Trans
          i18nKey={desc as string}
          values={values}
          components={[<span className="text-primary" />, <span className="text-primary" />]}
        />
      </p>
    </details>
  );
};

export const InnerSportsGiveUpBonus = () => {
  const openModal = useBoundStore((state) => state.openModal);
  const { t } = useTranslation();

  const { data: sportsBonusWallet } = useUserSportWallet();
  const { data: userBalance = [] } = useUserBalance();

  const match = userBalance?.find((token: { currency: string }) => token?.currency === ESport.TOKEN);
  const status = sportsBonusWallet?.data;

  // 余额小于 0.1 才可放弃
  const limit = Decimal(match?.balance || 0).gt(0) && Decimal(match?.balance || 0).lte(0.1);

  return (
    <InnerDisplayContent show={BonusInProgress.has(status?.status) && limit}>
      <div className="">
        <ConfirmBox
          className="btn-soft flex w-full"
          onClick={() => {
            // TODO: 放弃体育彩金
            openModal("OPEN_GIVE_UP_BONUS_MODAL", { id: status?.id, kind: "sports" });
          }}
        >
          {t("bonus:giveUp")}
        </ConfirmBox>
      </div>
    </InnerDisplayContent>
  );
};

// 解析 extra_data 工具，外部需要时可复用
export { parser };
// You cannot give up your Sports Bonus while your sports bonus bets are unsettled.