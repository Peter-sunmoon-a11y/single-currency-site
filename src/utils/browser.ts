export function isMobile(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const userAgent = window.navigator.userAgent.toLowerCase();
  const mobileKeywords = ["android", "webos", "iphone", "ipad", "ipod", "blackberry", "windows phone", "mobile"];

  return mobileKeywords.some((keyword) => userAgent.includes(keyword));
}

export function isIOS(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
}

export function isAndroid(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const userAgent = window.navigator.userAgent.toLowerCase();
  return /android/.test(userAgent);
}

export const isMac = (): boolean => {
  return /macintosh|mac os x/.test(navigator.userAgent.toLowerCase());
};

export function getCookie(name: string) {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

export const isPWA = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  const displayModes = ["fullscreen", "standalone", "minimal-ui"];
  const matchesPwa = displayModes.some((displayMode) => window.matchMedia("(display-mode: " + displayMode + ")").matches);
  return matchesPwa || (window.navigator as any).standalone || document.referrer.includes("android-app://");

  // return (window.matchMedia('(display-mode: standalone)').matches) || ((window.navigator as any).standalone) || document.referrer.includes('android-app://');
};
