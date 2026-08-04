import { ComponentProps, useCallback, useMemo, useState } from "react";
import clsx from "clsx";
import { Trans, useTranslation } from "@/lib/i18n/react-i18next";
import {
  ArrowBigDownDash,
  ChevronRight,
  Gamepad2,
  Lock,
  TrendingDown,
  TrendingUp
} from "lucide-react";
import { Decimal } from "decimal.js";
import { BonusClaimModal } from "@/sections/dollars/bonus-claim-modal.tsx";
import { toast } from "sonner";
import { useBoundStore } from "@/store";
import { useUserBonusWallet } from "@/query/dollars.ts";
import { useCurrencyData } from "@/hooks/useCurrency.ts";
import {
  useUserBalance
} from "@/hooks/api/useAuth.ts";
import { InnerContentVisible } from "@/components/header/message-v2/c/InnerComponents.tsx";
import { claimBonusWallet, getCurrencyOtherThanBonusCoin } from "@/services/auth/bonus";
import { CountdownTimer } from "@/sections/dollars/CountdownTimer.tsx";
import { InnerDisplayContent } from "@/components/modal/UserFinanceModal/c/WithdrawMethodInfoAdd.tsx";
import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { parser } from "@/utils/financeParser.ts";
import { sleep } from "@/components/socialLogin/helper.ts";
import { PropsWithChildren, ReactNode } from "react";
import { Store } from "@/components/icons/Store.tsx";
import { LockKeyhole } from "lucide-react";
import { Check } from "lucide-react";
import { useUpdateSettlementCurrency } from "@/contexts/SettlementCurrencyContext.tsx";
import { Info } from "@/sections/bonus/components/Info.tsx";
import { useAppNavigate } from "@/hooks/useAppNavigate";
import { InnerConfirmBox } from "@/sections/dollars/inner-confirm-box.tsx";
import { TextBaseContent } from "@/components/standard/TextBaseContent.tsx";
import { EBonus } from "@/config";

export { InnerConfirmBox };

// 状态：0-inactive，1-进行中，2-过期，3-待领取，4-已领取，5-失败结束
export enum BonusDollarsState {
  inactive = 0,
  in_progress = 1,
  expired = 2,
  pending_collection = 3,
  claimed = 4,
  failure_end = 5,
  not_open = 6,
  give_up = 7,
}

export const InnerBonusContainer = ({ style, ...props }: ComponentProps<"div">) => (
  <div style={{
    backgroundImage: "url('/images/bonus_store/bonus-store.png')",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 20px top 12px",
    position: "relative", ...style
  }} {...props} />
);

export const BonusInProgress = new Set([
  BonusDollarsState.in_progress,
  BonusDollarsState.pending_collection
]);

export const BonusWaitingActive = new Set([
  BonusDollarsState.inactive,
  BonusDollarsState.not_open
]);

export const BonusNotAvailable = new Set([
  BonusDollarsState.expired,
  BonusDollarsState.claimed,
  BonusDollarsState.failure_end
]);

export const InnerBonusSlogan = ({ title }: { title: string }) => {
  return <h3 className={"pl-3 font-extrabold text-[18px] text-base-content leading-5 whitespace-pre-line uppercase"}>
    {title}
  </h3>;
};

