import { CountdownTimerThree } from "@/components/ui/CountdownTimer";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { useBoundStore } from "@/store";
import { BadgeAlert } from "lucide-react";
import { useCurrencyData } from "@/hooks/useCurrency";
import { ICurrentPromoList } from "@/types/double-or-nothing";


const getFormattedMinAmount = (
  currentPromo: ICurrentPromoList,
  depositType: string,
  depositFiat: any,
  depositCrypto: any,
  convertCurrency: any,
  exchangeRates: any,
  formatCurrency: any,
) => {
  const value =
    convertCurrency({
      amount: currentPromo?.min_amount,
      fromCurrency: "USDT",
      toCurrency:
        depositType === "fiat"
          ? depositFiat?.currency?.currency
          : depositCrypto?.currency?.currency,
      exchangeRates: exchangeRates,
    }) || 0;

  const valueNum = depositType === "fiat" ? Math.ceil(value || 0) : value;

  return formatCurrency({
    amount: valueNum,
    currency: depositType === "fiat" ? depositFiat?.currency?.currency : depositCrypto?.currency?.currency,
    showSymbol: true,
    showCode: false,
  }).formatted;
};

const getFormattedCashBonus = (
  currentPromo: ICurrentPromoList,
  depositType: string,
  depositFiat: any,
  depositCrypto: any,
  convertCurrency: any,
  exchangeRates: any,
  formatCurrency: any,
) => {
  const value =
    convertCurrency({
      amount: currentPromo?.bonus_amount,
      fromCurrency: "USDT",
      toCurrency:
        depositType === "fiat"
          ? depositFiat?.currency?.currency
          : depositCrypto?.currency?.currency,
      exchangeRates: exchangeRates,
    }) || 0;

  return formatCurrency({
    currency:
      depositType === "fiat"
        ? depositFiat?.currency?.currency
        : depositCrypto?.currency?.currency,
    amount: value,
    showCode: false,
    showSymbol: true,
  }).formatted;
};


export const LimitedOfferBanner = ({ currentPromo }: { currentPromo: ICurrentPromoList }) => {

  const { t } = useTranslation();
  const { convertCurrency, exchangeRates, formatCurrency } = useCurrencyData();
  const { depositFiat, depositCrypto, depositType, openModal } = useBoundStore();

  return (

    <div className="w-full h-[138px] rounded-lg relative overflow-hidden  ">
      <div className="absolute inset-0 w-full h-full"
        style={{
          transform: "none",
        }}
      >
        <svg className='w-full h-full' viewBox="0 0 375 138" preserveAspectRatio="xMaxYMax meet" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g filter="url(#filter0_f_23_1347)">
            <ellipse cx="237.234" cy="202" rx="192" ry="179" fill="var(--color-primary)" />
          </g>
          <rect width="131.692" height="417.524" transform="matrix(0.803413 0.595422 -0.455574 0.890198 94.2208 23.0442)" fill="var(--color-primary)" fillOpacity="0.19" />
          <mask id="path-3-outside-1_23_1347" maskUnits="userSpaceOnUse" x="-45.251" y="32.2906" width="363.902" height="528.847" fill="black">
            <rect fill="white" x="-45.251" y="32.2906" width="363.902" height="528.847" />
            <path d="M199.746 55.5121L318.572 143.575L104.947 561L-13.8779 472.937L199.746 55.5121Z" />
          </mask>
          <path d="M199.746 55.5121L318.572 143.575L104.947 561L-13.8779 472.937L199.746 55.5121Z" fill="color-mix(in oklch, var(--color-base-400) 20%, transparent)" />
          <path d="M-13.8779 472.937L16.7307 495.621L230.355 78.1966L199.746 55.5121L169.138 32.8276L-44.4866 450.252L-13.8779 472.937Z" fill="var(--color-primary)" mask="url(#path-3-outside-1_23_1347)" />
          <g filter="url(#filter1_f_23_1347)">
            <circle cx="178.166" cy="40.9316" r="191.932" fill="var(--color-base-400)" />
          </g>
          <defs>
            <filter id="filter0_f_23_1347" x="-116.061" y="-138.295" width="706.591" height="680.591" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
              <feGaussianBlur stdDeviation="80.6477" result="effect1_foregroundBlur_23_1347" />
            </filter>
            <filter id="filter1_f_23_1347" x="-175.061" y="-312.295" width="706.454" height="706.454" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
              <feGaussianBlur stdDeviation="80.6477" result="effect1_foregroundBlur_23_1347" />
            </filter>
          </defs>
        </svg>
      </div>
      <div className="relative px-4 pt-4">
        <div className='flex-inline flex-col justify-center relative z-10'>
          <div className="flex items-center gap-4">
            <p className="text-lg test-base text-base-content font-bold whitespace-pre-line leading-5">{t('finance:limited_offer')}</p>
            <BadgeAlert
              strokeWidth={3}
              className="w-5 h-5 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                openModal("OPEN_LIMITED_OFFERS_HELP_MODAL", { currentPromo });
              }}
            />
          </div>
          <button className="btn btn-primary min-w-[151px] h-[42px] p-2 my-1 whitespace-pre-line text-left leading-4 font-bold text-ml text-[14px]">
            {t('finance:deposit_plus_cash_bonus',
              {
                amount: getFormattedMinAmount(
                  currentPromo,
                  depositType,
                  depositFiat,
                  depositCrypto,
                  convertCurrency,
                  exchangeRates,
                  formatCurrency,
                ),
                cash_bonus: getFormattedCashBonus(
                  currentPromo,
                  depositType,
                  depositFiat,
                  depositCrypto,
                  convertCurrency,
                  exchangeRates,
                  formatCurrency,
                ),
              })}
          </button>
          <div className='text-primary font-semibold text-sm leading-5 flex items-center gap-1'>
            <div>{t('bonus:expires_in')}</div> <CountdownTimerThree expireTime={currentPromo?.expired_at} />
          </div>
        </div>
        <img src="/images/deposit_promotion/specialOffer.png" className='w-[160px] h-[160px] absolute top-0'
             style={{
            right: "-7px",
            transform: "none",
          }}
        />
      </div>
    </div>
  );
};

