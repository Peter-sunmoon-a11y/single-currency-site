import dayjs from "dayjs";

export const parseAmount = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const cleaned = value.replace(/,/g, "");
    const parsed = Number(cleaned);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
};

export const resolveFirstString = (...candidates: unknown[]): string | undefined => {
  for (const candidate of candidates) {
    if (candidate === null || candidate === undefined) continue;
    if (typeof candidate === "string" && candidate.trim().length > 0) {
      return candidate.trim();
    }
    if (typeof candidate === "number") {
      return String(candidate);
    }
  }
  return undefined;
};

export const resolveTimestamp = (...candidates: unknown[]): string | undefined => {
  for (const candidate of candidates) {
    if (candidate === null || candidate === undefined) continue;

    if (typeof candidate === "number") {
      const normalized = candidate > 1_000_000_000_000 ? candidate : candidate * 1000;
      return dayjs(normalized).isValid() ? dayjs(normalized).format("DD MMM [']YY · HH:mm") : undefined;
    }

    if (typeof candidate === "string") {
      const numeric = Number(candidate);
      if (!Number.isNaN(numeric)) {
        const normalized = numeric > 1_000_000_000_000 ? numeric : numeric * 1000;
        if (dayjs(normalized).isValid()) {
          return dayjs(normalized).format("DD MMM [']YY · HH:mm");
        }
      }

      const parsed = dayjs(candidate);
      if (parsed.isValid()) {
        return parsed.format("DD MMM [']YY · HH:mm");
      }
    }
  }

  return undefined;
};

// 仅用于内部积分体系的虚拟币种，不对应真实下注记录，不应出现在筛选器中
export const CASINO_EXCLUDED_ASSETS = new Set(["SPORT"]);
