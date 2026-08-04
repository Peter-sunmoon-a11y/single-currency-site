import { GAME_PANEL_CLS, GAME_PANEL_STYLE } from "@/sections/gameId/components.tsx";
import { useParams } from "next/navigation";
import { useGamingGuide } from "@/hooks/api/usePublic.ts";
import { ReactNode, useMemo } from "react";
import {
  fn_ban_regions,
  fn_ban_support_settlement_currencies, fn_regions,
  fn_support_settlement_currencies
} from "@/utils/helper";
import { useCountryCodeByIp } from "@/sections/profile/security/helper.ts";
import { useQuery } from "@tanstack/react-query";
import { getUserDefaultCurrency } from "@/services/auth/user";
import { useSettlementCurrency } from "@/contexts/SettlementCurrencyContext.tsx";
import { useCheckDemoSupportQuery, useUserBalance } from "@/hooks/api/useAuth.ts";
import { GameLoadingScreen } from "@/components/game/GameLoadingScreen.tsx";
import { useBoundStore } from "@/store";

export interface GamingGuardValues {
  gamingGuide: ReturnType<typeof useGamingGuide>["data"];
  gameCurrency: string;
  guideLoading: boolean;
  currencyLoading: boolean;
  supportGameTrial: boolean;
  is_insufficient: boolean;
  is_regional_access_prohibited: boolean;
  is_currency_settlement_prohibited: boolean;
}

type GamingGuardProps = {
  children: (values: GamingGuardValues) => ReactNode;
};

export const GamingGuard = (props: GamingGuardProps) => {
  const user = useBoundStore((state) => state.user);
  const displayCurrency = useBoundStore((state) => state.displayCurrency);

  const { gameId } = useParams<{ gameId?: string }>();

  // 游戏详情信息，包含必要启动参数
  const { data: gamingGuide, isLoading: guideLoading } = useGamingGuide(gameId ?? "");

  // 游戏默认结算货币
  const { data: currency, isLoading: currencyLoading } = useQuery({
    queryKey: ["userDefaultCurrency", gamingGuide?.inner_game_id, displayCurrency],
    queryFn: () => getUserDefaultCurrency({ inner_game_id: gamingGuide!.inner_game_id }),
    enabled: !!gamingGuide?.inner_game_id && !!user,
  });

  // 最终可用游戏币种：优先服务端返回值，回退到游戏默认 / 用户币种 / USD
  const gameCurrency = currency?.data?.default_currency
    || gamingGuide?.default_currency
    || user?.currency
    || "USD";

  // 是否支持 Demo 模式
  const { data: gameDemo } = useCheckDemoSupportQuery({
    inner_game_id: gamingGuide?.inner_game_id || "",
    game_provider: gamingGuide?.game_provider || "",
    game_currency: gameCurrency
  });
  const supportGameTrial = gameDemo?.code === 0 && !!gameDemo?.data?.support_demo;

  // 根据 IP 获取地区
  const { data: country } = useCountryCodeByIp();

  // 地区禁止检查
  const is_regional_access_prohibited = useMemo(() => {
    const country_code = country?.data?.country_code ?? "";
    return !!fn_ban_regions(gamingGuide?.ban_regions ?? "", country_code)
      || !!fn_regions(gamingGuide?.regions ?? "", country_code);
  }, [country?.data?.country_code, gamingGuide]);

  // 结算币禁止检查
  const is_currency_settlement_prohibited = useMemo(() => {
    const current_settlement_currency = user?.currency ?? "";
    return !!fn_ban_support_settlement_currencies(gamingGuide?.ban_support_settlement_currencies ?? "", current_settlement_currency)
      || !!fn_support_settlement_currencies(gamingGuide?.support_settlement_currencies ?? "", current_settlement_currency);
  }, [user?.currency, gamingGuide]);

  // 余额检查
  const { selectedCurrency: settlement } = useSettlementCurrency();
  const { data: userBalances } = useUserBalance();
  const real_balance = useMemo(() => {
    const entry = userBalances?.find((b: Record<string, any>) => b.currency === settlement);
    return Number(entry?.balance ?? 0);
  }, [userBalances, settlement]);
  const is_insufficient = !!user && real_balance === 0;

  if (guideLoading || currencyLoading) return (
    <div
      className={GAME_PANEL_CLS}
      style={GAME_PANEL_STYLE}
    >
      <GameLoadingScreen sample={false} gameGuide={gamingGuide} fixed />
    </div>
  );

  return (
    <>
      {props.children({
        gamingGuide,
        gameCurrency,
        guideLoading,
        currencyLoading,
        supportGameTrial,
        is_insufficient,
        is_regional_access_prohibited,
        is_currency_settlement_prohibited
      })}
    </>
  );
};
