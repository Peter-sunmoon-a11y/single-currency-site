import { useMemo, useState } from "react";
import Countdown from "./Countdown.tsx";
import { parser } from "./InnerMsgLink.tsx";
import { useTranslation } from "@/lib/i18n/react-i18next";
import {
  InnerDisplayContent,
  InnerStatusText
} from "@/components/header/message-v2/c/InnerComponents.tsx";
import dayjs from "dayjs";
import { Code2 } from "lucide-react";
import { useAppNavigate } from "@/hooks/useAppNavigate";

export type MType = "promo_code" | "free_spins" | "monday_vip_bonus"

export const msg_type_need_countdown: MType[] = ["promo_code", "free_spins", "monday_vip_bonus"];

export const InnerCountdown = ({ type, content, status, payload, jump_url, expired_at, onClose }: {
  type: MType,
  status: number,
  content: Record<string, any>,
  payload: string,
  jump_url: string,
  expired_at: number,
  onClose?: () => void
}) => {
  const _payload = useMemo(() => payload && parser(JSON.parse(payload)), [payload]);
  
  return <>
    {type === "free_spins" &&
      <FreeSpinsCountdown
        status={status}
        payload={_payload}
        jump_url={jump_url}
        expired_at={expired_at * 1000}
        onClose={onClose} />}
    {
      type === "promo_code" &&
      <PromoCodeCountdown
        status={status}
        jump_url={jump_url}
        expired_at={expired_at * 1000}
        onClose={onClose} />}
    {
      type === "monday_vip_bonus" &&
      <VIPMondayCountdown
        status={content?.status}
        jump_url={jump_url}
        expired_at={expired_at * 1000}
        onClose={onClose} />}
  </>;
};

const VIPMondayCountdown = (
  {
    status,
    expired_at
  }: {
    status: number,
    jump_url: string,
    expired_at: number,
    onClose?: () => void
  }) => {
  const { t } = useTranslation(["bonus", "luckySpin"]);

  return (<>
    <InnerDisplayContent show={[0].includes(status) && expired_at > 0 && dayjs().valueOf() < expired_at}>
      <Countdown
        deadlineText={t("bonus:expiration")}
        endedText={<InnerStatusText text={t("transaction:transactionStatus.expired")} />}
        end={expired_at} />
    </InnerDisplayContent>

    <InnerDisplayContent show={expired_at > 0 && dayjs().valueOf() >= expired_at && ![1].includes(status)}>
      <InnerStatusText text={t("transaction:transactionStatus.expired")} />
    </InnerDisplayContent>

    <InnerDisplayContent show={[1].includes(status)}>
      <InnerStatusText className={"!text-primary"} text={t("bonus:claimed")} />
    </InnerDisplayContent>
  </>);
};

const PromoCodeCountdown = (
  {
    status,
    jump_url, onClose, expired_at
  }: {
    status: number,
    jump_url: string,
    expired_at: number,
    onClose?: () => void
  }) => {
  const navigate = useAppNavigate();
  const { t } = useTranslation();


  const [finished, setFinished] = useState<boolean>(false);

  return (<>
    <InnerDisplayContent show={[0].includes(status) && expired_at > 0 && dayjs().valueOf() < expired_at}>
      <Countdown
        onFinished={(v) => {
          v && setFinished(v);
        }}
        deadlineText={t("bonus:expiration")}
        endedText={<InnerStatusText text={t("transaction:transactionStatus.expired")} />}
        end={expired_at} />

      <InnerDisplayContent show={!finished}>
        <div className={"text-primary text-[13px] cursor-pointer"} onClick={(e) => {
          e.stopPropagation();
          void navigate({ to: decodeURIComponent(jump_url?.replace("/main/", "/")) });
          onClose?.();
          return false;
        }}>
          {t("bonus:deposit_now")}
        </div>
      </InnerDisplayContent>
    </InnerDisplayContent>

    <InnerDisplayContent show={expired_at > 0 && dayjs().valueOf() >= expired_at && ![1].includes(status)}>
      <InnerStatusText text={t("transaction:transactionStatus.expired")} />
    </InnerDisplayContent>

    <InnerDisplayContent show={[1].includes(status)}>
      <InnerStatusText className={"!text-primary"} text={t("bonus:completed")} />
    </InnerDisplayContent>
  </>);
};

const FreeSpinsCountdown = (
  {
    status,
    jump_url, onClose, expired_at, payload
  }: {
    status: number,
    payload: Record<string, any>,
    jump_url: string,
    expired_at: number,
    onClose?: () => void
  }) => {
  const navigate = useAppNavigate();
  const { t } = useTranslation(['transaction']);


  return (<>
    <InnerDisplayContent show={[0, 1].includes(status) && expired_at > 0 && dayjs().valueOf() < expired_at}>
      <Countdown
        deadlineText={t("bonus:expiration")}
        endedText={<InnerStatusText text={t("transaction:transactionStatus.expired")} />}
        end={expired_at} />
    </InnerDisplayContent>

    <InnerDisplayContent show={expired_at > 0 && dayjs().valueOf() >= expired_at && ![4, 5].includes(status)}>
      <InnerStatusText text={t("transaction:transactionStatus.expired")} />
    </InnerDisplayContent>

    <InnerDisplayContent show={[2].includes(status)}>
      <InnerStatusText text={t("bonus:gameOver")} />
    </InnerDisplayContent>

    <InnerDisplayContent show={[3].includes(status)}>
      <div
        className={"inline-flex items-center gap-1 text-primary text-[13px] cursor-pointer leading-none"}
        onClick={(e) => {
          e.stopPropagation();
          void navigate({ to: decodeURIComponent(jump_url?.replace("/main/", "/")) });
          onClose?.();
          return false;
        }}>
        <Code2 className="w-4 h-4 shrink-0" />
        <span>{payload?.free_spin_code}</span>
      </div>
    </InnerDisplayContent>

    <InnerDisplayContent show={[4, 5].includes(status)}>
      <InnerStatusText className={"!text-primary"} text={t("bonus:completed")} />
    </InnerDisplayContent>

    <InnerDisplayContent show={[6].includes(status)}>
      <InnerStatusText text={t("transaction:transactionStatus.cancelled")} />
    </InnerDisplayContent>
  </>);
};
