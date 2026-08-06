import { useDefaultAdTag } from "@/hooks/api/useAuth.ts";
import { useBaseConfig } from "@/hooks/api/usePublic.ts";
import { useCountryCodeByIp } from "@/sections/profile/security/helper.ts";
import { resolveTelegramAwareBaseUrl } from "@/utils/telegramPlatform";
import { useMemo } from "react";

// const host_map = new Map<string, string>();
// host_map.set('id', "https://1stgame.games"); // 印尼

/**
 * 个人对外的注册推荐链接
 * @returns referralLink: 推荐链接
 * @returns baseConfLoading: 基础配置数据是否加载完毕
 * @returns adTagDataLoading: 推广码配置数据是否加载完毕
 */
export const useReferralLink = (custom_referral_code?: string) => {
  const { data: country } = useCountryCodeByIp();

  const { data: baseConf, isLoading: baseConfLoading } = useBaseConfig();

  const { data: adTagData, isLoading: adTagDataLoading, refetch: refetchAdTagData } = useDefaultAdTag();

  const country_code = country?.data?.country_code ?? "";

  const referralLink = useMemo(() => {
    if (baseConfLoading || adTagDataLoading) return "🏃......";
    const referral_code = custom_referral_code || adTagData?.data?.code;
    const baseUrl = resolveTelegramAwareBaseUrl(baseConf?.data);
    if (!referral_code || !baseUrl) return "- -";
    return `${baseUrl}?startapp=${referral_code}`;
  }, [baseConf, adTagData, custom_referral_code, country_code]);

  return {
    referralLink,
    baseConfLoading,
    adTagDataLoading,
    refetchAdTagData,
  };
};
