import { usePaymentGatewayByUser, usePaymentIcons } from "@/query/casino.ts";
import { useAuth } from "@/contexts/AuthContext";
import { useBoundStore } from "@/store";
import { GuestGuide } from "@/components/standard/GuestGuide";
import { useTranslation } from "@/lib/i18n/react-i18next";

export const FinanceGuide = ({ type }: { type: string }) => {
  const { t } = useTranslation("finance");
  const { user } = useAuth();
  const { paymentIcons } = usePaymentIcons();
  const { paymentGatewayByUser } = usePaymentGatewayByUser();
  const { openModal } = useBoundStore();

  const cryptoIcons = user ? paymentGatewayByUser?.crypto_icons : paymentIcons?.crypto_icons;

  return (
    <GuestGuide
      images={cryptoIcons ?? []}
      label={`${type} - ${t("sign_in_to_continue")}`}
      onAction={() => openModal("OPEN_AUTH_MODAL", { initialTab: "sign-up" })}
    />
  );
};
