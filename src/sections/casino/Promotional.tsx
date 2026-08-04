import Iconify from "@/components/iconify";
import { useBaseConfig } from "@/hooks/api/usePublic.ts";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { localizeHref } from "@/lib/navigation";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { PromotionalSkeleton } from "./PromotionalSkeleton";
import { NewBadge } from "@/components/ui/NewBadge";

type GridItem = {
  icon: string;
  label: string;
  onClick: () => void;
  isNew?: boolean;
};

export const Promotional = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: baseConfig, isLoading } = useBaseConfig();
  const showBetby = baseConfig?.data?.is_show_betby !== 0;
  const pushWithSearch = (pathname: string, search: Record<string, string>) => {
    router.push(localizeHref(`${pathname}?${new URLSearchParams(search).toString()}`));
  };

  const items: GridItem[] = [
    {
      icon: "custom:slots",
      label: t("explore:slots"),
      onClick: () => pushWithSearch("/explore", { type: "slots", category: "all" }),
    },
    {
      icon: "custom:live",
      label: t("explore:liveCasino"),
      onClick: () => pushWithSearch("/explore", { type: "liveCasino", category: "all" }),
    },
    {
      icon: "custom:fast",
      label: t("explore:fast"),
      onClick: () => pushWithSearch("/explore", { type: "fast", category: "all" }),
    },
    {
      icon: "custom:fishing",
      label: t("explore:fishing"),
      onClick: () => pushWithSearch("/explore", { type: "fishing" }),
    },
    {
      icon: "custom:lottery",
      label: t("explore:lottery"),
      onClick: () => pushWithSearch("/explore", { type: "lottery" }),
    },
    ...(showBetby
      ? [
          {
            icon: "custom:basketball",
            label: t("common:common.sports"),
            onClick: () => pushWithSearch("/sports", { "bt-path": "/" }),
          },
          {
            icon: "custom:prediction",
            label: t("explore:prediction"),
            onClick: () => pushWithSearch("/sports", { "bt-path": "/predictions" }),
          },
        ]
      : []),
  ];

  if (isLoading) {
    return <PromotionalSkeleton />;
  }

  return (
    <div className="grid grid-cols-2 gap-1">
      {items.map((item) => (
        <GridCard key={item.label} {...item} />
      ))}
    </div>
  );
};

const GridCard = ({ icon, label, onClick, isNew, className }: GridItem & { className?: string }) => {
  return (
    <div onClick={onClick} className={clsx("rounded-lg cursor-pointer relative flex items-center gap-2 px-4 h-10 bg-base-200", className)}>
      <Iconify icon={icon} size={18} className="text-base-content shrink-0" />
      <span className="font-bold text-sm text-base-content uppercase truncate">{label}</span>
      {isNew && <NewBadge />}
    </div>
  );
};
