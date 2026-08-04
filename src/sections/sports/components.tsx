import clsx from "clsx";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { toast } from "sonner";
import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { useUpdateSettlementCurrency } from "@/contexts/SettlementCurrencyContext.tsx";
import { ESport } from "@/sections/dollars/components.tsx";
import { useAppNavigate } from "@/hooks/useAppNavigate";

// TODO: 自定义轻量级toast提示模式
export const InnerToastCustom = (
  {
    tst
  }: {
    tst: any,
  }) => {

  const navigate = useAppNavigate();
  const { t } = useTranslation("sportsBonus");

  const { updateSettlementCurrency } = useUpdateSettlementCurrency();

  return <div className="">
    <div className={clsx("flex gap-4 p-4")}>
      <img src={"/images/bonus_sports/sport.png"} className="w-10 h-10 animate-gift-shake" alt="" />

      <div>
        <p
          className={clsx("font-bold text-base italic")}>
          {t("sportsBonus:switch_prompt_title")}
        </p>
        <div className="mt-2 flex gap-2 justify-end">
          <ConfirmBox onClick={() => {
            toast.dismiss(tst);

            // TODO: 跳转体育的iframe页面
            void navigate({ to: "/dollars/sports-bonus" });
          }} className={"w-fit btn-soft btn-sm text-sm"}>{t("sportsBonus:switch_prompt_more")}</ConfirmBox>

          <ConfirmBox onClick={() => {
            toast.dismiss(tst);

            try {
              // TODO: 切换体育彩金币种
              void updateSettlementCurrency(ESport.TOKEN);
            } catch (e) {
            }
          }} className={"w-fit btn-sm text-sm"}>{t("sportsBonus:switch_prompt_switch")}</ConfirmBox>
        </div>
      </div>
    </div>
  </div>;
};