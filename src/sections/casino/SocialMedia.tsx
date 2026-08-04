import { type ButtonHTMLAttributes } from "react";
import { useBaseConfig } from "@/hooks/api/usePublic.ts";
import clsx from "clsx";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { getSocialLogoUrl } from "@/lib/env";
import {
  buildOfficialChannelTarget,
  type OfficialPlatform
} from "@/features/social/lib/socialTargets";
import { openSocialTarget } from "@/features/social/lib/socialNavigation";

type TMedia = OfficialPlatform;

// Discord（高度结构化的玩家社区）?
const media_info_match: Partial<Record<TMedia, { icon: string }>> = {
  "telegram": { icon: getSocialLogoUrl("telegram.svg") },
  "twitter": { icon: getSocialLogoUrl("twitter.svg") },
  "facebook": { icon: getSocialLogoUrl("facebook.svg") },
  "youtube": { icon: getSocialLogoUrl("youtube.svg") },
  "whatsapp": { icon: getSocialLogoUrl("whatsapp.svg") },
  "instagram": { icon: getSocialLogoUrl("instagram.svg") },
};

// TODO: 官方媒体 - 有没有还不确定,所以显不显示也不确定
export const SocialMedia = ({ className }: { className?: string }) => {
  const { data: baseConf } = useBaseConfig();
  const { t } = useTranslation("common");
  const mediaLinks = baseConf?.data?.media_links;

  const handleSocialClick = async (media: TMedia, rawUrl: string) => {
    const target = buildOfficialChannelTarget({
      platform: media,
      rawUrl
    });
    const result = await openSocialTarget(target);

    if (result.status === "opened") {
      return;
    }

    if (result.status === "blocked") {
      toast.error(
        t(
          "socialLinkPopupBlocked",
          "Unable to open the link. Please allow pop-ups or open it in your browser."
        )
      );
      return;
    }

    if (result.status === "failed" && result.reason === "telegram-open-failed") {
      toast.error(
        t(
          "socialLinkTelegramFailed",
          "Unable to open this link from Telegram right now."
        )
      );
      return;
    }

    toast.error(
      t(
        "socialLinkUnavailable",
        "This social link is unavailable right now."
      )
    );
  };

  return (<div className={clsx("flex gap-1", className)}>
    {Object.entries(media_info_match).map(([key, info]) => {
      const media = key as TMedia;
      const rawUrl = mediaLinks?.[media];

      if (!rawUrl || !info?.icon) {
        return null;
      }

      return (
        <InnerButton
          key={media}
          icon={info.icon}
          onClick={() => {
            void handleSocialClick(media, rawUrl);
          }}
          aria-label={`Open ${media} official channel`}
        />
      );
    })}
  </div>);
};

const InnerButton = (
  props: ButtonHTMLAttributes<HTMLButtonElement> & { icon: string }
) => {
  const { icon, className, type, ...rest } = props;

  return (
    <button
      {...rest}
      type={type ?? "button"}
      className={clsx("btn btn-sm btn-soft btn-square btn-primary", className)}
    >
      <img
        src={icon}
        alt=""
      />
    </button>
  );
};
