import { useTranslation } from "@/lib/i18n/react-i18next";
import { localizeHref } from "@/lib/navigation";
import { cn } from "@/utils/cn";
import { useRumSdkUserLog } from "@/utils/helper.ts";
import { Bug } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import Header from "../header/Header";
import { Sidebar } from "../sidebar/Sidebar";

interface GeneralErrorProps {
  error: Error;
  reset: () => void;
}

export function GeneralError({ error }: GeneralErrorProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const mainRef = useRef<HTMLElement>(null);

  const { rumException } = useRumSdkUserLog();

  useEffect(() => {
    // Log the error to console for debugging purposes
    console.error("GeneralError caught:", error);
    // TODO: 异常日志推送
    rumException("Page Error ❌", error);
  }, [error, rumException]);

  const handleBack = () => {
    // Attempt to go back, fallback to home if no history or other issue
    if (window.history.length > 2) {
      router.back();
    } else {
      // Navigate to home with empty search params as required by the root route validator
      router.push(localizeHref("/"));
    }

    location?.reload();
  };

  return (
    <div className="flex h-[100dvh] bg-base-300">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main
          ref={mainRef}
          className={cn("flex-1 w-full overflow-y-auto hide-scrollbar flex flex-col items-center justify-center p-4 text-center")}
        >
          <Bug className="w-12 h-12 mb-4 text-primary" />

          <h2 className="text-base font-bold mb-2 text-base-content">{t("common:somethingWentWrong")}</h2>

          <p className="text-sm text-base-content/70 max-w-xs mx-auto mb-4">{t("common:tryRefresh")}</p>

          <button onClick={handleBack} className="btn btn-primary btn-soft">
            {t("common:common.back")}
          </button>
        </main>
      </div>
    </div>
  );
}
