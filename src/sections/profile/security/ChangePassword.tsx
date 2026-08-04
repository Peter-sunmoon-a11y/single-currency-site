import type { ReactNode } from "react";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { useBoundStore } from "@/store";
import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import clsx from "clsx";
import { KeyRound } from "lucide-react";

export function ChangePassword() {
  const { t } = useTranslation("profile");
  const openModal = useBoundStore((state) => state.openModal);

  return (
    <div className="rounded-lg bg-base-200 p-4 flex flex-col gap-4">
      <InnerContainer
        icon={<KeyRound className="w-6 h-6 text-primary" />}
        title={t("profile:changePassword")}
        desc={t("profile:updatePasswordDescription")}
      />
      <ConfirmBox onClick={() => openModal("OPEN_CHANGE_PASSWORD_MODAL")}>
        {t("profile:changePassword")}
      </ConfirmBox>
    </div>
  );
}

// Kept for backward compat — other non-security files still use InnerImg
export const InnerImg = ({ name, className }: { name: string; className?: string }) => {
  return <img src={`/images/profile/${name}.png`} className={clsx("w-14 h-14 md:w-21 md:h-21", className)} alt="" />;
};

export const InnerContainer = ({ icon, title, desc }: { icon: ReactNode; title: string; desc?: string }) => {
  return (
    <div className="flex items-center gap-3 font-semibold">
      <div className="w-12 h-12 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex flex-col flex-1 gap-1">
        <p className="text-base">{title}</p>
        <p className="text-sm text-base-content/50">{desc}</p>
      </div>
    </div>
  );
};
