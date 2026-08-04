import { AddressCard } from "@/components/modal/UserFinanceModal/c/AddressCard.tsx";
// import { CurrencyScrollBar } from "@/components/modal/UserFinanceModal/c/CurrencyScrollBar.tsx";
import { DepositCryptoSelect } from "@/components/modal/UserFinanceModal/c/DepositCryptoSelect.tsx";
import ExchangeRate from "@/components/modal/UserFinanceModal/c/ExchangeRate.tsx";
import { SpecialOffers } from "./SpecialOffers.tsx";
import { InnerSpecialOffersWrapper } from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";
import { TieredFirstDepositBanner } from "@/sections/finance/TieredFirstDepositBanner.tsx";

export const DepositCrypto = () => {
  return (
    <div className="flex flex-col gap-4">
      {/* <CurrencyScrollBar /> */}
      <DepositCryptoSelect />
      <AddressCard />
      <ExchangeRate />
      {/* 优惠充值活动 */}
      <InnerSpecialOffersWrapper>
        <SpecialOffers />
        {/* 终身的首存奖励 */}
        <TieredFirstDepositBanner />
      </InnerSpecialOffersWrapper>
    </div>
  );
};
