import { ReactNode, useCallback } from "react";
import { useBoundStore } from "@/store";
import { useMqttEvent } from "@/contexts/mqtt";
import { SPIN_RADIALS, SPIN_TYPE_ICON } from "@/sections/lucky-spin/constants.ts";
import { toast } from "sonner";
import { InnerToastCustom } from "@/components/ui/InnerToastCustom.tsx";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { useAppNavigate } from "@/hooks/useAppNavigate";
import { useUserLuckySpinHome } from "@/hooks/api/useAuth.ts";

type LuckySpinEventPayload = {
  type?: string;
  times?: number;
};

export const LuckySpinContainer = () => {
  const { t } = useTranslation(["luckySpin"]);

  const navigate = useAppNavigate();

  const user = useBoundStore((state) => state.user);

  // 容器只保留按需刷新能力，避免首页 mount 时主动请求该接口。
  const { refetch: luckySpinRefetch } = useUserLuckySpinHome(false);

  // TODO: 事件通知
  //       EMQX - Lucky Spin 抽奖次数发放通知
  const luckySpinTopic = user?.id ? `user/${user.id}/lucky_spin` : null;

  const showBaseToast = useCallback((params: {
    icon: string;
    title: string;
    subTitle: ReactNode;
    poolType: "normal" | "mega";
  }) => {
    toast.custom(
      (tst) => (
        <InnerToastCustom
          closeBtn
          tst={tst}
          icon={params.icon}
          style={{ background: SPIN_RADIALS[params.poolType] }}
          title={params.title}
          subTitle={params.subTitle}
          closeIcon={<ChevronRight size={16} />}
          onConfirm={() => void navigate({ to: "/lucky-spin", state: { spinType: params.poolType } as any })}
        />
      ),
      { duration: 10_000, position: "top-right" }
    );
  }, [navigate]);

  const triggerLuckySpinToast = useCallback((message: {
    parsed?: {
      type?: string;
      times?: number;
    };
  }) => {
    if (!message?.parsed) return;

    const nextSpinType = message.parsed.type?.endsWith("_normal") ? "normal" : "mega";

    showBaseToast({
      icon: SPIN_TYPE_ICON[nextSpinType],
      poolType: nextSpinType,
      title: t("luckySpin:fortune"),
      subTitle: (
        <div>
          <div className="text-primary font-semibold">
            {t("luckySpin:available", { times: message.parsed.times })}
          </div>
        </div>
      )
    });
  }, [showBaseToast, t]);

  useMqttEvent<LuckySpinEventPayload>(
    luckySpinTopic,
    (message) => {
      if (!message.parsed) return;
      triggerLuckySpinToast(message);
      void luckySpinRefetch();
    }
  );

  return null;
};
