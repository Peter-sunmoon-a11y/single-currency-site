import {useTranslation} from "@/lib/i18n/react-i18next";
import {useEffect, useMemo, useState} from "react";
import {useBonusSwitch, useSpinPoolPrizeList, useUserLuckySpinHome} from "@/hooks/api/useAuth.ts";
import {
  getPrizeImageUrl,
  InnerContainer,
  InnerDataCard,
  InnerSpinsData,
  InnerSpinsType, resolveLuckySpinDisplayCurrency
} from "@/sections/lucky-spin/components.tsx";
import SpinWheel, {bg_colors} from "@/sections/lucky-spin/spin-wheel.tsx";
import {SpinsNotify} from "@/sections/lucky-spin/spins-notify.tsx";
import {clsx} from "clsx";
import {useBoundStore} from "@/store";
import {useCurrencyData} from "@/hooks/useCurrency.ts";
import {useAppNavigate} from "@/hooks/useAppNavigate";
import {ConfirmBox} from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import {GuestGuide} from "@/components/standard/GuestGuide.tsx";

const ENABLE_MOCK_SPIN_WHEN_EMPTY = false;
const BALL_IMAGES = [
  "/images/game_lucky_spin/spins-small.png",
  "/images/game_lucky_spin/roulette1.png",
  "/images/game_lucky_spin/roulette1.png",
  "/images/game_lucky_spin/roulette1.png",
  "/images/game_lucky_spin/roulette2.png",
  "/images/game_lucky_spin/roulette2.png",
  "/images/game_lucky_spin/roulette2.png",
];

