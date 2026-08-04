/**
 * Free Spins 功能统一类型定义
 */

/**
 * 免费旋转记录数据
 */
export interface FreeSpinData {
  id: string;
  bet_count?: number;
  status?: 'pending' | 'active' | 'completed';
  created_at?: string;
  expires_at?: string;
  [key: string]: any;
}

/**
 * 游戏项目数据
 */
export interface GameItem {
  inner_game_id: string;
  game_provider?: string;
  image?: string;
  display_game_name?: string;
  [key: string]: any;
}

/**
 * 模态框状态枚举
 */
export type ModalState = "closed" | "opening" | "opened";

/**
 * Free Spins 流程状态枚举
 */
export enum FreeSpinFlowState {
  IDLE = 'idle',
  STARTER_PACK = 'starterPack',
  GAME_SELECTION = 'gameSelection',
  EXIT_CONFIRMATION = 'exitConfirmation',
  TRANSITIONING = 'transitioning'
}

/**
 * 退出确认前的模态框类型
 */
export type ActiveModalType = 'starter-pack' | 'game-selection' | null;

/**
 * Free Spins 容器组件属性
 */
export interface FreeSpinContainerProps {
  // 可以扩展的容器组件属性
}

/**
 * Starter Pack 模态框属性
 */
export interface FreeSpinModalProps {
  isOpen: boolean;
  onClose: () => void;
  freeSpinData?: FreeSpinData;
  modalState?: ModalState;
  onModalStateChange?: (state: ModalState) => void;
  wonAmount?: number;
  onWonAmountChange?: (amount: number) => void;
}

/**
 * 游戏选择模态框属性
 */
export interface FreeSpinGameSelectionProps {
  open: boolean;
  onExit: () => void;
  freeSpinData: FreeSpinData | null;
  onSelectGame?: (game: GameItem) => void;
  onClaimSuccess?: () => void;
}

/**
 * 退出确认模态框属性
 */
export interface FreeSpinExitConfirmProps {
  freeSpinData: FreeSpinData | null;
  open: boolean;
  onClose: () => void;
  onExitConfirmed?: () => void;
}

/**
 * Free Spins 流程 Hook 配置
 */
export interface FreeSpinsFlowConfig {
  /** 自动显示延迟时间（毫秒） */
  autoShowDelay?: number;
  /** 是否保留 Starter Pack 状态 */
  preserveStarterPackState?: boolean;
  /** 成功领取后是否跳过退出确认 */
  skipExitConfirmationAfterClaim?: boolean;
}

/**
 * Free Spins 流程 Hook 返回值
 */
export interface FreeSpinsFlowReturn {
  // 当前状态
  flowState: FreeSpinFlowState;
  
  // 计算属性
  isStarterPackOpen: boolean;
  isGameSelectionOpen: boolean;
  isExitConfirmationOpen: boolean;
  shouldSkipExitConfirmation: boolean;
  
  // 状态转换函数
  showStarterPack: () => void;
  showGameSelection: () => void;
  showExitConfirmation: (fromState: ActiveModalType) => void;
  goBack: () => void;
  closeAll: () => void;
  markClaimSuccess: () => void;
  setTransitioning: (isTransitioning: boolean) => void;
  
  // 内部状态
  activeModalBeforeExit: ActiveModalType;
  hasClaimedSuccessfully: boolean;
  isTransitioningToGameSelection: boolean;
  
  // Starter Pack 状态保存
  starterPackModalState: ModalState;
  starterPackWonAmount: number;
  setStarterPackModalState: (state: ModalState) => void;
  setStarterPackWonAmount: (amount: number) => void;
}