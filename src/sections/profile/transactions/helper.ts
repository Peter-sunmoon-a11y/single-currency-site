type TKeys = "PENDING" | "PROCESSING" | "SUCCESS" | "COMPLETED" | "FAILED" | "EXPIRED" | "CANCELLED" | "DEFAULT"

// 样式匹配
const cls_match: { [key in TKeys]: string } = {
  "PENDING": "bg-warning text-warning-content",
  "PROCESSING": "bg-warning text-warning-content",
  "SUCCESS": "bg-success text-success-content",
  "COMPLETED": "bg-success text-success-content",
  "FAILED": "bg-error text-error-content",
  "EXPIRED": "bg-error text-error-content",
  "CANCELLED": "bg-error text-error-content",
  "DEFAULT": "bg-base-300 text-base-content"
};

// 翻译匹配
const trans_match: { [key in TKeys]: string } = {
  "PENDING": "transaction:transactionStatus.pending",
  "PROCESSING": "transaction:transactionStatus.pending",
  "SUCCESS": "transaction:transactionStatus.completed",
  "COMPLETED": "transaction:transactionStatus.completed",
  "FAILED": "transaction:transactionStatus.failed",
  "EXPIRED": "transaction:transactionStatus.failed",
  "CANCELLED": "transaction:transactionStatus.failed",
  "DEFAULT": "transaction:transactionStatus.unknown"
};

// For Withdraw
const withdraw_match = {
  "0": "PROCESSING",
  "5": "PROCESSING",
  "6": "PROCESSING",
  "8": "PROCESSING",
  "1": "SUCCESS",
  "2": "FAILED",
  "3": "FAILED",
  "7": "FAILED",
  "4": "CANCELLED"
};

// For Deposit
const deposit_match = {
  "0": "PROCESSING",
  "3": "PROCESSING",
  "1": "SUCCESS",
  "2": "FAILED",
  "8": "FAILED",
  "4": "CANCELLED"
};

// 普通状态匹配
const general_match = {
  "0": "PROCESSING",
  "1": "SUCCESS",
  "2": "FAILED",
  "3": "PROCESSING",
  "4": "CANCELLED",
  "8": "FAILED"
};

// TODO: 有些记录是需要直接完成的
const SPECIAL_TYPE_JUST_COMPLETED_SET = new Set(["Referral", "Commission", "BonusStore", "SportsBonusStore"]);

export const getTransactionStatus = (type: string, status: any) => {
  if (SPECIAL_TYPE_JUST_COMPLETED_SET.has(type)) {
    return {
      cls: cls_match.COMPLETED,
      trans: trans_match.COMPLETED
    };
  }
  if (!type || !/^\d+$/.test(String(status))) return {
    cls: cls_match.DEFAULT,
    trans: String(status).toUpperCase()
  };
  const base_match: Record<string, any> = { deposit_match, withdraw_match };
  const final_type_match = `${type.toLowerCase()}_match`;
  const key: TKeys = (base_match[final_type_match] ?? general_match)[String(status)] ?? "DEFAULT";
  return {
    cls: cls_match[key],
    trans: trans_match[key]
  };
};