import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { BonusDetailsBoard } from "@/sections/bonus/shared/BonusDetailsBoard.tsx";
import { useTranslation } from "@/lib/i18n/react-i18next";
import {useBoundStore} from "@/store";

export function BonusDetails() {
  const { t } = useTranslation();

  const user = useBoundStore((state) => state.user);

  const [detailsOpen, setDetailsOpen] = useState(false);

  return (
    user && <>
      <div className="bg-base-200 rounded-lg p-2">
        <button
          className="btn btn-primary btn-soft btn-sm text-sm"
          onClick={() => setDetailsOpen(o => !o)}
        >
          {t("bonus:bonus_details")}
          {!detailsOpen ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      <BonusDetailsBoard open={detailsOpen} onClose={() => setDetailsOpen(false)} />
    </>
  );
}
