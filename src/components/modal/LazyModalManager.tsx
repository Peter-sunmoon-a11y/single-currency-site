import {
  BonusFreeSpinsHelpModalWrapper,
  BonusLuckyNumberHelpModalWrapper,
  BonusRakebackHelpModalWrapper,
  BonusStoreHelpModalWrapper,
  BonusSwapModalWrapper,
  BonusTournamentHelpModalWrapper,
  BoostModalWrapper,
  BountyDetailsModalWrapper,
  BuddyBallsDetailsModalWrapper,
  CreateCampaignModalWrapper,
  DailyCheckInDepositModalWrapper,
  DoubleOrNothingHelpModalWrapper,
  DoubleOrNothingModalWrapper,
  DoubledUpModalWrapper,
  ExtraReferralBonusModalWrapper,
  FirstChallengeInfoModalWrapper,
  FreeSpinModalWrapper,
  GameBanReasonModalWrapper,
  GameDetailsModalWrapper,
  GetPromoCodeModalWrapper,
  GiveUpBonusModalWrapper,
  HelpModalMysteryBoxWrapper,
  JesterHelpModalWrapper,
  LimitedOfferModalWrapper,
  LimitedOffersHelpModalWrapper,
  LuckySpinDetailsModalWrapper,
  MemberBonusHelpModalWrapper,
  MembersDayHelpModalWrapper,
  MysteryBoxModalWrapper,
  NotificationPromptModalWrapper,
  NothingModalWrapper,
  PlayBonusDetailsModalWrapper,
  ReferralMyCommissionsDetailsWrapper,
  ReferralRewardsDetailsWrapper,
  ReferralShareModalBigWinWrapper,
  SportsBonusDetailsModalWrapper,
  SportsBonusHelpModalWrapper,
  SportsBonusSwapModalWrapper,
  SundaySuperHelpModalWrapper,
  TieredFirstDepositInfoModalWrapper,
  VIPMondayBonusModalWrapper,
  WheelFortuneWinModalWrapper,
} from "./BonusModalWrappers.tsx";
import {
  AuthModalWrapper,
  BetSlipModalWrapper,
  UserFinanceModalWrapper,
  InternalMessageModalWrapper,
} from "./MultiModalWrappers.tsx";
import {
  CryptoSettlementModalWrapper,
  CurrencySelectorModalWrapper,
  DepositFiatViewModalWrapper,
  DepositMinAmountModalWrapper,
  FinanceAMLModalWrapper,
  WithdrawAddressAddModalWrapper,
  WithdrawMethodInfoAddModalWrapper,
  WithdrawMinAmountModalWrapper,
  WithdrawOkModalWrapper,
  WithdrawPinModalWrapper,
} from "./FinanceModalWrappers.tsx";
import {
  ChangePasswordModalWrapper,
  EmailVerificationModalWrapper,
  ExploreSearchDialogWrapper,
  PhoneAreaCodeModalWrapper,
  PhoneVerificationModalWrapper,
  RolloverDetailsDialogWrapper,
  SetWithdrawalPINModalWrapper,
  WelcomeSignUpModalWrapper,
} from "./ProfileModalWrappers.tsx";

const LazyModalManager = () => {
  return (
    <>
      <AuthModalWrapper />
      <BetSlipModalWrapper />
      <UserFinanceModalWrapper />
      <InternalMessageModalWrapper />
      <GiveUpBonusModalWrapper />
      <ExtraReferralBonusModalWrapper />
      <BonusSwapModalWrapper />
      <VIPMondayBonusModalWrapper />
      <BuddyBallsDetailsModalWrapper />
      <DailyCheckInDepositModalWrapper />
      <BountyDetailsModalWrapper />
      <GetPromoCodeModalWrapper />
      <PlayBonusDetailsModalWrapper />
      <LuckySpinDetailsModalWrapper />
      <WheelFortuneWinModalWrapper />
      <ReferralShareModalBigWinWrapper />
      <SportsBonusSwapModalWrapper />
      <SportsBonusDetailsModalWrapper />
      <LimitedOfferModalWrapper />
      <SundaySuperHelpModalWrapper />
      <DoubleOrNothingHelpModalWrapper />
      <LimitedOffersHelpModalWrapper />
      <BonusStoreHelpModalWrapper />
      <SportsBonusHelpModalWrapper />
      <BonusRakebackHelpModalWrapper />
      <BonusTournamentHelpModalWrapper />
      <MysteryBoxModalWrapper />
      <HelpModalMysteryBoxWrapper />
      <JesterHelpModalWrapper />
      <BonusLuckyNumberHelpModalWrapper />
      <MembersDayHelpModalWrapper />
      <MemberBonusHelpModalWrapper />
      <GameBanReasonModalWrapper />
      <BonusFreeSpinsHelpModalWrapper />
      <NotificationPromptModalWrapper />
      <DoubleOrNothingModalWrapper />
      <DoubledUpModalWrapper />
      <NothingModalWrapper />
      <BoostModalWrapper />
      <GameDetailsModalWrapper />
      <CreateCampaignModalWrapper />
      <FreeSpinModalWrapper />
      <ReferralRewardsDetailsWrapper />
      <ReferralMyCommissionsDetailsWrapper />
      <FirstChallengeInfoModalWrapper />
      <TieredFirstDepositInfoModalWrapper />
      <WithdrawOkModalWrapper />
      <DepositFiatViewModalWrapper />
      <WithdrawMethodInfoAddModalWrapper />
      <WithdrawMinAmountModalWrapper />
      <WithdrawAddressAddModalWrapper />
      <WithdrawPinModalWrapper />
      <FinanceAMLModalWrapper />
      <CryptoSettlementModalWrapper />
      <DepositMinAmountModalWrapper />
      <CurrencySelectorModalWrapper />
      <WelcomeSignUpModalWrapper />
      <ChangePasswordModalWrapper />
      <EmailVerificationModalWrapper />
      <SetWithdrawalPINModalWrapper />
      <PhoneVerificationModalWrapper />
      <PhoneAreaCodeModalWrapper />
      <RolloverDetailsDialogWrapper />
      <ExploreSearchDialogWrapper />
    </>
  );
};

export default LazyModalManager;
