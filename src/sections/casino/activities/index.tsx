import { useBaseConfig } from "@/hooks/api/usePublic";
import { localizeHref } from "@/lib/navigation";
import { ActivityItem, presetActivityItems } from "./config";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

function getActivityItems(shortcutItems: unknown): ActivityItem[] {
  if (!Array.isArray(shortcutItems) || shortcutItems.length === 0) {
    return [];
  }

  return shortcutItems
    .map((item): ActivityItem | null => {
      if (typeof item !== "string") return null;
      return presetActivityItems[item] ?? null;
    })
    .filter((item): item is ActivityItem => Boolean(item));
}

const Index = () => {
  const router = useRouter();

  const t = useTranslations();
  const { data: bonusConfig, isLoading } = useBaseConfig();

  const activityItems = getActivityItems(bonusConfig?.data?.bonus_config?.sidebar_bonus_shortcuts);

  if (isLoading || activityItems.length === 0) return null;

  return (
    <div
      className="grid gap-1"
      style={{ gridTemplateColumns: `repeat(${Math.max(activityItems.length, 1)}, minmax(0, 1fr))` }}
    >
      {activityItems.map((item) => (
        <button
          key={item.to}
          type="button"
          onClick={() => router.push(localizeHref(item.to))}
          className={`relative flex flex-col items-center gap-1 bg-base-200 rounded-lg p-2 pb-3 active:scale-95 transition-transform duration-100 cursor-pointer overflow-hidden`}
        >
          <span
            aria-hidden="true"
            className={`animate-activity-bg-flow absolute inset-[-28%] rounded-[inherit] bg-gradient-to-br ${item.from} via-primary/20 to-transparent blur-2xl`}
          />
          <span
            aria-hidden="true"
            className="animate-activity-bg-sweep absolute inset-y-0 left-0 w-2/3 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.02)_18%,rgba(255,255,255,0.22)_50%,rgba(255,255,255,0.02)_82%,transparent_100%)]"
          />
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-[inherit] bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,transparent_52%,rgba(0,0,0,0.1)_100%)]"
          />

          <img src={item.icon} alt="" className="h-[36px] w-[36px] object-contain" loading="lazy" decoding="async" />

          <p className="flex items-center text-sm font-bold">{item.label || t(item.labelKey)}</p>
        </button>
      ))}
    </div>
  );
};

export default Index;
