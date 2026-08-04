export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
}

export interface GameState {
  ballsLeft: number;
  lastWin: number;
  isShaking: boolean;
}

export const MULTIPLIERS = [128, 32, 16, 8, 1, 0, 1, 8, 16, 32, 128];

// 奖励区背景色
export const SLOT_COLORS_BG = [
  '#3A4A10', // 128x
  '#2D1D44', // 32x
  '#251A4A', // 16x
  '#102A58', // 8x
  '#15273E', // 1x
  '#1B2433', // 0x
  '#15273E', // 1x
  '#102A58', // 8x
  '#251A4A', // 16x
  '#2D1D44', // 32x
  '#3A4A10', // 128x
];

// 奖励区边框色
export const SLOT_COLORS_BORDER = [
  '#9EDB2E', // 128x
  '#C95BFF', // 32x
  '#7D6CFF', // 16x
  '#47A0FF', // 8x
  '#6A86FF', // 1x
  '#9AB1FF', // 0x
  '#6A86FF', // 1x
  '#47A0FF', // 8x
  '#7D6CFF', // 16x
  '#C95BFF', // 32x
  '#9EDB2E', // 128x
];

// 奖励区文字色
export const SLOT_COLORS_NUM = [
  '#F4FFD0',
  '#F5E1FF',
  '#E7E2FF',
  '#DAF0FF',
  '#E5ECFF',
  '#F1F4FF',
  '#E5ECFF',
  '#DAF0FF',
  '#E7E2FF',
  '#F5E1FF',
  '#F4FFD0',
];

// 球袋发光的颜色
export const SLOT_COLORS_BAG = [
  '#D3ED1D',
  '#BA16FD',
  '#703FFB',
  '#226EFD',
  '#746CF0',
  '#6C8EF8',
  '#746CF0',
  '#226EFD',
  '#703FFB',
  '#BA16FD',
  '#D3ED1D',
];

//球袋普通颜色
export const SLOT_BAG_NORMAL = "#14191F"
export const SLOT_BAG_NORMAL_BORDER = "#11151B"

// 三角形背景顶部颜色
export const TRIANGLE_BG_TOP_COLOR = '#17357F';
// 三角形背景底部颜色
export const TRIANGLE_BG_BOTTOM_COLOR = '#0A1833';

// 渲染及视觉表现颜色配置
export const RENDER_COLORS = {
  // 球体渲染颜色
  ball: {
    base: '#FFD700', // 金色球基础阴影色
    gradientCenter: '#FFED4E', // 径向渐变中心高光
    gradientEdge: '#FFD700', // 径向渐变边缘底色
    trail: '100, 255, 100', // 拖尾基础色 (r,g,b格式，供alpha通道组合)
    debugHighlightFill: 'rgba(255, 40, 40, 0.45)', // 调试模式下特殊球内部填充
    debugHighlightStroke: 'rgba(255, 120, 120, 0.9)', // 调试模式下特殊球边框
  },
  // 钉子渲染颜色
  pin: {
    baseFill: '#606873', // 常规冷蓝钉子填充色
    baseStroke: 'rgba(24, 29, 36,1)', // 常规钉子边框色
    baseShadow: 'rgba(25, 54, 128, 0.55)', // 常规钉子阴影
    // 受击发光状态
    glowFillBase: '255, 242, 140', // 击中时填充基色 (r,g,b)
    glowStroke: 'rgba(255, 250, 210, 0.95)', // 击中时边框色
    glowShadow: '#FFE66D', // 击中时阴影/光晕色
    // 外层泛光层
    outerGlowFillBase: '255, 244, 170', // 外层泛光填充基色 (r,g,b)
    outerGlowShadow: 'rgba(255, 230, 110, 0.95)', // 外层泛光阴影
    innerGlowFillBase: '255, 252, 220', // 内层高光基色 (r,g,b)
  },
  // 三角形墙体及背景
  triangle: {
    borderInner: 'rgba(33, 40, 49, 1)', // 内层边框
    borderOuter: 'rgba(21, 25, 31, 0.6)', // 外层边框
    highlight: 'rgba(158, 212, 34, 0.96)', // 霓虹绿主描边
    highlightCore: 'rgba(229, 255, 170, 0.96)', // 发光核心亮边
    highlightShadowOuter: 'rgba(160, 255, 0, 0.72)', // 外层大范围散光
  },
  // 调试及隐藏对象可视化颜色
  debug: {
    wallMain: 'red', // 主墙体调试色
    wallSegment: '#facc15', // 分段墙体调试色
    slotSensorFill: 'rgba(255, 208, 0, 0.16)', // 底部插槽传感器区域
    slotSensorStroke: 'rgba(255, 208, 0, 0.75)',
    pinSensorFill: 'rgba(62, 235, 255, 0.18)', // 钉子碰撞盒区域
    pinSensorStroke: 'rgba(62, 235, 255, 0.85)',
  },
  // UI 按钮文字描边色 (Play按钮)
  button: {
    disabledText: '#0A1822', // 禁用时文字颜色
    disabledStroke: '#525252', // 禁用时描边
    disabledShadow: 'rgba(82,82,82,0.4)', // 禁用时阴影
    enabledText: '#00471F', // 正常文字颜色
    strokeTop: '#669EE1', // 3D字效顶部描边
    strokeMid: '#80BAE8', // 3D字效中部描边
    strokeBot: '#97D1F0', // 3D字效底部描边
    enabledShadow: 'rgba(23,106,214,0.35)', // 正常发光阴影
  }
} as const;