export const InnerPlayToClaim = (
  {
    currency
  }: {
    currency: "SPORT" | "BONUS"
  }) => {
  const navigate = useAppNavigate();

  const { t } = useTranslation("bonusStore");

  const user = useBoundStore((state) => state.user);

  const { updateSettlementCurrency } = useUpdateSettlementCurrency();

  // 彩金钱包数据
  const { data: bonusWallet, refetch: bonusWalletRefetch } = useUserBonusWallet();

  // 用户余额数据
  const { data: userBalance = [] } = useUserBalance();

  // 币种转换辅助
  const { formatCurrency, convertCurrency, exchangeRates } = useCurrencyData();

  // 提取收益窗口控制
  const [triggerClaim, setTriggerClaim] = useState<boolean>(false);
  // 设置活动是否过期
  const [bonusExpired, setBonusExpired] = useState<boolean>(false);
  // 奖励领取状态
  const [bonusPending, setBonusPending] = useState<boolean>(false);

  // 匹配币种信息，余额 icon 精度 等
  const match = userBalance?.find((token: { currency: string; }) => token?.currency === currency);

  // 匹配彩金币种状态信息 打码的数据 奖励的数据等
  const status = bonusWallet?.data;

  // TODO: 是否需要数据定时更新，虽然每次进入页面都会重新拉数据，还是存在数据有延迟的可能性
  // wager / wager_require - 注意超范围1
  const progress2 = useMemo(() => {
    const a = Decimal(status?.wager || 0);
    const b = Decimal(status?.wager_require || 0);
    if (a.eq(0) || b.eq(0)) return 0;
    const c = a.div(b).toNumber();
    return Math.min(1, c);
  }, [status?.wager, status?.wager_require]);

  const currency_fiat = user?.currency_fiat || "USD";

  /**
   * 奖金提取
   * @currency: 用户提取奖励的时候选择的要将bonus转换为哪个法币提取到钱包，和用户的结算法币设置无关
   */
  const handle = useCallback(async (currency: string) => {
    setBonusPending(true);
    setTriggerClaim(false); // 重置数据：下次还能打开提取收益窗口

    try {
      const response = await claimBonusWallet(status?.id, currency);

      if (response.code === 0 || response.code === 200) {
        void bonusWalletRefetch(); // 更新彩金钱包信息

        toast.success(t("toast:bonusClaimedSuccessfully"), { duration: 3_000 }); // 奖励提取成功

        await sleep(3000);

        void navigate({
          to: "/casino",
          search: {
            openLogin: undefined,
            openSignUp: undefined,
            redirect: undefined,
            startapp: undefined,
            openFinance: undefined
          }
        });

        // 切换彩金币种为其他结算币种
        const targetCurrency = await getCurrencyOtherThanBonusCoin();
        if (targetCurrency?.data?.currency) {
          console.info(`Switch the invalid bonus currency to = ${targetCurrency?.data?.currency}`);
          void updateSettlementCurrency(targetCurrency?.data?.currency);
        }
      } else {
        toast.error(t("toast:claimBonusFailed")); // 奖励提取失败
      }
    } catch (err) { // 接口异常
      toast.error(t("toast:claimBonusFailed")); // 奖励提取失败
    } finally {
      setBonusPending(false);
    }
  }, [status?.id]);

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

  return <div className={"flex flex-col gap-4"}>
    <div className="grid grid-cols-1 gap-4">
      <div className="flex gap-1">
        <CompareInfoRow label={
          <span className="inline-flex items-center gap-1">
            <img
              loading="lazy"
              src={`/images/currency/${EBonus.TOKEN.toLowerCase()}.png`}
              alt=""
              className="h-5 w-5 rounded-full shrink-0"
            />
            <span>{t("bonus:bo_balance")}</span>
          </span>
        }
                        value={BonusNotAvailable.has(status?.status) || BonusWaitingActive.has(status?.status) ? "0.00" : formattedClaimable} />
        <div className={"flex flex-col gap-2 flex-1"}>
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
              <Gamepad2
                className={clsx("h-5 w-5 text-primary animate-gift-shake", { "text-success !animate-none": progress2 >= 1 })} />
            )}
          </div>
          <div className={clsx(
            "truncate text-base font-extrabold transition-colors text-base-content"
          )}>
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
          "text-base-content": !BonusInProgress.has(status?.status),
          "text-success !animate-none": progress2 >= 1
        })}
      />

      <CompareInfoRow label={t("bonus:progress")} value={
        <div>
            <span
              className={clsx("text-base", { "text-success": progress2 >= 1 })}>{`${Math.round(progress2 * 100)}%`}</span>
          <sub className={"pl-2 font-normal text-xs text-base-content/60"}>
            {t("bonus:currentWager")}{" "}/{" "}{t("bonus:wagerRequired")}
          </sub>
        </div>
      } />
    </div>


    {/* 按钮操作 - 活动正在启动中 */}
    <InnerContentVisible show={BonusWaitingActive.has(status?.status)}>
      <InnerConfirmBox className="btn-soft" loading={true}>
        {t("bonus:bonus")} {t("bonus:pending")}
      </InnerConfirmBox>
    </InnerContentVisible>

    {/* 按钮操作 - 活动不可用 除了状态还要附加是否过期 */}
    <InnerContentVisible show={!status || BonusNotAvailable.has(status?.status) || bonusExpired}>
      <InnerConfirmBox className="btn-soft"><Lock
        className={"w-4 h-4"} />{t("bonus:activity_unavailable")}</InnerConfirmBox>
    </InnerContentVisible>

    {/* 按钮操作 - 跳转游戏列表 - 除了状态还要附加是否过期 */}
    <InnerContentVisible show={[BonusDollarsState.in_progress].includes(status?.status) && !bonusExpired}>
      <InnerConfirmBox
        className="btn-soft flex-1"
        onClick={() => navigate({
          to: "/explore", search: {
            type: "bonus"
          }
        })}><Lock
        className={"w-4 h-4"} />{t("bonus:play_to_claim")}</InnerConfirmBox>
    </InnerContentVisible>

    {/* 按钮操作 - 提取奖励 Claim - 除了状态还要附加是否过期 */}
    <InnerContentVisible
      show={[BonusDollarsState.pending_collection].includes(status?.status) && !bonusExpired && Decimal(match?.balance || 0).gte(status?.claim_min || 0)}>
      <InnerConfirmBox onClick={() => setTriggerClaim(true)} loading={bonusPending}>
        {t("bonus:claim")}{" "}
        {formatCurrency({
          amount: convertCurrency({
            amount: Decimal.min(match?.balance || 0, status?.claim_max || 0).toString(),
            fromCurrency: "USDT",
            toCurrency: currency_fiat,
            exchangeRates
          }),
          currency: currency_fiat,
          showSymbol: true, showCode: false
        }).formatted
        }</InnerConfirmBox>
    </InnerContentVisible>

    {/* 按钮操作 - 提取奖励 Claim - amount 小于 claim_min - 不可领取 - 除了状态还要附加是否过期 */}
    <InnerContentVisible
      show={[BonusDollarsState.pending_collection].includes(status?.status) && !bonusExpired && Decimal(match?.balance || 0).lt(status?.claim_min || 0)}>
      <InnerConfirmBox sample>{t("bonus:min_claim")}:{" "}
        {formatCurrency({
          amount: convertCurrency({
            amount: status?.claim_min || 0,
            fromCurrency: "USDT",
            toCurrency: currency_fiat,
            exchangeRates
          }),
          currency: currency_fiat,
          showSymbol: true, showCode: false
        }).formatted
        }</InnerConfirmBox>
    </InnerContentVisible>

    {/* 按钮操作 - 已提取奖励 Claimed */}
    <InnerContentVisible show={[BonusDollarsState.claimed].includes(status?.status)}>
      <InnerConfirmBox sample>{t("bonus:claimed")}{" "}
        {formatCurrency({
          amount: convertCurrency({
            amount: Decimal.min(match?.balance || 0, status?.claim_max || 0).toString(),
            fromCurrency: "USDT",
            toCurrency: currency_fiat,
            exchangeRates
          }),
          currency: currency_fiat,
          showSymbol: true, showCode: false
        }).formatted
        }
      </InnerConfirmBox>
    </InnerContentVisible>

    {/* 活动倒计时 */}
    <InnerContentVisible show={[BonusDollarsState.in_progress].includes(status?.status)}>
      <div className={"flex items-center gap-1 text-sm justify-center text-base-content/60"}>
        {t("bonus:bonus_ends_in")}:{" "}<CountdownTimer
        onFinished={(v) => v && setBonusExpired(true)}
        expireTime={status?.expired_at} />
      </div>
    </InnerContentVisible>

    {/* 奖励领取和转换 */}
    <BonusClaimModal
      isBonus
      open={triggerClaim}
      bonus={Decimal.min(match?.balance || 0, status?.claim_max || 0).toString()}
      loading={bonusPending}
      onClick={handle}
      onClose={() => setTriggerClaim(false)} />
  </div>;
};

