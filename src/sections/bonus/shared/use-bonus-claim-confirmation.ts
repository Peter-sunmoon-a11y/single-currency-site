import { useState, useCallback } from 'react';

export interface BonusClaimConfirmationState {
  isOpen: boolean;
  bonusType: string;
  claimableAmount?: string | number;
  onNormalClaim?: () => void;
  onDoubleClaim?: () => void;
}

/**
 * Hook for managing BonusClaimConfirmationModal state
 */
export function useBonusClaimConfirmation() {
  const [modalState, setModalState] = useState<BonusClaimConfirmationState>({
    isOpen: false,
    bonusType: '',
  });

  const openClaimConfirmation = useCallback((params: {
    bonusType: string;
    claimableAmount?: string | number;
    onNormalClaim: () => void;
    onDoubleClaim: () => void;
  }) => {
    setModalState({
      isOpen: true,
      bonusType: params.bonusType,
      claimableAmount: params.claimableAmount,
      onNormalClaim: params.onNormalClaim,
      onDoubleClaim: params.onDoubleClaim,
    });
  }, []);

  const closeClaimConfirmation = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      isOpen: false,
    }));
  }, []);

  return {
    modalState,
    openClaimConfirmation,
    closeClaimConfirmation,
  };
}

export default useBonusClaimConfirmation;
