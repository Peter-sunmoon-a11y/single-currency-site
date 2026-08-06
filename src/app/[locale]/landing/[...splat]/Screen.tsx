import { replaceOrOpenTelegramAwareUrl } from "@/utils/telegramPlatform";

export const beforeLoad = ({ params, search }: { params: Record<string, string>; search: Record<string, string> }) => {
    let targetUrl: string | undefined;

    if (search.url) {
      try {
        targetUrl = decodeURIComponent(search.url);
      } catch {
        targetUrl = search.url;
      }
    }

    if (!targetUrl) {
      const splat = (params as { splat?: string }).splat || "";

      if (/^https?:\/\//i.test(splat)) {
        targetUrl = splat;
      }
    }

    if (!targetUrl) {
      return;
    }

    try {
      const resolvedTarget = new URL(targetUrl, window.location.href).href;
      if (resolvedTarget === window.location.href) {
        return;
      }
    } catch {
      // ignore URL parsing errors and fall back to replace
    }

    replaceOrOpenTelegramAwareUrl(targetUrl);
  };

const ScreenComponent = () => null;

export default ScreenComponent;