// 活动有特殊的描述兼容
const bonus_rules_desc = (key: string) => {
  const baseRules = [
    {
      id: 0,
      title: "bonus:bonus_rules_desc.r0.title",
      desc: "bonus:bonus_rules_desc.r0.desc"
    },
    {
      id: 1,
      title: "bonus:bonus_rules_desc.r1.title",
      desc: "bonus:bonus_rules_desc.r1.desc"
    },
    key
      ? {
        id: 9,
        title: "bonus:bonus_rules_desc.r2.title",
        desc: "bonus:bonus_rules_desc.r2.desc"
      }
      : {
        id: 2,
        title: "bonus:bonus_rules_desc.r9.title",
        desc: "bonus:bonus_rules_desc.r9.desc"
      },
    key
      ? {
        id: 3,
        title: "bonus:bonus_rules_desc.r3.title",
        desc: "bonus:bonus_rules_desc.r3.desc"
      }
      : {
        id: 10,
        title: "bonus:bonus_rules_desc.r10.title",
        desc: "bonus:bonus_rules_desc.r10.desc"
      }
  ];

  const commonRules = [
    {
      id: 4,
      title: "bonus:bonus_rules_desc.r4.title",
      desc: "bonus:bonus_rules_desc.r4.desc"
    },
    {
      id: 5,
      title: "bonus:bonus_rules_desc.r5.title",
      desc: "bonus:bonus_rules_desc.r5.desc"
    },
    {
      id: 6,
      title: "bonus:bonus_rules_desc.r6.title",
      desc: "bonus:bonus_rules_desc.r6.desc"
    },
    {
      id: 7,
      title: "bonus:bonus_rules_desc.r7.title",
      desc: "bonus:bonus_rules_desc.r7.desc"
    },
    {
      id: 11,
      title: "bonus:bonus_rules_desc.r11.title",
      desc: "bonus:bonus_rules_desc.r11.desc"
    },
    {
      id: 8,
      title: "bonus:bonus_rules_desc.r8.title",
      desc: "bonus:bonus_rules_desc.r8.desc"
    }
  ];

  return [...baseRules, ...commonRules];
};

