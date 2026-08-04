import clsx from "clsx";

export const InnerCoinBox = ({ imageSrc = "/images/bonus_store/coin.png", animateCls = 'animate-coin-pulse' }: { imageSrc?: string, animateCls?: string }) => {
  return <img src={imageSrc} alt="" className={clsx("w-50 m-auto", animateCls)} />;
};
