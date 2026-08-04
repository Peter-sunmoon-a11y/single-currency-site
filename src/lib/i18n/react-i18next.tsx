"use client";

import {
  useLocale,
  useMessages
} from "next-intl";
import React, { Fragment, ReactElement, ReactNode } from "react";
import { i18nRuntime, resolveMessage } from "./runtime";

type Namespace = string | string[];
type Values = Record<string, unknown>;
type TranslateOptions = Values | string | undefined;

const getNamespace = (namespace?: Namespace) => {
  return Array.isArray(namespace) ? namespace[0] : namespace;
};

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

const toPlainText = (value: string) => {
  return value.replace(/<\d+>(.*?)<\/\d+>/g, "$1");
};

export function useTranslation(namespace?: Namespace) {
  const locale = useLocale();
  const messages = useMessages() as Record<string, unknown>;
  const defaultNamespace = getNamespace(namespace);

  i18nRuntime.setState(locale, messages);

  const t: any = (key: string, options?: TranslateOptions, fallback?: TranslateOptions) => {
    if (!key) return "";
    const resolved = resolveMessage(messages, key, defaultNamespace);
    if (resolved) return toPlainText(interpolate(resolved.message, options, fallback));

    void getValues(options, fallback);
    return getDefaultValue(key, options);
  };

  return {
    t,
    i18n: i18nRuntime,
    ready: true
  };
}

const renderLineBreaks = (text: string): ReactNode => {
  const parts = text.split(/<br\s*\/?>/gi);
  if (parts.length === 1) return text;

  return parts.map((part, index) => (
    <Fragment key={index}>
      {index > 0 ? <br /> : null}
      {part}
    </Fragment>
  ));
};

const renderRichText = (message: string, components?: ReactElement[]): ReactNode => {
  if (!components?.length) return renderLineBreaks(toPlainText(message));

  const match = message.match(/^([\s\S]*?)<(\d+)>([\s\S]*?)<\/\2>([\s\S]*)$/);
  if (!match) return renderLineBreaks(toPlainText(message));

  const [, before, index, inner, after] = match;
  const component = components[Number(index)];
  if (!component) return renderLineBreaks(toPlainText(message));

  return (
    <>
      {renderLineBreaks(before)}
      {React.cloneElement(component, undefined, renderRichText(inner, components))}
      {after ? renderRichText(after, components) : null}
    </>
  );
};

export function Trans({
  i18nKey,
  components,
  values,
  defaults,
  ns
}: {
  i18nKey: string;
  components?: ReactElement[];
  values?: Values;
  defaults?: string;
  ns?: Namespace;
}): ReactNode {
  const messages = useMessages() as Record<string, unknown>;
  const resolved = resolveMessage(messages, i18nKey, getNamespace(ns));
  const baseText = resolved?.message ?? (typeof defaults === "string" ? defaults : i18nKey);
  const translated = interpolate(baseText, values, defaults);

  return <Fragment>{renderRichText(translated, components)}</Fragment>;
}
