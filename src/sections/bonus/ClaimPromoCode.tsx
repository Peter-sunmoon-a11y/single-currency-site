import { Trans, useTranslation } from "@/lib/i18n/react-i18next";
import { ReactNode, useCallback, useState } from "react";
import { userClaimPromoCode } from "@/services/auth/bonus";
import { ErrorMessageBox } from "@/components/modal/UserFinanceModal/c/ErrorMessageBox.tsx";
import { InnerErrorWrapper } from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";
import { useBoundStore } from "@/store";
import { uuidv4Generate } from "@/utils/helper.ts";
import { toast } from "sonner";
import { InnerToastCustom } from "@/sections/dollars/components.tsx";
import { SocialMedia } from "@/sections/casino/SocialMedia.tsx";
import { TicketPercent } from "lucide-react";
import { TextBaseContent } from "@/components/standard/TextBaseContent.tsx";
import { useNavigateGuard } from "@/sections/casino/hero-banner/InnerComponents.tsx";

export const ClaimPromoCode = () => {
  const { t } = useTranslation("promoCode");

  const { navigateCallback } = useNavigateGuard()

  const openModal = useBoundStore((state) => state.openModal);

  const [state, setState] = useState({
    isPending: false,
    promoCode: ""
  });

  const isError = state.promoCode !== "" && !/^[A-Za-z0-9]{3,}$/.test(state.promoCode);

  const showBaseToast = useCallback((params: {
    icon: string;
    title: string;
    subTitle: ReactNode;
  }) => {
    toast.custom(
      (tst) => (
        <InnerToastCustom
          closeBtn
          tst={tst}
          icon={params.icon}
          title={params.title}
          subTitle={params.subTitle}
          onConfirm={() => console.info("onClose")}
        />
      ),
      { duration: 6_000, position: "top-right" }
    );
  }, []);

  const showErrorToast = useCallback((i18nKey: string) => {
    showBaseToast({
      icon: "/images/common/error.png",
      title: t("transaction:transactionStatus.failed"),
      subTitle: <Trans i18nKey={i18nKey} />
    });
  }, [showBaseToast, t]);

  // const showSuccessToast = useCallback(() => {
  //   showBaseToast({
  //     icon: "/images/bonus/success.png",
  //     title: t("doubleOrNothing:congratulations"),
  //     subTitle: (
  //       <Trans i18nKey={"promoCode:claim_successful"} />
  //     )
  //   });
  // }, [showBaseToast, t]);

  const handle = useCallback(async () => {
    setState(prev => ({ ...prev, isPending: true }));
    try {
      const device_id = uuidv4Generate();

      // device_id: 服务于风控
      const response = await userClaimPromoCode(state.promoCode, device_id);

      if (response?.code === 0 || response?.code === 200) {
        // if (response?.data?.type?.includes("free_spin")) {
        //   TODO: 针对FreeSpin的优惠码获取结果,需要数据生成的过渡处理
        openModal("OPEN_GET_PROMO_CODE_MODAL", { ...response });
        // } else {
        // TODO: 普通优惠码的领取
        // showSuccessToast();
        // }

        setState(prev => ({ ...prev, promoCode: "" }));
      } else {
        // TODO: 领取异常处理
        if (response?.code === 51016) showErrorToast("promoCode:promo_expired");
        if (response?.code === 51017) showErrorToast("promoCode:promo_claimed");
        if (response?.code === 51007) showErrorToast("promoCode:invalid_parameter");
        if (response?.code === 51008) showErrorToast("promoCode:promo_invalid");
        if (response?.code === 51018) showErrorToast("promoCode:promo_claim_limit");
        if (response?.code === 51014) showErrorToast("promoCode:promo_unavailable");
        if (response?.code === 51019) showErrorToast("promoCode:promo_claim_limit");
        if (response?.code === 51020) showErrorToast("promoCode:similar_event");
        if (response?.code === 51021) showErrorToast("promoCode:not_started_yet");
        if (response?.code === 51022) showErrorToast("promoCode:not_eligible");
        if (response?.code === 51023) showErrorToast("promoCode:cannot_claim");
      }
    } catch (_error) {
      console.info(_error);
      showErrorToast("promoCode:promo_unavailable");
    } finally {
      setState(prev => ({ ...prev, isPending: false }));
    }
  }, [state.promoCode]);

  return (
    <div className="relative flex w-full flex-col overflow-hidden rounded-lg bg-base-100 duration-200">
      <div className="relative flex flex-col gap-4 p-4 pt-5">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/20">
            <TicketPercent className="size-6 text-primary" />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-base font-bold">{t("finance:promoCode")}</p>
            <TextBaseContent text={t("promoCode:redeem_promotional")} />
          </div>
        </div>

        {/* 输入区 */}
        <InnerErrorWrapper>
          <div className="flex gap-2">
            {/* Polygon Input */}
            <div
              className="relative flex-1 transition-[filter] duration-300"
              style={{
              }}
            >
              <div
                className="relative overflow-hidden"
                style={{
                  clipPath: "polygon(8px 0%,calc(100% - 8px) 0%,100% 8px,100% calc(100% - 8px),calc(100% - 8px) 100%,8px 100%,0% calc(100% - 8px),0% 8px)"
                }}
              >
                <span className="absolute inset-0" style={{ background: "linear-gradient(to right, color-mix(in oklch, var(--color-primary) 65%, black), color-mix(in oklch, var(--color-primary) 82%, black), color-mix(in oklch, var(--color-primary) 65%, black))" }} />
                <span className="absolute inset-x-0 top-0 h-[40%] bg-gradient-to-b from-white/25 to-transparent pointer-events-none" />
                <span className="pointer-events-none absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "repeating-linear-gradient(0deg,#000 0px,#000 1px,transparent 1px,transparent 3px)" }} />
                <input
                  type="text"
                  value={state.promoCode}
                  onChange={(e) => {
                    setState(prev => ({ ...prev, promoCode: e.target.value?.trim() }));
                  }}
                  className="text-sm relative font-bold h-10 px-3 w-full bg-transparent outline-none border-0 text-primary-content placeholder:text-primary-content/50"
                  placeholder={t("finance:enter")}
                />
              </div>
            </div>
            {/* Polygon Claim Button */}
            <div
              className="flex-none w-28 transition-[filter] duration-300"
              style={{
              }}
            >
              <button
                type="button"
                disabled={!state.promoCode || isError || state.isPending}
                onClick={() => {
                  navigateCallback(() => {
                    void handle()
                  }, true)
                }}
                style={{
                  clipPath: "polygon(8px 0%,calc(100% - 8px) 0%,100% 8px,100% calc(100% - 8px),calc(100% - 8px) 100%,8px 100%,0% calc(100% - 8px),0% 8px)"
                }}
                className="group relative w-full h-10 flex items-center justify-center whitespace-nowrap overflow-hidden transition-all duration-200 disabled:opacity-35 disabled:cursor-not-allowed enabled:hover:brightness-[1.15] enabled:active:scale-[0.94]"
              >
                {/* 金属渐变底层 */}
                <span className="absolute inset-0" style={{ background: "linear-gradient(to right, color-mix(in oklch, var(--color-primary) 80%, black), color-mix(in oklch, var(--color-primary) 85%, white), color-mix(in oklch, var(--color-primary) 80%, black))" }} />
                {/* 扫描线纹理 */}
                <span
                  className="pointer-events-none absolute inset-0 opacity-[0.05]"
                  style={{ backgroundImage: "repeating-linear-gradient(0deg,#000 0px,#000 1px,transparent 1px,transparent 3px)" }}
                />
                {/* 文字 */}
                <span
                  className="relative z-10 font-extrabold text-xs tracking-widest uppercase text-primary-content drop-shadow-[0_1px_0_rgba(255,255,255,0.3)]">
                  {state.isPending
                    ? <span className="loading loading-spinner loading-xs" />
                    : t("bonus:claim")}
                </span>
              </button>
            </div>
          </div>
          <ErrorMessageBox
            sample
            show={isError}
            content={t("promoCode:promo_format_error", { length: 3 })} />
        </InnerErrorWrapper>

        {/* 社交媒体 */}
        <SocialMedia className="justify-end" />
      </div>
    </div>
  );
};
