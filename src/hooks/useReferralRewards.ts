import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { useGroupClaim, useReferralClaim } from "@/hooks/api/useAuth";
import { useBoundStore } from "@/store";
import Decimal from "decimal.js";
import { useMemo } from "react";

/**
 * 推荐奖励业务逻辑 Hook
 *
 * 组合多个数据源，计算并格式化推荐相关的所有奖励数据
 *
 * @returns {Object} 包含所有推荐奖励相关的计算值和格式化数据
 */
export function useReferralRewards() {
  const { formatWithConversion } = useDisplayCurrencyFormatter();
  const status = useBoundStore((state) => state.status);

  // 获取基础 API 数据
  const { data: referralData, isLoading: isLoadingReferral, refetch: refetchreferralData } = useReferralClaim();
  const { data: groupData, isLoading: isLoadingGroup, refetch: refetchGroupData } = useGroupClaim();

  // 提取实际数据
  const referralValue = useMemo(() => {
    if (referralData?.code === 0 && referralData?.data?.data) {
      return referralData.data.data;
    }
    return null;
  }, [referralData]);

  const groupValue = useMemo(() => {
    if (groupData?.code === 0 && groupData?.data?.data) {
      return groupData.data.data;
    }
    return null;
  }, [groupData]);

  // 计算总奖励（referral.sum + group.sum）
  const totalRewards = useMemo(() => {
    const referralSum = referralValue?.sum ?? 0;
    const groupSum = groupValue?.sum ?? 0;

    return new Decimal(referralSum).add(groupSum).toNumber();
  }, [referralValue, groupValue]);

  // 格式化总奖励
  const formattedTotalRewards = useMemo(() => {
    const currency = referralValue?.currency || groupValue?.currency || "USD";

    return formatWithConversion(totalRewards, currency, {
      showSymbol: true,
      showCode: false,
      minimizeDecimals: true,
    });
  }, [totalRewards, formatWithConversion, referralValue, groupValue]);

  // 计算网络总人数（直接邀请 + 间接邀请）
  const networkCount = useMemo(() => {
    const directInvitations = status?.direct_invitations ?? 0;
    const indirectInvitations = status?.indirect_invitations ?? 0;
    return directInvitations + indirectInvitations;
  }, [status]);

  // 可用佣金（group.value）
  const availableCommission = useMemo(() => {
    const currency = groupValue?.currency || "USD";
    const value = groupValue?.value ?? 0;
    return formatWithConversion(value, currency, {
      showSymbol: true,
      showCode: false,
      minimizeDecimals: true,
    });
  }, [groupValue, formatWithConversion]);

  // 可用推荐奖励（referral.value）
  const availableReferral = useMemo(() => {
    const currency = referralValue?.currency || "USD";
    const value = referralValue?.value ?? 0;
    return formatWithConversion(value, currency, {
      showSymbol: true,
      showCode: false,
      minimizeDecimals: true,
    });
  }, [referralValue, formatWithConversion]);

  // 佣金总计（group.sum）
  const totalReceivedCommission = useMemo(() => {
    const currency = groupValue?.currency || "USD";
    const sum = groupValue?.sum ?? 0;
    return formatWithConversion(sum, currency, {
      showSymbol: true,
      showCode: false,
      minimizeDecimals: true,
    });
  }, [groupValue, formatWithConversion]);

  // 推荐总计（referral.sum）
  const totalReceivedReferral = useMemo(() => {
    const currency = referralValue?.currency || "USD";
    const sum = referralValue?.sum ?? 0;
    return formatWithConversion(sum, currency, {
      showSymbol: true,
      showCode: false,
      minimizeDecimals: true,
    });
  }, [referralValue, formatWithConversion]);

  // 锁定金额（referral.locked）
  const lockedReferral = useMemo(() => {
    const currency = referralValue?.currency || "USD";
    const locked = referralValue?.locked ?? 0;
    return formatWithConversion(locked, currency, {
      showSymbol: true,
      showCode: false,
      minimizeDecimals: true,
    });
  }, [referralValue, formatWithConversion]);

  return {
    // 原始数据
    referralValue,
    groupValue,

    // 加载状态
    isLoading: isLoadingReferral || isLoadingGroup,

    // 计算值
    totalRewards,
    networkCount,

    refetchGroupData,
    refetchreferralData,

    // 格式化数据（用于显示）
    formattedTotalRewards,
    availableCommission,
    availableReferral,
    totalReceivedCommission,
    totalReceivedReferral,
    lockedReferral,
  };
}