type TView = `view_${number}`;

export const InnerDescription = (
  {
    data,
    hideId,
    currency,
    className
  }: {
    data: Record<string, any>
    hideId?: number
    currency: "SPORT" | "BONUS",
    className?: string
  }) => {
  const { t } = useTranslation("bonusStore");

  const user = useBoundStore((state) => state.user);

  // 币种转换辅助
  const { formatCurrency, convertCurrency, exchangeRates } = useCurrencyData();

  const [statement, setStatement] = useState<{
    [key: TView]: boolean;
  } | null>(null);

  const parsed_data = parser(data?.extra_data);

  const currency_fiat = user?.currency_fiat || "USD";

  const handle = useCallback((rules: Record<string, any>) => {
    setStatement((v) => ({
      ...v,
      ["view_" + rules.id]: !v?.[("view_" + rules.id) as TView]
    }));
  }, []);

  return <section className={clsx("flex flex-col gap-4", className)}>
    <div className={"flex flex-col gap-2"}>
      <div className={"mb-3"}>
        <h4 className={"text-base font-bold flex items-center justify-between gap-4 mb-2"}>
          {t("common:common.challengeEverything")}
        </h4>
        <p className="text-base-content/50 text-sm">
          {t("bonus:bonus_rules_desc.mega")}
        </p>
      </div>

      {bonus_rules_desc(parsed_data?.type).map((rule) => {
        if (hideId === rule.id) return null;
        return (
          <InnerDescriptionItem
            key={rule.id}
            desc={rule.desc}
            title={rule.title}
            values={{
              min: Number(data?.claim_min) >= 0 ? formatCurrency({
                amount: convertCurrency({
                  amount: data?.claim_min || 0,
                  fromCurrency: "USDT",
                  toCurrency: currency_fiat,
                  exchangeRates
                }),
                currency: currency_fiat,
                showSymbol: true, showCode: false
              }).formatted : "",
              max: Number(data?.claim_max) >= 0 ? formatCurrency({
                amount: convertCurrency({
                  amount: data?.claim_max || 0,
                  fromCurrency: "USDT",
                  toCurrency: currency_fiat,
                  exchangeRates
                }),
                currency: currency_fiat,
                showSymbol: true, showCode: false
              }).formatted : "",
              amount: 0.1,
              currency: currency
            }}
            handle={() => handle(rule)}
            statement={statement}
          />);
      })}
    </div>
  </section>;
};

