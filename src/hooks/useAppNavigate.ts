import { buildHref, HrefOptions } from "@/lib/navigation";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export type AppNavigateOptions = HrefOptions | string;

export const useAppNavigate = () => {
  const router = useRouter();
  const currentSearchParams = useSearchParams();
  const params = useParams();
  // 从路由参数读 locale，比 window.location 更可靠（SSR 安全）
  const locale = typeof params?.locale === "string" ? params.locale : undefined;

  return useCallback(
    (options: AppNavigateOptions) => {
      // number -1 语义改为直接调用 router.back()
      if (typeof options !== "string" && options.back) {
        router.back();
        return;
      }

      // 只有 search 是函数形式时才需要 currentSearchParams（合并当前 query）
      const needsCurrentParams = typeof options !== "string" && typeof options.search === "function";
      const scroll = typeof options !== "string" ? options.scroll : undefined;

      const href = buildHref(options, needsCurrentParams ? currentSearchParams : undefined, locale);

      if (typeof href === "number") {
        router.back();
        return;
      }

      if (typeof options !== "string" && options.replace) {
        router.replace(href, { scroll });
        return;
      }
      router.push(href, { scroll });
    },
    [router, currentSearchParams, locale],
  );
};
