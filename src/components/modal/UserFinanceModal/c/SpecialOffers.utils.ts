export const promoKey = {
  doubleDeposit:  () => "special_offer_don_deposit",
  everyDay:       () => "daily_first_deposit_branch",
  firstDeposit:   () => "special_offer_first_deposit",
  secondDeposit:  () => "special_offer_second_deposit",
  limitOfferSet:  () => new Set([promoKey.firstDeposit(), promoKey.secondDeposit()]),

  /** @deprecated 已废弃，使用 everyDay() 替代 */
  sunday:         () => "special_offer_sunday",
  /** @deprecated 已废弃，使用 everyDay() 替代 */
  thursday:       () => "special_offer_thursday",
};
