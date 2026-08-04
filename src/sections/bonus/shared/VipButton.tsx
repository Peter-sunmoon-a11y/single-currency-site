import Iconify from "@/components/iconify";
import { useBoundStore } from "@/store";
import { checkVipAccess, getVipStatusText } from "./config";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";

interface VipButtonProps {
  requiredLevel: number;
  onClick?: () => void;
  className?: string;
  claimable?: boolean;
  loading?: boolean;
  useClaimStateWhenUnlocked?: boolean;
}

/**
 * VIP 按钮组件
 * 根据用户 VIP 等级与可领取状态显示不同按钮状态
 */
export function VipButton({ loading, requiredLevel, onClick, claimable = false, useClaimStateWhenUnlocked = false }: VipButtonProps) {
  const { t } = useTranslation()
  const status = useBoundStore((state) => state.status);

  const userVipLevel = status?.vip || 0;
  const isUnlocked = checkVipAccess(userVipLevel, requiredLevel);
  const showClaimState = useClaimStateWhenUnlocked && isUnlocked;
  const buttonText = showClaimState ? "bonus:claim" : getVipStatusText(userVipLevel, requiredLevel);
  const isDisabled = !isUnlocked || (showClaimState && !claimable);

  return (
    <ConfirmBox
      loading={loading}
      className={`btn-sm w-fit text-sm`}
      disabled={isDisabled}
      onClick={!isDisabled ? onClick : undefined}
    >
      {!isUnlocked && <Iconify icon="custom:lock" size={14} />}
      <p>{t(buttonText)}</p>
    </ConfirmBox>
  );
}

export function VipButton2({ loading, requiredLevel, onClick, claimable = false }: VipButtonProps) {
  const { t } = useTranslation()
  const status = useBoundStore((state) => state.status);

  const userVipLevel = status?.vip || 0;
  const isUnlocked = checkVipAccess(userVipLevel, requiredLevel);
  const buttonText = claimable ? "bonus:claim" : getVipStatusText(userVipLevel, requiredLevel);
  const isDisabled = loading || !isUnlocked;

  return (
    <ConfirmBox
      loading={loading}
      className={`btn-sm w-fit text-sm`}
      disabled={isDisabled}
      onClick={!isDisabled ? onClick : undefined}
    >
      {!isUnlocked && <Iconify icon="custom:lock" size={14} />}
      <p>{t(buttonText)}</p>
    </ConfirmBox>
  );
}

export function VipButton3({ loading, requiredLevel, onClick, claimable = false }: VipButtonProps) {
  const { t } = useTranslation()
  const status = useBoundStore((state) => state.status);

  const getVipStatusText = (): string => {
    if ((status?.vip || 0) >= requiredLevel) {
      return 'bonus:go';
    }
    if (claimable) {
      return 'bonus:claim';
    }
    if (!claimable) {
      return 'bonus:claimed';
    }
    return `VIP ${requiredLevel}`;
  };

  const userVipLevel = status?.vip || 0;
  const isUnlocked = checkVipAccess(userVipLevel, requiredLevel);
  const buttonText = getVipStatusText();
  const isDisabled = loading || !isUnlocked || !claimable;

  return (
    <ConfirmBox
      loading={loading}
      className={`btn-sm w-fit text-sm`}
      disabled={isDisabled}
      onClick={!isDisabled ? onClick : undefined}
    >
      {!isUnlocked && <Iconify icon="custom:lock" size={14} />}
      <p>{t(buttonText)}</p>
    </ConfirmBox>
  );
}