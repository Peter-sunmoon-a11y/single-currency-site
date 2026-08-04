import "server-only";

import enAchievement from "../../../public/locales/en/achievement.json";
import enBanner from "../../../public/locales/en/banner.json";
import enBonus from "../../../public/locales/en/bonus.json";
import enBonusStore from "../../../public/locales/en/bonusStore.json";
import enBounty from "../../../public/locales/en/bounty.json";
import enBuddyBalls from "../../../public/locales/en/buddyBalls.json";
import enCasino from "../../../public/locales/en/casino.json";
import enChat from "../../../public/locales/en/chat.json";
import enCommon from "../../../public/locales/en/common.json";
import enConquest from "../../../public/locales/en/conquest.json";
import enDoubleOrNothing from "../../../public/locales/en/doubleOrNothing.json";
import enExplore from "../../../public/locales/en/explore.json";
import enFinance from "../../../public/locales/en/finance.json";
import enFirstChallenge from "../../../public/locales/en/firstChallenge.json";
import enGameDetail from "../../../public/locales/en/gameDetail.json";
import enInformation from "../../../public/locales/en/information.json";
import enLogin from "../../../public/locales/en/login.json";
import enLuckySpin from "../../../public/locales/en/luckySpin.json";
import enMenu from "../../../public/locales/en/menu.json";
import enMysteryBox from "../../../public/locales/en/mysteryBox.json";
import enPopup from "../../../public/locales/en/popup.json";
import enProfile from "../../../public/locales/en/profile.json";
import enPromoCode from "../../../public/locales/en/promoCode.json";
import enPwa from "../../../public/locales/en/pwa.json";
import enReferral from "../../../public/locales/en/referral.json";
import enRtp from "../../../public/locales/en/rtp.json";
import enSeo from "../../../public/locales/en/seo.json";
import enSportsBonus from "../../../public/locales/en/sportsBonus.json";
import enToast from "../../../public/locales/en/toast.json";
import enTournament from "../../../public/locales/en/tournament.json";
import enTransaction from "../../../public/locales/en/transaction.json";
import enVip from "../../../public/locales/en/vip.json";
import enVipMonday from "../../../public/locales/en/vipMonday.json";
import enWebpush from "../../../public/locales/en/webpush.json";
import thInformation from "../../../public/locales/th/information.json";
import thSeo from "../../../public/locales/th/seo.json";
import zhCnInformation from "../../../public/locales/zh-CN/information.json";
import zhCnSeo from "../../../public/locales/zh-CN/seo.json";
import { defaultLocale, IntlMessages, isSupportedLocale } from "./config";

const MESSAGE_BUNDLES = {
  en: {
    achievement: enAchievement,
    banner: enBanner,
    bonus: enBonus,
    bonusStore: enBonusStore,
    bounty: enBounty,
    buddyBalls: enBuddyBalls,
    casino: enCasino,
    chat: enChat,
    common: enCommon,
    conquest: enConquest,
    doubleOrNothing: enDoubleOrNothing,
    explore: enExplore,
    finance: enFinance,
    firstChallenge: enFirstChallenge,
    gameDetail: enGameDetail,
    information: enInformation,
    login: enLogin,
    luckySpin: enLuckySpin,
    menu: enMenu,
    mysteryBox: enMysteryBox,
    popup: enPopup,
    profile: enProfile,
    promoCode: enPromoCode,
    pwa: enPwa,
    referral: enReferral,
    rtp: enRtp,
    seo: enSeo,
    sportsBonus: enSportsBonus,
    toast: enToast,
    tournament: enTournament,
    transaction: enTransaction,
    vip: enVip,
    vipMonday: enVipMonday,
    webpush: enWebpush,
  },
  th: {
    information: thInformation,
    seo: thSeo,
  },
  "zh-CN": {
    information: zhCnInformation,
    seo: zhCnSeo,
  },
} as const satisfies Record<string, IntlMessages>;

export const getMessages = async (requestedLocale = defaultLocale): Promise<IntlMessages> => {
  const locale = isSupportedLocale(requestedLocale) ? requestedLocale : defaultLocale;
  return MESSAGE_BUNDLES[locale] ?? MESSAGE_BUNDLES[defaultLocale];
};
