// API路径映射 - 集中管理所有API路径 - 不需要rum log推送的集合
export const API_PATHS_UNNECESSARY_RUM_LOG = new Set<string>([
  // 认证相关
  // "/Authentication/login",
  // "/Authentication/signupRoiBest",
  // "/Authentication/signup",
  "/user/logout",
  "/auth/refresh",
  // "/authentication/forgetPasswordToSendCode",
  // "/Authentication/resetPassword",

  // 用户相关
  "/User/profile",
  // "/User/updateCurrency",
  // "/User/updateUser",

  // 钱包相关
  "/UserWallet",
  "/UserBalance/indexTimer",
  "/UserBalanceExtension",

  // 支付网关
  "/PaymentGateway/getWithdrawCryptoGatewayList",
  "/PaymentGateway/getFiatGatewayList",
  "/PaymentGateway/getCryptoGatewayList",
  "/PaymentGateway/getFiatGatewayWithdrawParamsV2",
  "/PaymentGateway/getFiatGatewayDepositParamsV2",
  "/PaymentGateway/getPaymentIcons",
  "/PaymentGateway/getPaymentIconsByUser",

  // 存取款
  // "/UserDeposit",
  // "/UserDeposit/fiat_deposit",
  // "/UserWithdraw",
  // "/UserWithdraw/fiat_withdraw",
  // "/UserWithdraw/fiat_withdraw_V2",
  // "/UserWithdrawWallet",
  // "/UserWithdrawWallet/new",
  // "/UserWithdrawWallet/delete",
  // "/UserWithdraw/new",

  // 奖金相关
  "/Claim/index",
  "/Claim/bonusDetailsV2",
  // "/Claim/claim",
  // "/Claim/activateBooster",
  "/Claim/hasMysteryBox",
  "/claim/getClaimCount",

  // 征服任务
  "/Conquest/getConquestCompleted",
  "/Conquest/getConquestReward",
  "/Conquest/claimConquest",
  "/Conquest/index",

  // 日历奖励
  "/Calendar/index",
  "/Calendar/claim",

  // 游戏相关
  // "/Game/playV2",
  // "/Game/playDemo",
  "/Game/isSupportDemo",
  // "/Game/likeV2",
  "/GameList/getUserDefaultCurrency",
  "/GameList/getTopWageredGamesV2",
  "/GameList/getUserGameListV2",
  "/GameList/getBanGameList",

  // 游戏订单
  "/GameOrder/getBetHistoryV4",

  // 交换
  "/UserSwap/new",
  "/UserSwap",

  // Free Spin
  "/FreeSpin/getGameDetailsByUserFreeSpinRecord",
  "/FreeSpin/getEarliestPendingRecord",
  // "/FreeSpin/claimReward",
  "/FreeSpin/getSupportedGamesV1",
  // "/FreeSpin/cancelFreeSpinRecord",
  // "/FreeSpin/enableRecordV1",
  "/FreeSpin/getActiveRecords",

  // 锦标赛
  "/Tournament/getTournamentList",
  "/Tournament/getTournamentLeaderboard",
  "/Tournament/getPoolPrizeTimer",
  "/Tournament/getUserLastTournamentInfo",
  "/Tournament/getLastTournamentLeaderboard",

  // Ad Tag
  "/AdTag/getDefault",
  "/AdTag",
  // "/AdTag/setDefault",
  // "/AdTag/create",

  // 成就
  "/Achievement/index",
  "/Achievement/indexV2",
  "/Achievement/myAchievement",
  // "/Achievement/claim",

  // VIP
  "/VipConfig/index",

  // 个人中心
  // "/Personal/changePassword",
  // "/Personal/setTmaPassword",
  // "/Personal/sendEmailCode",
  // "/Personal/bindEmail",
  // "/Personal/sendMobileCode",
  // "/Personal/bindMobile",

  // 推荐相关
  "/RewardReferUnlockLog/getReferralList",
  "/RewardReferUnlockLog/getReferralDetail",
  "/RewardReferUnlockLog/getReferralRewardListTotal",
  "/RewardReferUnlockLog/getReferralRewardListTotalDetail",

  // 佣金
  "/RewardGroupLog/myList",
  "/RewardGroupLog/detail",

  // 通知
  "/NotificationMessage/getMessageV1",
  // "/NotificationMessage/readV1",

  // 用户Bonus记录
  "/UserBonus",

  // Bonus Wallet
  "/BonusWallet/index",
  // "/BonusWallet/setClaimStatus",
  // "/BonusWallet/claim",
  "/BonusWallet/transactionsList",
  "/BonusWallet/welcomeBonus",
  "/BonusWallet/purchaseConfigList",
  // "/BonusWallet/abandonBonus",
  "/BonusWallet/latestHistoryData",
  "/BonusWallet/historyList",
  // "/BonusWallet/purchase",

  // Sports Bonus Wallet
  "/SportsBonusWallet/index",
  "/SportsBonusWallet/purchaseConfigList",
  "/SportsBonusWallet/isRegionBanned",
  // "/SportsBonusWallet/purchase",
  // "/SportsBonusWallet/claim",
  // "/SportsBonusWallet/abandonBonus",
  "/SportsBonusWallet/latestHistoryData",
  "/SportsBonusWallet/historyList",
  "/SportsBonusWallet/transactionsList",

  // Buddy Balls
  "/BuddyBalls/index",
  // "/BuddyBalls/dailyCheckin",
  "/BuddyBalls/checkInHistory",
  // "/BuddyBalls/claim",
  "/BuddyBalls/playList",
  "/BuddyBalls/claimList",
  // "/BuddyBalls/dailyCheckIn",
  // "/BuddyBalls/play",
  "/BuddyBalls/buddyBallConfigList",

  // Lucky Spin
  "/LuckySpin/index",
  // "/LuckySpin/lottery",
  "/LuckySpin/getPoolPrizeList",
  "LuckySpin/myWinList",
  "LuckySpin/chanceList",
  "LuckySpin/winList",

  // 优惠码
  // "/PromoCode/claim",

  // 促销
  "/Promo/getCurrentPromo",
  // "/Promo/checkDetailPromo",
  // "/Promo/checkDonPromo",
  "/Promo/getPromoByPage",
  "/Promo/getPromoByPage2",
  // "/Promo/choicePromo",
  // "/Promo/addSundayBonus",
  // "/Promo/addThursdayBonus",
  "/Promo/getUtcTodayDepositCount",

  // Don
  "/Don/deal",

  // 用户提现信息
  "/UserWithdrawInfo/getUserWithdrawInfo",
  // "/UserWithdrawInfo/addUserWithdrawInfo",
  // "/UserWithdrawInfo/setUserWithdrawInfoDefaultById",
  // "/UserWithdrawInfo/deleteUserWithdrawInfo",

  // 支付通道分类
  "/PaymentChannelClass/getWithdrawChannelClassList",
  "/PaymentChannelClass/getDepositChannelClassList",

  // 货币
  "/Currency/index_V2",
  // "/Currency/walletSettingsCurrency",
  "/Currency/userDefaultCurrency",

  // KYC
  // "/UserKyc/update",
  "/UserKyc/getDetail",

  // 图片上传
  // "/Images/uploadPublic",
  // "/Images/uploadPrivate",
  // "/Images/uploadShareImage",

  // 其他
  // "/user/updatePin",
  "/ClaimLog/index",
  "/UserDeposit/rollover",
  "/MondayVipBonus/index",
  // "/MondayVipBonus/claim",
  "/branch/bonusSwitch",

  // Betby相关
  "/BetBy/getBetByConfig",
  "/BetBy/generateAuthJwt",

  // Telegram Bot相关
  "/TelegramBot/baseUrlAgg",
  "/TelegramBot/baseUrl",

  // 语言相关
  "/Language/getLanguageList",

  // 游戏订单
  "/GameOrderBigWin/binWinList",
  "/GameOrder/newestV3",
  "/GameOrder/newestV2Timer",

  // 货币相关
  "/Currency/gameCurrency",
  "/Currency",

  // 配置相关
  "/Currency/getExchangeRates",

  // 游戏列表
  "/GameList/getGameHomeCacheV3",
  "/GameList/getCommonGameListV2",
  "/GameList/getGameV2",

  // 游戏提供商
  "/GameProvider/getProvidersV1",

  // 聊天相关
  "/chat/getInboxId",

  // 存款奖励配置
  "/DepositBonusConfig/indexTimer",

  // 游戏分类
  "/GameCategory/gameCategoryList",

  // 认证相关
  "/Authentication/getCountryCodeByIp",
  // "/Authentication/loginByGoogle",
  // "/Authentication/loginByFacebook",
  // "/Authentication/loginByTMA",
  "/Authentication/getSocialList",
  "/Authentication/getBannerContent",
  // "/authentication/resetPasswordByToken",

  // FCM相关
  "/user/refreshFcmToken",
  "/FcmConfig/getConfigClient",

  // Banner相关
  "/Banner/list",

  // Buddy Balls相关
  "/BuddyBalls/dailyCheckInConfig",
]);
