import { getImgCompressParams } from "@/utils/helper.ts";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

type BannerVisualProps = {
  picture?: string;
  title: ReactNode;
  cta?: ReactNode;
  priority?: boolean;
  onClick?: () => void;
  className?: string;
};

const PLACEHOLDER_PICTURE_MARKERS = ["placeholder", "{{", "}}", "${", "undefined", "null"];

const resolveBannerPicture = (picture?: string) => {
  const value = picture?.trim();
  if (!value) return "";

  const normalizedValue = value.toLowerCase();
  if (PLACEHOLDER_PICTURE_MARKERS.some((marker) => normalizedValue.includes(marker))) {
    return "";
  }

  if (value.startsWith("data:image/") || value.startsWith("/")) {
    return value;
  }

  try {
    const url = new URL(value);
    if (!/^https?:$/.test(url.protocol)) return "";
    return value;
  } catch {
    return "";
  }
};

export const BannerVisual = ({
  picture,
  title,
  cta,
  priority = false,
  onClick,
  className = "",
}: BannerVisualProps) => {
  const [network, setNetwork] = useState<"4g" | "3g" | "slow-2g" | "2g">("4g");

  useEffect(() => {
    if (typeof navigator === "undefined" || !("connection" in navigator)) return;

    const connection = (navigator as Navigator & {
      connection?: { effectiveType?: "4g" | "3g" | "slow-2g" | "2g"; addEventListener?: (event: "change", handler: () => void) => void; removeEventListener?: (event: "change", handler: () => void) => void; };
    }).connection;
    const updateNetwork = () => setNetwork(connection?.effectiveType ?? "4g");

    updateNetwork();
    connection?.addEventListener?.("change", updateNetwork);
    return () => connection?.removeEventListener?.("change", updateNetwork);
  }, []);

  const safePicture = resolveBannerPicture(picture);
  const src = safePicture ? getImgCompressParams(safePicture, 209, 65, 209, network) : "";
  console.info(src);
  return (
    <div
      className={`rounded-lg relative min-w-0 overflow-hidden h-full p-4 ${className}`}
      onClick={onClick}
    >
      {safePicture && (
        <div className="absolute inset-y-4 right-4 z-0">
          <img
            alt=""
            src={src}
            // src={'/monthly-CA-fqQod.png'}
            width={148}
            height={148}
            className="h-full w-full object-contain object-right"
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            decoding="async"
          />
        </div>
      )}

      <div className="relative z-20 flex h-full max-w-[60%] flex-col gap-2">
        <div className="font-extrabold leading-tight text-base-content text-shadow-lg">{title}</div>
        <div className="mt-auto">
          {cta}
        </div>
      </div>
    </div>
  );
};
