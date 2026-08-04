import "server-only";

import { existsSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { defaultLocale, IntlMessages, isSupportedLocale } from "./config";

const localesRoot = path.join(process.cwd(), "public", "locales");

const readJson = async (filePath: string) => {
  const source = await readFile(filePath, "utf8");
  return JSON.parse(source) as unknown;
};

export const getMessages = async (requestedLocale = defaultLocale): Promise<IntlMessages> => {
  const locale = isSupportedLocale(requestedLocale) ? requestedLocale : defaultLocale;
  const fallbackDir = path.join(localesRoot, defaultLocale);
  const localeDir = path.join(localesRoot, locale);
  const sourceDir = existsSync(localeDir) ? localeDir : fallbackDir;
  const messages: IntlMessages = {};

  for (const entry of await readdir(sourceDir, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith(".json")) {
      const namespace = entry.name.replace(/\.json$/, "");
      messages[namespace] = await readJson(path.join(sourceDir, entry.name));
    }
  }

  return messages;
};
