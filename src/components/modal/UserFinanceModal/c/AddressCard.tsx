import {
  useSupportedCryptoDepositGatewaysFilter
} from "@/components/modal/UserFinanceModal/helper.ts";
import Copy from "@/components/ui/Copy.tsx";
import { SignInToContinue } from "@/components/ui/SignInToContinue.tsx";
import { useBoundStore } from "@/store";
import { useCryptoDepositAddress } from "@/hooks/api/useAuth.ts";
import { cn } from "@/utils/cn.ts";
import { Trans, useTranslation } from "@/lib/i18n/react-i18next";
import { SmallLoading } from "./Loading.tsx";
import { TinyQR } from "@/components/modal/UserFinanceModal/c/QrCode.tsx";
import { Alert } from "@/components/icons/Alert.tsx";

export const AddressCard = () => {
  const isAuthenticated = useBoundStore((state) => !!state.user);

  const { depositCrypto } = useBoundStore();

  const { data: address, isLoading, error, refetch } = useCryptoDepositAddress(depositCrypto.network?.network);

  return (
    <div>
      <Address show={isAuthenticated && address?.code === 0} data={address?.data} />

      <SmallLoading loading={isAuthenticated && isLoading} content={null} className="h-[120px]" />

      <GoSignIn show={!isAuthenticated} />

      <GotError func={refetch} show={isAuthenticated && (!!error || address?.code === 1)} />

      <NoAddress show={!!(address && address?.data?.address?.length === 0) && !isLoading} />
    </div>
  );
};

const Address = ({ show, data }: { show: boolean; data: Record<string, any> }) => {
  return (
    show && (
      <div className="rounded-lg p-4 bg-base-200 font-semibold flex flex-col gap-2">
        <MinAmount />
        <div className="flex items-center gap-2 text-base-content/50">
          <TinyQR
            value={data?.address}
            size={80}
            color="#000"
            bgColor="#f3f4f6"
            level="M"
          />
          <h2
            className={cn("p-2 rounded-md bg-base-100 flex-1 text-sm break-all flex items-center gap-2")}>
            {data?.address}
            <Copy text={data?.address} />
          </h2>
        </div>
      </div>
    )
  );
};
const GotError = ({ show, func }: { show: boolean; func: () => void }) => {
  const { t } = useTranslation();
  return (
    show && (
      <div
        className="rounded-lg h-[120px] p-4 bg-base-200 items-center justify-center flex flex-col text-xs font-semibold">
        <p className="text-error">{t("finance:failedToGetDepositAddress")}</p>
        <button className="btn btn-xs btn-soft mt-2" onClick={() => func()}>
          {t("finance:retry")}
        </button>
      </div>
    )
  );
};
const NoAddress = ({ show }: { show: boolean }) => {
  const { t } = useTranslation();
  return (
    show && (
      <div
        className="rounded-lg h-[120px] p-4 bg-base-200 items-center justify-center flex flex-col text-sm font-semibold">
        <p className="text-base-content/50">{t("finance:noDepositAddressAvailable")}</p>
      </div>
    )
  );
};
const GoSignIn = ({ show }: { show: boolean }) => {
  return (
    show && (
      <div className="flex flex-col gap-4">
        <div className="rounded-lg p-4 bg-base-300 text-center text-xs text-base-content/50 font-semibold">
          <Trans i18nKey="finance:pleaseLoginToViewDepositAddress"
                 components={[<u className="text-primary" />, <u />]} />
        </div>
        <SignInToContinue />
      </div>
    )
  );
};
const MinAmount = () => {
  const { t } = useTranslation();

  const { depositCrypto, openModal } = useBoundStore();

  const [isGatewaysLoading] = useSupportedCryptoDepositGatewaysFilter(depositCrypto.currency?.currency);

  return (
    <div className="flex items-center justify-between text-sm text-base-content/50 font-bold">
      <p>
        <span className="text-primary text-base">{depositCrypto.network?.network}</span>
      </p>
      <SmallLoading
        loading={isGatewaysLoading}
        content={
          <button
            className="flex items-center gap-1 bg-warning/15 text-warning px-1.5 py-1 rounded-sm"
            onClick={() => openModal("OPEN_DEPOSIT_MIN_AMOUNT_MODAL")}
          >
            <Alert className="w-4 h-4 shrink-0" />
            <span className="text-sm font-normal">
              {t("finance:min")} {depositCrypto.network?.min ?? "?"} {depositCrypto.currency?.currency}
            </span>
          </button>
        }
      />
    </div>
  );
};
