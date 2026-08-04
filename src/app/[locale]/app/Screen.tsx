import { HideGames } from "@/components/sidebar/HideGames.tsx";
import { ClearCache } from "@/components/sidebar/ClearCache.tsx";
import { ProblemReport } from "@/components/sidebar/ProblemReport";
import { SettingsBox } from "@/sections/profile/security/settings-box";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { useBoundStore } from "@/store";
import { updateUserLanguage } from "@/services/auth/user";
import { toast } from "sonner";
import { useDisplayCurrency } from "@/contexts/DisplayCurrencyContext";
import { SelectDropdown } from "@/components/modal/UserFinanceModal/c/SelectDropdown";
import { PwaInstallBanner } from "@/components/PwaInstallButton";
import { useCurrencyData } from "@/hooks/useCurrency.ts";
import { supportedLanguages } from "@/lib/i18n/config";
import { Decimal } from "decimal.js";
import { localizeHref, setLocaleCookie } from "@/lib/navigation";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getLanguageDisplayName } from "@/utils/languages";
import { AUTH_QUERY_KEYS } from "@/hooks/api/useAuth.ts";
import { useQueryClient } from "@tanstack/react-query";

const LANGUAGES = supportedLanguages.map((value) => ({
  value,
  label: getLanguageDisplayName(value),
  flag: ""
}));

function LanguageSwitcher() {
  const { i18n, t } = useTranslation(["common", "menu"]);

  const user = useBoundStore((state) => state.user);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeLang = i18n.language.toLowerCase();
  const queryClient = useQueryClient();

  const currentValue = LANGUAGES.find(lang => {
    const v = lang.value.toLowerCase();
    const base = activeLang.split("-")[0];
    return activeLang === v || base === v.split("-")[0];
  })?.value ?? LANGUAGES[0].value;

  const langOptions = LANGUAGES.map(lang => ({
    id: lang.value,
    value: lang.value,
    label: `${lang.flag} ${lang.label}`
  }));

  // 未登录 & 登录
  const changeLanguage = async (lng: string) => {
    try {
      /** 写 NEXT_LOCALE cookie，让 middleware 在后续无 locale 前缀的导航中自动补全 */
      setLocaleCookie(lng);

      await i18n.changeLanguage(lng);
      const search = searchParams.toString();
      const currentHref = search ? `${pathname}?${search}` : pathname;
      router.replace(localizeHref(currentHref, lng));

      if (user) {
        // 同步后端
        void updateUserLanguage(lng);

        // 乐观更新 RQ 缓存，AuthContext 的 sync effect 会自动同步到 Zustand store
        queryClient.setQueryData(AUTH_QUERY_KEYS.currentUser, (old: any) =>
          old ? { ...old, user: { ...old.user, language_code: lng } } : old
        );
      }

      toast.success(i18n.getFixedT(lng)("common:languageUpdated"));
    } catch {
      toast.error(t("common:languageUpdateFailed"));
    } finally {
    }
  };

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold text-base-content/50">{t("menu:language")}</h2>
      <SelectDropdown
        title={t("menu:language")}
        options={langOptions}
        value={currentValue}
        onChange={(val) => changeLanguage(val as string)}
        renderOption={(option: Record<string, any>) => (
          <span className="font-bold text-sm">{option.label}</span>
        )}
      />
    </div>
  );
}

function CurrencyOption({ label, icon, rate, decimal }: {
  label: string;
  icon?: string;
  rate: string,
  decimal: number
}) {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2">
        {icon && <img loading="lazy" src={icon} className="w-6 h-6 rounded-full shrink-0" />}
        <span className="font-bold">{label}</span>
      </div>
      {rate && (
        <span className="flex items-center gap-2">
          <span
            className="text-sm text-base-content/70 italic">{Decimal(1).div(rate).toDP(decimal, Decimal.ROUND_DOWN).toString()} {label}</span>
          <sub className="text-base-content/50">≈ 1 USD</sub>
        </span>
      )}
    </div>
  );
}

