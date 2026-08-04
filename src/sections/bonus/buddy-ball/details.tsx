import { useTranslation } from "@/lib/i18n/react-i18next";
import { Modal } from "@/components/ui/Modal.tsx";
import { ReactNode } from "react";
import { useUserBuddyBallsHome } from "@/hooks/api/useAuth.ts";
import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import { InnerShareLink } from "@/sections/bonus/buddy-ball/share.tsx";
import {
  InnerContainer,
  InnerContent,
  InnerDescription,
  InnerHeader,
  InnerSlogan, InnerTitle
} from "@/standard/modals/DemoLazyInfoModal.tsx";
import { useNavigateGuard } from "@/sections/casino/hero-banner/InnerComponents.tsx";
import { useAppNavigate } from "@/hooks/useAppNavigate";

dayjs.extend(isToday);

export const Details = (
  {
    open,
    onClose
  }: {
    open: boolean;
    onClose: () => void;
  }) => {

  const navigate = useAppNavigate();
  const { navigateCallback } = useNavigateGuard();

  const { t } = useTranslation(["popup", "bonus"]);

  const { data: buddy } = useUserBuddyBallsHome();

  const source = buddy?.data?.source_ball_stats ?? [];
  const user = source?.find((s: { source: string; }) => s?.source === "user");
  const deposit = source?.find((s: { source: string; }) => s?.source === "deposit");

  return (
    <Modal
      hideTitle
      isOpen={open}
      onClose={onClose}
      position="modal-middle"
      className="p-0 bg-transparent"
    >
      <InnerSlogan
        // 根据设计稿自行修改文字
        title={t("buddyBalls:buddyBalls")}
        // 根据设计稿自行修改图片
        picture="/images/game_buddy_balls/ball-pool.png"
      />

      <InnerContainer>
        <InnerHeader
          title={t("bonus:bonus_details")}
          onClose={onClose}
        />

        <InnerContent>
          <InnerTitle title={t("buddyBalls:moreBalls")} />

          <InnerDescription>
            <InnerItem title={t("buddyBalls:dailyCheck")} counter={""}>
              {dayjs((buddy?.data?.continuous_checkin_last_date_ts || 0) * 1000).isToday()
                ? <span className="text-[12px] text-success leading-none mr-2">✓</span>
                : <button className="btn btn-primary btn-sm text-sm"
                          onClick={() => {
                            navigateCallback(() => {
                              void navigate({ to: "/daily-check" });
                              onClose();
                            }, true);
                          }}>{t("buddyBalls:go")}</button>}
            </InnerItem>

            <InnerItem title={t("buddyBalls:referFriend")} counter={"1"}>
              <span className={"pr-3 text-base-content/50 font-bold"}>+{user?.total_ball || 0}</span>
            </InnerItem>

            <InnerItem title={t("buddyBalls:referralDeposit")} counter={"5"}>
              <span className={"pr-3 text-base-content/50 font-bold"}>+{deposit?.total_ball || 0}</span>
            </InnerItem>
          </InnerDescription>

          <InnerDescription>
            <InnerShareLink />
          </InnerDescription>

          <InnerTitle title={t("popup:tournament.expiration")} />
          <InnerDescription>{t("popup:tournament.expirationDesc")}</InnerDescription>

          <InnerTitle title={t("popup:tournament.generalTerms")} />
          <InnerDescription>{t("buddyBalls:accumulated")}</InnerDescription>
          <InnerDescription>{t("popup:tournament.generalTermsDesc2")}</InnerDescription>

        </InnerContent>
      </InnerContainer>
    </Modal>
  );
};

const InnerItem = ({ title, counter, children }: { title: ReactNode, counter: string, children: ReactNode }) => {
  return (<div className="flex items-center justify-between bg-base-200 rounded-lg pr-1 pl-4 py-1 min-h-10 mt-1">
    <div className="flex items-center gap-2">
      <span className={"text-base-content/50"}>{title}</span>
      {<div className="flex text-primary font-bold">
        <img src="/images/game_buddy_balls/ball.png" alt="" className={"w-4 h-4"} />
        {counter ? `x${counter}` : ""}
      </div>}
    </div>
    {children}
  </div>);
};

export default Details;