/**
 * 截断小数位，处理科学计数法，不依赖 react-number-format
 */
export const o = (value: string | number, decimal = 8): string => {
  let str: string;
  if (typeof value === "number") {
    str = String(value);
  } else {
    str = value;
  }
  if (str.includes("e") || str.includes("E")) {
    const match = str.match(/[eE]([+-]?\d+)$/);
    const exponent = match ? parseInt(match[1], 10) : 0;
    const safeDecimal = exponent > 10 ? Math.max(0, 20 - exponent) : 20;
    str = Number(str)
      .toFixed(safeDecimal)
      .replace(/\.?0+$/, "");
  }
  return str.indexOf(".") > -1 ? f(str, decimal) : str;
};

const f = (value: string, decimal = 8): string => {
  const regexp = /(?:\.0*|(\.\d+?)0+)$/;
  const [a, b] = value.split(".");
  const output = `${a}.${b.substring(0, decimal)}`;
  return output.replace(regexp, "$1");
};
