export interface FormatAmountProps {
  tail?: number;
  unit?: string;
  local?: boolean;
  amount: string;
  decimals?: number;
  lessThan?: number;
  showLess?: boolean;
}
