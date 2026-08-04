import { useEffect, useRef } from "react";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { useReferralLink } from "@/hooks/useReferralLink.ts";
import Copy from "@/components/ui/Copy.tsx";
import { shareTo } from "@/features/social/lib/socialShare";
import { toast } from "sonner";
import type { SocialNavigationResult } from "@/features/social/lib/socialNavigation";
import { TextBaseContent } from "@/components/standard/TextBaseContent.tsx";
import { Telegram } from "@/components/icons/Telegram.tsx";
import { WhatsApp } from "@/components/icons/WhatsApp.tsx";
import { Instagram } from "@/components/icons/Instagram.tsx";
import { Messenger } from "@/components/icons/Messenger.tsx";
import { Facebook } from "@/components/icons/Facebook.tsx";
import clsx from "clsx";

const icons = [
  { id: "telegram", icon: <Telegram width={32} /> },
  { id: "whatsapp", icon: <WhatsApp width={32} />   },
  { id: "messenger", icon: <Messenger width={32}/>  },
  { id: "facebook", icon: <Facebook width={32} /> },
  { id: "instagram", icon: <Instagram width={32} /> }
];

export const InnerShareLink = ({className}:{className?: string}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const { t } = useTranslation(["common", "bonus", "referral", "buddyBalls"]);

  const { referralLink } = useReferralLink();
  const hasShareableLink = /^https?:\/\//i.test(referralLink);

  const shareText = "🎮 Join me on this amazing platform!";

  const notifyShareIssue = (result?: SocialNavigationResult) => {
    if (!result) {
      toast.error(t("referral:shareLinkUnavailable", "Share link isn't ready yet. Please try again."));
      return;
    }

    if (result.status === "blocked") {
      toast.error(
        t(
          "referral:sharePopupBlocked",
          "Unable to open the share target. Please allow pop-ups or open it in your browser."
        )
      );
      return;
    }

    if (result.status === "failed" && result.reason === "telegram-open-failed") {
      toast.error(
        t(
          "referral:shareTelegramFailed",
          "Unable to open this share target from Telegram right now."
        )
      );
      return;
    }

    if (result.status === "failed" && result.reason === "clipboard-failed") {
      toast.error(
        t(
          "referral:copyFailed",
          "Unable to copy the link right now. Please try again."
        )
      );
      return;
    }

    toast.error(t("common:error", "Something went wrong. Please try again."));
  };

  const handle = async (platform: string) => {
    try {
      const result = await shareTo(platform as any, {
        url: referralLink,
        text: shareText
      });
      if (!result.handled) {
        notifyShareIssue();
        return;
      }
      if (result.copied) {
        toast.success(t("referral:linkCopiedOpenInstagram", "Link copied! Open Instagram to share."));
        return;
      }
      if (result.result?.status !== "opened") {
        notifyShareIssue(result.result);
      }
    } catch (error) {
      console.error("Share error:", error);
      toast.error(t("common:error", "Something went wrong. Please try again."));
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el && document.documentElement.dir === "rtl") {
      el.scrollLeft = -el.scrollWidth;
    }

    // 监听 dir 属性变化
    const observer = new MutationObserver(() => {
      if (el && document.documentElement.dir === "rtl") {
        el.scrollLeft = -el.scrollWidth;
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["dir"]
    });

    return () => observer.disconnect();
  }, [referralLink]);

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col gap-2">
        <div className="text-sm font-bold">
          {t("buddyBalls:quickShare", "Quick Share")}
        </div>

        <div className={clsx("w-full input h-10 border-none flex items-center pr-1", className || "bg-base-200")}>
          <div className="flex-1 min-w-0 overflow-x-auto hide-scrollbar overflow-y-hidden" ref={scrollRef}>
            <TextBaseContent text={hasShareableLink ? referralLink : ""} className={'!whitespace-nowrap block'} />
          </div>
          <Copy text={hasShareableLink ? referralLink : ""} />
        </div>
      </div>

      <div className={"flex items-center justify-center gap-2"}>
        {icons.map((social) => (
          <button
            key={social.id}
            onClick={(e) => {
              e.stopPropagation();
              void handle(social.id);
            }}
            className="btn btn-primary btn-soft btn-square btn-sm"
            aria-label={`Share on ${social.id}`}
            disabled={!hasShareableLink}
          >
            {social.icon}
          </button>
        ))}
      </div>
    </div>
  );
};
