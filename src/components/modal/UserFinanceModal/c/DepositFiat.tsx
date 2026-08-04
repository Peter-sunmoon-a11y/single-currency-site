import { DepositFiatForm } from "@/components/modal/UserFinanceModal/c/DepositFiatForm.tsx";
import { useMemo } from "react";
import { useBoundStore } from "@/store";
import { SpecialOffers } from "./SpecialOffers.tsx";
import {
  InnerDepositProviderError,
  InnerSpecialOffersWrapper
} from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";
import { DepositFiatSelect } from "@/components/modal/UserFinanceModal/c/Case.tsx";
import { TieredFirstDepositBanner } from "@/sections/finance/TieredFirstDepositBanner.tsx";

export const DepositFiat = () => {
  // from data store, share common data
  const { depositFiat } = useBoundStore();

  // 供应商不可用错误
  const provider_error = useMemo(() => {
    if (depositFiat.method) return depositFiat.method?.status === 0;
  }, [depositFiat.method]);

  return (
    <div className="relative flex flex-col gap-4">
      {/* 币种和通道选择 */}
      <DepositFiatSelect />

      {/* 通道在维护 */}
      <InnerDepositProviderError show={Boolean(provider_error)} channel={depositFiat.method?.display_name} />

      {/* 动态表单 */}
      <DepositFiatForm extraNode={
        <>
          <InnerSpecialOffersWrapper>
            <SpecialOffers />
          </InnerSpecialOffersWrapper>
          <TieredFirstDepositBanner />
        </>}
      />
    </div>
  );
};
