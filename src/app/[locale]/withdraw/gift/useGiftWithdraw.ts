import { validateAddress } from "@/components/modal/UserFinanceModal/helper.ts";
import { submitUserWithdrawGift } from "@/services/auth/wallet";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { buildInfoDefaults, getFieldError, type GiftDetail } from "./shared.ts";

const isFieldError = (value: unknown) => value === true || value === "true";

type FiatGiftForm = {
  formItem: Record<string, string>;
  [key: `${string}_error`]: boolean | string | undefined;
};

export function useGiftWithdraw({
  claimKey,
  detail,
  onSubmitted,
  t
}: {
  claimKey: string;
  detail: GiftDetail | null;
  onSubmitted: () => Promise<unknown>;
  t: (key: string, options?: Record<string, any>) => string;
}) {
  const [selectedNetwork, setSelectedNetwork] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [comment, setComment] = useState("");
  const [selectedChannel, setSelectedChannel] = useState("");
  const [fiatForm, setFiatForm] = useState<FiatGiftForm>({ formItem: {} });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [viewportHeight, setViewportHeight] = useState<number>(window.visualViewport?.height || window.innerHeight);

  useEffect(() => {
    if (!detail) return;

    if (detail.type === "crypto") {
      setSelectedNetwork((current) => current || detail.networks[0]?.value || "");
      return;
    }

    const firstChannel = detail.channels[0];
    if (!firstChannel) return;

    setSelectedChannel((current) => current || firstChannel.value);
  }, [detail]);
  console.info(detail);
  const activeChannel = useMemo(
    () => detail?.channels.find((item) => item.value === selectedChannel) ?? detail?.channels[0] ?? null,
    [detail?.channels, selectedChannel]
  );

  const selectedNetworkConfig = useMemo(
    () => detail?.networks.find((item) => item.value === selectedNetwork) ?? detail?.networks[0] ?? null,
    [detail?.networks, selectedNetwork]
  );

  useEffect(() => {
    if (!activeChannel) return;
    setFiatForm({ formItem: buildInfoDefaults(activeChannel.params, activeChannel.raw) });
  }, [activeChannel?.id, activeChannel?.value, activeChannel?.params, activeChannel?.raw]);

  const updateFiatField = useCallback((key: string, value: string | Record<string, any>) => {
    if (typeof value === "object" && value !== null) {
      setFiatForm((current) => ({
        ...current,
        formItem: {
          ...current.formItem,
          [key]: String(value.value ?? "")
        },
        [`${key}_error`]: value[`${key}_error`]
      }));
      return;
    }

    setFiatForm((current) => ({
      ...current,
      formItem: {
        ...current.formItem,
        [key]: value
      }
    }));
  }, []);

  useEffect(() => {
    if (!window.visualViewport) return;

    const handleResize = () => {
      setViewportHeight(window.visualViewport!.height);
    };

    window.visualViewport.addEventListener("resize", handleResize);
    return () => window.visualViewport?.removeEventListener("resize", handleResize);
  }, []);

  const visibleFiatFields = useMemo(() => {
    if (!activeChannel) return [];

    return Object.entries(activeChannel.params).filter(([key, field]) => {
      if (key === "amount" || !field || typeof field !== "object") return false;
      return !(field.bind || field.hide);
    });
  }, [activeChannel]);


  const cryptoAddressError = useMemo(() => {
    if (!walletAddress.trim()) return "";
    if (!selectedNetwork) return "";
    return validateAddress(selectedNetwork, walletAddress.trim()) ? "" : t("finance:address_failed_validation");
  }, [selectedNetwork, t, walletAddress]);

  const fiatFieldErrors = useMemo(() => {
    if (!activeChannel) return {};

    return Object.fromEntries(
      visibleFiatFields.map(([key, field]) => {
        const explicitError = fiatForm[`${key}_error`];
        const error = getFieldError(field, fiatForm.formItem[key] ?? "", t);
        return [key, isFieldError(explicitError) ? error || t("finance:field_required") : error];
      })
    );
  }, [activeChannel, fiatForm, t, visibleFiatFields]);

  const status = detail?.status ?? "available";
  const isTerminal = status !== "available";

  const submitDisabled = useMemo(() => {
    if (!detail || isTerminal) return true;

    if (detail.type === "crypto") {
      return !selectedNetwork || !walletAddress.trim() || Boolean(cryptoAddressError);
    }

    if (!activeChannel || activeChannel.disabled) return true;
    return visibleFiatFields.some(([key, field]) => {
      const value = fiatForm.formItem[key] ?? "";
      return isFieldError(fiatForm[`${key}_error`]) || Boolean(getFieldError(field, value, t));
    });
  }, [activeChannel, cryptoAddressError, detail, fiatForm, isTerminal, selectedNetwork, t, visibleFiatFields, walletAddress]);

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!detail) throw new Error("Missing detail");

      if (detail.type === "crypto") {
        return submitUserWithdrawGift({
          type: "crypto",
          claim_key: claimKey,
          network: selectedNetwork,
          wallet_address: walletAddress.trim(),
          comment: comment.trim()
        });
      }

      const payload: Record<string, any> = {
        type: detail.type,
        claim_key: claimKey,
        info: fiatForm.formItem
      };

      if (activeChannel?.channelClass) payload.channel_class = activeChannel.channelClass;
      if (activeChannel?.channelId && !payload.channel_class) payload.channel_id = activeChannel.channelId;

      return submitUserWithdrawGift(payload);
    },
    onSuccess: async (response) => {
      if (response.code === 0 || response.code === 200) {
        toast.success(t("finance:giftWithdrawSuccess"));
        await onSubmitted();
        return;
      }

      toast.error(response.msg || t("toast:failedToCreateWithdrawalOrder"));

      if (response.code === 40022) {
        await onSubmitted();
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || t("toast:failedToCreateWithdrawalOrder"));
    }
  });

  return {
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
    isTerminal,
    submitDisabled,
    submitMutation
  };
}
