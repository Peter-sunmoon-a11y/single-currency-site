import { useMemo } from "react";

import { FormatAmountProps } from "./interface";

const o = (value: string, decimal = 8, local?: boolean): string => {
  const str = String(value)
  const _value = f(str.indexOf(".") > -1 ? str : `${str}.0`, decimal)
  return local ? _value.replace(/\d+/, (m) => m.replace(/(\d)(?=(\d{3})+$)/g, ($1) => $1 + ',')) : _value;
};

const f = (value: string, decimal = 8): string => {
  const regexp = /(?:\.0*|(\.\d+?)0+)$/;
  const [a, b] = value.split(".");
  const output = `${a}.${b.substring(0, decimal)}`;
  return output.replace(regexp, "$1");
};

function showLessAmount(n: string, decimals = 8, tail = 4) {
  const reg1 = new RegExp(`(0.0<sub>\\d{1,}</sub>)(\\d{0,${tail}})`, 'g')
  let t = n
  const reg2 = new RegExp(`(0{${decimals},})`, 'g')
  const y = t.match(reg2)
  y &&
    y.forEach((i) => {
      t = t.replace(i, `0<sub>${i.split('').length}</sub>`)
    })
  return y ? (t.match(reg1) ?? t) : n
}

const FormatAmount = (
  {
    unit = '',
    tail = 4,
    local,
    amount,
    decimals = 8,
    showLess,
    lessThan = 0
  }: FormatAmountProps) => {
  return useMemo(
    () => {
      const _amount = Number(amount)

      if (lessThan > 0 && _amount > 0 && _amount < lessThan) return (
        <span className={"format-amount"}>{`< ${unit}${lessThan}`}</span>)

      if (showLess && _amount > 0 && decimals >= 5 && _amount < 0.00001) {
        const fixedAmount = Number(amount).toFixed(18)
        const h = { __html: `${unit}${showLessAmount(fixedAmount, decimals, tail)}` }
        return (<span dangerouslySetInnerHTML={h} />)
      }

      const _ = <>{unit}{_amount === 0 ? "0.00" : o(!isNaN(_amount) && String(amount).toLowerCase().includes("e") ? _amount.toFixed(18) : amount, decimals, local)}</>

      return (<span className={"format-amount"}>{_}</span>)
    },
    [unit, amount, showLess, lessThan, decimals],
  );
};

export default FormatAmount;
