import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { DEVICE_STORAGE_KEY } from "@/utils/storageKeys";

// 落地页广告归因参数持久化：
// - startapp 单独存，供登录接口使用
// - 完整 querystring 快照存 ad_attribution_qs，首次写入不覆盖（first-touch 归因）
export function AdAttributionTracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const startapp = searchParams.get("startapp");
    if (startapp) localStorage.setItem(DEVICE_STORAGE_KEY.startapp, startapp);

    const qs = searchParams.toString();
    if (qs) localStorage.setItem(DEVICE_STORAGE_KEY.adAttributionQs, qs);
  }, [searchParams]);

  return null;
}
