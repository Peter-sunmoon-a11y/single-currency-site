import { searchParamsToObject } from "@/lib/navigation";
import { useSearchParams } from "next/navigation";
import { DepositType } from "@/components/modal/UserFinanceModal/c/DepositType.tsx";
import { useBoundStore } from "@/store";
import {
  useDepositCryptoCurrencySelectedFirstTime,
  useDepositFiatCurrencySelectedFirstTime
} from "@/components/modal/UserFinanceModal/helper.ts";
import { DisplayContent } from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";
import { lazy, PropsWithChildren, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { FinanceGuide } from "@/components/modal/UserFinanceModal/c/FinanceGuide.tsx";
import { useTranslation } from "@/lib/i18n/react-i18next";

// 懒加载部分Tab组件
const DepositFiat = lazy(() => import("./c/DepositFiat").then(module => ({ default: module.DepositFiat })));
const DepositCrypto = lazy(() => import("./c/DepositCrypto").then(module => ({ default: module.DepositCrypto })));

export const Deposit = ({ isModal = false }: { isModal?: boolean }) => {
  // initial default selected option
  useDepositFiatCurrencySelectedFirstTime();
  useDepositCryptoCurrencySelectedFirstTime();

  const { depositType, setDepositType } = useBoundStore();

  const searchSearchParams = useSearchParams();
  const search = searchParamsToObject(searchSearchParams);

  useEffect(() => {
    if (isModal) return;
    if (search.type === "crypto" || search.type === "fiat") setDepositType(search.type);
  }, [isModal, search.type, setDepositType]);

  return (
    <DepositGuard>
      <DepositType sticky={!isModal} />

      <DisplayContent status={depositType === "crypto"}>
        <DepositCrypto />
      </DisplayContent>

      <DisplayContent status={depositType === "fiat"}>
        <DepositFiat />
      </DisplayContent>
    </DepositGuard>
  );
};

const DepositGuard = ({ children }: PropsWithChildren) => {
  const { t } = useTranslation();
  // TODO: 个性引导
  const { user } = useAuth();

  if (!user) return <FinanceGuide type={t("common.deposit")} />;

  return children;
};
