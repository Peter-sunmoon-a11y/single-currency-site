import { useTranslation } from "@/lib/i18n/react-i18next";
import clsx from "clsx";
import { ChangeEvent, useEffect, useState } from "react";

const PROBLEM_REPORT_STORAGE_KEY = "__problem_report_rum__";
const PROBLEM_REPORT_DURATION = 30 * 60 * 1000;

export const ProblemReport = () => {
  const { t } = useTranslation();

  const [checked, setCheckbox] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const rawValue = window.localStorage.getItem(PROBLEM_REPORT_STORAGE_KEY);

      if (!rawValue) {
        setCheckbox(false);
        return;
      }

      const parsedValue = JSON.parse(rawValue) as { enabled?: boolean; expiresAt?: number };
      const expiresAt = typeof parsedValue.expiresAt === "number" ? parsedValue.expiresAt : 0;
      const isEnabled = Boolean(parsedValue.enabled) && expiresAt > Date.now();

      if (!isEnabled) {
        window.localStorage.removeItem(PROBLEM_REPORT_STORAGE_KEY);
        window.localStorage.removeItem("_arms_session");
        setCheckbox(false);
        return;
      }

      setCheckbox(true);
    } catch {
      setCheckbox(false);
    }
  }, []);

  const handle = async (e: ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();

    const nextChecked = e.target.checked;
    setCheckbox(nextChecked);

    if (typeof window !== "undefined") {
      if (nextChecked) {
        window.localStorage.setItem(
          PROBLEM_REPORT_STORAGE_KEY,
          JSON.stringify({
            enabled: true,
            expiresAt: Date.now() + PROBLEM_REPORT_DURATION,
          })
        );
      } else {
        window.localStorage.removeItem(PROBLEM_REPORT_STORAGE_KEY);
      }

      window.localStorage.removeItem("_arms_session");
      window.location.reload();
    }
  };

  return (
    <button className="justify-between btn btn-md md:btn-lg w-full">
      <div className="flex items-center gap-x-3 overflow-hidden">
        <span className="text-sm truncate">{t("menu:logging_key")}</span>
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={handle}
        className={clsx("toggle toggle-xs", checked ? "toggle-primary" : "")}
      />
    </button>
  );
};
