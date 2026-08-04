import { handleBindOrHideFormItemDefaultValue } from "@/components/modal/UserFinanceModal/c/DepositFiatFormInit.tsx";
import { parser } from "@/utils/financeParser.ts";

export type GiftStatus = "available" | "processing" | "completed" | "cancelled";
export type GiftType = "crypto" | "fiat";

export type GiftNetworkOption = {
  id: string;
  label: string;
  value: string;
  icon?: string;
  feeRate: string;
  feeFix: string;
  raw: Record<string, any>;
};

export type GiftChannelOption = {
  id: string;
  label: string;
  value: string;
  channelClass?: string;
  channelId?: string;
  feeRate: string;
  feeFix: string;
  params: Record<string, any>;
  disabled?: boolean;
  raw: Record<string, any>;
};

export type GiftDetail = {
  amount: string;
  currency: string;
  notice: string;
  status: GiftStatus;
  type: GiftType;
  networks: GiftNetworkOption[];
  channels: GiftChannelOption[];
};

export const CLAIM_KEY_REGEXP = /^[0-9a-f]{48}$/;

export const resolveAssetIcon = (value?: string) => {
  if (!value) return undefined;
  return `/images/currency/${value.toLowerCase()}.png`;
};

const normalizeStatus = (value: unknown): GiftStatus => {
  if (typeof value === "string") {
    const normalized = value.toLowerCase();
    if (normalized.includes("process")) return "processing";
    if (normalized.includes("complete") || normalized.includes("success")) return "completed";
    if (normalized.includes("cancel")) return "cancelled";
    return "available";
  }

  if (typeof value === "number") {
    if (value === 1) return "processing";
    if (value === 2) return "completed";
    if (value === 3) return "cancelled";
  }

  return "available";
};

const normalizeType = (value: unknown): GiftType => {
  return String(value ?? "").toLowerCase().includes("fiat") ? "fiat" : "crypto";
};

const safeParseSchema = (value: unknown) => {
  if (!value) return {};
  if (typeof value === "string") {
    try {
      return parser(value);
    } catch {
      return {};
    }
  }
  return typeof value === "object" ? value as Record<string, any> : {};
};

const normalizeFeeValue = (item: Record<string, any>, keys: string[]) => {
  const value = keys.map((key) => item[key]).find((next) => next !== undefined && next !== null && next !== "");
  return String(value ?? 0);
};

const normalizeNetworks = (raw: unknown): GiftNetworkOption[] => {
  const list = Array.isArray(raw) ? raw : [];
  const output: GiftNetworkOption[] = [];

  list.forEach((item) => {
    if (typeof item === "string") {
      output.push({
        id: item,
        label: item,
        value: item,
        icon: resolveAssetIcon(item),
        feeRate: "0",
        feeFix: "0",
        raw: { network: item }
      });
      return;
    }

    if (!item || typeof item !== "object") return;

    const network = String(item.network ?? item.value ?? item.label ?? item.display_name ?? "");
    if (!network) return;

    output.push({
      id: network,
      label: String(item.display_name ?? item.label ?? network),
      value: network,
      icon: item.icon || resolveAssetIcon(network),
      feeRate: normalizeFeeValue(item, ["fee_rate", "withdraw_fee_rate", "network_fee_rate"]),
      feeFix: normalizeFeeValue(item, ["fee_fix", "withdraw_fee_fix", "network_fee_fix"]),
      raw: item
    });
  });

  return output;
};

const normalizeChannels = (raw: unknown): GiftChannelOption[] => {
  const list = Array.isArray(raw) ? raw : [];
  const output: GiftChannelOption[] = [];

  list.forEach((item, index) => {
    const optionValue = `gift-channel-${index}`;

    if (typeof item === "string") {
      output.push({
        id: optionValue,
        label: item,
        value: optionValue,
        channelClass: item,
        feeRate: "0",
        feeFix: "0",
        params: {},
        raw: { channel_class: item }
      });
      return;
    }

    if (!item || typeof item !== "object") return;

    const channelClass = item.channel_class ? String(item.channel_class) : undefined;
    const channelId = item.channel_id != null ? String(item.channel_id) : item.id != null ? String(item.id) : undefined;
    const label = String(item.display_name ?? item.channel_class ?? item.label ?? channelId ?? optionValue);
    if (!label) return;

    output.push({
      id: optionValue,
      label,
      value: optionValue,
      channelClass,
      channelId,
      feeRate: normalizeFeeValue(item, ["fee_rate", "withdraw_fee_rate", "channel_fee_rate"]),
      feeFix: normalizeFeeValue(item, ["fee_fix", "withdraw_fee_fix", "channel_fee_fix"]),
      params: safeParseSchema(item.params ?? item.info_fields ?? item.fields ?? item.form_params),
      disabled: item.status === 0 || item.active === 0,
      raw: item
    });
  });

  return output;
};

