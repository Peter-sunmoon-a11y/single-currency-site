import { useEffect, useRef, useState } from "react";

// TODO: 为了测试chatwoot自定义样式，暂时写死了hideMessageBubble, baseUrl, websiteToken 并没有从context拿
interface ChatwootConfig {
  websiteToken: string;
  baseUrl?: string;
  hideMessageBubble?: boolean;
  darkMode?: "auto" | "light" | "dark";
  showUnreadMessagesDialog?: boolean;
  useBrowserLanguage?: boolean;
  locale?: string;
}

export const useChatwoot = (config: ChatwootConfig) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    // 如果没有websiteToken或已经初始化过，则不初始化
    if (!config.websiteToken || isInitialized) return;

    const initChatwoot = () => {
      // 设置chatwoot配置
      (window as any).chatwootSettings = {
        position: "right",
        type: "standard",
        launcherTitle: "Chat with us",
        hideMessageBubble: config.hideMessageBubble ?? true,
        darkMode: config.darkMode ?? "auto",
        showUnreadMessagesDialog: config.showUnreadMessagesDialog ?? false,
        useBrowserLanguage: config.useBrowserLanguage ?? false,
        locale: config.locale?.replace("-", "_") ?? "en",
      };

      // 初始化SDK
      if ((window as any).chatwootSDK) {
        (window as any).chatwootSDK.run({
          websiteToken: config.websiteToken,
          baseUrl: config.baseUrl || "https://app.openchats.online",
        });
        setIsInitialized(true);
      }
    };

    const loadScript = () => {
      if (scriptLoaded.current) {
        initChatwoot();
        return;
      }

      const script = document.createElement("script");
      script.src = `${config.baseUrl || "https://app.openchats.online"}/packs/js/sdk.js`;
      script.defer = true;
      script.async = true;

      script.onload = () => {
        scriptLoaded.current = true;
        initChatwoot();
      };

      script.onerror = () => {
        console.error("Failed to load Chatwoot SDK");
      };

      document.head.appendChild(script);
    };

    loadScript();

    // 清理函数
    return () => {
      // 当token变化时，重置初始化状态
      if (isInitialized) {
        setIsInitialized(false);
      }
    };
  }, [config.websiteToken, config.baseUrl, isInitialized]);

  // 提供一些有用的方法
  const toggleWidget = () => {
    if ((window as any).$chatwoot) {
      (window as any).$chatwoot.toggle();
    }
  };

  const openWidget = () => {
    const cw = (window as any).$chatwoot;
    if (!cw) return;
    try {
      // chatwoot supports toggle('open') / toggle('close')
      cw.toggle?.("open");
    } catch {
      cw.toggle?.();
    }
  };

  const closeWidget = () => {
    const cw = (window as any).$chatwoot;
    if (!cw) return;
    try {
      cw.toggle?.("close");
    } catch {
      // no-op
    }
  };

  const setUser = (userId: string | number, userAttributes: any) => {
    if ((window as any).$chatwoot) {
      (window as any).$chatwoot.setUser(userId, userAttributes);
    }
  };

  const setLocale = (locale: string) => {
    if ((window as any).$chatwoot) {
      (window as any).$chatwoot.setLocale(locale.replace("-", "_"));
    }
  };

  const setCustomAttributes = (attributes: any) => {
    if ((window as any).$chatwoot) {
      (window as any).$chatwoot.setCustomAttributes(attributes);
    }
  };

  const setConversationCustomAttributes = (attributes: any) => {
    if ((window as any).$chatwoot) {
      (window as any).$chatwoot.setConversationCustomAttributes(attributes);
    }
  };

  const reset = () => {
    if ((window as any).$chatwoot) {
      (window as any).$chatwoot.reset();
      setIsInitialized(false);
    }
  };

  return {
    toggleWidget,
    openWidget,
    closeWidget,
    setUser,
    setLocale,
    setCustomAttributes,
    setConversationCustomAttributes,
    reset,
    isInitialized,
  };
};
