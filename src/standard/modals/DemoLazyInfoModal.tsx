"use client";

import { ComponentProps, PropsWithChildren, ReactNode } from "react";
import { X } from "lucide-react";
import clsx from "clsx";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { Modal } from "@/components/ui/Modal.tsx";

export const DemoLazyInfoModal = (
  {
    open,
    onClose
  }: {
    data: any;
    open: boolean;
    onClose: () => void;
  }) => {
  const { t } = useTranslation(["popup", "bonus", "buddyBalls"]);

  return (
    <Modal
      hideTitle
      isOpen={open}
      onClose={onClose}
      className="p-0 md:w-[420px] hide-scrollbar bg-transparent outline-none"
      closeButtonClassName="hidden"
      position="modal-middle"
    >
      <InnerSlogan
        title={t("luckySpin:fortune")}
        picture="/images/game_lucky_spin/spins.png"
        style={{
          background: `radial-gradient(180.83% 141.42% at 100% 0%, color(display-p3 0.9216 0.3255 0.7569 / 0.50) 0%, var(--d-color-base-300, color(display-p3 0.0627 0.0784 0.098 / 0.50)) 100%), var(--d-color-base-300, color(display-p3 0.0627 0.0784 0.098))`
        }}
      />

      <InnerContainer>
        <InnerHeader
          title={<>
            <img src="/images/game_lucky_spin/spins-small.png" alt="" className="w-4 h-4" />
            {t("bonus:bonus_details")}
          </>}
          onClose={onClose}
        />

        <InnerContent>
          <InnerDescription cls="!mt-0">demo1</InnerDescription>
          <InnerTitle title={t("demo2")} />
          <InnerDescription>{t("demo3")}</InnerDescription>
          <InnerTitle title={t("demo4")} />
          <InnerDescription>{t("demo5")}</InnerDescription>
          <InnerTitle title={t("demo6")} />
          <InnerDescription>{t("demo7")}</InnerDescription>
        </InnerContent>
      </InnerContainer>
    </Modal>
  );
};

export default DemoLazyInfoModal;

export const InnerTitle = ({ title, className }: { title: ReactNode, className?: string }) => {
  return <h3 className={clsx("text-base text-base-content font-bold flex items-center gap-1 mt-4", className)}>{title}</h3>;
};

export const InnerClose = (props: ComponentProps<"button">) => {
  return <button {...props} className="btn btn-sm btn-square outline-none"><X size={16} /></button>;
};

export const InnerSlogan = ({ title, picture, style, className }: {
  title: ReactNode,
  picture: string,
  style?: React.CSSProperties
  className?: string
}) => {
  return (
    <div
      className={clsx("rounded-lg p-4 relative overflow-hidden max-h-[140px] h-[140px] flex items-center bg-base-100 bg-gradient-to-br from-primary/50 via-primary/25 to-base-200", className)}
      style={style}
    >
      <div className="relative z-10 flex items-center h-full justify-between w-full">
        <h3 className="z-1 text-lg font-bold text-base-content uppercase whitespace-pre-line">
          {title}
        </h3>
        <img src={picture} className="absolute h-full object-contain right-0" alt="" />
      </div>
    </div>
  );
};

export const InnerHeader = ({ title, onClose }: { title: ReactNode, onClose: () => void }) => {
  return (
    <div className="flex items-center justify-between">
      <InnerTitle className="!mt-0" title={title} />
      <InnerClose onClick={onClose} />
    </div>
  );
};

export const InnerContent = (props: PropsWithChildren) => {
  return <div className="hide-scrollbar overflow-y-auto max-h-[420px]">{props.children}</div>;
};

export const InnerContainer = (props: PropsWithChildren<{ className?: string }>) => {
  return (
    <section className={clsx("mt-1 text-sm font-semibold bg-base-100 p-4 rounded-lg flex-1 leading-4", props.className)}>
      {props.children}
    </section>
  );
};

export const InnerDescription = (props: PropsWithChildren<{ cls?: string }>) => {
  return <p className={clsx("text-base-content/50 whitespace-pre-line mt-2", props.cls)}>{props.children}</p>;
};
