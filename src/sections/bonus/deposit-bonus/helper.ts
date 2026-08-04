import {TFunction} from "@/lib/i18n/i18next";

export const deposit_bonus_static_info = (t: TFunction) => ([
  {
    id: 1,
    icon: "box-black.png",
    title: t('popup:deposit.firstDepositBonus'),
    subTitle: t('popup:deposit.firstDepositBonusValue'),
    desc: 'popup:deposit.bonusCalculationDesc1V2'
  },
  {
    id: 2,
    icon: "box-red.png",
    title: t('popup:deposit.secondDepositBonus'),
    subTitle: t('popup:deposit.secondDepositBonusValue'),
    desc: 'popup:deposit.bonusCalculationDesc2V2'
  },
  {
    id: 3,
    icon: "box-purple.png",
    title: t('popup:deposit.thirdDepositBonus'),
    subTitle: t('popup:deposit.thirdDepositBonusValue'),
    desc: 'popup:deposit.bonusCalculationDesc3V2'
  },
  {
    id: 4,
    icon: "box-blue.png",
    title: t('popup:deposit.fourthDepositBonus'),
    subTitle: t('popup:deposit.fourthDepositBonusValue'),
    desc: 'popup:deposit.bonusCalculationDesc4V2'
  },
  {
    id: 5,
    icon: "box-general.png",
    alias: t("finance:depositBonusPool"),
    title: t('popup:deposit.lgeFiveDepositBonus'),
    subTitle: t('popup:deposit.lgeFiveDepositBonusValue'),
    desc: 'popup:deposit.bonusCalculationDesc5V2'
  }
])
