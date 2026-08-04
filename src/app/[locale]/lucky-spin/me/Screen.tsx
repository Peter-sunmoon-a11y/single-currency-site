import clsx from "clsx";
import { useState, useTransition } from "react";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { RewardsHistory } from "@/sections/lucky-spin/RewardsHistory.tsx";
import { SpinsHistory } from "@/sections/lucky-spin/SpinsHistory.tsx";
import { InnerSlogan } from "@/standard/modals/DemoLazyInfoModal.tsx";

type TabType = "rewards" | "spins";

function History() {
  const { t } = useTranslation(["luckySpin"]);

  const [activeTab, setActiveTab] = useState<TabType>("rewards");

  const [isPending, startTransition] = useTransition();

  return (
    <div className="p-4">
      <InnerSlogan
        title={t("luckySpin:fortune")}
        picture="/images/game_lucky_spin/spins.png"
      />

      <div className={"flex flex-col gap-2 mt-4"}>
        <div
          role="tablist"
          className="z-1 bg-base-200 mb-0 tabs tabs-box tabs-sm sticky top-0 [--tab-color:var(--color-primary)]"
        >
          <button
            role="tab"
            type="button"
            disabled={isPending}
            className={`text-sm tab flex-1 font-bold ${activeTab === "rewards" ? "tab-active text-primary" : ""}`}
            onClick={() => {
              startTransition(() => {
                setActiveTab("rewards");
              });
            }}
          >
            {t("bonus:rewards")}
          </button>
          <button
            role="tab"
            type="button"
            disabled={isPending}
            className={`text-sm tab flex-1 font-bold ${activeTab === "spins" ? "tab-active text-primary" : ""}`}
            onClick={() => {
              startTransition(() => {
                setActiveTab("spins");
              });
            }}
          >
            {t("luckySpin:spin")}
          </button>
        </div>

        <div className={clsx({ "opacity-60 pointer-events-none": isPending })}>
          <div style={{ display: activeTab === "rewards" ? "block" : "none" }}>
            <RewardsHistory />
          </div>
          <div style={{ display: activeTab === "spins" ? "block" : "none" }}>
            <SpinsHistory />
          </div>
        </div>
      </div>
    </div>
  );
}
export default History;

export const beforeLoad = undefined;
