import { defaultLocale, IntlMessages } from "./config";
import { LANGUAGE_STORAGE_KEY } from "@/utils/storageKeys";

type LocaleSetter = (locale: string) => void;
type TranslateOptions = Record<string, unknown> | string | undefined;

const getValues = (options?: TranslateOptions, fallback?: TranslateOptions) => {
  if (fallback && typeof fallback === "object") return fallback;
  return options && typeof options === "object" ? options : undefined;
};

const getDefaultValue = (key: string, options?: TranslateOptions) => {
  return typeof options === "string" ? options : key;
};

const interpolate = (value: string, options?: TranslateOptions, fallback?: TranslateOptions) => {
  const values = getValues(options, fallback);
  if (!values) return value;
  return value.replace(/\{\{\s*([^}\s]+)\s*\}\}/g, (_, key: string) => String(values[key] ?? ""));
};

export const normalizeKey = (key: string, namespace?: string) => {
  if (key.includes(":")) {
    const [ns, ...rest] = key.split(":");
    return `${ns}.${rest.join(":")}`;
  }
  return namespace ? `${namespace}.${key}` : key;
};

export const lookupMessage = (messages: IntlMessages, key: string): unknown => {
  return key.split(".").reduce<unknown>((current, part) => {
    if (current && typeof current === "object" && part in current) {
      return (current as Record<string, unknown>)[part];
    }
    return undefined;
  }, messages);
};

const buildLookupCandidates = (key: string, namespace?: string) => {
  const candidates: string[] = [];
  const add = (value: string) => {
    if (value && !candidates.includes(value)) candidates.push(value);
  };

  if (key.includes(":")) {
    const [ns, ...rest] = key.split(":");
    const restKey = rest.join(":");
    add(`${ns}.${restKey}`);
    if (restKey && !restKey.startsWith(`${ns}.`)) {
      add(`${ns}.${ns}.${restKey}`);
    }
    return candidates;
  }

  if (namespace) {
    add(`${namespace}.${key}`);
    if (key.includes(".")) {
      add(`${namespace}.${namespace}.${key}`);
    }
  }

  add(key);

  if (key.includes(".")) {
    const [first] = key.split(".");
    add(`${first}.${key}`);
  }

  return candidates;
};

export const resolveMessage = (messages: IntlMessages, key: string, namespace?: string) => {
  for (const candidate of buildLookupCandidates(key, namespace)) {
    const message = lookupMessage(messages, candidate);
    if (typeof message === "string") {
      return { key: candidate, message };
    }
  }
  return null;
};

class I18nRuntime {
  language = defaultLocale;
  private messages: IntlMessages = {};
  private setLocale?: LocaleSetter;

  setState(locale: string, messages: IntlMessages, setLocale?: LocaleSetter) {
    this.language = locale;
    this.messages = messages;
    this.setLocale = setLocale;
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale.split("-")[0] || defaultLocale;
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, locale);
    }
  }

  async changeLanguage(locale: string) {
    this.language = locale;
    this.setLocale?.(locale);
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale.split("-")[0] || defaultLocale;
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, locale);
    }
    return this;
  }

  t = (key: string, options?: TranslateOptions, fallback?: TranslateOptions) => {
    const resolved = resolveMessage(this.messages, key);
    return resolved ? interpolate(resolved.message, options, fallback) : getDefaultValue(key, options);
  };

  getFixedT = (locale?: string, namespace?: string) => {
    void locale;
    return (key: string, options?: TranslateOptions, fallback?: TranslateOptions) => {
      const resolved = resolveMessage(this.messages, key, namespace);
      return resolved ? interpolate(resolved.message, options, fallback) : getDefaultValue(key, options);
    };
  };

  getDataByLanguage = (locale?: string): any => {
    void locale;
    return this.messages;
  };

  hasResourceBundle = (locale: string, namespace: string) => {
    void locale;
    return Boolean(this.messages[namespace]);
  };

  addResourceBundle = (
    locale: string,
    namespace: string,
    resources: unknown,
    deep?: boolean,
    overwrite?: boolean
  ) => {
    void locale;
    void deep;
    if (!overwrite && this.messages[namespace]) return;
    this.messages[namespace] = resources;
  };

  dir = () => "ltr";

  on = () => this;
}

export const i18nRuntime = new I18nRuntime();
