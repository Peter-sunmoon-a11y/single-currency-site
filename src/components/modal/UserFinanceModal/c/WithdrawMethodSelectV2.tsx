import { NoData } from "@/components/modal/UserFinanceModal/c/NoData.tsx";
import { cn } from "@/utils/cn.ts";
import { useToggle } from "@/hooks/useToggle";
import { ChevronDown } from "lucide-react";
import { useRef } from "react";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { useSupportedFiatWithdrawGatewaysV2 } from "@/components/modal/UserFinanceModal/helper.ts";
import clsx from "clsx";
import {
  InnerLoading,
  InnerPayment,
  InnerProviderIcon
} from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";
import { Modal } from "@/components/ui/Modal.tsx";

export const WithdrawMethodSelectV2 = (
  {
    title,
    currency,
    method,
    setMethod
  }: {
    title: string;
    currency: string;
    method: Record<string, any> | null;
    setMethod: (v: Record<string, any>) => void;
  }) => {
  const ref = useRef<HTMLDivElement>(null);

  const { t } = useTranslation();

  // 法币提款支持的网关
  const { data: gateways, isLoading } = useSupportedFiatWithdrawGatewaysV2(currency);

  const [status, { set }] = useToggle<boolean>(false);

  return (
    <div className="flex flex-col gap-2" ref={ref}>
      <div className="text-sm font-semibold text-base-content/50 flex items-center">{title}</div>
      <div className="relative">
        <button
          onClick={() => !isLoading && set(!status)}
          className={cn("btn bg-base-200 px-4 w-full")}
        >
          {isLoading ? (<InnerLoading />) : (
            <>
              <div className={"flex items-center gap-2 flex-1"}>
                <InnerProviderIcon
                  icon={method?.icon}
                  thumbnail={method?.thumbnail}
                  iconLight={method?.icon_light}
                  thumbnailLight={method?.thumbnail_light}
                />
                <p
                  className={clsx("truncate font-bold", method ? "text-base-content" : "text-base-content/50")}>
                  {method?.channel_class || t("finance:select")}
                </p>
              </div>
              <ChevronDown size={14} />
            </>
          )}
        </button>

        <Modal isOpen={status} onClose={() => set(false)}
               title={t("finance:paymentProviders")} position="modal-middle">
          <InnerProviderWrap set={set} method={method} setMethod={setMethod} gateways={gateways?.data ?? []} />
        </Modal>
      </div>
    </div>
  );
};

const InnerProviderWrap = ({ set, method, gateways, setMethod }: {
  set: (value: boolean) => void
  method: Record<string, any> | null;
  gateways: Record<string, any>,
  setMethod: (v: Record<string, any>) => void;
}) => {
  const { t } = useTranslation();
  return gateways.length === 0 ? (
    <NoData text={t("common.noData")} />
  ) : (
    <div className={clsx("grid grid-cols-2 gap-x-2 gap-y-2")}>
      {gateways.map((gateway: Record<string, any>, index: number) => (
        <InnerPayment
          key={index}
          method={method}
          gateway={gateway}
          onClick={() => {
            // 已选中的没必要再次选中触发事件
            if (method?.id === gateway?.id) return;
            setMethod({ provider: gateway });
            setTimeout(() => {
              set(false);
            }, 100);
          }}
        />
      ))}
    </div>
  );
};
