import { ReactNode } from "react";

// 一个用于根据公开环境变量开关来决定是否渲染子内容的小组件。
// 用法：<EnvVariablesGuard name="NEXT_PUBLIC_ENABLED_FOO">...</EnvVariablesGuard>

type EnvFlagProps = {
  // 环境变量名称，例如："NEXT_PUBLIC_ENABLED_ALLIANCE"
  name: string;
  // 开关为真时渲染
  children: ReactNode;
  // 开关为假时渲染（默认是 null）
  fallback?: ReactNode;
};

// 将常见的“真值”字符串规范化为 boolean。
// 支持：true / 1 / yes / on（不区分大小写）
const truthy = (raw: unknown) => {
  if (raw == null) return false;
  if (typeof raw === "boolean") return raw;
  const v = String(raw).trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes" || v === "on";
};

export const EnvVariablesGuard = ({ name, children, fallback = null }: EnvFlagProps) => {
  const raw = process.env[name];
  return truthy(raw) ? children : fallback;
};
