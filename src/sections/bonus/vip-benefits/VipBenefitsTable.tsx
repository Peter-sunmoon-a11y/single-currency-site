import { useBoundStore } from "@/store";
import { useLuckyNumberConfig, useMembersDayConfig, useVipConfig } from "@/hooks/api/usePublic";
import { useBonusSwitch } from "@/hooks/api/useAuth";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { useDeferredValue, useMemo, useState } from "react";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { Search } from "lucide-react";
import { NothingFound } from "@/components/ui/NothingFound";
import type { IVipLevelConfig } from "@/types/vip";
import { VIP_REQUIREMENTS } from "@/sections/bonus";

const toNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toArray = <T, >(value: T[] | null | undefined): T[] => (Array.isArray(value) ? value : []);

interface RewardRow {
  labelKey: string;
  type: "currency" | "percentage" | "boolean";
  getValue: (config: IVipLevelConfig) => string | boolean;
  isVisible?: boolean;
}

const LevelBlock = ({
                      config,
                      t,
                      formatWithConversion,
                      isCurrent,
                      rewardRows
                    }: {
  config: IVipLevelConfig;
  t: ReturnType<typeof useTranslation>["t"];
  formatWithConversion: ReturnType<typeof useDisplayCurrencyFormatter>["formatWithConversion"];
  isCurrent: boolean;
  rewardRows: RewardRow[];
}) => (
  <div className={`rounded-lg bg-base-200 overflow-hidden`}>
    {/* 等级标题 */}
    <div className="flex items-center gap-2 px-4 py-2 border-b border-base-300">
      {!isCurrent && <img src={`/images/vip/levels/${config.vip}.png`} alt="" className="w-7.5 h-7.5 object-contain" />}
      <span className="text-lg font-bold uppercase italic">{isCurrent ? <span className={'text-primary'}>{t("vip:current")}</span> : `VIP ${config.vip}`}</span>
    </div>

    {/* 明细条目 */}
    <div className="flex flex-col divide-y divide-base-300">
      {rewardRows.map((row) => {
        const raw = row.getValue(config);

        let valueNode: React.ReactNode;
        if (row.type === "boolean") {
          valueNode = raw ? (
            <span className="text-success text-sm font-bold">✓</span>
          ) : (
            <span className="text-base-content/30 text-sm">--</span>
          );
        } else if (row.type === "currency") {
          const n = parseFloat(raw as string);
          valueNode = n > 0 ? (
            <span className="text-sm font-bold text-primary">
              {formatWithConversion(n, "USDT", { showSymbol: true, showCode: false }).formatted}
            </span>
          ) : (
            <span className="text-base-content/30 text-xs">—</span>
          );
        } else {
          valueNode = <span className="text-sm font-bold">{raw as string}</span>;
        }

        return (
          <p key={row.labelKey} className="flex items-center justify-between px-4 py-1.5">
            <span className="text-sm font-medium text-base-content/50">
              {t(row.labelKey, { digit: "" })}
            </span>
            {valueNode}
          </p>
        );
      })}
    </div>
  </div>
);

