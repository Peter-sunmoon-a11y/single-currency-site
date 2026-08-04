import { NoData } from "@/components/modal/UserFinanceModal/c/NoData.tsx";
import { cn } from "@/utils/cn.ts";
import { useToggle } from "@/hooks/useToggle";
import { ChevronDown } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { useSupportedFiatWithdrawGatewaysV1 } from "@/components/modal/UserFinanceModal/helper.ts";
import clsx from "clsx";
import {
  InnerLoading,
  InnerPayment,
  InnerProviderIcon
} from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";
import { sleep } from "@/components/socialLogin/helper.ts";
import { Modal } from "@/components/ui/Modal.tsx";
import { useBoundStore } from "@/store";

export const WithdrawMethodSelectV1 = () => {
  const ref = useRef<HTMLDivElement>(null);

  const { t } = useTranslation();

  // from data store, share common data
  const { withdrawFiat, setWithdrawFiat } = useBoundStore();

  // 法币提款支持的网关
  const { data: gateways, isLoading } = useSupportedFiatWithdrawGatewaysV1(withdrawFiat.currency?.currency);

  const [status, { set }] = useToggle<boolean>(false);

  const memoProviders = useMemo(() => {
    const transform = gateways?.data ?? [];
    return transform.length === 0 ? (
      <NoData text={t("common.noData")} />
    ) : (
      <div className="grid grid-cols-2 gap-2">
        {transform.map((gateway: Record<string, any>, index: number) => (
          <InnerPayment
            key={index}
            method={withdrawFiat.method}
            gateway={gateway}
            onClick={async () => {
              // 已选中的没必要再次选中触发事件
              if (withdrawFiat.method?.id === gateway?.id) return;
              setWithdrawFiat({ method: gateway });

              await sleep(250);

              set(false);
            }}
          />
        ))}
      </div>
    );
  }, [gateways, status, withdrawFiat.method]);

  useEffect(() => {
    if (withdrawFiat.method) return;
    if (Array.isArray(gateways?.data) && gateways.data.length > 0) {
      setWithdrawFiat({ method: gateways.data[0] });
    }
  }, [gateways]);

  return (
    <div className="flex flex-col gap-2" ref={ref}>
      <p className="text-sm font-semibold text-base-content/50 flex items-center">{t("finance:withdrawalMethod")}</p>
      <div className="relative">
        <button
          onClick={() => !isLoading && set(!status)}
          className={cn("btn bg-base-200 px-4 w-full")}
        >
          {isLoading ? (<InnerLoading />) : (
            <>
              <div className={"flex items-center gap-2 flex-1"}>
                <InnerProviderIcon
                  icon={withdrawFiat.method?.icon}
                  thumbnail={withdrawFiat.method?.thumbnail}
                  iconLight={withdrawFiat.method?.icon_light}
                  thumbnailLight={withdrawFiat.method?.thumbnail_light}
                />
                <p
                  className={clsx("truncate font-bold", withdrawFiat.method ? "text-base-content" : "text-base-content/50")}>
                  {withdrawFiat.method?.display_name || t("finance:select")}
                </p>
              </div>
              <ChevronDown size={14} />
            </>
          )}
        </button>
      </div>

      <Modal isOpen={status} onClose={() => set(false)}
             title={t("finance:paymentProviders")} position="modal-middle">
        <div className="">{memoProviders}</div>
      </Modal>
    </div>
  );
};
