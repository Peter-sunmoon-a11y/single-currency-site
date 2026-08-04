import { defaultLocale, isSupportedLocale } from "@/lib/i18n/config";

type SearchValue = string | number | boolean | null | undefined;
type SearchInput = Record<string, SearchValue> | ((previous: Record<string, string>) => Record<string, SearchValue>) | null | undefined;

export type HrefOptions = {
  to?: string;
  href?: string;
  params?: Record<string, string | number | undefined>;
  search?: SearchInput;
  replace?: boolean;
  back?: boolean;
  state?: unknown;
};

export function searchParamsToObject(searchParams: URLSearchParams | ReadonlyURLSearchParamsLike) {
  return Array.from(searchParams.entries()).reduce<Record<string, string>>((acc, [key, value]) => {
    acc[key] = value;
    return acc;
  }, {});
}

export function decodeRouteParam(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return "";

  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function encodeRouteParam(value: string | number | undefined) {
  return encodeURIComponent(String(value ?? "")).replace(/%3A/gi, ":");
}

const nonPagePathPrefixes = ["/api", "/_next", "/images", "/locales", "/vendor"];

const getBrowserLocale = () => {
  if (typeof window === "undefined") return defaultLocale;
  const [, maybeLocale] = window.location.pathname.split("/");
  return isSupportedLocale(maybeLocale) ? maybeLocale : defaultLocale;
};

export function localizeHref(href: string, locale?: string) {
  if (
    !href ||
    href.startsWith("#") ||
    href.startsWith("//") ||
    /^[a-z][a-z\d+.-]*:/i.test(href) ||
    !href.startsWith("/") ||
    nonPagePathPrefixes.some((prefix) => href === prefix || href.startsWith(`${prefix}/`))
  ) {
    return href;
  }

  const [pathnameWithSearch, hash = ""] = href.split("#");
  const [pathname, search = ""] = pathnameWithSearch.split("?");
  const [, maybeLocale] = pathname.split("/");
  const targetLocale = isSupportedLocale(locale) ? locale : getBrowserLocale();

  if (isSupportedLocale(maybeLocale)) {
    if (maybeLocale === targetLocale) return href;

    const segments = pathname.split("/");
    segments[1] = targetLocale;
    const localizedPath = segments.join("/") || `/${targetLocale}`;
    return `${localizedPath}${search ? `?${search}` : ""}${hash ? `#${hash}` : ""}`;
  }

  const localizedPath = pathname === "/" ? `/${targetLocale}` : `/${targetLocale}${pathname}`;
  return `${localizedPath}${search ? `?${search}` : ""}${hash ? `#${hash}` : ""}`;
}

export function buildHref(
  options: string | number | HrefOptions,
  currentSearch?: URLSearchParams | ReadonlyURLSearchParamsLike,
  locale?: string,
) {
  if (typeof options === "number") return options;
  if (typeof options === "string") return localizeHref(options, locale);

  const rawPath = String(options.href || options.to || "/");
  const path = Object.entries(options.params ?? {}).reduce((nextPath, [key, value]) => {
    return nextPath.replace(`$${key}`, encodeRouteParam(value));
  }, rawPath);

  if (!options.search) return localizeHref(path, locale);

  const nextSearch = new URLSearchParams(currentSearch?.toString());
  const search = typeof options.search === "function" ? options.search(searchParamsToObject(nextSearch)) : options.search;

  for (const [key, value] of Object.entries(search)) {
    if (value === undefined || value === null || value === "") {
      nextSearch.delete(key);
    } else {
      nextSearch.set(key, String(value));
    }
  }

  const query = nextSearch.toString();
  return localizeHref(query ? `${path}?${query}` : path, locale);
}

type ReadonlyURLSearchParamsLike = {
  entries(): IterableIterator<[string, string]>;
  toString(): string;
};

/** 写 NEXT_LOCALE cookie，让 middleware 在后续无 locale 前缀的导航中自动补全；用 cookie 而非 localStorage 是因为 SSR 期间服务端也能读取 */
export function setLocaleCookie(locale: string) {
  if (typeof document === "undefined") return;
  document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`;
}