function RouteComponent() {
  const navigate = useAppNavigate();

  const [currentSpin, setCurrentSpin] = useState<"normal" | "mega">("normal");
  const [isWheelSpinning, setIsWheelSpinning] = useState(false);

  const {t} = useTranslation(["luckySpin"]);

  const user = useBoundStore((state) => state.user);
  const openModal = useBoundStore((state) => state.openModal);

  const {convertCurrency, exchangeRates, formatCurrency} = useCurrencyData();

  // 幸运盘 -> 主页信息
  const {data: luckySpin} = useUserLuckySpinHome();
  const {switchData} = useBonusSwitch();

  // 幸运盘 -> 奖池详情接口
  const {data: spinsList, isLoading} = useSpinPoolPrizeList(currentSpin);

  const normalMinAmountUsdt = Number(luckySpin?.data?.lucky_spin_config?.normal_min_amount_usdt ?? 0) > 0
    ? Number(luckySpin?.data?.lucky_spin_config?.normal_min_amount_usdt ?? 0)
    : 20;
  const megaMinAmountUsdt = Number(luckySpin?.data?.lucky_spin_config?.mega_min_amount_usdt ?? 0) > normalMinAmountUsdt
    ? Number(luckySpin?.data?.lucky_spin_config?.mega_min_amount_usdt ?? 0)
    : 100;

  // TODO: 旋转类型配置
  const spinTypeConfig = useMemo(() => ({
    normal: {
      name: t("luckySpin:lucky"),
      count: luckySpin?.data?.lucky_spin_normal_num || 0,
      icon: "/images/game_lucky_spin/roulette1.png",
      deposit: t("luckySpin:deposit", {
        amount: formatCurrency({
          amount: convertCurrency({
            amount: normalMinAmountUsdt,
            fromCurrency: "USDT",
            toCurrency: user?.currency_fiat ?? "USD",
            exchangeRates
          }),
          currency: user?.currency_fiat ?? "USD",
          showSymbol: true, showCode: false
        }).formatted
      })
    },
    mega: {
      name: t("luckySpin:mega"),
      count: luckySpin?.data?.lucky_spin_mega_num || 0,
      icon: "/images/game_lucky_spin/roulette2.png",
      deposit: t("luckySpin:deposit", {
        amount: formatCurrency({
          amount: convertCurrency({
            amount: megaMinAmountUsdt,
            fromCurrency: "USDT",
            toCurrency: user?.currency_fiat ?? "USD",
            exchangeRates
          }),
          currency: user?.currency_fiat ?? "USD",
          showSymbol: true, showCode: false
        }).formatted
      })
    }
  }), [luckySpin?.data, user?.currency_fiat, exchangeRates]);

  // TODO: 旋转类型配置
  const currentSpinConfig = spinTypeConfig[currentSpin];
  const isLuckySpinDisabled = switchData?.bonus_switch?.lucky_spin === 0;
  const isMockSpinEnabled = ENABLE_MOCK_SPIN_WHEN_EMPTY && !isLuckySpinDisabled && Number(currentSpinConfig?.count) === 0;

  // TODO: 获奖结果数据
  const handle = (prize: any) => {
    console.info(prize);
  };

  const spins_list = spinsList?.data?.list ?? [];
  const luckySpinDisplayCurrency = resolveLuckySpinDisplayCurrency(user);

  const prize_list = useMemo(() => {
    return spins_list.map((p: Record<string, any>, index: number) => {
      const extra_data = p?.extra_data;
      const isUserCurrencyPrize = extra_data?.prize_name === "User Currency";
      const displayLabel = isUserCurrencyPrize
        ? luckySpinDisplayCurrency
        : extra_data?.prize_name || extra_data?.prize_type || "";

      return {
        id: index + 1,
        label: displayLabel,
        ...extra_data,
        imageUrl: getPrizeImageUrl(extra_data, luckySpinDisplayCurrency),
        record_id: p?.id,
        isSettlementCurrencyMatch: Boolean(
          luckySpinDisplayCurrency && isUserCurrencyPrize
        )
      };
    });
  }, [luckySpinDisplayCurrency, spins_list]);

  useEffect(() => {
    const spinType = typeof window === "undefined" ? undefined : window.history.state?.spinType;
    if (spinType === "mega" || spinType === "normal") {
      setCurrentSpin(spinType);
    }
  }, []);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center">
        <GuestGuide
          images={BALL_IMAGES}
          label={t("login:pleaseLoginToContinue")}
          onAction={() => openModal("OPEN_AUTH_MODAL", {initialTab: "signup"})}
        />
      </div>
    );
  }

  return (
    <div className="">
      <InnerContainer $type={currentSpin} className="p-4 min-h-screen">
        <div className="flex flex-col gap-4">
          {/*获奖的滚动通知*/}
          <SpinsNotify/>

          {/*旋转类型切换*/}
          <InnerDataCard className={"bg-base-300/50"}>
            <InnerSpinsData
              name={currentSpinConfig.name}
              count={currentSpinConfig.count}
            />
            <div className="flex items-center gap-2">
              <InnerSpinsType
                icon={<img className={"w-6 h-6"} src={spinTypeConfig.normal.icon} alt=""/>}
                title={t("luckySpin:lucky")}
                onClick={() => setCurrentSpin("normal")}
                disabled={isWheelSpinning}
                extra={spinTypeConfig["normal"]?.count > 0 &&
                    <span className="absolute rounded-full w-2 h-2 top-0 right-0" style={{background: "#0B965D"}}/>}
                className={clsx(currentSpin === "normal" ? "hidden" : "block")}
              />
              <InnerSpinsType
                icon={<img className={"w-6 h-6"} src={spinTypeConfig.mega.icon} alt=""/>}
                title={t("luckySpin:mega")}
                onClick={() => setCurrentSpin("mega")}
                disabled={isWheelSpinning}
                extra={spinTypeConfig["mega"]?.count > 0 &&
                    <span className="absolute rounded-full w-2 h-2 top-0 right-0" style={{background: "#EB53C1"}}/>}
                className={clsx(currentSpin === "mega" ? "hidden" : "block")}
              />
            </div>
          </InnerDataCard>
        </div>

        {/*旋转轮盘入口*/}
        <div className={"mt-4"}>
          <SpinWheel
            prizes={prize_list}
            loading={isLoading}
            spinType={currentSpin}
            mockSpin={isMockSpinEnabled}
            showSpin={isLuckySpinDisabled || Number(currentSpinConfig?.count) > 0 || isMockSpinEnabled}
            unavailable={isLuckySpinDisabled ? t("bonus:activity_unavailable") : undefined}
            extraNode={
              !isLuckySpinDisabled && !isLoading && Number(currentSpinConfig?.count) === 0 && !isMockSpinEnabled &&
                <ConfirmBox
                    className={`${bg_colors[currentSpin]} border-none text-base-content !rounded-xl`}
                    onClick={() => void navigate({to: "/deposit"})}>
                <span className={"truncate"}>
                  {currentSpinConfig?.deposit}
                </span>
                </ConfirmBox>}
            onSpinResult={handle}
            onSpinningChange={setIsWheelSpinning}
          />
        </div>
      </InnerContainer>
    </div>
  );
}

export default RouteComponent;
