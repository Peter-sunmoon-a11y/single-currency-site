import { i18nRuntime } from "./runtime";

export type TFunction = (key: string, options?: Record<string, unknown> | string, fallback?: Record<string, unknown>) => string;

export const t: TFunction = i18nRuntime.t;

export default i18nRuntime;
