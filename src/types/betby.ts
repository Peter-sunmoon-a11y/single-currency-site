/**
 * Betby Sports 集成相关的类型定义
 */

/**
 * Betby 初始化配置参数
 */
export interface BetbyInitConfig {
  brand_id: string | number;
  token: string | null;
  themeName?: string;
  lang: string;
  target: HTMLElement;
  basename?: string; // URL 管理基础路径
  url?: string; // 初始化时显示的页面路径
  betSlipOffsetTop?: number;
  betSlipOffsetBottom?: number;
  betSlipOffsetRight?: number;
  stickyTop?: number;
  betslipZIndex?: number;
  // Promo Banner 相关配置
  widgetName?: "promo";
  widgetParams?: BetbyWidgetParams;
  onRouteChange?: () => void;
  onLogin?: () => void;
  onRegister?: () => void;
  onRecharge?: () => void;
  onSessionRefresh?: () => Promise<string | null>;
  onTokenExpired?: () => Promise<string | null>;
  onTokenRefresh?: () => Promise<string | null>;
  onBetSlipStateChange?: (state: any) => void;
}

/**
 * Betby Promo Banner Widget 参数
 */
export interface BetbyWidgetParams {
  placeholder: string;
  onBannerClick?: (params: { url?: string; customAction?: string }) => void;
  onOutcomeClick?: (params: { url?: string }) => void;
}

/**
 * BTRenderer 实例接口
 */
export interface BTRendererInstance {
  kill: () => void;
  updateOptions: (options: {
    betSlipOffsetTop?: number;
    betSlipOffsetBottom?: number;
    betSlipOffsetRight?: number;
    url?: string; // 更新 Betby 内部导航路径
    stickyTop?: number;
  }) => void;
}

/**
 * BTRenderer 类
 */
export interface BTRendererClass {
  new (): {
    initialize: (config: BetbyInitConfig) => BTRendererInstance;
  };
}

/**
 * Betby API 响应数据
 */
export interface BetbyAuthResponse {
  jwt: string | null;
  brand_id: string | number;
  lang: string;
  currency?: string;
  code?: number; // 可选的错误码（用于检测嵌套错误）
}

/**
 * Betby 配置请求参数
 */
export interface BetbyAuthTokenParams {
  currency: string;
  lang: string;
}

/**
 * Betby 错误码
 */
export const BETBY_RESTRICTED_CODE = "BETBY_RESTRICTED";
export const BETBY_NO_ACCESS_CODE = "BETBY_NO_ACCESS";

/**
 * Betby 访问被拒绝错误（币种不支持）
 */
export class BetbyAccessDeniedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BetbyAccessDeniedError";
  }
}

/**
 * Betby 无访问权限错误
 */
export class BetbyNoAccessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BetbyNoAccessError";
  }
}

/**
 * Betby 不允许访问错误（错误码 80004）
 */
export class BetbyNotAllowedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BetbyNotAllowedError";
  }
}