export interface SlotBagNeonConfig {
  topGlow: string;
  innerGlow: string;
  bottomGlow: string;
  outerGlow: string;
  activeBgTop: string;
  activeBgMid: string;
  activeBgBottom: string;
}

// 落袋高亮专用荧光配置（按 11 个槽位一一对应）
export const SLOT_BAG_NEON_CONFIGS: SlotBagNeonConfig[] = [
  { topGlow: 'rgba(255,255,255,0.96)', innerGlow: 'rgba(121,186,255,0.34)', bottomGlow: 'rgba(230,255,130,0.92)', outerGlow: 'rgba(167,246,102,0.78)', activeBgTop: '#E0F550', activeBgMid: '#C1DB17', activeBgBottom: '#ABC211' }, // 128x
  { topGlow: 'rgba(245,245,255,0.94)', innerGlow: 'rgba(181,130,255,0.36)', bottomGlow: 'rgba(190,255,143,0.9)', outerGlow: 'rgba(121,236,126,0.74)', activeBgTop: '#A424D7', activeBgMid: '#A124DC', activeBgBottom: '#7D1EA3' }, // 32x
  { topGlow: 'rgba(240,244,255,0.93)', innerGlow: 'rgba(152,141,255,0.35)', bottomGlow: 'rgba(175,251,149,0.88)', outerGlow: 'rgba(111,232,133,0.72)', activeBgTop: '#7D51F4', activeBgMid: '#4D3CD4', activeBgBottom: '#2E26AC' }, // 16x
  { topGlow: 'rgba(236,244,255,0.92)', innerGlow: 'rgba(119,171,255,0.34)', bottomGlow: 'rgba(164,247,155,0.86)', outerGlow: 'rgba(96,228,145,0.68)', activeBgTop: '#2573FE', activeBgMid: '#2668FC', activeBgBottom: '#1955F9' }, // 8x
  { topGlow: 'rgba(232,243,255,0.9)', innerGlow: 'rgba(110,204,255,0.34)', bottomGlow: 'rgba(154,241,164,0.84)', outerGlow: 'rgba(92,220,161,0.66)', activeBgTop: '#4E47C0', activeBgMid: '#6C68E3', activeBgBottom: '#534CC8' }, // 1x
  { topGlow: 'rgba(255, 230, 230, 0.87)', innerGlow: 'rgba(126,222,255,0.33)', bottomGlow: 'rgba(148,238,170,0.82)', outerGlow: 'rgba(88,214,170,0.64)', activeBgTop: '#8BA8FC', activeBgMid: '#6D80EC', activeBgBottom: '#5F77E3' }, // 0x
  { topGlow: 'rgba(232,243,255,0.9)', innerGlow: 'rgba(110,204,255,0.34)', bottomGlow: 'rgba(154,241,164,0.84)', outerGlow: 'rgba(92,220,161,0.66)', activeBgTop: '#4E47C0', activeBgMid: '#6C68E3', activeBgBottom: '#534CC8' }, // 1x
  { topGlow: 'rgba(236,244,255,0.92)', innerGlow: 'rgba(119,171,255,0.34)', bottomGlow: 'rgba(164,247,155,0.86)', outerGlow: 'rgba(96,228,145,0.68)', activeBgTop: '#2573FE', activeBgMid: '#2668FC', activeBgBottom: '#1955F9' }, // 8x
  { topGlow: 'rgba(240,244,255,0.93)', innerGlow: 'rgba(152,141,255,0.35)', bottomGlow: 'rgba(175,251,149,0.88)', outerGlow: 'rgba(111,232,133,0.72)', activeBgTop: '#110c1fff', activeBgMid: '#4D3CD4', activeBgBottom: '#2E26AC' }, // 16x
  { topGlow: 'rgba(245,245,255,0.94)', innerGlow: 'rgba(181,130,255,0.36)', bottomGlow: 'rgba(190,255,143,0.9)', outerGlow: 'rgba(121,236,126,0.74)', activeBgTop: '#A424D7', activeBgMid: '#A124DC', activeBgBottom: '#7D1EA3' }, // 32x
  { topGlow: 'rgba(255,255,255,0.96)', innerGlow: 'rgba(121,186,255,0.34)', bottomGlow: 'rgba(230,255,130,0.92)', outerGlow: 'rgba(167,246,102,0.78)', activeBgTop: '#E0F550', activeBgMid: '#C1DB17', activeBgBottom: '#ABC211' }, // 128x
];