function CurrencySwitcher() {
  const { t } = useTranslation(["common"]);
  const user = useBoundStore((state) => state.user);
  const { groupedCurrencies, selectedCurrency, updateDisplayCurrency } = useDisplayCurrency();
  const fiatCurrencies = groupedCurrencies.fiat || [];

  const { exchangeRates } = useCurrencyData();

  if (!user) return null;

  const currentCurrency = user?.currency_fiat || selectedCurrency;

  const currencyOptions = fiatCurrencies.map(c => ({
    id: c.currency,
    value: c.currency,
    label: c.display_name,
    decimal: c.decimal,
    icon: `/images/currency/${c.currency.toLowerCase()}.png`,
    rate: Decimal(exchangeRates?.[c.currency] ?? 0).toDP(8, Decimal.ROUND_DOWN).toString()
  }));

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold text-base-content/50">{t("common:exchangeRateDisplay")}</h2>
      <SelectDropdown
        title={t("common:exchangeRateDisplay")}
        options={currencyOptions}
        value={currentCurrency}
        onChange={(val) => updateDisplayCurrency(val as string)}
        renderOption={(option: Record<string, any>) => (
          <CurrencyOption label={option.label} icon={option.icon} rate={option.rate} decimal={option.decimal} />
        )}
      />
    </div>
  );
}

function ToolsSection() {
  const { t } = useTranslation(["common"]);

  return (
    <section className="space-y-2">
      <h2 className="text-sm font-semibold text-base-content/50">{t("common:tools")}</h2>
      <div className="space-y-2">
        {/*游戏隐藏*/}
        <HideGames onClose={() => {
        }} />
        {/*api数据刷新*/}
        <ClearCache />
        {/*问题反馈*/}
        <ProblemReport />
        <PwaInstallBanner />
      </div>
    </section>
  );
}

function GameSettings() {
  const { t } = useTranslation(["gameDetail"]);
  const user = useBoundStore((state) => state.user);

  const isGameFullScreen = useBoundStore((s) => s.isGameFullScreen);
  const setGameFullScreen = useBoundStore((s) => s.setGameFullScreen);
  // const isDirectPlay = useBoundStore((s) => s.isDirectPlay);
  // const setDirectPlay = useBoundStore((s) => s.setDirectPlay);

  if (!user) return null;

  return (
    <>
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-base-content/50">{t("game")}</h2>
        <button className="justify-between btn btn-md md:btn-lg w-full">
          <div className="flex items-center gap-x-3 overflow-hidden">
            <span className="text-sm truncate">{t("launchInFullScreen")}</span>
          </div>
          <input
            type="checkbox"
            className="toggle toggle-primary toggle-xs"
            checked={isGameFullScreen}
            onChange={(e) => setGameFullScreen(e.target.checked)}
          />
        </button>
        {/*<div className="bg-base-200 rounded-box px-4 py-3 flex items-center justify-between">*/}
        {/*  <span className="text-sm font-semibold">{t("directPlay")}</span>*/}
        {/*  <input*/}
        {/*    type="checkbox"*/}
        {/*    className="toggle toggle-primary toggle-xs"*/}
        {/*    checked={!isDirectPlay}*/}
        {/*    onChange={(e) => setDirectPlay(!e.target.checked)}*/}
        {/*  />*/}
        {/*</div>*/}
      </section>
    </>
  );
}

function RouteComponent() {
  return (
    <div className="mx-auto p-4 space-y-4">
      {/*货币选择*/}
      <CurrencySwitcher />

      {/*语言切换*/}
      <LanguageSwitcher />

      <GameSettings />

      {/*工具*/}
      <ToolsSection />

      {/*设置*/}
      <SettingsBox />
    </div>
  );
}

export const beforeLoad = undefined;

export default RouteComponent;
