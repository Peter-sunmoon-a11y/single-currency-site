"use client";

import type { SelectOption } from "@/components/modal/UserFinanceModal/c/SelectDropdown.tsx";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { getUserWithdrawGiftDetail } from "@/services/auth/wallet";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import {
  CLAIM_KEY_REGEXP,
  normalizeGiftDetail,
  resolveAssetIcon
} from "./shared.ts";
import {
  GiftAmountCard,
  GiftConfirmModal,
  GiftCryptoFields,
  GiftEmptyState,
  GiftFiatFieldList,
  GiftHero,
  GiftLoadingState,
  GiftSummaryAction
} from "./sections.tsx";
import { useGiftWithdraw } from "./useGiftWithdraw.ts";

export const beforeLoad = undefined;

function GiftWithdrawPage() {
  const { t } = useTranslation(["finance", "common", "toast"]);
  const { user, isLoading: isAuthLoading } = useAuth();

  const searchParams = useSearchParams();
  const claimKey = searchParams.get("claim_key")?.trim().toLowerCase() ?? "";
  const hasValidClaimKey = CLAIM_KEY_REGEXP.test(claimKey);

  const detailQuery = useQuery({
    queryKey: ["withdrawGiftDetail", claimKey],
    queryFn: () => getUserWithdrawGiftDetail(claimKey),
    enabled: !!user && hasValidClaimKey
  });

  const detail = useMemo(() => {
    if (!detailQuery.data?.data) return null;
    return normalizeGiftDetail(detailQuery.data);
  }, [detailQuery.data]);

  const {
    selectedNetwork,
    setSelectedNetwork,
    walletAddress,
    setWalletAddress,
    comment,
    setComment,
    selectedChannel,
    setSelectedChannel,
    updateFiatField,
    confirmOpen,
    setConfirmOpen,
    viewportHeight,
    activeChannel,
    selectedNetworkConfig,
    visibleFiatFields,
    cryptoAddressError,
    fiatFieldErrors,
    submitDisabled,
    submitMutation
  } = useGiftWithdraw({
    claimKey,
    detail,
    onSubmitted: detailQuery.refetch,
    t
  });

  if (detailQuery.isLoading || isAuthLoading) {
    return <GiftLoadingState />;
  }

  if (detailQuery.isError || !detail) {
    return <GiftEmptyState text={t("finance:giftWithdrawExpired")} />;
  }

  const networkOptions: SelectOption[] = detail.networks.map((item) => ({
    id: item.id,
    value: item.value,
    label: item.label,
    icon: item.icon
  }));

  const channelOptions: SelectOption[] = detail.channels.map((item) => ({
    id: item.id,
    value: item.value,
    label: item.label
  }));

  const currencyIcon = resolveAssetIcon(detail.currency);

  const descriptionKey = detail.type === "fiat"
    ? "finance:giftWithdrawDescriptionFiat"
    : "finance:giftWithdrawDescriptionCrypto";
  const isCancelled = detail.status === "cancelled";
  console.info(activeChannel);
  return (
    <section className="flex flex-col gap-4 p-4">
      <GiftHero
        title={t("finance:giftWithdrawTitle")}
        description={t(descriptionKey)}
        notice={t("finance:giftWithdrawRiskNotice")}
      />

      <div className="flex flex-col gap-4">
        <GiftAmountCard
          currencyIcon={currencyIcon}
          currency={detail.currency}
          amount={detail.amount}
          badge={t("finance:giftWithdrawBadge")}
          broken={isCancelled}
        />

        {isCancelled ? null : (
          <>
            {detail.type === "crypto" ? (
              <GiftCryptoFields
                selectedNetwork={selectedNetwork}
                networkOptions={networkOptions}
                onNetworkChange={setSelectedNetwork}
                walletAddress={walletAddress}
                onWalletAddressChange={setWalletAddress}
                cryptoAddressError={cryptoAddressError}
                comment={comment}
                onCommentChange={setComment}
                t={t}
              />
            ) : (
              <GiftFiatFieldList
                selectedChannel={selectedChannel}
                onChannelChange={setSelectedChannel}
                channelOptions={channelOptions}
                channelUnavailable={Boolean(activeChannel?.disabled)}
                visibleFiatFields={visibleFiatFields as [string, Record<string, any>][]}
                fiatFieldErrors={fiatFieldErrors}
                onFieldChange={updateFiatField}
                t={t}
              />
            )}

            <GiftSummaryAction
              amount={detail.amount}
              currency={detail.currency}
              sticky={viewportHeight >= 700}
              loading={submitMutation.isPending}
              disabled={submitDisabled || submitMutation.isPending}
              feeRate={detail.type === "crypto" ? selectedNetworkConfig?.feeRate ?? "0" : activeChannel?.feeRate ?? "0"}
              feeFix={detail.type === "crypto" ? selectedNetworkConfig?.feeFix ?? "0" : activeChannel?.feeFix ?? "0"}
              onClick={() => {
                if (submitDisabled) return;
                setConfirmOpen(true);
              }}
              confirmText={t("finance:giftWithdrawConfirm")}
              t={t}
            />
          </>
        )}
      </div>

      {!isCancelled ? (
        <GiftConfirmModal
          open={confirmOpen}
          title={t("finance:giftWithdrawConfirm")}
          description={t("finance:double_check")}
          loading={submitMutation.isPending}
          onClose={() => setConfirmOpen(false)}
          onConfirm={() => {
            setConfirmOpen(false);
            submitMutation.mutate();
          }}
          cancelText={t("common:common.cancel")}
          confirmText={t("common:common.confirm")}
        />
      ) : null}
    </section>
  );
}

export default GiftWithdrawPage;
