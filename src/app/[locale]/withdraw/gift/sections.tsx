import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { ErrorMessageBox } from "@/components/modal/UserFinanceModal/c/ErrorMessageBox.tsx";
import FormatAmount from "@/components/modal/UserFinanceModal/c/FormatAmount";
import {
  FormBox, InnerFieldItem, InnerOptions,
  InputBox
} from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";
import { RequireItem } from "@/components/modal/UserFinanceModal/c/RequireItem.tsx";
import { SelectDropdown, type SelectOption } from "@/components/modal/UserFinanceModal/c/SelectDropdown.tsx";
import { TextBaseContent } from "@/components/standard/TextBaseContent.tsx";
import { NothingFound } from "@/components/ui/NothingFound.tsx";
import { Modal } from "@/components/ui/Modal.tsx";
import clsx from "clsx";
import Decimal from "decimal.js";
import { Gift } from "lucide-react";

export const GiftLoadingState = () => (
  <div className="flex items-center justify-center h-full">
    <div className="animate-gift-shake flex items-center justify-center">
      <Gift className="h-2 w-2 text-success" />
      <Gift className="h-4 w-4 text-success" />
      <Gift className="h-6 w-6 text-success" />
      <Gift className="h-8 w-8 text-success" />
      <Gift className="h-10 w-10 text-success" />
      <Gift className="h-12 w-12 text-success" />
      <Gift className="h-14 w-14 text-success" />
    </div>
  </div>
);

export const GiftEmptyState = ({ text }: { text: string }) => (
  <NothingFound
    className="p-10 text-center"
    icon={<Gift className="h-10 w-10 text-error" />}
    text={text}
  />
);

export const GiftHero = ({
                           title,
                           description,
                           notice
                         }: {
  title: string;
  description: string;
  notice: string;
}) => (
  <div className="relative overflow-hidden rounded-lg bg-base-200 p-4 flex flex-col gap-2">
    <h1 className="text-center text-base font-bold text-base-content flex items-center gap-1">
      <Gift className="h-5 w-5 text-success" />{title}
    </h1>
    <TextBaseContent text={description} />
    <TextBaseContent text={notice} />
  </div>
);

export const GiftAmountCard = ({
                                 currencyIcon,
                                 currency,
                                 amount,
                                 badge,
                                 broken = false
                               }: {
  currencyIcon?: string;
  currency: string;
  amount: string;
  badge: string;
  broken?: boolean;
}) => (
  <div
    className={clsx(
      "relative overflow-hidden rounded-lg bg-base-200 px-4 py-2",
    )}
  >
    {broken ? (
      <>
        <div
          aria-hidden
          className="absolute inset-y-0 left-0 w-[52%] bg-base-200/80 -translate-x-1 -rotate-1"
        />
        <div
          aria-hidden
          className="absolute inset-y-0 right-0 w-[52%] bg-base-200/80 translate-x-1 rotate-1"
        />
        <svg
          aria-hidden
          viewBox="0 0 36 120"
          preserveAspectRatio="none"
          className="pointer-events-none absolute left-1/2 top-0 z-10 h-full w-9 -translate-x-1/2 text-error drop-shadow-[0_0_6px_color-mix(in_oklab,var(--color-error)_45%,transparent)]"
        >
          <path
            d="M18 0 L10 18 L23 34 L13 52 L24 70 L11 90 L19 120"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16 31 L4 42 M21 67 L34 78 M13 91 L3 105"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <span aria-hidden className="absolute left-[42%] top-3 z-10 h-1.5 w-1.5 rotate-45 bg-error/70" />
        <span aria-hidden className="absolute left-[58%] bottom-4 z-10 h-2 w-2 rotate-12 bg-error/50" />
      </>
    ) : null}

    <div className={clsx("relative z-20 flex items-center justify-between gap-4", broken && "scale-[0.98]")}>
      <div className="flex min-w-0 items-center gap-2">
        {currencyIcon ? <img src={currencyIcon} alt="" className="h-7 w-7 rounded-full" /> :
          <div className="h-9 w-9 rounded-full bg-base-100" />}
        <div className="min-w-0">
          <p className={clsx("text-xs text-success")}>{badge}</p>
          <p className="truncate text-sm font-bold text-base-content">{currency}</p>
        </div>
      </div>
      <div className="text-right">
        <div className={clsx("text-lg font-bold text-success")}>
          <FormatAmount amount={amount} local />
        </div>
      </div>
    </div>
  </div>
);

export const GiftCryptoFields = ({
                                   selectedNetwork,
                                   networkOptions,
                                   onNetworkChange,
                                   walletAddress,
                                   onWalletAddressChange,
                                   cryptoAddressError,
                                   comment,
                                   onCommentChange,
                                   t
                                 }: {
  selectedNetwork: string;
  networkOptions: SelectOption[];
  onNetworkChange: (value: string) => void;
  walletAddress: string;
  onWalletAddressChange: (value: string) => void;
  cryptoAddressError: string;
  comment: string;
  onCommentChange: (value: string) => void;
  t: (key: string, options?: Record<string, any>) => string;
}) => (
  <>
    <FormBox label={t("finance:withdrawalNetwork")}>
      <SelectDropdown
        title={t("finance:withdrawalNetwork")}
        value={selectedNetwork}
        options={networkOptions}
        onChange={(value) => onNetworkChange(String(value))}
      />
    </FormBox>

    <InputBox
      ignore
      type="text"
      label={<RequireItem label={t("finance:address")} required />}
      value={walletAddress}
      onChange={(event) => onWalletAddressChange(event.target.value)}
      placeholder={t("finance:address")}
    />
    <ErrorMessageBox className="!mt-[-12px]" show={Boolean(cryptoAddressError)} content={cryptoAddressError} />

    {selectedNetwork === "TON" ? (
      <InputBox
        ignore
        type="text"
        label={t("finance:withdrawalComment")}
        value={comment}
        onChange={(event) => onCommentChange(event.target.value)}
        placeholder={t("finance:withdrawalComment")}
      />
    ) : null}
  </>
);

