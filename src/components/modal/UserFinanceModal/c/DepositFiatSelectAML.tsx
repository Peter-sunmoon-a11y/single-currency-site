import { useBoundStore } from "@/store";
import { Trans, useTranslation } from "@/lib/i18n/react-i18next";
import { ChevronRight, ShieldCheck } from "lucide-react";

// TODO: 一些法币需要做一下前置的提示给用户
const fiatAMLSet = new Set(["THB", "thb"]);

export const DepositFiatSelectAML = () => {
  const { t } = useTranslation();

  // from data store, share common data
  const depositFiat = useBoundStore((state) => state.depositFiat);

  const fiat = depositFiat?.currency?.currency;

  return fiat && fiatAMLSet.has(fiat) && (<>
    <details
      open
      className="cursor-pointer group collapse text-sm bg-base-200 !rounded-lg p-2 text-base-content/50 outline-none">
      <summary className="list-none select-none">
        <h4 className={"flex items-center justify-between gap-4 text-primary"}>
          <div className={"flex items-center gap-1"}><ShieldCheck size={16} />{t('finance:read_carefully')}</div>
          <div className="btn btn-square btn-sm btn-soft">
            <ChevronRight
              className="w-3 h-3 transition-transform duration-200 group-open:rotate-90"
            />
          </div>
        </h4>
      </summary>
      <p className={"collapse-content p-0 mt-2 text-warning text-sm whitespace-pre-line"}>
        <Trans i18nKey="toast:depositNameEntered" components={[<b className={"text-base-content"} />]} />
      </p>
    </details>
  </>);
};
