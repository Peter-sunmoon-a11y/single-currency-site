import { useSupportedGameCurrencies } from "@/hooks/api/usePublic.ts";
import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";

export const CurrencyIconPlaceholder = (
  {
    alt,
    className,
    currency,
    ...props
  }: React.ComponentProps<"img"> & {
    currency: string;
  }) => {
  const { data: currencies } = useSupportedGameCurrencies();
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const target = useMemo(() => {
    if (currency && currencies?.data) {
      // const info = currencies?.data?.find((cur: Record<string, any>) => cur?.currency?.toUpperCase() === currency?.toUpperCase());
      // if (info?.icon) return info.icon;
      return `/images/currency/${currency?.toLowerCase()}.png`;
    }
    return "";
  }, [currency, currencies?.data]);
  useEffect(() => {
    if (!target) return;
    setImageLoaded(false);
    const img = new Image();
    img.src = target;
    img.onload = () => setImageLoaded(true);
  }, [target]);
  return imageLoaded ? (
    <img {...props} src={target} className={clsx("w-5 h-5 rounded-full", className)} alt={alt} loading="lazy" />
  ) : (
    <div className={clsx("skeleton bg-base-200 w-5 h-5 rounded-full", className)} />
  );
};

// TODO: 简化版币种图标展示
export const SimpleCurrencyIconPlaceholder = (
  {
    alt,
    className,
    ...props
  }: React.ComponentProps<"img">) => {
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  useEffect(() => {
    if (!props.src) return;
    setImageLoaded(false);
    const img = new Image();
    img.src = props.src;
    img.onload = () => setImageLoaded(true);
  }, [props.src]);
  return imageLoaded ? (
    <img {...props} src={props.src} className={clsx("w-6 h-6 rounded-full", className)} alt={alt} loading="lazy" />
  ) : (
    <div className={clsx("skeleton bg-base-200 w-6 h-6 rounded-full", className)} />
  );
};