export const GiftFiatFieldList = (
  {
    selectedChannel,
    onChannelChange,
    channelOptions,
    channelUnavailable,
    visibleFiatFields,
    fiatFieldErrors,
    onFieldChange,
    t
  }: {
    selectedChannel: string;
    onChannelChange: (value: string) => void;
    channelOptions: SelectOption[];
    channelUnavailable: boolean;
    visibleFiatFields: [string, Record<string, any>][];
    fiatFieldErrors: Record<string, string>;
    onFieldChange: (key: string, value: string | Record<string, any>) => void;
    t: (key: string, options?: Record<string, any>) => string;
  }) => (
  <>
    <FormBox label={t("finance:withdrawalMethod")}>
      <SelectDropdown
        title={t("finance:withdrawalMethod")}
        value={selectedChannel}
        options={channelOptions}
        onChange={(value) => onChannelChange(String(value))}
      />
    </FormBox>

    {channelUnavailable ? (
      <div className="rounded-lg bg-error/10 p-2 text-sm text-error">
        {t("finance:giftWithdrawChannelUnavailable")}
      </div>
    ) : null}

    {visibleFiatFields.map(([key, field]) => {
      const fieldKey = `${selectedChannel}_${key}`;

      if (Array.isArray(field.select)) {
        return (
          <div key={fieldKey}>
            <InnerOptions
              name={key}
              field={field}
              onChange={(nextValue) => onFieldChange(key, nextValue)}
            />
            <ErrorMessageBox className="!mt-[-12px]" show={Boolean(fiatFieldErrors[key])} content={fiatFieldErrors[key]} />
          </div>
        );
      }

      return (
        <InnerFieldItem
          key={fieldKey}
          name={key}
          field={field}
          onChange={(event) => onFieldChange(key, event)}
        />
      );
    })}
  </>
);

export const GiftSummaryAction = (
  {
    amount,
    currency,
    feeRate,
    feeFix,
    sticky,
    loading,
    disabled,
    onClick,
    confirmText,
    t
  }: {
    amount: string;
    currency: string;
    feeRate: string;
    feeFix: string;
    sticky: boolean;
    loading: boolean;
    disabled: boolean;
    onClick: () => void;
    confirmText: string;
    t: (key: string) => string;
  }) => {
  const totalWithdrawAmount = Decimal(amount || 0);
  const withdrawalFee = totalWithdrawAmount.times(feeRate || 0).plus(feeFix || 0);
  const withdrawAmount = Decimal.max(totalWithdrawAmount.sub(withdrawalFee), 0);

  return (
    <div className={clsx("w-full z-1", sticky && "sticky bottom-1")}>
      <div className="mb-1 rounded-lg bg-base-200 px-2 divide-y divide-dashed divide-base-content/20">
        <div className="flex items-center justify-between py-2">
          <span className="text-sm font-semibold text-base-content/50">{t("finance:withdrawAmount")}</span>
          <span className="flex items-center gap-1 text-sm font-bold text-base-content">
            <FormatAmount amount={withdrawAmount.toString()} local /> {currency}
          </span>
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-sm font-semibold text-base-content/50">{t("finance:fee")}</span>
          <span className="flex items-center gap-1 text-sm font-bold text-base-content">
            <FormatAmount amount={withdrawalFee.toString()} local /> {currency}
            {Decimal(feeRate || 0).gt(0) ? (
              <span className="text-[10px] text-base-content/50">
                {`(${Decimal(feeRate).times(100).toString()}% + ${feeFix || 0})`}
              </span>
            ) : null}
          </span>
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-sm font-semibold text-base-content/50">{t("finance:totalWithdrawAmount")}</span>
          <span className="flex items-center gap-1 text-sm font-bold text-base-content">
            <FormatAmount amount={totalWithdrawAmount.toString()} local /> {currency}
          </span>
        </div>
      </div>

      <ConfirmBox disabled={disabled} loading={loading} onClick={onClick}>
        {confirmText}
      </ConfirmBox>
    </div>
  );
};

export const GiftConfirmModal = ({
                                   open,
                                   title,
                                   description,
                                   loading,
                                   onClose,
                                   onConfirm,
                                   cancelText,
                                   confirmText
                                 }: {
  open: boolean;
  title: string;
  description: string;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
  cancelText: string;
  confirmText: string;
}) => (
  <Modal isOpen={open} onClose={onClose} title={title} position="modal-middle">
    <div className="flex flex-col gap-4">
      <p className="text-sm font-semibold leading-5 text-base-content/50">{description}</p>
      <div className="flex items-center gap-2">
        <ConfirmBox type="button" className="w-auto flex-1 btn-soft" onClick={onClose}>
          {cancelText}
        </ConfirmBox>
        <ConfirmBox type="button" className="w-auto flex-1" loading={loading} onClick={onConfirm}>
          {confirmText}
        </ConfirmBox>
      </div>
    </div>
  </Modal>
);
