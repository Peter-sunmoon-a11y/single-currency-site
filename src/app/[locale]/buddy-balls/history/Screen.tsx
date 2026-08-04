import { useState } from "react";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { BallsHistory } from "@/sections/buddy-balls/BallsHistory.tsx";
import { RewardsHistory } from "@/sections/buddy-balls/RewardsHistory.tsx";
import { InnerSlogan } from "@/standard/modals/DemoLazyInfoModal.tsx";
import { cn } from "@/utils/cn";

type TabType = "rewards" | "balls";

function History() {
  const { t } = useTranslation(["buddyBalls"]);
  const [activeTab, setActiveTab] = useState<TabType>("rewards");

  return (
    <div className="p-4">
      <InnerSlogan
        title={t("buddyBalls:buddyBalls")}
        picture="/images/game_buddy_balls/ball-pool.png"
      />

      <div className={"flex flex-col gap-2 mt-4"}>
        <div role="tablist" className="tabs tabs-box w-full">
          <button
            role="tab"
            type="button"
            className={cn("tab flex-1 gap-1 text-sm px-1 font-bold", activeTab === "rewards" && "tab-active text-primary")}
            onClick={() => setActiveTab("rewards")}
          >
            {t("bonus:rewards")}
          </button>
          <button
            role="tab"
            type="button"
            className={cn("tab flex-1 gap-1 text-sm px-1 font-bold", activeTab === "balls" && "tab-active text-primary")}
            onClick={() => setActiveTab("balls")}
          >
            {t("buddyBalls:buddyBalls")}
          </button>
        </div>

        {activeTab === "rewards" ? <RewardsHistory /> : <BallsHistory />}
      </div>
    </div>
  );
}

export const beforeLoad = undefined;

export default History;
