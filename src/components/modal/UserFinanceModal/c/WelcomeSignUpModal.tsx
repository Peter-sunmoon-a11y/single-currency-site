import { ComponentProps, useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import StorageExtend from "./StorageExtend.ts";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { useBoundStore } from "@/store";
import { X } from "lucide-react";

export default function WelcomeSignUpModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);

  const { t } = useTranslation();

  const user = useBoundStore((state) => state.user);

  const { openModal } = useBoundStore();

  const [radio, isRadio] = useState<boolean>(false);

  // 事件通知
  useEffect(() => {
    if (open && !user) ref.current?.show();
    if (!open) ref.current?.close();
  }, [open, user]);

  return <dialog ref={ref} className="modal" onClose={onClose}>
    <StyledBackground1
      className="modal-box p-6 rounded-xl relative flex flex-col overflow-hidden gap-6 max-w-[340px]">
      <CloseBtn onClick={() => ref.current?.close()} />
      <div className="relative min-h-70 flex flex-col gap-6 items-center justify-end">
        <div className="z-1 p-5 rounded-xl bg-black/60">
          <StyledBackground2 className="text-4xl font-[Lobster] text-center font-extrabold whitespace-pre-line">
            {t("common:registrationBonus", "Registration\nBonus")}
          </StyledBackground2>

          <p
            className="text-center text-xs font-bold mt-4 whitespace-pre-line">
            {t("common:freeSpinsAwaitYou", "Your Free Spins \n Await You")}
          </p>
        </div>
        {/* 小仙女 */}
        <img src={`https://1stgame.imgix.net/popup/default/little_fairy.png?w=80&auto=format,compress&dpr=1.5&q=80`}
             alt="" className="w-30 absolute -left-20 rotate-10 -top-[25%]" />

        {/* 小魔女 */}
        <img src={`https://1stgame.imgix.net/popup/default/little_witch.png?w=80&auto=format,compress&dpr=1.5&q=80`}
             alt="" className="w-28 absolute -right-20 -rotate-10 top-0" />

        {/* 宙斯大爷 */}
        <img
          src={`https://1stgame.imgix.net/popup/default/zeus2.png?w=180&auto=format,compress&dpr=1.5&q=80`}
          alt="" className="w-65 absolute -bottom-6 max-w-none"
        />

        <div className="flex flex-col gap-6 justify-center z-1">
          <div className={"text-center"}>
            <button className="btn btn-primary" onClick={() => {
              openModal("OPEN_AUTH_MODAL", { initialTab: "sign-up" });
              ref.current?.close();
            }}>
              {t("common:claimNow", "Claim Now")}
            </button>
          </div>

          <div className="flex items-center gap-2 text-[10px] bg-base-300/70 rounded-full p-1 cursor-pointer font-bold"
               onClick={() => {
                 if (!radio) {
                   StorageExtend.getInstance().setItem({
                     key: "DoNotRemainMeToday",
                     value: true,
                     expired: dayjs().endOf("day").valueOf()
                   });
                 } else {
                   StorageExtend.getInstance().removeItem("DoNotRemainMeToday");
                 }
                 radio ? isRadio(false) : isRadio(true);
               }}>
            <input
              type="checkbox"
              checked={radio}
              className="checkbox checkbox-xs border checkbox-primary"
              onChange={() => null}
            />
            {t("common:notRemindMeAgainToday", "Do Not Remind Me Again Today")}
          </div>
        </div>
      </div>
    </StyledBackground1>
  </dialog>;
}

const StyledBackground1 = ({ style, ...props }: ComponentProps<"div">) => (
  <div style={{ background: "linear-gradient(175deg, color(display-p3 0.1686 0.1725 0.4314) -1.75%, color(display-p3 0.0549 0.0667 0.1843) 54.33%)", ...style }} {...props} />
);

const StyledBackground2 = ({ style, ...props }: ComponentProps<"div">) => (
  <div style={{ background: "linear-gradient(183deg, color(display-p3 0.7176 0.8824 1) 2.12%, color(display-p3 0.498 0.7765 1) 57.21%, color(display-p3 0.8431 0.9529 1) 102.79%)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0px 4px 0px #0E00BD)", ...style }} {...props} />
);

const CloseBtn = ({ onClick }: { onClick?: () => void }) => {
  return (<div className="flex w-full justify-end z-1">
      <button className="btn btn-sm btn-square outline-none" onClick={onClick}>
        <X size={16} />
      </button>
    </div>
  );
};

export const WelcomeSignUp = () => {
  const openModal = useBoundStore((state) => state.openModal);

  const isAuthenticated = useBoundStore((state) => !!state.user);

  useEffect(() => {
    const now = Date.now();
    const trigger_key = "WELCOME_SIGN_UP_MODAL_TRIGGERED_AT";
    const last_triggered_at = Number(sessionStorage.getItem(trigger_key) ?? "0");

    if (isAuthenticated) return;

    if (StorageExtend.getInstance().getItem("DoNotRemainMeToday")) return;

    // TODO: Prevent rapid duplicate triggers (e.g., React StrictMode / remount)
    if (last_triggered_at && now - last_triggered_at < 5_000) return;

    sessionStorage.setItem(trigger_key, String(now));

    const timeoutId = window.setTimeout(() => {
      openModal("OPEN_WELCOME_SIGN_UP_MODAL");
    }, 1500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isAuthenticated, openModal]);

  return null;
};