export const InnerDescriptionItem = (
  {
    desc,
    title,
    values
  }: {
    desc: ReactNode,
    title: ReactNode,
    values: Record<string, any>
    handle: () => void,
    statement: Record<string, any> | null,
  }) => {
  const { t } = useTranslation("bonusStore");
  return <details
    className="cursor-pointer group collapse text-[14px] bg-base-200 !rounded-lg p-2 text-base-content/50">
    <summary className="list-none select-none">
      <h4 className={"font-bold flex items-center justify-between gap-4"}>
        <Trans
          i18nKey={title as string}
          values={values}
        />
        <div className="btn btn-soft btn-square btn-primary btn-sm">
          <ChevronRight
            className="w-3 h-3 transition-transform duration-200 group-open:rotate-90"
            strokeWidth={3}
          />
        </div>
      </h4>
    </summary>
    <p
      className={"whitespace-pre-line collapse-content p-0 mt-2 font-normal"}
      dangerouslySetInnerHTML={{ __html: String(t(desc as string, values)) }}
    />
  </details>;
};

export const InnerProgress = ({ style, ...props }: ComponentProps<"progress">) => (
  <progress style={{
    height: "6px",
    backgroundImage: "repeating-linear-gradient(135deg, var(--color-base-400) 0 5px, color-mix(in oklch, var(--color-primary) 5%, transparent) 5px 10px)", ...style
  }} {...props} />
);

const CompareInfoRow = ({ label, value, className }: { label: ReactNode; value: ReactNode; className?: string }) => {
  return (
    <div className={clsx("flex flex-col justify-between gap-3 rounded-lg bg-base-200 p-2", className)}>
      <TextBaseContent text={label} />
      <div className="text-right text-base font-bold text-base-content">{value}</div>
    </div>
  );
};

export const InnerUnavailable = ({ icon, text, className }: {
  icon?: ReactNode,
  text?: string,
  className?: string
}) => {
  const { t } = useTranslation("bonusStore");

  return (
    <div
      className={clsx("uppercase text-primary skeleton rounded-xl h-[213px] bg-base-200 flex flex-col items-center justify-center font-extrabold gap-2", className)}>
      {icon}
      {text || t("bonus:activity_unavailable")}
    </div>);
};

export const InnerGiveUpBonus = () => {
  const openModal = useBoundStore((state) => state.openModal);

  const { t } = useTranslation("bonusStore");

  // 彩金钱包数据
  const { data: bonusWallet } = useUserBonusWallet();

  // 用户余额数据
  const { data: userBalance = [] } = useUserBalance();

  // 匹配币种信息，余额 icon 精度 等
  const match = userBalance?.find((token: { currency: string; }) => token?.currency === "BONUS");

  // 匹配彩金币种状态信息 打码的数据 奖励的数据等
  const status = bonusWallet?.data;

  // 彩金余额小于 0.1 则可放弃
  const limit = Decimal(match?.balance || 0).gt(0) && Decimal(match?.balance || 0).lte(0.1);

  return <InnerDisplayContent show={BonusInProgress.has(status?.status) && limit}>
    <div className="">
      <ConfirmBox className={"btn-soft flex w-full"} onClick={() => {
        // TODO: 放弃常规彩金
        openModal("OPEN_GIVE_UP_BONUS_MODAL", { id: status?.id, kind: "general" });
      }}>
        {t("bonus:giveUp")}
      </ConfirmBox>
    </div>
  </InnerDisplayContent>;
};

export { InnerToastCustom } from "@/components/ui/InnerToastCustom.tsx";

// 历史记录链接
export const InnerHistoryLink = ({ to }: { to: string }) => {
  const navigate = useAppNavigate();
  const { t } = useTranslation("bonusStore");


  return <span
    className={"inline-flex items-center text-base-content/50 text-xs"}
    onClick={() => void navigate({ to })}>
    {t("common:common.history")}<ChevronRight size={16} />
  </span>;
};

export const InnerLabel = ({ title, subTitle, className }: { title: string, subTitle: string, className?: string }) => {
  return <div className={clsx("bg-base-200 rounded-field p-2", className)}>
    <p className="text-xs text-base-content/50 mb-1 font-bold truncate">{title}</p>
    <p className="text-sm font-extrabold text-primary">{subTitle}</p>
  </div>;
};