export const LimitedOfferBannerPC = ({ currentPromo }: { currentPromo: any }) => {

  const { t } = useTranslation();
  const { convertCurrency, exchangeRates, formatCurrency } = useCurrencyData();
  const { depositFiat, depositCrypto, depositType, openModal } = useBoundStore();

  return (
    <div className="w-[208px] h-[244px] rounded-lg relative overflow-hidden border border-primary">
      <div className="absolute inset-0 w-full h-full"
        style={{
          transform: "none",
        }}
      >
        <svg width="208" height="244" viewBox="0 0 208 244" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g filter="url(#filter0_f_13183_41706)">
            <ellipse cx="237.234" cy="202" rx="192" ry="179" fill="var(--color-primary)" />
          </g>
          <rect width="131.692" height="417.524" transform="matrix(0.803413 0.595422 -0.455574 0.890198 94.2227 23.0469)" fill="var(--color-primary)" fillOpacity="0.19" />
          <mask id="path-3-outside-1_13183_41706" maskUnits="userSpaceOnUse" x="-45.2512" y="32.2942" width="363.902" height="528.847" fill="black">
            <rect fill="white" x="-45.2512" y="32.2942" width="363.902" height="528.847" />
            <path d="M199.746 55.5156L318.571 143.579L104.947 561.004L-13.8781 472.94L199.746 55.5156Z" />
          </mask>
          <path d="M199.746 55.5156L318.571 143.579L104.947 561.004L-13.8781 472.94L199.746 55.5156Z" fill="color-mix(in oklch, var(--color-base-400) 19%, transparent)" />
          <path d="M-13.8781 472.94L16.7305 495.625L230.355 78.2001L199.746 55.5156L169.137 32.8311L-44.4867 450.256L-13.8781 472.94Z" fill="#E7FB78" mask="url(#path-3-outside-1_13183_41706)" />
          <g filter="url(#filter1_f_13183_41706)">
            <circle cx="178.166" cy="40.9316" r="191.932" fill="var(--color-base-400)" />
          </g>
          <defs>
            <filter id="filter0_f_13183_41706" x="-116.061" y="-138.295" width="706.591" height="680.591" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
              <feGaussianBlur stdDeviation="80.6477" result="effect1_foregroundBlur_13183_41706" />
            </filter>
            <filter id="filter1_f_13183_41706" x="-175.061" y="-312.295" width="706.454" height="706.45" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
              <feGaussianBlur stdDeviation="80.6477" result="effect1_foregroundBlur_13183_41706" />
            </filter>
          </defs>
        </svg>
      </div>
      <img src="/images/deposit_promotion/specialOffer.png" className='w-[196px] h-[196px] absolute bottom-[-21px]'
           style={{
          right: "-58px",
          transform: "none",
        }}
      />
      <div className="relative p-4">
        <div className='flex-inline flex-col justify-center'>
          <div className="flex items-center gap-4 mb-2">
            <p className="text-lg test-base text-base-content font-bold whitespace-pre-line leading-5">{t('finance:limited_offer')}</p>
            <BadgeAlert
              strokeWidth={3}
              className="w-5 h-5 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                openModal("OPEN_LIMITED_OFFERS_HELP_MODAL", { currentPromo });
              }}
            />
          </div>
          <div className='text-primary font-semibold text-sm leading-5 flex items-center gap-1 mb-4 flex-wrap'>
            <div>{t('bonus:expires_in')}</div> <CountdownTimerThree expireTime={currentPromo?.expired_at} />
          </div>
          <button className="btn btn-primary max-w-[155px] p-2 h-auto m-0 my-1 whitespace-pre-line text-left leading-4 font-bold text-ml text-[14px]">
            {t('finance:deposit_plus_cash_bonus',
              {
                amount: getFormattedMinAmount(
                  currentPromo,
                  depositType,
                  depositFiat,
                  depositCrypto,
                  convertCurrency,
                  exchangeRates,
                  formatCurrency,
                ),
                cash_bonus: getFormattedCashBonus(
                  currentPromo,
                  depositType,
                  depositFiat,
                  depositCrypto,
                  convertCurrency,
                  exchangeRates,
                  formatCurrency,
                ),
              })}
          </button>
        </div>
      </div>
    </div>
  )
}
