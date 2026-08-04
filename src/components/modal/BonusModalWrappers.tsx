import { lazy, Suspense, type ReactNode } from "react";
import { useBoundStore } from "@/store";

const BonusSwapModal = lazy(() => import("./BonusWallet/SlotsBonus"));
const VIPMondayBonusModal = lazy(() => import("./VIPMondayBonus.tsx"));
const BuddyBallsDetailsModal = lazy(() => import("@/sections/bonus/buddy-ball/details.tsx"));
const DailyCheckInDepositModal = lazy(() => import("@/sections/daily-check/DepositToContinueCheckInModal.tsx"));
const BountyDetailsModal = lazy(() => import("@/sections/bonus/bounty/bounty-help-modal.tsx").then((m) => ({ default: m.BountyHelpModal })));
const LuckySpinDetailsModal = lazy(() => import("@/sections/lucky-spin/details.tsx"));
const GetPromoCodeModal = lazy(() => import("./GetPromoCodeModal.tsx"));
const PlayBonusDetailsModal = lazy(() => import("./BonusWallet/PlayBonusDetailsModal.tsx"));
const WheelFortuneWinModal = lazy(() => import("./BonusWallet/WheelFortuneWinModal.tsx"));
const ReferralShareModalBigWin = lazy(() => import("@/sections/referral/referral-share-bigwin.tsx").then((m) => ({ default: m.ReferralShareModalBigWin })));
const SportsBonusSwapModal = lazy(() => import("./BonusWallet/SportsBonus/SportsBonusSwapModal.tsx"));
const SportsBonusDetailsModal = lazy(() => import("./BonusWallet/SportsBonus/SportsBonusDetailsModal.tsx"));
const LimitedOfferModal = lazy(() => import("@/sections/limited-offer/LimitedOffer.tsx"));
const SundaySuperHelpModal = lazy(() => import("@/sections/sunday-super-bouns/sunday-super-help-modal.tsx").then((m) => ({ default: m.SundaySuperHelpModal })));
const DoubleOrNothingHelpModal = lazy(() => import("@/sections/double-or-nothing/double-or-nothing-help-modal.tsx").then((m) => ({ default: m.DoubleOrNothingHelpModal })));
const LimitedOffersHelpModal = lazy(() => import("@/sections/limited-offer/limited-offers-help-modal").then((m) => ({ default: m.LimitedOffersHelpModal })));
const BonusStoreHelpModal = lazy(() => import("@/sections/bonus/bonus-store/bonus-store-help-modal").then((m) => ({ default: m.BonusStoreHelpModal })));
const SportsBonusHelpModal = lazy(() => import("@/sections/sports-bonus/sports-bonus-store/SportsBonusHelpModal").then((m) => ({ default: m.SportsBonusHelpModal })));
const BonusRakebackHelpModal = lazy(() => import("@/sections/bonus/rakeback/bonus-rakeback-help-modal").then((m) => ({ default: m.BonusRakebackHelpModal })));
const BonusTournamentHelpModal = lazy(() => import("@/sections/bonus/tournament/bonus-tournament-help-modal").then((m) => ({ default: m.BonusTournamentHelpModal })));
const MysteryBoxModal = lazy(() => import("@/sections/bonus/mystery-box/bonus-mystery-box-modal").then((m) => ({ default: m.MysteryBoxModal })));
const HelpModalMysteryBox = lazy(() => import("@/sections/bonus/mystery-box/bonus-mystery-box-help-modal").then((m) => ({ default: m.HelpModalMysteryBox })));
const JesterHelpModal = lazy(() => import("@/sections/bonus/vip-bonus/jester-help-modal").then((m) => ({ default: m.JesterHelpModal })));
const BonusLuckyNumberHelpModal = lazy(() => import("@/sections/bonus/lucky-number").then((m) => ({ default: m.BonusLuckyNumberHelpModal })));
const MembersDayHelpModal = lazy(() => import("@/sections/bonus/members-day/MembersDayHelpModal").then((m) => ({ default: m.MembersDayHelpModal })));
const MemberBonusHelpModal = lazy(() => import("@/sections/bonus/vip-progress/MemberBonusHelpModal").then((m) => ({ default: m.MemberBonusHelpModal })));
const GameBanReasonModal = lazy(() => import("./GameBanReasonModal.tsx").then((m) => ({ default: m.GameBanReasonModal })));
const BonusFreeSpinsHelpModal = lazy(() => import("@/sections/bonus/free-spins/bonus-free-spins-help-modal").then((m) => ({ default: m.BonusFreeSpinsHelpModal })));
const NotificationPromptModal = lazy(() => import("./NotificationPromptModal.tsx").then((m) => ({ default: m.NotificationPromptModal })));
const DoubleOrNothingModal = lazy(() => import("@/sections/double-or-nothing/DoubleOrNothingModal").then((m) => ({ default: m.DoubleOrNothingModal })));
const DoubledUpModal = lazy(() => import("@/sections/double-or-nothing/DoubledUp").then((m) => ({ default: m.DoubledUp })));
const NothingModal = lazy(() => import("@/sections/double-or-nothing/NothingModal.tsx").then((m) => ({ default: m.NothingModal })));
const BoostModal = lazy(() => import("@/sections/double-or-nothing/BoostModal.tsx").then((m) => ({ default: m.BoostModal })));
const GameDetailsModal = lazy(() => import("@/sections/gameId/game-details-modal.tsx").then((m) => ({ default: m.GameDetailsModal })));
const CreateCampaignModal = lazy(() => import("@/sections/referral/referral-create-campaign-modal").then((m) => ({ default: m.CreateCampaignModal })));
const FreeSpinModal = lazy(() => import("@/sections/free-spins/free-spin-starter-pack-modal").then((m) => ({ default: m.FreeSpinModal })));
const FirstChallengeInfoModal = lazy(() => import("@/sections/bonus/first-challenge/FirstChallengeInfoModal").then((m) => ({ default: m.FirstChallengeInfoModal })));
const TieredFirstDepositInfoModal = lazy(() => import("@/sections/bonus/tiered-first-deposit").then((m) => ({ default: m.TieredFirstDepositInfoModal })));
const ExtraReferralBonusModal = lazy(() => import("./ExtraReferralBonus.tsx"));
const GiveUpBonusModal = lazy(() => import("./BonusWallet/GiveUpBonusModal.tsx"));
const ReferralRewardsDetails = lazy(() => import("@/sections/referral/referral-rewards-details.tsx"));
const ReferralMyCommissionsDetails = lazy(() => import("@/sections/referral/referral-my-commissions-details.tsx"));

