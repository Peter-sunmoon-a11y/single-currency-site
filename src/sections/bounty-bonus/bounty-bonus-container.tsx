import { ReactNode, useCallback, useEffect, useMemo } from "react";
import { useBoundStore } from "@/store";
import { useMqttService, useMqttTopicMessagesReadonly } from "@/contexts/mqtt";
import { toast } from "sonner";
import { InnerToastCustom } from "@/components/ui/InnerToastCustom.tsx";
import { ChevronRight } from "lucide-react";
import { Trans, useTranslation } from "@/lib/i18n/react-i18next";
import { useAppNavigate } from "@/hooks/useAppNavigate";
import { usePathname } from "next/navigation";
import { isSupportedLocale } from "@/lib/i18n/config";

const normalizeGamePathname = (pathname: string) => {
  if (pathname === "/games" || pathname.startsWith("/games/")) {
    return pathname;
  }

  const [, maybeLocale, route, ...rest] = pathname.split("/");

  if (isSupportedLocale(maybeLocale) && route === "games") {
    return rest.length > 0 ? `/games/${rest.join("/")}` : "/games";
  }

  return pathname;
};

export const BountyBonusContainer = () => {
  const { t } = useTranslation(["bounty"]);

  const navigate = useAppNavigate();
  const pathname = usePathname();

  const user = useBoundStore((state) => state.user);
  const headerBackAction = useBoundStore((state) => state.headerBackAction);

  const isInGame = normalizeGamePathname(pathname).startsWith("/games/play/") || Boolean(headerBackAction);

  // TODO: 事件通知
  const bountyWinnerTopic = user?.id ? `user/${user.id}/bounty_winner` : undefined;

  const { clearMessages } = useMqttService();

  const { parsedMessages } = useMqttTopicMessagesReadonly<any>(bountyWinnerTopic);

  const latest = parsedMessages?.[0];

  const multiplier = useMemo(() => {
    const parsed_data = latest?.parsed;
    if (!parsed_data) return;
    return parsed_data?.data?.bet_multiplier;
  }, [latest?.timestamp]);

  const showBaseToast = useCallback((params: {
    icon: string;
    title: string;
    subTitle: ReactNode;
  }) => {
    toast.custom(
      (tst) => (
        <InnerToastCustom
          closeBtn
          tst={tst}
          icon={params.icon}
          title={params.title}
          subTitle={params.subTitle}
          closeIcon={<ChevronRight size={16} />}
          onConfirm={() => void navigate({ to: "/bounty/my" })}
        />
      ),
      { duration: 10_000, position: "top-right" }
    );
  }, [navigate]);

  const triggerBountyWinToast = useCallback((value = multiplier) => {
    showBaseToast({
      icon: "/images/bonus_bounty/bounty-card.png",
      title: t("bounty:congratulations"),
      subTitle: (
        <div>
          <Trans
            i18nKey="bounty:youHitMultiplier"
            values={{ multiplier: value }}
            components={[<span className="font-bold text-primary" />]}
          />
        </div>
      )
    });
  }, [multiplier, showBaseToast, t]);

  useEffect(() => {
    if (isInGame) return;
    if (!multiplier) return;
    if (!bountyWinnerTopic) return;

    triggerBountyWinToast();
    clearMessages(bountyWinnerTopic);
  }, [bountyWinnerTopic, clearMessages, isInGame, multiplier, triggerBountyWinToast]);

  return null;
};