export const VipBenefitsTable = () => {
  const { t } = useTranslation(["vip", "bonus", "vipMonday"]);
  const status = useBoundStore((state) => state.status);
  const { formatWithConversion } = useDisplayCurrencyFormatter();
  const { data: vipConfigData, isLoading } = useVipConfig();
  const { data: luckyNumberConfigResponse } = useLuckyNumberConfig();
  const { data: membersDayConfigResponse } = useMembersDayConfig();
  const { switchData } = useBonusSwitch();

  const vipLevels = useMemo<IVipLevelConfig[]>(() => {
    if (!vipConfigData?.data) return [];
    return [...(vipConfigData.data as IVipLevelConfig[])].sort((a, b) => a.vip - b.vip);
  }, [vipConfigData?.data]);

  const luckyNumberRequiredVipLevel = useMemo(() => {
    const luckyNumberConfig = luckyNumberConfigResponse?.data ?? {};
    return toNumber(toArray<number>(luckyNumberConfig?.levels)[0] ?? 0);
  }, [luckyNumberConfigResponse?.data]);

  const membersDayRequiredVipLevel = useMemo(() => {
    const membersDayConfig = membersDayConfigResponse?.data ?? {};
    return toNumber(
      membersDayConfig?.min_vip ??
      membersDayConfig?.required_vip_level ??
      membersDayConfig?.requiredLevel ??
      membersDayConfig?.vip_level ??
      membersDayConfig?.level ??
      toArray<number>(membersDayConfig?.levels)[0] ??
      0
    );
  }, [membersDayConfigResponse?.data]);

  const isLuckyNumberVisible = (luckyNumberConfigResponse?.data?.enabled ?? false)
    && switchData?.bonus_switch?.lucky_number !== 0;
  const isSuperRakebackVisible = switchData?.bonus_switch?.rakeback !== 0;
  const isVipMondayVisible = switchData?.bonus_switch?.monday_vip_bonus !== 0;
  const isMembersDayVisible = switchData?.bonus_switch?.members_day !== 0;

  const rewardRows = useMemo<RewardRow[]>(() => {
    const rows: RewardRow[] = [
      {
        labelKey: "vip:level_up_bonus_cumulative",
        type: "currency",
        getValue: (c: IVipLevelConfig) => c.level_up
      },
      {
        labelKey: "vip:referral_commission",
        type: "percentage",
        getValue: (c: IVipLevelConfig) => {
          const n = parseFloat(c.group);
          return n > 0 ? `${(n * 100).toFixed(2)}%` : "-";
        }
      },
      {
        labelKey: "bonus:super_rakeback",
        type: "percentage",
        getValue: (c: IVipLevelConfig) => {
          const n = parseFloat(c.rakeback);
          return n > 0 ? `${(n * 100).toFixed(2)}%` : "-";
        },
        isVisible: isSuperRakebackVisible
      },
      {
        labelKey: "vip:achievements",
        type: "boolean",
        getValue: (c: IVipLevelConfig) => c.vip > 1
      },
      {
        labelKey: "mysteryBox:lucky_number_title",
        type: "boolean",
        getValue: (c: IVipLevelConfig) => c.vip >= luckyNumberRequiredVipLevel,
        isVisible: isLuckyNumberVisible
      },
      {
        labelKey: "vipMonday:vip_monday",
        type: "boolean",
        getValue: (c: IVipLevelConfig) => c.vip >= VIP_REQUIREMENTS.vipMonday.requiredLevel,
        isVisible: isVipMondayVisible
      },
      {
        labelKey: "vipMonday:members_day",
        type: "boolean",
        getValue: (c: IVipLevelConfig) => c.vip >= membersDayRequiredVipLevel,
        isVisible: isMembersDayVisible
      }
    ];

    return rows.filter((row) => row.isVisible ?? true);
  }, [isLuckyNumberVisible, isMembersDayVisible, isSuperRakebackVisible, isVipMondayVisible, luckyNumberRequiredVipLevel, membersDayRequiredVipLevel]);

  const currentVip = status?.vip ?? 0;

  const [searchText, setSearchText] = useState("");
  const deferredSearch = useDeferredValue(searchText);
  const filteredLevels = useMemo(() => {
    const q = deferredSearch.trim();
    const visibleLevels = vipLevels.filter((c) => c.vip >= currentVip);
    const list = q ? visibleLevels.filter((c) => String(c.vip).includes(q)) : visibleLevels;
    const current = list.find((c) => c.vip === currentVip);
    const rest = list.filter((c) => c.vip !== currentVip);
    return current ? [current, ...rest] : rest;
  }, [vipLevels, deferredSearch, currentVip]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="skeleton h-20 rounded-lg bg-base-200" />
        ))}
      </div>
    );
  }

  if (!vipLevels.length) return null;

  return (
    <div className="flex flex-col gap-2">
      {/* 搜索框 */}
      <label className="input bg-base-200 w-full !outline-0 border-0 font-bold flex">
        <Search className="text-base-content/50 w-4 h-4" />
        <input
          type="text"
          inputMode="numeric"
          value={searchText}
          placeholder={t("common:common.searchPlaceholder")}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </label>

      {filteredLevels.length == 0 && <NothingFound className="static h-25" />}

      {filteredLevels.map((config) => (
        <LevelBlock
          t={t}
          key={config.vip}
          config={config}
          isCurrent={config.vip === currentVip}
          rewardRows={rewardRows}
          formatWithConversion={formatWithConversion}
        />
      ))}
    </div>
  );
};
