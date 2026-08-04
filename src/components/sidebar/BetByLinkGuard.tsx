import { PropsWithChildren } from "react";
import { useBaseConfig } from "@/hooks/api/usePublic.ts";

/**
 * 在 Betby 不支持的地区和被体育禁止的用户将体育替换为“Live（Casino）”
 * @param props
 * @constructor
 */

export const BetByLinkGuard = (props: PropsWithChildren) => {
  // 基础配置数据
  const { data: baseConfig } = useBaseConfig();

  return (baseConfig?.data?.is_show_betby === 0 ? null : props?.children);
};
