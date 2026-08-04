import { useState, useCallback } from 'react';
import {
  ModalState,
  FreeSpinsFlowConfig,
} from '../types';
import { DEFAULT_FLOW_CONFIG } from '../constants';

/**
 * 简化的 Free Spins 流程管理 Hook
 * 
 * 新逻辑：
 * - 每个modal独立控制显示状态
 * - 退出确认modal在更高层级显示，不关闭原modal
 * - Go Back只关闭确认modal，原modal自然恢复
 */
export const useFreeSpinsFlow = (
  config: FreeSpinsFlowConfig = DEFAULT_FLOW_CONFIG
) => {
  // 独立的modal显示状态
  const [isStarterPackOpen, setIsStarterPackOpen] = useState(false);
  const [isGameSelectionOpen, setIsGameSelectionOpen] = useState(false);
  const [isExitConfirmationOpen, setIsExitConfirmationOpen] = useState(false);
  
  // 业务逻辑标志
  const [hasClaimedSuccessfully, setHasClaimedSuccessfully] = useState(false);
  const [isTransitioningToGameSelection, setIsTransitioningToGameSelection] = useState(false);
  
  // Starter Pack 模态框状态保存
  const [starterPackModalState, setStarterPackModalState] = useState<ModalState>('closed');
  const [starterPackWonAmount, setStarterPackWonAmount] = useState<number>(0);

  // 计算属性
  const shouldSkipExitConfirmation = hasClaimedSuccessfully && (config.skipExitConfirmationAfterClaim ?? true);

  // 状态转换函数
  const showStarterPack = useCallback(() => {
    setIsStarterPackOpen(true);
  }, []);

  const hideStarterPack = useCallback(() => {
    setIsStarterPackOpen(false);
  }, []);

  const showGameSelection = useCallback(() => {
    setIsGameSelectionOpen(true);
  }, []);

  const hideGameSelection = useCallback(() => {
    setIsGameSelectionOpen(false);
  }, []);

  const showExitConfirmation = useCallback(() => {
    setIsExitConfirmationOpen(true);
  }, []);

  const hideExitConfirmation = useCallback(() => {
    setIsExitConfirmationOpen(false);
  }, []);

  const closeAll = useCallback(() => {
    setIsStarterPackOpen(false);
    setIsGameSelectionOpen(false);
    setIsExitConfirmationOpen(false);
    
    // 重置 Starter Pack 状态
    if (config.preserveStarterPackState) {
      setStarterPackModalState('closed');
      setStarterPackWonAmount(0);
    }
    
    // 重置其他状态 - 但不重置 hasClaimedSuccessfully，因为这会影响 shouldSkipExitConfirmation 的判断
    setIsTransitioningToGameSelection(false);
  }, [config.preserveStarterPackState]);

  // 新增一个完全重置的方法，用于完全退出时
  const resetAll = useCallback(() => {
    setIsStarterPackOpen(false);
    setIsGameSelectionOpen(false);
    setIsExitConfirmationOpen(false);
    
    // 重置 Starter Pack 状态
    if (config.preserveStarterPackState) {
      setStarterPackModalState('closed');
      setStarterPackWonAmount(0);
    }
    
    // 重置所有状态
    setHasClaimedSuccessfully(false);
    setIsTransitioningToGameSelection(false);
  }, [config.preserveStarterPackState]);

  const markClaimSuccess = useCallback(() => {
    setHasClaimedSuccessfully(true);
  }, []);

  const setTransitioning = useCallback((isTransitioning: boolean) => {
    setIsTransitioningToGameSelection(isTransitioning);
  }, []);

  return {
    // 计算属性
    isStarterPackOpen,
    isGameSelectionOpen,
    isExitConfirmationOpen,
    shouldSkipExitConfirmation,
    
    // 状态转换函数
    showStarterPack,
    hideStarterPack,
    showGameSelection,
    hideGameSelection,
    showExitConfirmation,
    hideExitConfirmation,
    closeAll,
    resetAll,
    markClaimSuccess,
    setTransitioning,
    
    // 内部状态
    hasClaimedSuccessfully,
    isTransitioningToGameSelection,
    
    // Starter Pack 状态保存
    starterPackModalState,
    starterPackWonAmount,
    setStarterPackModalState,
    setStarterPackWonAmount,
  };
};