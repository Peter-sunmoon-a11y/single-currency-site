import { useBoundStore } from "@/store";
import { useTranslation } from "@/lib/i18n/react-i18next";

type TabItemsType = "crypto" | "fiat";

const tabItems: TabItemsType[] = ["fiat", "crypto"];

export const DepositType = ({ sticky = true }: { sticky?: boolean }) => {
  const { t } = useTranslation("finance");

  const { depositType, setDepositType } = useBoundStore();

  return (
    <div role="tablist" className={`mt-1 z-10 bg-base-200 mb-4 tabs tabs-box tabs-md [--tab-color:var(--color-primary)] ${sticky ? "sticky top-0" : ""}`}>
      {tabItems.map((label) => (
        <button
          key={label}
          role="tab"
          onClick={() => setDepositType(label)}
          className={`text-sm tab flex-1 font-bold ${depositType === label ? "tab-active text-primary" : ""}`}
        >
          {t(label)}
        </button>
      ))}
    </div>
  );
};


