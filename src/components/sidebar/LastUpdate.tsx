import { buildConfig } from "@/lib/env";
import { useTranslation } from "@/lib/i18n/react-i18next";
import dayjs from "dayjs";

export const LastUpdate = () => {
  const { t } = useTranslation(["transaction"]);

  const versionRaw = String(buildConfig.version ?? "");
  const versionMs = versionRaw ? Number(versionRaw) : null;
  const versionLabel = versionMs === null ? null : dayjs(versionMs).format("DD MMM'YY T HH:mm Z");

  return (
    <button
      type="button"
      className="btn justify-start w-full rounded-md"
    >
      <span
        className={"font-semibold tracking-tighter truncate text-[14px] text-base-content/60"}>{t("transaction:details.lastUpdate")} {versionLabel}</span>
    </button>
  );
};
