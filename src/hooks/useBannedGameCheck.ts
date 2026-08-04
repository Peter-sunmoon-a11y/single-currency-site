import { useBanGameList } from "@/query/game.ts";
import { useCountryCodeByIp } from "@/sections/profile/security/helper.ts";
import { useBoundStore } from "@/store";
import { fn_ban_regions, fn_ban_support_settlement_currencies, fn_regions, fn_support_settlement_currencies } from "@/utils/helper.ts";
import { useCallback } from "react";

/**
 * 检查游戏是否被禁止的 hook
 * @param enabledBanGameList 是否启用禁止游戏列表
 * @returns 检查游戏是否被禁止的函数
 */
export function useBannedGameCheck(enabledBanGameList = true) {
  // 获取用户和地区信息
  const user = useBoundStore((s) => s.user);
  const { data: country } = useCountryCodeByIp();
  const { data: banGameList } = useBanGameList(enabledBanGameList);

  const is_show_blocked_games = user?.is_show_blocked_games === 1;

  // 检查游戏是否被禁止的函数
  return useCallback(
    (game: any) => {
      if (user && !is_show_blocked_games) return false;

      // 地区禁止 - method 1: 使用 banGameList
      if (banGameList?.data) {
        const ban_ip_games = banGameList?.data?.ban_ip_games ?? [];
        if (ban_ip_games.find((inner_game_id: string) => inner_game_id === game?.inner_game_id)) {
          return true;
        }
      }

      // 地区禁止 - method 2: 使用游戏数据中的 ban_regions
      const country_code = country?.data?.country_code ?? "";
      const limit1 = fn_ban_regions(game?.ban_regions ?? "", country_code);
      const limit2 = fn_regions(game?.regions ?? "", country_code);

      return limit1 || limit2;
    },
    [user, banGameList, country?.data?.country_code],
  );
}

// TODO: 服务于推荐游戏 -》推荐的游戏需要过滤掉不可玩的游戏 [币种禁用 地区禁用]
export function useBannedGameForceCheck() {
  // 获取用户和地区信息
  const user = useBoundStore((s) => s.user);
  const { data: country } = useCountryCodeByIp();
  const { data: banGameList } = useBanGameList(true);

  // 检查游戏是否被禁止的函数
  return useCallback(
    (game: any) => {
      const current_settlement_currency = user?.currency ?? "";

      const limit1 = fn_ban_support_settlement_currencies(game?.ban_support_settlement_currencies ?? "", current_settlement_currency);
      const limit2 = fn_support_settlement_currencies(game?.support_settlement_currencies ?? "", current_settlement_currency);

      // 地区禁止 - method 1: 使用 banGameList
      if (banGameList?.data) {
        const ban_ip_games = banGameList?.data?.ban_ip_games ?? [];
        if (ban_ip_games.find((inner_game_id: string) => inner_game_id === game?.inner_game_id)) {
          return true;
        }
      }

      // 地区禁止 - method 2: 使用游戏数据中的 ban_regions
      const country_code = country?.data?.country_code ?? "";
      const limit3 = fn_ban_regions(game?.ban_regions ?? "", country_code);
      const limit4 = fn_regions(game?.regions ?? "", country_code);

      return limit1 || limit2 || limit3 || limit4;
    },
    [user?.currency, banGameList, country?.data?.country_code],
  );
}
