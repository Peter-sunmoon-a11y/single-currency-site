/**
 * 货币相关的hooks集合
 *
 * 提供两个级别的货币工具：
 * 1. useBaseCurrencyUtils - 基础工具，不涉及用户偏好
 * 2. useCurrencyFormatter - 增强版本，包含转换和用户偏好
 */

// 基础货币工具 - 从 useCurrency.ts 导出
export { useBaseCurrencyUtils, useCurrencyData } from "./useCurrency";

// 显示币 hook（状态来自 Zustand store）
export { useDisplayCurrency, useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
// 结算币 hook（状态来自 Zustand store）
export { useSettlementCurrency, useUpdateSettlementCurrency } from "@/contexts/SettlementCurrencyContext";

// 类型导出
export type { Currency, CurrencyFormatOptions, FormattedCurrency } from "@/types/currency";

/**
 * 使用指南：
 *
 * 1. 如果需要货币转换功能（如将BTC转换为用户的游戏货币）：
 *    使用 useDisplayCurrencyFormatter (来自 DisplayCurrencyContext)
 *
 * 2. 如果只需要基础格式化（不涉及转换）：
 *    使用 useBaseCurrencyUtils
 *
 * 3. 如果需要完整的货币数据和底层功能：
 *    使用 useCurrencyData
 */
