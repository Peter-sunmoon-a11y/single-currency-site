// VIP 功能配置
export const VIP_REQUIREMENTS = {
  achievements: {
    requiredLevel: 2,
    name: 'Achievements',
    translationKey: 'bonus:achievements'
  },
  mysteryBox: {
    requiredLevel: 5,
    name: 'Mystery Box',
    translationKey: 'mysteryBox:mystery_box'
  },
  jester: {
    requiredLevel: 2,
    name: 'The Jester',
    translationKey: 'mysteryBox:the_jester'
  },
  cannon: {
    requiredLevel: 48,
    name: 'The Cannon',
    translationKey: 'mysteryBox:the_cannon'
  },
  luckyNumber: {
    requiredLevel: 7,
    name: 'Lucky Number Seven',
    translationKey: 'mysteryBox:lucky_number_seven'
  },
  vipMonday: {
    requiredLevel: 2,
    name: 'VIP Monday',
    translationKey: 'vipMonday:vip_monday'
  }
} as const;

// 检查用户是否满足 VIP 要求
export const checkVipAccess = (userVipLevel: number, requiredLevel: number): boolean => {
  return userVipLevel >= requiredLevel;
};

// 获取 VIP 状态文本
export const getVipStatusText = (userVipLevel: number, requiredLevel: number): string => {
  if (userVipLevel >= requiredLevel) {
    return 'bonus:go';
  }
  return `VIP ${requiredLevel}`;
};
