import {
  useDepositChannelClassList
} from "@/components/modal/UserFinanceModal/helper.ts";
import { orderBy } from "es-toolkit";
import { SmallLoading } from "@/components/modal/UserFinanceModal/c/Loading.tsx";
import { useBoundStore } from "@/store";
import { cn } from "@/utils/cn.ts";
import { useEffect, useMemo, useState } from "react";
import {
  InnerPayment,
  InnerProviderIcon
} from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { useSupportedFiatDepositGateways } from "@/hooks/api/useAuth.ts";
import { NoData } from "@/components/modal/UserFinanceModal/c/NoData.tsx";
import { NothingFound } from "@/components/ui/NothingFound.tsx";
import { DepositFiatSelectAML } from "@/components/modal/UserFinanceModal/c/DepositFiatSelectAML.tsx";

export const ChannelClassOptions = () => {
  const depositFiat = useBoundStore((state) => state.depositFiat);
  const setDepositFiat = useBoundStore((state) => state.setDepositFiat);

  const [channelClass, setChannelClass] = useState<Record<string, any> | null>(null);

  const { t } = useTranslation();

  // 法币存款通道分类支持
  const { data: channelClasses, isLoading } = useDepositChannelClassList(depositFiat.currency?.currency);

  // 法币存款支持的网关
  const {
    data: gateways,
    isLoading: gatewaysLoading
  } = useSupportedFiatDepositGateways(depositFiat.currency?.currency);

  // TODO: 按照channelClasses中的channel_class来分组gateways
  const groupedGateways = useMemo(() => {
    const gatewaysData = gateways?.data ?? [];
    const channelClassList = channelClasses?.data ?? [];
    const grouped: Array<{ channel: Record<string, any>; gateways: Record<string, any>[] }> = [];

    channelClassList.forEach((channelClassItem: Record<string, any>) => {
      const gatewaysForClass = gatewaysData.filter((g: Record<string, any>) =>
        g?.channel_class === channelClassItem?.channel_class
      );

      if (gatewaysForClass.length > 0) {
        grouped.push({
          channel: channelClassItem,
          gateways: orderBy(gatewaysForClass, ["status"], ["desc"])
        });
      }
    });

    return grouped;
  }, [gateways, channelClasses]);

  const memoProviders = useMemo(() => {
    const target = groupedGateways?.find((g) => g?.channel?.id === channelClass?.id);
    return groupedGateways?.length === 0 || target?.gateways?.length === 0 ? (
      <NoData text={t("common.noData")} className={"!h-full"} />
    ) : (
      <div className={cn(
        "grid gap-1",
        (target?.gateways.length ?? 0) <= 1 ? "grid-cols-1" :
        (target?.gateways.length ?? 0) <= 2 ? "grid-cols-2" : "grid-cols-3"
      )}>
        {target?.gateways.map((gateway: Record<string, any>, index: number) => (
          <InnerPayment
            key={index}
            method={depositFiat.method}
            gateway={gateway}
            onClick={async () => {
              // 已选中的没必要再次选中触发事件
              if (depositFiat.method?.id === gateway?.id) return;

              setDepositFiat({ method: gateway });
            }}
          />
        ))}
      </div>
    );
  }, [groupedGateways, channelClass?.id, depositFiat.method]);

  const currentProviderCount = useMemo(() => {
    return groupedGateways?.find((g) => g?.channel?.id === channelClass?.id)?.gateways?.length ?? 0;
  }, [groupedGateways, channelClass?.id]);

  // TODO: 初始化选中类别
  // TODO: 初始化选中通道
  useEffect(() => {
    const data = groupedGateways?.[0];
    const first = data?.gateways?.[0];
    setChannelClass(data?.channel);
    setDepositFiat({ method: first });
  }, [groupedGateways]);

  return (
    <div className="flex flex-col gap-2 relative">
      <div className="text-sm font-semibold text-base-content/50 flex items-center">
        {t("finance:depositMethod")}
      </div>

      {/* 一些法币需要做一下前置的提示给用户 */}
      <DepositFiatSelectAML />

      <SmallLoading
        className="h-[100px] !rounded-lg w-full"
        loading={isLoading || gatewaysLoading}
        content={groupedGateways.length > 0
          ? <div className={`bg-base-200 p-2 rounded-lg grid gap-1 ${groupedGateways.length > 2 ? "grid-cols-3" : "grid-cols-2"}`}>
            {groupedGateways.map((item: Record<string, any>) => {
              return <button
                key={item?.channel?.id}
                className={cn(
                  "flex-1 relative btn btn-md border-none text-base-content px-2 text-sm btn-primary",
                  item?.channel?.id === channelClass?.id ? "text-neutral" : "btn-soft"
                )}
                id={item?.channel?.id === channelClass?.id ? "target" : ""}
                onClick={async () => {
                  const gateway = item?.gateways?.[0]
                  setChannelClass(item?.channel);
                  setDepositFiat({ method: gateway });
                }}
              >
                <InnerProviderIcon
                  icon={item?.channel?.icon}
                  thumbnail={item?.channel?.thumbnail}
                  iconLight={item?.channel?.icon_light}
                  thumbnailLight={item?.channel?.thumbnail_light}
                />
                <span className="text-sm truncate">{item?.channel?.channel_class}</span>
              </button>;
            })}
          </div>
          : <NothingFound className={'static bg-base-200 h-[88px] rounded-lg'} text={t("finance:no_channel")} />}
      />

      {
        (groupedGateways?.find((g) => g?.channel?.id === channelClass?.id)?.gateways ?? [])?.length > 0 && <>
          <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-base-content/50">
            <span>{t("finance:paymentProviders")}</span>
            <span className="text-primary">
              {currentProviderCount}
            </span>
          </div>

          <div className="hide-scrollbar max-h-[100px] overflow-y-auto bg-base-200 p-2 rounded-lg">{memoProviders}</div>
        </>
      }
    </div>
  );
};
