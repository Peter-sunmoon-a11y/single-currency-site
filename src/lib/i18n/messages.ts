import "server-only";

import { promises as fs } from "fs";
import path from "path";
import { defaultLocale, IntlMessages, isSupportedLocale } from "./config";

const LOCALES_ROOT = path.join(process.cwd(), "public", "locales");
const bundleCache = new Map<string, Promise<Record<string, unknown>>>();
const shouldCache = process.env.NODE_ENV === "production";

const readJsonFile = async (filePath: string) => {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw) as Record<string, unknown>;
};

const listLocaleNamespaces = async (locale: string) => {
  const localeDir = path.join(LOCALES_ROOT, locale);
  const entries = await fs.readdir(localeDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => entry.name.replace(/\.json$/, ""))
    .sort();
};

const loadLocaleNamespace = async (locale: string, namespace: string) => {
  const cacheKey = `${locale}:${namespace}`;
  if (shouldCache) {
    const cached = bundleCache.get(cacheKey);
    if (cached) return cached;
  }

  const promise = (async () => {
    const filePath = path.join(LOCALES_ROOT, locale, `${namespace}.json`);
    try {
      return await readJsonFile(filePath);
    } catch (error) {
      throw new Error(`Failed to load locale namespace "${namespace}" for "${locale}"`, { cause: error });
    }
  })();

  if (shouldCache) {
    bundleCache.set(cacheKey, promise);
  }
  return promise;
};

const loadLocaleMessages = async (locale: string, namespaces?: string[]) => {
  const effectiveNamespaces = namespaces?.length ? namespaces : await listLocaleNamespaces(locale);
  const entries = await Promise.all(
    effectiveNamespaces.map(async (namespace) => [namespace, await loadLocaleNamespace(locale, namespace)] as const)
  );
  return Object.fromEntries(entries) as IntlMessages;
};

export const getMessages = async (
  requestedLocale = defaultLocale,
  namespaces?: string[]
): Promise<IntlMessages> => {
  const locale = isSupportedLocale(requestedLocale) ? requestedLocale : defaultLocale;
  return loadLocaleMessages(locale, namespaces);
};