const ModalSuspense = ({ children }: { children: ReactNode }) => (
  <Suspense fallback={null}>{children}</Suspense>
);

export const GiveUpBonusModalWrapper = () => {
  const data = useBoundStore((state) => state.modals.OPEN_GIVE_UP_BONUS_MODAL?.data);
  const open = useBoundStore((state) => "OPEN_GIVE_UP_BONUS_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);
  if (!open) return null;
  return <ModalSuspense><GiveUpBonusModal open={open} data={data} onClose={() => closeModal("OPEN_GIVE_UP_BONUS_MODAL")} /></ModalSuspense>;
};

export const ExtraReferralBonusModalWrapper = () => {
  const open = useBoundStore((state) => "OPEN_EXTRA_REFERRAL_BONUS_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);
  if (!open) return null;
  return <ModalSuspense><ExtraReferralBonusModal open={open} onClose={() => closeModal("OPEN_EXTRA_REFERRAL_BONUS_MODAL")} /></ModalSuspense>;
};

export const BonusSwapModalWrapper = () => {
  const data = useBoundStore((state) => state.modals.OPEN_BONUS_SWAP_MODAL?.data);
  const open = useBoundStore((state) => "OPEN_BONUS_SWAP_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);
  if (!open) return null;
  return <ModalSuspense><BonusSwapModal open={open} data={data} onClose={() => closeModal("OPEN_BONUS_SWAP_MODAL")} /></ModalSuspense>;
};

export const VIPMondayBonusModalWrapper = () => {
  const open = useBoundStore((state) => "OPEN_VIP_MONDAY_BONUS_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);
  if (!open) return null;
  return <ModalSuspense><VIPMondayBonusModal open={open} onClose={() => closeModal("OPEN_VIP_MONDAY_BONUS_MODAL")} /></ModalSuspense>;
};

export const BuddyBallsDetailsModalWrapper = () => {
  const open = useBoundStore((state) => "OPEN_BUDDY_BALLS_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);
  if (!open) return null;
  return <ModalSuspense><BuddyBallsDetailsModal open={open} onClose={() => closeModal("OPEN_BUDDY_BALLS_MODAL")} /></ModalSuspense>;
};

export const DailyCheckInDepositModalWrapper = () => {
  const open = useBoundStore((state) => "OPEN_DAILY_CHECK_IN_DEPOSIT_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);
  if (!open) return null;
  return <ModalSuspense><DailyCheckInDepositModal open={open} onClose={() => closeModal("OPEN_DAILY_CHECK_IN_DEPOSIT_MODAL")} /></ModalSuspense>;
};

export const BountyDetailsModalWrapper = () => {
  const open = useBoundStore((state) => "OPEN_BOUNTY_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);
  if (!open) return null;
  return <ModalSuspense><BountyDetailsModal isOpen={open} onClose={() => closeModal("OPEN_BOUNTY_MODAL")} /></ModalSuspense>;
};

export const GetPromoCodeModalWrapper = () => {
  const data = useBoundStore((state) => state.modals.OPEN_GET_PROMO_CODE_MODAL?.data);
  const open = useBoundStore((state) => "OPEN_GET_PROMO_CODE_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);
  if (!open) return null;
  return <ModalSuspense><GetPromoCodeModal open={open} onClose={() => closeModal("OPEN_GET_PROMO_CODE_MODAL")} data={data} /></ModalSuspense>;
};

export const PlayBonusDetailsModalWrapper = () => {
  const data = useBoundStore((state) => state.modals.OPEN_PLAY_BONUS_MODAL?.data);
  const open = useBoundStore((state) => "OPEN_PLAY_BONUS_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);
  if (!open) return null;
  return <ModalSuspense><PlayBonusDetailsModal open={open} data={data} onClose={() => closeModal("OPEN_PLAY_BONUS_MODAL")} /></ModalSuspense>;
};

export const LuckySpinDetailsModalWrapper = () => {
  const open = useBoundStore((state) => "OPEN_LUCKY_SPIN_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);
  if (!open) return null;
  return <ModalSuspense><LuckySpinDetailsModal open={open} onClose={() => closeModal("OPEN_LUCKY_SPIN_MODAL")} /></ModalSuspense>;
};

export const WheelFortuneWinModalWrapper = () => {
  const data = useBoundStore((state) => state.modals.OPEN_WHEEL_FORTUNE_WIN_MODAL?.data);
  const open = useBoundStore((state) => "OPEN_WHEEL_FORTUNE_WIN_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);
  if (!open) return null;
  return <ModalSuspense><WheelFortuneWinModal open={open} onClose={() => closeModal("OPEN_WHEEL_FORTUNE_WIN_MODAL")} data={data} /></ModalSuspense>;
};

export const ReferralShareModalBigWinWrapper = () => {
  const open = useBoundStore((state) => "OPEN_REFERRAL_SHARE_BIG_WIN_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);
  if (!open) return null;
  return <ModalSuspense><ReferralShareModalBigWin open={open} closeModal={() => closeModal("OPEN_REFERRAL_SHARE_BIG_WIN_MODAL")} /></ModalSuspense>;
};

export const SportsBonusSwapModalWrapper = () => {
  const data = useBoundStore((state) => state.modals.OPEN_SPORTS_BONUS_SWAP_MODAL?.data);
  const open = useBoundStore((state) => "OPEN_SPORTS_BONUS_SWAP_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);
  if (!open) return null;
  return <ModalSuspense><SportsBonusSwapModal open={open} data={data} onClose={() => closeModal("OPEN_SPORTS_BONUS_SWAP_MODAL")} /></ModalSuspense>;
};

export const SportsBonusDetailsModalWrapper = () => {
  const data = useBoundStore((state) => state.modals.OPEN_PLAY_SPORTS_BONUS_MODAL?.data);
  const open = useBoundStore((state) => "OPEN_PLAY_SPORTS_BONUS_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);
  if (!open) return null;
  return <ModalSuspense><SportsBonusDetailsModal open={open} data={data} onClose={() => closeModal("OPEN_PLAY_SPORTS_BONUS_MODAL")} /></ModalSuspense>;
};

export const LimitedOfferModalWrapper = () => {
  const data = useBoundStore((state) => state.modals.OPEN_LIMIT_OFFER_MODAL?.data);
  const open = useBoundStore((state) => "OPEN_LIMIT_OFFER_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);
  if (!open) return null;
  return <ModalSuspense><LimitedOfferModal open={open} data={data} onClose={() => closeModal("OPEN_LIMIT_OFFER_MODAL")} /></ModalSuspense>;
};

export const SundaySuperHelpModalWrapper = () => {
  const data = useBoundStore((state) => state.modals.OPEN_SUNDAY_SUPER_HELP_MODAL?.data);
  const open = useBoundStore((state) => "OPEN_SUNDAY_SUPER_HELP_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);
  if (!open) return null;
  return <ModalSuspense><SundaySuperHelpModal open={open} onClose={() => closeModal("OPEN_SUNDAY_SUPER_HELP_MODAL")} currentPromo={data?.currentPromo} /></ModalSuspense>;
};

export const DoubleOrNothingHelpModalWrapper = () => {
  const data = useBoundStore((state) => state.modals.OPEN_DOUBLE_OR_NOTHING_HELP_MODAL?.data);
  const open = useBoundStore((state) => "OPEN_DOUBLE_OR_NOTHING_HELP_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);
  if (!open) return null;
  return <ModalSuspense><DoubleOrNothingHelpModal open={open} onClose={() => closeModal("OPEN_DOUBLE_OR_NOTHING_HELP_MODAL")} currentPromo={data?.currentPromo} /></ModalSuspense>;
};

export const LimitedOffersHelpModalWrapper = () => {
  const data = useBoundStore((state) => state.modals.OPEN_LIMITED_OFFERS_HELP_MODAL?.data);
  const open = useBoundStore((state) => "OPEN_LIMITED_OFFERS_HELP_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);
  if (!open) return null;
  return <ModalSuspense><LimitedOffersHelpModal open={open} onClose={() => closeModal("OPEN_LIMITED_OFFERS_HELP_MODAL")} currentPromo={data?.currentPromo} /></ModalSuspense>;
};

export const BonusStoreHelpModalWrapper = () => {
  const open = useBoundStore((state) => "OPEN_BONUS_STORE_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);
  if (!open) return null;
  return <ModalSuspense><BonusStoreHelpModal isOpen={open} onClose={() => closeModal("OPEN_BONUS_STORE_MODAL")} /></ModalSuspense>;
};

export const SportsBonusHelpModalWrapper = () => {
  const open = useBoundStore((state) => "OPEN_SPORTS_BONUS_HELP_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);
  if (!open) return null;
  return <ModalSuspense><SportsBonusHelpModal isOpen={open} onClose={() => closeModal("OPEN_SPORTS_BONUS_HELP_MODAL")} /></ModalSuspense>;
};

export const BonusRakebackHelpModalWrapper = () => {
  const open = useBoundStore((state) => "OPEN_RAKEBACK_HELP_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);
  if (!open) return null;
  return <ModalSuspense><BonusRakebackHelpModal isOpen={open} onClose={() => closeModal("OPEN_RAKEBACK_HELP_MODAL")} /></ModalSuspense>;
};

export const BonusTournamentHelpModalWrapper = () => {
  const open = useBoundStore((state) => "OPEN_TOURNAMENT_HELP_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);
  if (!open) return null;
  return <ModalSuspense><BonusTournamentHelpModal isOpen={open} onClose={() => closeModal("OPEN_TOURNAMENT_HELP_MODAL")} /></ModalSuspense>;
};

export const MysteryBoxModalWrapper = () => {
  const open = useBoundStore((state) => "OPEN_MYSTERY_BOX_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);
  if (!open) return null;
  return <ModalSuspense><MysteryBoxModal isOpen={open} onClose={() => closeModal("OPEN_MYSTERY_BOX_MODAL")} /></ModalSuspense>;
};

export const HelpModalMysteryBoxWrapper = () => {
  const open = useBoundStore((state) => "OPEN_MYSTERY_BOX_HELP_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);
  if (!open) return null;
  return <ModalSuspense><HelpModalMysteryBox isOpen={open} onClose={() => closeModal("OPEN_MYSTERY_BOX_HELP_MODAL")} /></ModalSuspense>;
};

export const JesterHelpModalWrapper = () => {
  const open = useBoundStore((state) => "OPEN_JESTER_HELP_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);
  if (!open) return null;
  return <ModalSuspense><JesterHelpModal isOpen={open} onClose={() => closeModal("OPEN_JESTER_HELP_MODAL")} /></ModalSuspense>;
};

export const BonusLuckyNumberHelpModalWrapper = () => {
  const data = useBoundStore((state) => state.modals.OPEN_LUCKY_NUMBER_HELP_MODAL?.data);
  const open = useBoundStore((state) => "OPEN_LUCKY_NUMBER_HELP_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);
  if (!open) return null;
  return <ModalSuspense><BonusLuckyNumberHelpModal data={data} isOpen={open} onClose={() => closeModal("OPEN_LUCKY_NUMBER_HELP_MODAL")} /></ModalSuspense>;
};

export const MembersDayHelpModalWrapper = () => {
  const open = useBoundStore((state) => "OPEN_MEMBERS_DAY_HELP_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);
  if (!open) return null;
  return <ModalSuspense><MembersDayHelpModal isOpen={open} onClose={() => closeModal("OPEN_MEMBERS_DAY_HELP_MODAL")} /></ModalSuspense>;
};

export const MemberBonusHelpModalWrapper = () => {
  const open = useBoundStore((state) => "OPEN_MEMBER_BONUS_HELP_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);
  if (!open) return null;
  return <ModalSuspense><MemberBonusHelpModal isOpen={open} onClose={() => closeModal("OPEN_MEMBER_BONUS_HELP_MODAL")} /></ModalSuspense>;
};

export const GameBanReasonModalWrapper = () => {
  const data = useBoundStore((state) => state.modals.OPEN_GAME_BAN_REASON_MODAL?.data);
  const open = useBoundStore((state) => "OPEN_GAME_BAN_REASON_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);
  if (!open) return null;
  return <ModalSuspense><GameBanReasonModal open={open} reason={data?.reason} image={data?.image} gameName={data?.gameName} onClose={() => closeModal("OPEN_GAME_BAN_REASON_MODAL")} /></ModalSuspense>;
};

export const BonusFreeSpinsHelpModalWrapper = () => {
  const open = useBoundStore((state) => "OPEN_FREE_SPINS_HELP_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);
  if (!open) return null;
  return <ModalSuspense><BonusFreeSpinsHelpModal isOpen={open} onClose={() => closeModal("OPEN_FREE_SPINS_HELP_MODAL")} /></ModalSuspense>;
};

export const NotificationPromptModalWrapper = () => {
  const open = useBoundStore((state) => "OPEN_NOTIFICATION_PROMPT_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);
  if (!open) return null;
  return <ModalSuspense><NotificationPromptModal isOpen={open} onClose={() => closeModal("OPEN_NOTIFICATION_PROMPT_MODAL")} /></ModalSuspense>;
};

export const DoubleOrNothingModalWrapper = () => {
  const data = useBoundStore((state) => state.modals.OPEN_DOUBLE_OR_NOTHING_MODAL?.data);
  const open = useBoundStore((state) => "OPEN_DOUBLE_OR_NOTHING_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);
  if (!open) return null;
  return <ModalSuspense><DoubleOrNothingModal open={open} onClose={() => closeModal("OPEN_DOUBLE_OR_NOTHING_MODAL")} modalData={data} /></ModalSuspense>;
};

export const DoubledUpModalWrapper = () => {
  const data = useBoundStore((state) => state.modals.OPEN_DOUBLED_UP_MODAL?.data);
  const open = useBoundStore((state) => "OPEN_DOUBLED_UP_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);
  if (!open) return null;
  return <ModalSuspense><DoubledUpModal open={open} onClose={() => closeModal("OPEN_DOUBLED_UP_MODAL")} donData={data} /></ModalSuspense>;
};

export const NothingModalWrapper = () => {
  const data = useBoundStore((state) => state.modals.OPEN_NOTHING_MODAL?.data);
  const open = useBoundStore((state) => "OPEN_NOTHING_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);
  if (!open) return null;
  return <ModalSuspense><NothingModal open={open} onClose={() => closeModal("OPEN_NOTHING_MODAL")} don_record_id={data?.don_record_id} /></ModalSuspense>;
};

export const BoostModalWrapper = () => {
  const data = useBoundStore((state) => state.modals.OPEN_BOOST_MODAL?.data);
  const open = useBoundStore((state) => "OPEN_BOOST_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);
  if (!open) return null;
  return <ModalSuspense><BoostModal open={open} onClose={() => closeModal("OPEN_BOOST_MODAL")} modalData={data} /></ModalSuspense>;
};

export const GameDetailsModalWrapper = () => {
  const data = useBoundStore((state) => state.modals.OPEN_GAME_DETAILS_MODAL?.data);
  const open = useBoundStore((state) => "OPEN_GAME_DETAILS_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);
  if (!open) return null;
  return <ModalSuspense><GameDetailsModal open={open} data={data} onClose={() => closeModal("OPEN_GAME_DETAILS_MODAL")} /></ModalSuspense>;
};

export const CreateCampaignModalWrapper = () => {
  const data = useBoundStore((state) => state.modals.OPEN_CREATE_CAMPAIGN_MODAL?.data);
  const open = useBoundStore((state) => "OPEN_CREATE_CAMPAIGN_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);
  if (!open) return null;
  return <ModalSuspense><CreateCampaignModal isOpen={open} onClose={() => closeModal("OPEN_CREATE_CAMPAIGN_MODAL")} compaignDetail={data?.compaignDetail ?? null} /></ModalSuspense>;
};

export const FreeSpinModalWrapper = () => {
  const data = useBoundStore((state) => state.modals.OPEN_FREE_SPIN_MODAL?.data);
  const open = useBoundStore((state) => "OPEN_FREE_SPIN_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);
  if (!open) return null;
  return <ModalSuspense><FreeSpinModal isOpen={open} onClose={() => closeModal("OPEN_FREE_SPIN_MODAL")} freeSpinData={data?.freeSpinData} /></ModalSuspense>;
};

export const ReferralRewardsDetailsWrapper = () => {
  const data = useBoundStore((state) => state.modals.OPEN_REFERRAL_REWARDS_DETAILS_MODAL?.data);
  const open = useBoundStore((state) => "OPEN_REFERRAL_REWARDS_DETAILS_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);
  if (!open) return null;
  return <ModalSuspense><ReferralRewardsDetails item={data} isOpen={open} onClose={() => closeModal("OPEN_REFERRAL_REWARDS_DETAILS_MODAL")} /></ModalSuspense>;
};

export const ReferralMyCommissionsDetailsWrapper = () => {
  const data = useBoundStore((state) => state.modals.OPEN_REFERRAL_COMMISSIONS_DETAILS_MODAL?.data);
  const open = useBoundStore((state) => "OPEN_REFERRAL_COMMISSIONS_DETAILS_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);
  if (!open) return null;
  return <ModalSuspense><ReferralMyCommissionsDetails item={data} isOpen={open} onClose={() => closeModal("OPEN_REFERRAL_COMMISSIONS_DETAILS_MODAL")} /></ModalSuspense>;
};

export const FirstChallengeInfoModalWrapper = () => {
  const open = useBoundStore((state) => "OPEN_FIRST_CHALLENGE_INFO_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);
  if (!open) return null;
  return <ModalSuspense><FirstChallengeInfoModal isOpen={open} onClose={() => closeModal("OPEN_FIRST_CHALLENGE_INFO_MODAL")} /></ModalSuspense>;
};

export const TieredFirstDepositInfoModalWrapper = () => {
  const open = useBoundStore((state) => "OPEN_TIERED_FIRST_DEPOSIT_INFO_MODAL" in state.modals);
  const closeModal = useBoundStore((state) => state.closeModal);
  if (!open) return null;
  return <ModalSuspense><TieredFirstDepositInfoModal isOpen={open} onClose={() => closeModal("OPEN_TIERED_FIRST_DEPOSIT_INFO_MODAL")} /></ModalSuspense>;
};
