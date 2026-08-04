import { useBoundStore } from "@/store";
import { useTranslation } from "@/lib/i18n/react-i18next";

type TabItemsType = "crypto" | "fiat";

const tabItems: { label: TabItemsType }[] = [
  {
    label: "fiat",
  },
  {
    label: "crypto",
  },
];

export const WithdrawType = () => {
  const { t } = useTranslation("finance");

  const { withdrawType, setWithdrawType } = useBoundStore();

  return (
    <div role="tablist" className="mt-1 z-1 bg-base-200 mb-4 tabs tabs-box tabs-md sticky top-0 [--tab-color:var(--color-primary)]">
      {tabItems.map(({ label }) => (
        <button
          key={label}
          role="tab"
          onClick={() => {
            setWithdrawType(label);
          }}
          className={`text-sm tab flex-1 font-bold ${withdrawType === label ? "tab-active text-primary" : ""}`}
        >
          {t(label)}
        </button>
      ))}
    </div>
  );
};
