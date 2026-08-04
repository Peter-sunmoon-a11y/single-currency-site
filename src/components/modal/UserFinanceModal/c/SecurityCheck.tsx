import { useTranslation } from "@/lib/i18n/react-i18next";
import { ShieldCheck, BadgeCheck, Zap } from "lucide-react";

export type SecurityStepStatus = "idle" | "running" | "done" | "failed";

export interface SecurityStep {
  labelKey: string;
  status: SecurityStepStatus;
}

interface Props {
  visible: boolean;
  steps: SecurityStep[];
}

const ICONS = [ShieldCheck, BadgeCheck, Zap] as const;

export const SecurityCheck = ({ visible, steps }: Props) => {
  const { t } = useTranslation();

  if (!visible) return null;

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2">
      <div className={'bg-base-100 w-full p-2 rounded-lg flex flex-col gap-2'}>
        {steps.map(({ labelKey, status }, i) => {
          const Icon = ICONS[i] ?? Zap;
          const isDone    = status === "done";
          const isRunning = status === "running";
          const isFailed  = status === "failed";
          const isIdle    = status === "idle";

          return (
            <div
              key={i}
              className={[
                "w-full flex items-center gap-2 px-2 py-2 rounded-md transition-all duration-300",
                isDone    && "bg-green",
                isRunning && "bg-primary",
                isFailed  && "bg-error",
              ].join(" ")}
            >
              <Icon
                size={24}
                strokeWidth={2}
                className={
                  isDone    ? "text-base-content"        :
                    isRunning ? "text-base-content"        :
                      isFailed  ? "text-base-content"        : "text-base-content"
                }
              />

              <span className={[
                "flex-1 text-base font-bold italic transition-colors duration-300",
                isDone    ? "text-base-content"        :
                  isRunning ? "text-base-content"   :
                    isFailed  ? "text-base-content"          : "text-base-content",
              ].join(" ")}>
              {t(labelKey)}
            </span>

              <div className="w-5 flex items-center justify-center">
                {isDone    && <span className="text-success font-bold">✓</span>}
                {isRunning && <span className="loading loading-spinner loading-xs text-primary" />}
                {isFailed  && <span className="text-base-content font-bold">✗</span>}
                {isIdle    && null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
