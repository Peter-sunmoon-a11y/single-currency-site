import {useChoicePromo, useGetPromoByPage} from "@/query/promo.tsx";
import {useRef} from "react";
import {EveryDayBonus} from "@/sections/components/EveryDayBonus.tsx";
import {InnerDisplayContent} from "@/components/modal/UserFinanceModal/c/WithdrawMethodInfoAdd.tsx";
import {LimitOfferBonus} from "@/sections/components/LimitOfferBonus.tsx";
import {DoubleBonus} from "@/sections/components/DoubleBonus.tsx";
import {promoKey} from "@/components/modal/UserFinanceModal/c/SpecialOffers.utils.ts";
import {DataLoading} from "@/components/standard/DataLoading.tsx";

export const SpecialOffers = () => {
  const lockRef = useRef(false);

  const {data, currentPromo, refetch} = useGetPromoByPage();
  const {mutate: choicePromo, isPending} = useChoicePromo();

  const handle = (item: Record<string, any>) => {
    if (lockRef.current) return;
    if (item.promo_code === currentPromo?.promo_code) return;
    lockRef.current = true;
    choicePromo(item.id, {
      onSettled: () => {
        lockRef.current = false;
      }
    });
  };

  return <div className={"relative flex flex-col gap-1 p-1 rounded-lg border-1 border-primary/20"}>
    {isPending && <DataLoading className={'!bg-base-200/50 z-1'}/>}
    {data.map((item: Record<string, any>) => {
      return <div key={item.id} onClick={() => handle(item)}>
        <InnerDisplayContent show={item?.promo_code === promoKey.doubleDeposit()}>
          <DoubleBonus current={item} onExpire={refetch}/>
        </InnerDisplayContent>

        <InnerDisplayContent show={item?.promo_code === promoKey.everyDay()}>
          <EveryDayBonus current={item} onExpire={refetch}/>
        </InnerDisplayContent>

        <InnerDisplayContent
          show={promoKey.limitOfferSet().has(item?.promo_code)}>
          <LimitOfferBonus current={item} onExpire={refetch}/>
        </InnerDisplayContent>
      </div>;
    })}
  </div>;
};
