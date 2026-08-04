import { Modal } from "@/components/ui/Modal";
import { Trans, useTranslation } from "@/lib/i18n/react-i18next";
import { useBoundStore } from "@/store";
import { ICurrentPromo } from "@/types/double-or-nothing";
import { useCurrencyData } from "@/hooks/useCurrency";
import { useSupportedCurrencyV2Filter } from "@/components/modal/UserFinanceModal/helper.ts";
import { CountdownTimer } from "@/sections/dollars/CountdownTimer.tsx";
import { useAppNavigate } from "@/hooks/useAppNavigate";

export const BoostModal = ({ open, onClose, modalData }: {
  open: boolean;
  onClose: () => void;
  modalData: ICurrentPromo
}) => {

  const navigate = useAppNavigate();
  const { t } = useTranslation(["gameDetail", "bonus", "doubleOrNothing"]);// const { formatWithConversion } = useDisplayCurrencyFormatter();

  const user = useBoundStore((state) => state.user);

  const { convertCurrency, exchangeRates, formatCurrency } = useCurrencyData();

  const [, , currencies] = useSupportedCurrencyV2Filter("FIAT", "DEPOSIT");

  const MathCeilFun = (amount: number, currency: string) => {
    const currencyData = currencies.find((c: { value: string }) => c.value.toLowerCase() === currency.toLowerCase());
    if (currencyData) {
      return Math.ceil(amount);
    }
    return amount;
  };

  return (
    <Modal
      title={t("doubleOrNothing:recovery_bonus")}
      isOpen={open}
      onClose={onClose}
      position="modal-middle"
    >
      <div className="relative flex flex-col gap-4 items-center">
        {Number(modalData?.expired_at || 0) > 0 && <div className="absolute">
          <CountdownTimer expireTime={(modalData?.expired_at || 0)} />
        </div>}

        <img src="/images/double_nothing/nothing.png" alt="" className="w-60 animate-coin-pulse" />

        <p className="text-base-content text-base font-bold text-center">{t("doubleOrNothing:boost_your_balance")}</p>

        <div className="text-primary text-4xl font-bold text-center">
          {t("gameDetail:get", {
            value: `${(() => {
              const value =
                convertCurrency({
                  amount: modalData?.bonus_amount,
                  fromCurrency: "USDT",
                  toCurrency: user?.currency_fiat || "BUCK",
                  exchangeRates
                }) || 0;

              return formatCurrency({
                currency: user?.currency_fiat || "BUCK",
                amount: value,
                showCode: false,
                showSymbol: true
              }).formatted;
            })()}`
          })}
        </div>

        <p className="text-base-content text-sm font-bold text-center">
          <Trans
            i18nKey={"doubleOrNothing:if_you_deposit_of_or_more"}
            values={{
              amount: `${(() => {
                const value = convertCurrency({
                  amount: modalData?.min_amount || 0,
                  fromCurrency: "USDT",
                  toCurrency: user?.currency_fiat || "USDT",
                  exchangeRates: exchangeRates
                }) || 0;

                return formatCurrency({
                  currency: user?.currency_fiat || "USDT",
                  amount: MathCeilFun(value, user?.currency_fiat || "USD"),
                  showCode: false,
                  showSymbol: true
                }).formatted;
              })()
              }`
            }}
            components={[<span className={"text-primary"} />]}
          />
        </p>

        <button
          className="btn btn-primary"
          onClick={() => {
            onClose();
            void navigate({ to: "/finance" });
          }}>{t("bonus:gotIt")}</button>
      </div>
    </Modal>
  );
};