/**
 * Free Spins 功能常量配置
 */

/**
 * Free Spins 配置常量
 */
export const FREE_SPINS_CONFIG = {
  /** 自动显示Starter Pack模态框的延迟时间（毫秒） */
  AUTO_SHOW_DELAY: 15000,
  
  /** 退出确认模态框的 z-index */
  EXIT_CONFIRMATION_Z_INDEX: 20000,
  
  /** 游戏列表分页大小 */
  PAGINATION_SIZE: 20,
  
  /** 动画持续时间（毫秒） */
  ANIMATION_DURATION: 300,
  
  /** 模态框最大宽度 */
  MODAL_MAX_WIDTH: '600px',
  
  /** 游戏网格列数 */
  GAME_GRID_COLUMNS: 3,
  
  /** Query stale time（毫秒） */
  QUERY_STALE_TIME: 30 * 1000, // 30秒
} as const;

/**
 * Free Spins 流程默认配置
 */
export const DEFAULT_FLOW_CONFIG = {
  autoShowDelay: FREE_SPINS_CONFIG.AUTO_SHOW_DELAY,
  preserveStarterPackState: true,
  skipExitConfirmationAfterClaim: true,
} as const;

/**
 * 模态框尺寸配置
 */
export const MODAL_SIZES = {
  EXIT_CONFIRMATION: {
    width: '335px',
  },
  GAME_SELECTION: {
    width: '600px',
    maxWidth: '2xl',
  },
} as const;

/**
 * 动画变体常量
 */
export const ANIMATION_VARIANTS = {
  FADE_IN_DOWN_DISTANCE: 20,
  FADE_IN_UP_DISTANCE: 20,
  BACKDROP_BLUR: '2px',
} as const;