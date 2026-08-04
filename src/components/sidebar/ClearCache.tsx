import { useTranslation } from "@/lib/i18n/react-i18next";

const safe = (fn: () => void) => {
  try {
    fn();
  } catch {
    // ignore
  }
};

// const safeAsync = async (fn: () => Promise<void>) => {
//   try {
//     await fn();
//   } catch {
//     // ignore
//   }
// };

export const ClearCache = () => {
  const { t } = useTranslation();

  const handleClear = async () => {
    safe(() => {
      window.location.reload();
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => void handleClear()}
        className="justify-between btn btn-md md:btn-lg w-full"
      >
        <div className="flex items-center gap-x-3 min-w-0 overflow-hidden">
          <span className="text-sm truncate font-bold">{t('common:clearCache')}</span>
        </div>
      </button>
    </>
  )
    ;
};