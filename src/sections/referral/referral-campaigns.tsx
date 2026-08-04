import Iconify from "@/components/iconify";
import { useBoundStore } from "@/store";
import { useAdTagList } from "@/hooks/api/useAuth";
import dayjs from "dayjs";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { ChevronRight } from "lucide-react";
import Copy from "@/components/ui/Copy";
import { ReferralHeroSection } from "@/sections/referral/referral-hero-section.tsx";
import { ReferralGuard } from "@/sections/referral/referral-guard.tsx";
import { DataLoading } from "@/components/standard/DataLoading.tsx";
import { NothingFound } from "@/components/ui/NothingFound.tsx";
import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";

export const ReferralCampaigns = () => {
  const { t } = useTranslation(["referral", "common"]);

  const status = useBoundStore((state) => state.status);

  const { data: adTagListResponse, isFetching } = useAdTagList();

  const openModal = useBoundStore((state) => state.openModal);

  const adTagList = adTagListResponse?.data || [];

  return (
    <ReferralGuard>
      {(referral_enable: boolean) => (
        <div className="p-4 flex flex-col gap-4">
          <ReferralHeroSection referralEnable={referral_enable} />

          <h3 className="text-base font-bold">{t("referral:myCampaigns")}</h3>

          {/* 统计 + 创建按钮 */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-base-200 p-2 flex items-center gap-2">
                <Iconify icon="custom:speaker" className="text-primary h-5 w-5 shrink-0" />
                <div>
                  <div className="text-xs uppercase text-base-content/50">{t("referral:campaigns")}</div>
                  <div className="text-base-content text-base font-bold">
                    {`${adTagList.length ?? "--"} / 20`}
                  </div>
                </div>
              </div>
              <div className="rounded-lg bg-base-200 p-2 flex items-center gap-2">
                <Iconify icon="custom:referral" className="text-primary h-5 w-5 shrink-0" />
                <div>
                  <div className="text-xs uppercase font-semibold text-base-content/50">{t("referral:referrals")}</div>
                  <div className="text-base-content text-base font-bold">{status?.direct_invitations || 0}</div>
                </div>
              </div>
            </div>
            <ConfirmBox onClick={() => openModal("OPEN_CREATE_CAMPAIGN_MODAL", {})}>
              {t("referral:createNewCampaign")}
            </ConfirmBox>
          </div>

          <div className={"flex flex-col gap-2 w-full"}>
            {/* 列表 */}
            <div className="px-2 grid grid-cols-2 text-base-content/50 text-xs uppercase">
              <div className="text-start">{t("finance:name")} | {t("referral:code")}</div>
              <div className="text-end">{t("referral:referrals")}</div>
            </div>

            <div className="relative rounded-lg bg-base-200 p-2 min-h-[180px]">
              <div className="space-y-1">
                {adTagList.map((item, index) => (
                  <div
                    key={item.id ?? index}
                    className="relative grid grid-cols-2 items-center gap-2 rounded-lg bg-base-300 p-2 cursor-pointer"
                    onClick={() => openModal("OPEN_CREATE_CAMPAIGN_MODAL", { compaignDetail: item })}
                  >
                    {Boolean(item.is_default) && <span
                      className="absolute bottom-0 right-0 w-0 h-0 border-b-[24px] border-l-[24px] border-b-primary border-l-transparent rounded-br-[inherit]" />}

                    <div>
                      {/* 活动名 */}
                      <span className="text-sm text-base-content truncate">{item.campaign}</span>

                      {/* 推荐码 */}
                      <div
                        className="flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span
                          className="text-sm text-primary/65 font-bold">{item.code}</span>
                        <Copy text={item.code} />
                      </div>
                    </div>

                    {/* 注册数 + 日期 */}
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1 text-primary font-bold text-base">
                        <span>{item.register_count}</span>
                        <ChevronRight className="w-3 h-3" strokeWidth={4} />
                      </div>
                      <span className="text-xs text-base-content/50">
                      {dayjs(item.created_at * 1000).format("YYYY/MM/DD")}
                    </span>
                    </div>
                  </div>
                ))}
              </div>

              {isFetching && <DataLoading />}
              {!isFetching && adTagList.length === 0 && <NothingFound />}
            </div>
          </div>
        </div>
      )}
    </ReferralGuard>
  );
};
