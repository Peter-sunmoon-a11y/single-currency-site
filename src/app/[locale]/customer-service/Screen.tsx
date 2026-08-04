import { useChatwootInboxId } from "@/hooks/api/usePublic";
import { memo } from "react";
import { useTranslation } from "@/lib/i18n/react-i18next";

const RouteComponent = memo(function RouteComponent() {
  const { t } = useTranslation("chat");
  const { data: chatwootInboxIdResponse, isLoading, isError } = useChatwootInboxId();
  const { inbox_id } = chatwootInboxIdResponse?.data ?? {};

  const chatUrl = inbox_id
    ? `https://app.openchats.online/widget?website_token=${inbox_id}`
    : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <span className="loading loading-spinner loading-md" />
      </div>
    );
  }

  if (isError || !chatUrl) {
    return (
      <div className="flex items-center justify-center h-full w-full text-sm text-base-content/60">
        {t("customerServiceChatFailedToLoad")}
      </div>
    );
  }

  return (
    <iframe
      src={chatUrl}
      className="w-full h-full border-none"
      title={t("customerService")}
      allow="microphone"
    />
  );
});

export const beforeLoad = undefined;

export default RouteComponent;
