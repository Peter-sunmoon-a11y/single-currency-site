import { useCallback, useEffect, useMemo } from "react";
import i18n from "@/lib/i18n/i18next";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { useLoginByGoogle, useLoginByFacebook } from "@/hooks/api/useAuth";
import { sleep, parseURLParamsToJson, getAdvertisementParams } from "@/components/socialLogin/helper.ts";
import { uuidv4Generate } from "@/utils/helper.ts";
import { useAppNavigate } from "@/hooks/useAppNavigate";
import { DEVICE_STORAGE_KEY } from "@/utils/storageKeys";
import { useSearchParams } from "next/navigation";

const controller = new AbortController();

function RouteComponent() {

  const navigate = useAppNavigate();
  const { t } = useTranslation();

  const locationSearchParams = useSearchParams();
  const search = locationSearchParams.toString() ? `?${locationSearchParams.toString()}` : "";
  const hash = typeof window === "undefined" ? "" : window.location.hash;

  const loginByGoogleMutation = useLoginByGoogle();
  const loginByFacebookMutation = useLoginByFacebook();

  // 解析入参数
  const urlParams = useMemo(() => {
    if (hash && hash.includes("?state=")) {
      return parseURLParamsToJson(hash.split("?")[1]) as Record<string, string>;
    }

    return parseURLParamsToJson(search.replace(/^\?/, "")) as Record<string, string>;
  }, [hash, search]);

  // 当前登录社媒的类型，从链接参数解析得到
  const authType = useMemo(() => {
    const searchParams = new URLSearchParams(atob(urlParams?.state ?? ""));

    return searchParams.get("auth_type");
  }, [urlParams]);

  const googleAuth = useCallback(async () => {
    // link携带的必要参数 state（经过 atob 处理）
    if (!urlParams?.state) return;

    // link携带的必要参数 state（经过 atob 处理）需解码（atob）处理
    const searchParams = new URLSearchParams(atob(urlParams.state));

    // 区分是哪个社媒来登录
    const auth_type = searchParams.get("auth_type");

    // 区分是哪个社媒来登录，是否是google
    if (auth_type !== "google") return;

    // google auth return code
    const code = searchParams.get("code");

    // 广告参数，优先从 state 里取，降级读 localStorage
    const startapp = searchParams.get("startapp") ?? localStorage.getItem(DEVICE_STORAGE_KEY.startapp) ?? "";

    // auth站地址
    const redirect_uri = searchParams.get("redirect_uri");

    // 设备指纹
    const device_id = uuidv4Generate();

    // 不能缺少必要参数
    if (!code || !redirect_uri || !device_id) return toast.error(t("toast:signInFailed"));

    // 获取广告推广参数
    const adParams = getAdvertisementParams();

    // 延长联动效果窗口
    await sleep();

    try {
      await loginByGoogleMutation.mutateAsync({
        data: { code, startapp, device_id, redirect_uri, ...adParams },
        signal: controller.signal,
        headers: { "Accept-Language": i18n.language || "en" }
      });
    } catch {
    }

  }, [search, i18n.language, urlParams]);

  const facebookAuth = useCallback(async () => {
    const parsedParams = urlParams;

    // link携带的必要参数 state（经过 atob 处理）
    if (!parsedParams?.state) return;

    // link携带的必要参数 state（经过 atob 处理）需解码（atob）处理
    const searchParams = new URLSearchParams(atob(parsedParams.state));

    // 区分是哪个社媒来登录
    const auth_type = searchParams.get("auth_type");

    // 区分是哪个社媒来登录，是否是google
    if (auth_type !== "facebook") return;

    // google auth return code
    const code = searchParams.get("code");

    // 广告参数，优先从 state 里取，降级读 localStorage
    const startapp = searchParams.get("startapp") ?? localStorage.getItem(DEVICE_STORAGE_KEY.startapp) ?? "";

    // auth站地址
    const redirect_uri = searchParams.get("redirect_uri");

    // 设备指纹
    const device_id = uuidv4Generate();

    // 不能缺少必要参数
    if (!code || !redirect_uri || !device_id) return toast.error(t("toast:signInFailed"));

    // 获取广告推广参数
    const adParams = getAdvertisementParams();

    // 延长联动效果窗口
    await sleep();

    try {
      await loginByFacebookMutation.mutateAsync({
        data: { code, startapp, device_id, redirect_uri, ...adParams },
        signal: controller.signal,
        headers: { "Accept-Language": i18n.language || "en" }
      });
    } catch {
      toast.error(t("toast:signInFailed"));
    }

  }, [search, i18n.language, urlParams]);

  useEffect(() => {
    // For Google Auth
    void googleAuth();

    // For Facebook
    void facebookAuth();

    // For Twitter

    // For Telegram
  }, []);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col gap-4 items-center justify-center p-1 rounded-2xl w-full max-w-[90%] md:w-80"
        // style={{ background: `${auth_themes["google"]}` }}
      >
        <div className={"w-full py-10 flex flex-col justify-center bg-base-200 rounded-2xl"}>
          <div
            className="flex flex-col gap-6 mb-6">
            <img src="/favicon/logo-200w.png" alt="" className={'m-auto w-25'} />
            {/* 当前社媒图标 */}
            <AuthIcon authType={authType} />
          </div>
          <div className="text-center">
            <button
              className="btn btn-primary btn-soft btn-sm text-sm"
              onClick={() => {
                controller.abort(); // 主动取消social login请求
                void navigate({ to: "/casino" });
              }}>
              {t("common.cancel")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const AuthIcon = ({ authType }: { authType: string | null }) => (
  <div className="relative flex justify-center">
    <img src={`/images/social/${authType}.svg`}
         className="h-8 absolute top-[50%] translate-y-[-50%]"
         alt="" /><span
    className="loading loading-circle text-primary w-12 h-12" /></div>);

export const beforeLoad = undefined;

export default RouteComponent;
