import { ReactNode } from "react";
import clsx from "clsx";
import { Info } from "@/sections/bonus/components/Info.tsx";
import { useBoundStore } from "@/store";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { useBonusSwitch } from "@/hooks/api/useAuth";
import { useBaseConfig } from "@/hooks/api/usePublic";
import {
  getJesterRequiredVipLevel,
  resolveJesterIntroConfig
} from "./jester-shared";
import { VipButton2 } from "@/sections/bonus/shared/VipButton.tsx";
import { useAppNavigate } from "@/hooks/useAppNavigate.ts";

export function JesterBonus() {
  return (
    <JesterGuard>
      {(props) => <JesterContent {...props} />}
    </JesterGuard>
  );
}

type JesterGuardValues = {
  requiredVipLevel: number;
};

function JesterGuard(
  {
    children
  }: {
    children: (values: JesterGuardValues) => ReactNode;
  }) {
  const { switchData } = useBonusSwitch();
  const { data: baseConfig } = useBaseConfig();

  if (switchData?.bonus_switch?.joker_bonus === 0) {
    return null;
  }

  const jesterConfig = resolveJesterIntroConfig(baseConfig?.data?.bonus_config?.joker_bonus);

  if (jesterConfig?.enabled === 0) {
    return null;
  }

  const requiredVipLevel = getJesterRequiredVipLevel(jesterConfig);

  return children({
    requiredVipLevel
  });
}

function JesterContent({
                         requiredVipLevel
                       }: JesterGuardValues) {
  const { t } = useTranslation(["vip"]);

  const navigate = useAppNavigate();
  const openModal = useBoundStore((state) => state.openModal);

  return (
    <div className="relative bg-base-100 rounded-lg px-4 py-4 overflow-hidden flex flex-col gap-2">
      <div className="flex items-center gap-4 justify-between">
        <div className="flex items-center gap-2">
          <img
            src="/images/bonus_jester/jester.svg"
            loading="lazy"
            decoding="async"
            className="w-8 h-8 object-contain" />
          <h2 className={clsx("text-base font-bold uppercase truncate")}>
            {t("vip:jester")}
          </h2>
          {/* 活动信息提示 */}
          <Info
            onClick={(e) => {
              e.stopPropagation();
              openModal("OPEN_JESTER_HELP_MODAL");
            }}
          />
        </div>

        <VipButton2
          onClick={() => {
            void navigate({
              to: "/explore",
              search: { type: "slots", category: "all" }
            });
          }}
          requiredLevel={requiredVipLevel}
        />
      </div>
    </div>
  );
}