export const InnerHeader = () => {
  const { t } = useTranslation("bonusStore");
  return <div className="flex items-center gap-2">
    <Store className="w-5 h-5 text-primary" />
    <span className="text-base font-bold">{t("bonus:bonusStore")}</span>
  </div>;
};

export const InnerOption = ({ icon, time, rate, name, checked: _checked, onClick, onChecked, multiplier }: {
  icon: string
  time: number,
  name: string,
  rate: string,
  checked?: boolean,
  onClick?: () => void,
  onChecked?: (checked: boolean) => void,
  multiplier: string
}) => {
  console.info(name, multiplier);
  const [uncontrolledChecked, setUncontrolledChecked] = useState<boolean>(false);
  const { t } = useTranslation("bonusStore");

  const isControlled = _checked != null;
  const checked = _checked ?? uncontrolledChecked;

  const setChecked = (next: boolean) => {
    if (!isControlled) setUncontrolledChecked(next);
    onChecked?.(next);
  };

  return <InnerTimeCheck time={time}>
    <div
      className={clsx(
        "cursor-pointer rounded-lg border p-2 transition-colors bg-base-200",
        checked
          ? "border-primary"
          : "border-base-200"
      )}
      onClick={() => {
        setChecked(!checked);
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <div
            className={clsx(
              "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border",
              checked ? "border-primary bg-primary text-primary-content" : "border-base-200 bg-base-100 text-transparent"
            )}
          >
            <Check className="h-3 w-3" strokeWidth={3} />
          </div>
          <img src={icon} alt="" className="h-6 w-6 shrink-0" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-1 gap-y-1">
              <span className="rounded-sm bg-primary/20 px-2 py-0.5 text-sm text-primary font-bold">
                +{rate}
              </span>
            </div>
            <div className="mt-1 text-sm font-semibold leading-5 text-base-content/50">
              {t("bonusStore:extraBonusGet", { value: rate })}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Info
            onClick={(e) => {
              e?.stopPropagation();
              onClick?.();
              return false;
            }} />
        </div>
      </div>
    </div>
  </InnerTimeCheck>;
};

// 活动倒计时
const InnerTimeCheck = (props: PropsWithChildren<{ time: number }>) => {
  const [bonusExpired, setBonusExpired] = useState<boolean>(false);

  // 限购期间禁止操作
  const locked = new Date().getTime() < ((props.time || 0) * 1000) && !bonusExpired;

  // 限购期间禁止操作
  const preventWhenLocked = (e: {
    preventDefault: () => void;
    stopPropagation: () => void;
  }) => {
    if (!locked) return;
    e.preventDefault();
    e.stopPropagation();
  };

  return <div
    className="relative rounded-field overflow-hidden"
    onPointerDownCapture={preventWhenLocked}
    onClickCapture={preventWhenLocked}
    onKeyDownCapture={preventWhenLocked}
  >
    {locked &&
      <div className="absolute inset-0 bg-base-200/60 w-full h-full flex items-center justify-center">
        <div
          className={"inline-flex gap-1 text-[12px] justify-center text-base-content font-bold bg-base-400 rounded-field px-3 py-2"}>
          <LockKeyhole className={"w-4 h-4 text-primary"} />
          <CountdownTimer
            className={"text-primary"}
            onFinished={(v) => v && setBonusExpired(true)}
            expireTime={props.time} />
        </div>
      </div>}
    <div className={clsx({ "pointer-events-none": locked })}>
      {props.children}
    </div>
  </div>;
};

export const InnerBonusItem = ({ src = "/images/bonus_store/bonus.png", rate, className }: {
  src?: string,
  rate: string,
  className?: string
}) => {
  const { t } = useTranslation("bonusStore");
  return <div className={clsx("flex items-center gap-2", className)}>
    <img src={src} alt="" className={"h-6 w-6 shrink-0"} />
    <span className="text-sm text-primary font-normal">{t('bonusStore:extraBonusGet',{value:rate})}</span>
  </div>;
};

export { EBonus, ESport } from "@/config";

export const BONUS_ERROR_MAP: Record<number, string> = {
  51029: "bonusStore:bonusExists",
  51030: "bonusStore:notAllowed",
  51032: "finance:insufficient_balance",
  51034: "bonusStore:amountLow",
  51035: "bonusStore:amountHigh"
};
