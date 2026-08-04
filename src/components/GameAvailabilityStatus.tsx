import { useBanGameList } from "@/query/game.ts";
import { useCountryCodeByIp } from "@/sections/profile/security/helper.ts";
import { useBoundStore } from "@/store";
import { fn_ban_regions, fn_ban_support_settlement_currencies, fn_regions, fn_support_settlement_currencies } from "@/utils/helper";
import clsx from "clsx";
import { GlobeLock, LockKeyhole } from "lucide-react";
import { useMemo } from "react";

export const GameAvailabilityStatus = ({
  data,
  sample,
  className,
  enabledBanGameList,
}: {
  data: Record<string, any>;
  sample?: boolean;
  className?: string;
  enabledBanGameList?: boolean;
}) => {
  const user = useBoundStore((state) => state.user);

  // 根据IP获取地区
  const { data: country } = useCountryCodeByIp();

  // 游戏是否被禁止的辅助数据
  const { data: banGameList } = useBanGameList(enabledBanGameList);

  const openModal = useBoundStore((state) => state.openModal);

  // 结算币禁止
  const is_currency_settlement_prohibited = useMemo(() => {
    // method 1: 如果提供的游戏数据中没有提供 ban_support_settlement_currencies 字段的时候需要使用辅助判断方式 useBanGameList(enabledBanGameList)
    if (enabledBanGameList && banGameList?.data) {
      const ban_currency_games = banGameList?.data?.ban_currency_games ?? [];
      return ban_currency_games.find((inner_game_id: string) => inner_game_id === data?.inner_game_id);
    }

    // method 2: 游戏数据中提供了 support_settlement_currencies ban_support_settlement_currencies 字段
    const current_settlement_currency = user?.currency ?? "";

    const limit1 = fn_ban_support_settlement_currencies(data?.ban_support_settlement_currencies ?? "", current_settlement_currency);
    const limit2 = fn_support_settlement_currencies(data?.support_settlement_currencies ?? "", current_settlement_currency);

    return limit1 || limit2;
  }, [
    banGameList?.data,
    data?.inner_game_id,
    data?.ban_support_settlement_currencies,
    data?.support_settlement_currencies,
    enabledBanGameList,
    user?.currency,
  ]);
  // const is_currency_settlement_prohibited = true

  // 地区禁止
  const is_regional_access_prohibited = useMemo(() => {
    // method 1: 如果提供的游戏数据中没有提供 ban_regions 字段的时候需要使用辅助判断方式 useBanGameList(enabledBanGameList)
    if (enabledBanGameList && banGameList?.data) {
      const ban_ip_games = banGameList?.data?.ban_ip_games ?? [];
      return ban_ip_games.find((inner_game_id: string) => inner_game_id === data?.inner_game_id);
    }

    // method 2: 游戏数据中提供了 ban_regions 字段
    const country_code = country?.data?.country_code ?? "";

    const limit1 = fn_ban_regions(data?.ban_regions ?? "", country_code);
    const limit2 = fn_regions(data?.regions ?? "", country_code);

    return limit1 || limit2;
  }, [banGameList?.data, country?.data?.country_code, data?.inner_game_id, data?.ban_regions, data?.regions, enabledBanGameList]);

  if (sample || (!is_currency_settlement_prohibited && !is_regional_access_prohibited)) return null;

  const reason = is_regional_access_prohibited ? "region" : "currency";

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        openModal("OPEN_GAME_BAN_REASON_MODAL", {
          reason,
          image: data?.image || data?.imageUrl,
          gameName: data?.display_game_name || data?.game_name || data?.title,
        });
      }}
      className={clsx(
        "h-full absolute top-0 bottom-0 w-full z-9 overflow-hidden cursor-pointer",
        "flex items-center justify-center",
        className,
      )}
    >
      <div className="absolute inset-0 backdrop-grayscale backdrop-brightness-65 bg-black/10" />
      {is_regional_access_prohibited ? (
        <GlobeLock className="w-5 h-5 text-white relative drop-shadow-md" />
      ) : (
        <LockKeyhole className="w-5 h-5 text-white relative drop-shadow-md" />
      )}
    </div>
  );
};