export const normalizeGiftDetail = (payload: Record<string, any>): GiftDetail => {
  const data = payload?.data ?? payload ?? {};

  return {
    amount: String(data.amount ?? data.withdraw_amount ?? 0),
    currency: String(data.currency ?? data.display_currency ?? ""),
    notice: String(data.notice ?? data.remark ?? ""),
    status: normalizeStatus(data.status ?? data.gift_status ?? data.state),
    type: normalizeType(data.type ?? data.withdraw_type ?? data.currency_type),
    networks: normalizeNetworks(data.networks ?? data.network_list ?? data.available_networks ?? data.gateway_list),
    channels: normalizeChannels(data.channels ?? data.channel_list ?? data.channel_classes ?? data.available_channels)
  };
};

export const buildInfoDefaults = (fields: Record<string, any>, source: Record<string, any> | null) => {
  const next: Record<string, string> = {};

  Object.entries(fields).forEach(([key, field]) => {
    if (key === "amount" || !field || typeof field !== "object") return;

    if (field.bind || field.hide) {
      next[key] = String(handleBindOrHideFormItemDefaultValue(field, source) ?? "");
      return;
    }

    if (Array.isArray(field.select)) {
      next[key] = String(field.default ?? field.select[0]?.value ?? "");
      return;
    }

    next[key] = String(field.default ?? "");
  });

  return next;
};

export const getFieldError = (
  field: Record<string, any>,
  value: string,
  t: (key: string, options?: Record<string, any>) => string
) => {
  const normalized = value.trim();

  if (field.required && !normalized) return t("finance:field_required");
  if (!normalized) return "";

  if (field.label === "email" && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(normalized)) {
    return t("finance:enter_email_correct");
  }

  if (field.type === "number") {
    if (!/^\d+$/.test(normalized)) return t("finance:enter_number");

    if (field.fixed_length) {
      const lengths = String(field.fixed_length).split(",").map((item) => item.trim()).filter(Boolean);
      if (!lengths.includes(String(normalized.length))) {
        return t("finance:enter_number_limit_length", { limit: field.fixed_length });
      }
    }

    if (field.min_length && field.max_length && field.min_length === field.max_length && normalized.length !== Number(field.min_length)) {
      return t("finance:enter_number_fixed_len", { len: field.min_length });
    }

    if (field.min_length && field.max_length && field.min_length !== field.max_length) {
      if (normalized.length < Number(field.min_length) || normalized.length > Number(field.max_length)) {
        return field.label === "mobile_number"
          ? t("finance:enter_phone_min_max", { min: field.min_length, max: field.max_length })
          : t("finance:enter_number_min_max", { min: field.min_length, max: field.max_length });
      }
    }
  }

  if (field.type !== "number") {
    if (field.min_length && !field.max_length && normalized.length < Number(field.min_length)) {
      return t("finance:enter_string_min_length", { length: field.min_length });
    }

    if (field.min_length && field.max_length && field.min_length === field.max_length && normalized.length !== Number(field.min_length)) {
      return t("finance:enter_code_fixed_len", { len: field.min_length });
    }

    if (field.min_length && field.max_length && field.min_length !== field.max_length) {
      if (normalized.length < Number(field.min_length) || normalized.length > Number(field.max_length)) {
        return t("finance:enter_code_min_max", { min: field.min_length, max: field.max_length });
      }
    }

    if (field.disabled_char && normalized.includes(String(field.disabled_char))) {
      return t("finance:enter_string_disabled_char", { char: field.disabled_char });
    }

    if (field.en_only && !/^[A-Za-z0-9 ]+$/.test(normalized)) {
      return t("finance:enter_string_en_only");
    }
  }

  return "";
};