export const BALL_VALUE = 0.59; // ₱0.59 per ball
export const STARTING_BALLS = 50;

export const PLINKO_TRAJECTORY_CONFIG = {
  // 隐藏球常态录制仍保持 60fps，避免全程高频采样带来不必要的性能与点数成本。
  hiddenRecordingBaseTimeStepMs: 1000 / 60,
  // 当隐藏球接近钉子，或刚发生钉子碰撞后的短窗口内，切到 180fps 记录关键细节。
  hiddenRecordingContactTimeStepMs: 1000 / 180,
  // 自适应录制在接近/碰撞窗口内允许更多子步，确保低帧率时仍能消化高频采样。
  hiddenRecordingContactMaxSubStepsPerFrame: 12,
  // 当球心距离“球半径 + 钉子半径 + 该额外边距”以内时，提前切到高精度采样。
  // 这里用 pinSpacingX 的比例而不是固定像素，保证不同尺寸盘面手感一致。
  hiddenRecordingContactProximityPaddingRatio: 0.12,
  // 命中钉子后继续维持高精度一小段时间，覆盖弹离与短暂侧滑阶段。
  hiddenRecordingPostHitWindowMs: 140,
  // 轨迹最少保留点数，避免过短/过稀的轨迹被写入缓存。
  minRecordedPoints: 24,
  // 轨迹最短持续时间，避免只录到局部碰撞片段。
  minRecordedDurationMs: 600,
  // 轨迹最少垂直位移，确保录到的是完整下落而不是中途截断。
  minRecordedVerticalTravel: 0.3,
  // 可见球回放前加入一个短 lead-in，让球从生成点自然接上录制轨迹。
  visibleReplayLeadInMs: 160,
  // 允许轨迹点在三角形边界外保留少量 overscan，避免边缘碰撞被硬裁掉。
  edgeOverscanRatio: 0.22,
} as const;

export const PLINKO_PHYSICS_CONFIG = {
  world: {
    gravityY: 1.3, // 经典 Plinko 范式：较高的重力配合高弹性，让下落干脆利落，避免飘浮感
  },
  // 经典硬质弹珠配置：高弹性，极低摩擦
  ball: {
    restitutionBase: 0.9,   // 较高的弹性，保持能量，避免在钉子顶部陷入死区
    friction: 0.001,        // 极低摩擦，真实弹珠台表面非常光滑
    frictionStatic: 0.0,    // 0 静摩擦，彻底消除低速时的粘滑卡顿
    frictionAir: 0.05,     // 适当的空气阻力，防止球在高弹性下无限制加速
  },
  // 钉子配置：与球配合产生清脆反弹
  pin: {
    restitutionBase: 0.9,   // 与球弹性匹配
    restitutionJitter: 0.0, // 关闭弹性随机，经典配置通常依靠微小的初始位置差异而非弹性随机来产生混沌
    friction: 0.001,       // 极低摩擦
    frictionStatic: 0.0,   // 0 静摩擦
  },
  wall: {
    restitution: 0.12,      // 略微增加墙壁弹性
    friction: 0.18,         // 增加墙壁摩擦
  },
  bottomBarrier: {
    restitution: 0.05,      // 略微增加底部屏障弹性
    friction: 0.04,         // 增加底部摩擦
  },
} as const;

// 每个槽位的静态轨迹配置数量（中间槽位更多配置）
export const SLOT_PATH_COUNTS = [5, 5, 5, 5, 7, 8, 7, 5, 5, 5, 5];

