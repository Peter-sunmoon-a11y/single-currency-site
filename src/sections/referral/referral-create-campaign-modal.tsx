import React, { useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useCreateAdTag, useSetDefaultAdTag } from "@/hooks/api/useAuth";
import { cn } from "@/utils/cn";
import { useTranslation } from "@/lib/i18n/react-i18next";
import Copy from "@/components/ui/Copy";
import { toast } from "sonner";
import { AdTag } from "@/types/referral";
import { useReferralLink } from "@/hooks/useReferralLink.ts";
import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { TextBaseContent } from "@/components/standard/TextBaseContent.tsx";
import clsx from "clsx";

type CreateCampaignModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
  compaignDetail?: AdTag | null;
};

const COMMISSION_OPTIONS = [0, 10, 25, 50];

const generateCode = () => Math.random().toString(36).slice(2, 8).toUpperCase();

export const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({
                                                                          isOpen,
                                                                          onClose,
                                                                          onCreated,
                                                                          compaignDetail
                                                                        }) => {
  const { t } = useTranslation(["referral", "common"]);
  const createCampaign = useCreateAdTag();
  const setDefaultCampaign = useSetDefaultAdTag();
  const [commissionSplit, setCommissionSplit] = useState<number>(0);
  const [campaignName, setCampaignName] = useState("");
  const [referralCode, setReferralCode] = useState(generateCode());
  const [isDefaultCampaign, setIsDefaultCampaign] = useState(false);

  const { refetchAdTagData } = useReferralLink();

  useEffect(() => {
    if (isOpen) {
      if (compaignDetail) {
        setCommissionSplit(parseInt(compaignDetail.share_to_referee || "0"));
        setCampaignName(compaignDetail.campaign);
        setReferralCode(compaignDetail.code);
        setIsDefaultCampaign(compaignDetail.is_default || false);
      } else {
        setCommissionSplit(0);
        setCampaignName("");
        setReferralCode(generateCode());
        setIsDefaultCampaign(false);
      }
    }
  }, [isOpen, compaignDetail]);

  const { youReceive, referralReceive } = useMemo(() => {
    const referral = commissionSplit;
    return {
      youReceive: Math.max(0, 100 - referral),
      referralReceive: referral
    };
  }, [commissionSplit]);

  const { referralLink } = useReferralLink(referralCode);

  const handleGenerateCode = () => {
    setReferralCode(generateCode());
  };

  const handleClose = () => {
    if (!createCampaign.isPending) {
      onClose();
    }
  };

  const handleCreateCampaign = async () => {
    if (createCampaign.isPending) return;
    if (!campaignName.trim() || !referralCode.trim()) return;

    if (referralCode.trim().length < 6) {
      toast.error(t("referral:referralCodeMinLength", "Referral code must be at least 6 characters long"));
      return;
    }

    try {
      await createCampaign.mutateAsync({
        campaign: campaignName.trim(),
        code: referralCode.trim().toUpperCase(),
        is_default: isDefaultCampaign,
        share: commissionSplit.toString()
      });
      onCreated?.();
      onClose();
    } catch (error) {

    }
  };

  const handleSetDefaultCampaign = async () => {
    if (setDefaultCampaign.isPending) return;
    if (!compaignDetail) return;
    try {
      await setDefaultCampaign.mutateAsync({
        id: compaignDetail?.id || "",
        campaign: compaignDetail.campaign,
        code: compaignDetail.code,
        is_default: isDefaultCampaign,
        share: compaignDetail.share_to_referee
      });
      onClose();
    } catch (error) {
      // toast handled by hook
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (compaignDetail) {
      await handleSetDefaultCampaign();

      void refetchAdTagData();
    } else {
      await handleCreateCampaign();
    }
  };

  const isSubmitDisabled =
    !campaignName.trim() ||
    !referralCode.trim() ||
    createCampaign.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      position="modal-middle"
      title={t("referral:campaignInformation")}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-base-200 p-2 flex flex-col">
            <span className="text-xs text-base-content/50">
              {t("referral:youReceive", "You Receive")}
            </span>
            <span className="text-base font-bold text-primary">{youReceive}%</span>
          </div>
          <div className="rounded-lg bg-base-200 p-2 flex flex-col">
            <span className="text-xs text-base-content/50">
              {t("transaction:transactionTypes.referral", "Referral")}
            </span>
            <span className="text-base font-bold text-primary">{referralReceive}%</span>
          </div>
        </div>

        {
          !compaignDetail && (
            <div className="space-y-2">
              <TextBaseContent className={"text-xs"} text={t("referral:commissionSplit")} />

              <div className="grid grid-cols-4 gap-2">
                {COMMISSION_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setCommissionSplit(option)}
                    className={cn(
                      "btn btn-sm",
                      commissionSplit === option && "btn-primary"
                    )}
                  >
                    {option}%
                  </button>
                ))}
              </div>
            </div>
          )
        }

        <div className="space-y-2">
          <TextBaseContent className={"text-xs"} text={t("referral:campaignName")} />
          <label className="w-full input h-10 border-none flex items-center pr-1 bg-base-200">
            <input
              id="campaign-name"
              type="text"
              placeholder={t("referral:enterCampaignName", "Campaign name")}
              value={campaignName}
              onChange={(event) => setCampaignName(event.target.value)}
              maxLength={40}
              disabled={!!compaignDetail}
            />
          </label>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <TextBaseContent className={"text-xs"} text={t("referral:referralCode")} />
            {
              !compaignDetail && (
                <button
                  type="button"
                  onClick={handleGenerateCode}
                  className="btn btn-xs btn-primary btn-soft"
                >
                  {t("common:generate", "Generate")}
                </button>
              )
            }
          </div>

          <div className="w-full input h-10 border-none flex items-center pr-1 bg-base-200">
            <input
              id="referral-code"
              type="text"
              value={referralCode}
              onChange={(event) => setReferralCode(event.target.value.toUpperCase())}
              minLength={6}
              maxLength={12}
              disabled={!!compaignDetail}
            />
            <Copy text={referralCode} />
          </div>
        </div>

        <div className="space-y-2">
          <TextBaseContent className={"text-xs"} text={t("referral:referralLink", "Referral Link")} />

          <div className={clsx("w-full input h-10 border-none flex items-center pr-1 bg-base-200")}>
            <div className="flex items-center h-full flex-1 min-w-0 overflow-x-auto hide-scrollbar">
              <TextBaseContent text={referralLink} className={"!whitespace-nowrap"} />
            </div>
            <Copy text={referralLink} />
          </div>
        </div>

        <label className="flex items-center gap-2 text-xs text-base-content/50">
          <input
            type="checkbox"
            className="checkbox checkbox-xs checkbox-primary rounded-sm"
            checked={isDefaultCampaign}
            onChange={(event) => setIsDefaultCampaign(event.target.checked)}
          />
          <span>{t("referral:setAsDefaultCampaign")}</span>
        </label>

        <ConfirmBox type="submit" loading={createCampaign.isPending} disabled={isSubmitDisabled}>
          {(compaignDetail ? t("common:common.save") : t("referral:createNewCampaign", "Create Campaign"))}
        </ConfirmBox>
      </form>
    </Modal>
  );
};
