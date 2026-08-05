import { LazySection } from "@/components/ui/LazySection";
import { localizeHref } from "@/lib/navigation";
import { usePaymentGatewayByUser, usePaymentIcons } from "@/query/casino";
import { useBoundStore } from "@/store";
import type { ICachePaymentIcons } from "@/types/game";
import { getImgCompressParams } from "@/utils/helper.ts";
import { StepForward } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export const AcceptCurrencies = () => {
  const t = useTranslations();
  const user = useBoundStore((state) => state.user);

  const { paymentGatewayByUser } = usePaymentGatewayByUser();
  const { paymentIcons } = usePaymentIcons();
  const router = useRouter();
  const paymentData = user ? paymentGatewayByUser : paymentIcons;
  const fiatIcons = getThemeAwareFiatIcons(paymentData, true);
  const cryptoIcons = user ? paymentGatewayByUser?.crypto_icons : paymentIcons?.crypto_icons;

  return (
    <LazySection>
      {/* 标题 */}
      <div className="flex items-center gap-3 mb-5">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/40 to-primary/40" />
        <p className="text-sm font-bold uppercase text-base-content/50 shrink-0">{t("casino.weAccept")}</p>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent via-primary/40 to-primary/40" />
      </div>

      <div className="bg-base-200 rounded-lg overflow-hidden">
        {/* 加密货币 */}
        {cryptoIcons?.length ? (
          <div
            className="flex items-center gap-2 p-4 cursor-pointer"
            onClick={() => router.push(localizeHref("/finance/deposit?type=crypto"))}
          >
            <span className="text-xs font-bold uppercase text-base-content/50 shrink-0">{t("finance.crypto")}</span>
            <div className="flex items-center -space-x-4">
              {cryptoIcons.map((item, index) => (
                <div key={index} className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                  <img src={getCryptoLocalIcon(item)} className="w-full h-full object-contain" />
                </div>
              ))}
            </div>
            <StepForward className="ml-auto shrink-0 fill-base-content/20 text-base-content/20 animate-pulse" size={20} />
          </div>
        ) : null}

        {/* 分割线 */}
        {cryptoIcons?.length && fiatIcons?.length ? <div className="mx-4 h-px bg-base-content/5" /> : null}

        {/* 法币 / 支付方式 */}
        {fiatIcons?.length ? (
          <div
            className="flex items-center gap-2 p-4 cursor-pointer"
            onClick={() => router.push(localizeHref("/finance/deposit?type=fiat"))}
          >
            <span className="text-xs font-bold uppercase text-base-content/50 shrink-0">{t("finance.fiat")}</span>
            <div className="grid grid-cols-4 gap-1">
              {fiatIcons.map((item, index) => (
                <div
                  key={index}
                  className="flex h-9 items-center justify-center overflow-hidden rounded-md bg-base-100 px-1"
                >
                  <img className="max-h-full max-w-full object-contain" src={getImgCompressParams(item)} />
                </div>
              ))}
            </div>
            <StepForward className="ml-auto shrink-0 fill-base-content/20 text-base-content/20 animate-pulse" size={20} />
          </div>
        ) : null}
      </div>
    </LazySection>
  );
};

const getCryptoLocalIcon = (url: string): string => {
  const name = (url.split("/").pop() ?? "").replace(/\.[^.]+$/, "").toLowerCase();
  return `/images/currency/${name}.png`;
};

const getThemeAwareFiatIcons = (paymentData: ICachePaymentIcons | undefined, useLightThemeIcons: boolean) => {
  if (!paymentData) return undefined;
  if (useLightThemeIcons && paymentData.fiat_icons_light?.length) {
    return paymentData.fiat_icons_light;
  }
  return paymentData.fiat_icons;
};
