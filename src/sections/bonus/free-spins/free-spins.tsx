import { useUserFreeGameRecords } from "@/hooks/api/useAuth.ts";
import { useTranslation } from "@/lib/i18n/react-i18next";
import Iconify from "@/components/iconify";
import { BonusFreeSpinsCardV2, BonusListHeader } from "@/sections/bonus";
import { FreeSpinsApply, FreeSpinsHelpCard } from "@/sections/bonus/free-spins/free-spins-apply.tsx";
import { useBoundStore } from "@/store";

export const FreeSpins = () => {
  const user = useBoundStore((state) => state.user);

  const { t } = useTranslation(["bonus", "luckySpin"]);

  const { data: freeSpinsData, isLoading } = useUserFreeGameRecords();

  const hasFreeSpins = Array.isArray(freeSpinsData?.data?.games) && freeSpinsData.data.games.length > 0;

  return (
    <BonusListHeader
      icon={<Iconify icon="custom:game" className="shrink-0 w-5 h-5 text-primary" />}
      title={t("luckySpin:freeSpins")}
      childrenClassName="grid grid-cols-1 gap-2"
    >
      <FreeSpinsApply loading={isLoading} />

      {hasFreeSpins && (freeSpinsData?.data?.games ?? []).map((g: any) => {
        const r = g?.free_spin_record ?? {};
        const total = Number(r?.bet_count ?? 0);
        const used = Number(r?.current_bet_count ?? 0);
        const remaining = r?.remaining_bets != null ? Number(r.remaining_bets) : Math.max(0, total - used);
        const maxWin = parseFloat(r?.win_amount ?? r?.win_bucks_amount ?? "0");
        const turnoverLimit = parseFloat(r?.turnover_limit_usdt ?? "0");
        const currentTurnover = parseFloat(r?.current_turnover_limit_usdt ?? "0");

        return (
          <BonusFreeSpinsCardV2
            key={g?.id ?? r?.id}
            gameTitle={g?.display_game_name}
            gameIcon={g?.image}
            available={remaining}
            total={total}
            maxWin={isNaN(maxWin) ? 0 : maxWin}
            expiration={r?.expired_at || 0}
            gameId={g?.game_provider && g?.inner_game_id ? `${g.game_provider}:${g.inner_game_id}` : g?.inner_game_id}
            innerGameId={g?.inner_game_id}
            isAvailable={remaining > 0 && !r?.is_expired}
            handleStatus={r?.handle_status}
            freeSpinCode={r?.free_spin_code || r?.template_key}
            turnoverLimit={isNaN(turnoverLimit) ? 0 : turnoverLimit}
            currentTurnover={isNaN(currentTurnover) ? 0 : currentTurnover}
            winAmount={parseFloat(r?.win_amount ?? r?.win_bucks_amount ?? "0")}
            currency={r?.currency || g?.currency || "USDT"}
            isExpired={Boolean(r?.is_expired)}
            recordId={r?.id}
            isTurnoverMet={r?.is_turnover_requirement_met}
          />
        );
      })}

      {/* 提示用户获取FreeSpins手动优惠码 */}
      {(!hasFreeSpins || !user) && <FreeSpinsHelpCard />}
    </BonusListHeader>
  );
};