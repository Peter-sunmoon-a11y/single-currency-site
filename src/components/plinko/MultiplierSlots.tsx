import { SLOT_COLORS_BG, SLOT_COLORS_BORDER, SLOT_COLORS_NUM, SLOT_BAG_NORMAL,SLOT_BAG_NORMAL_BORDER } from './types';

interface MultiplierSlotsProps {
  multipliers: number[];
  slotWidth: number;
  slotGap: number;
  slotHeight: number;
  slotCenters?: number[];
  activeSlot: number | null;
  triangleBottomY?: number; // 添加三角形底部位置参数
  minTop?: number;
  highlightColors?: { [key: number]: string }; // 高亮颜色映射
  slotBackgroundColors?: string[];
  slotBorderColors?: string[];
  slotTextColors?: string[];
  slotBagNormalColor?: string;
  slotBagNormalBorderColor?: string;
  showValues?: boolean;
}

const hexToRgb = (hex: string) => {
  const normalized = hex.replace('#', '').trim();
  const full = normalized.length === 3
    ? normalized.split('').map((c) => c + c).join('')
    : normalized;
  if (full.length !== 6) return null;
  const r = Number.parseInt(full.slice(0, 2), 16);
  const g = Number.parseInt(full.slice(2, 4), 16);
  const b = Number.parseInt(full.slice(4, 6), 16);
  if ([r, g, b].some((v) => Number.isNaN(v))) return null;
  return { r, g, b };
};

const mixColor = (baseHex: string, target: { r: number; g: number; b: number }, ratio: number) => {
  const rgb = hexToRgb(baseHex);
  if (!rgb) {
    const t = Math.max(0, Math.min(1, ratio));
    return `color-mix(in oklab, ${baseHex} ${(1 - t) * 100}%, rgb(${target.r}, ${target.g}, ${target.b}) ${t * 100}%)`;
  }
  const t = Math.max(0, Math.min(1, ratio));
  const r = Math.round(rgb.r + (target.r - rgb.r) * t);
  const g = Math.round(rgb.g + (target.g - rgb.g) * t);
  const b = Math.round(rgb.b + (target.b - rgb.b) * t);
  return `rgb(${r}, ${g}, ${b})`;
};

export const MultiplierSlots = ({
  multipliers,
  slotWidth,
  slotGap,
  slotHeight,
  slotCenters,
  activeSlot,
  highlightColors,
  slotBackgroundColors,
  slotBorderColors,
  slotTextColors,
  slotBagNormalColor,
  slotBagNormalBorderColor,
  showValues = true,
}: MultiplierSlotsProps) => {
  const adaptiveFontSize = Math.max(9, Math.min(22, Math.min(slotWidth * 0.55, slotHeight * 0.45)));

  return (
    <div className={'absolute bottom-8'}
      style={{ gap: `${slotGap}px` }}
    >
      {multipliers.map((mult, i) => {
        const isActive = activeSlot === i;
        const isJackpot = i === multipliers.length - 1;
        const bgPalette = slotBackgroundColors ?? SLOT_COLORS_BG;
        const borderPalette = slotBorderColors ?? SLOT_COLORS_BORDER;
        const textPalette = slotTextColors ?? SLOT_COLORS_NUM;
        const baseColor = isActive ? bgPalette[i] : (slotBagNormalColor ?? SLOT_BAG_NORMAL);
        const borderColor = isActive ? borderPalette[i] : (slotBagNormalBorderColor ?? SLOT_BAG_NORMAL_BORDER);
        const textColor = textPalette[i] ?? textPalette[textPalette.length - 1];
        const activeHighlight = highlightColors?.[i] || 'var(--color-primary)';
        //const strongHighlight = SLOT_COLORS_BAG[i] ?? SLOT_COLORS_BAG[SLOT_COLORS_BAG.length - 1];
        const centerX = slotCenters?.[i];
        const softGlow = `color-mix(in oklab, ${activeHighlight} 42%, transparent)`;
        const glowColorStrong = mixColor(activeHighlight, { r: 255, g: 255, b: 255 }, 0.24);
        const glowColorSoft = mixColor(activeHighlight, { r: 255, g: 255, b: 255 }, 0.34);

        // 针对 5、6、7 号球袋（即 i 等于 4, 5, 6，因为索引从 0 开始），调整其渐变逻辑，使其中间不那么亮，渐变更柔和
        const isMiddleSlots = i >= 4 && i <= 6;

        const activeBackground = isActive
          ? isMiddleSlots
            ? `linear-gradient(to bottom, ${mixColor(activeHighlight, { r: 255, g: 255, b: 255 }, 0.12)} 0%, ${activeHighlight} 30%, ${activeHighlight} 70%, ${mixColor(activeHighlight, { r: 0, g: 0, b: 0 }, 0.15)} 100%)`
            : `linear-gradient(to bottom, ${mixColor(activeHighlight, { r: 255, g: 255, b: 255 }, 0.22)} 0%, ${mixColor(activeHighlight, { r: 255, g: 255, b: 255 }, 0.1)} 24%, ${activeHighlight} 58%, ${mixColor(activeHighlight, { r: 0, g: 0, b: 0 }, 0.12)} 100%)`
          : `linear-gradient(to bottom, color-mix(in oklab, ${baseColor} 42%, var(--color-base-300)) 0%, color-mix(in oklab, ${baseColor} 72%, var(--color-base-200)) 52%, ${baseColor} 100%)`;

        return (
          <div
            key={i}
            className={`
              absolute flex items-center justify-center transition-all duration-300
              ${isActive ? 'scale-105 z-10 brightness-105' : ''}
            `}
            style={{
              left: typeof centerX === 'number' ? `${centerX}px` : undefined,
              transform: typeof centerX === 'number' ? 'translateX(-50%)' : undefined,
              width: slotWidth, // 与钉子间距对齐（间隙已在 PlinkoBoard 中扣除）
              height: slotHeight, // 高度使用钉子垂直间距
              borderRadius: `${Math.max(5, slotWidth * 0.4)}px`, // 圆角矩形，所有角都有圆角
              marginLeft: typeof centerX === 'number' ? undefined : `${i * (slotWidth + slotGap)}px`,
              background: activeBackground,
              border: isActive ? 'none' : `1px solid ${borderColor}`,
              color: isActive ? textColor : 'var(--color-base-content)',
              fontSize: `${adaptiveFontSize}px`,
              fontWeight: 600,
              textShadow: isJackpot ? '0 1px 2px rgba(38, 83, 175, 0.45)' : '0 1px 2px rgba(38, 83, 175, 0.38)',
              boxShadow: isActive
                ? isMiddleSlots
                  ? `0 0 8px ${softGlow}, 0 0 16px rgba(116, 164, 250, 0.15), 0 0 24px rgba(76, 128, 236, 0.12), inset 0 1px 2px rgba(255,255,255,0.1), inset 0 -4px 8px rgba(35, 65, 140, 0.15)`
                  : `0 0 16px ${softGlow}, 0 0 32px rgba(116, 164, 250, 0.28), 0 0 52px rgba(76, 128, 236, 0.22), inset 0 1px 3px rgba(255,255,255,0.18), inset 0 -8px 14px rgba(35, 65, 140, 0.2)`
                : `0 6px 14px rgba(6, 11, 17, 0.34), inset 0 1px 4px rgba(255,255,255,0.16), inset 0 -10px 16px rgba(9, 14, 27, 0.18)`,
              overflow: isActive ? 'visible' : 'hidden',
              zIndex: isActive ? 2 : 1,
            }}
          >
            {isActive && (
              <>
                {/* 落袋后显示的包裹式外发光，让整个球袋一起发光 */}
                <div
                  className="absolute pointer-events-none"
                  style={{
                    left: '-16%',
                    right: '-16%',
                    top: `${-slotHeight * 0.16}px`,
                    bottom: `${-slotHeight * 0.16}px`,
                    borderRadius: `${Math.max(8, slotWidth * 0.46)}px`,
                    background: `radial-gradient(ellipse at center center, ${glowColorSoft} 0%, ${glowColorSoft} 34%, rgba(168, 210, 255, 0.16) 62%, rgba(168, 210, 255, 0.03) 82%, rgba(168, 210, 255, 0) 100%)`,
                    filter: 'blur(8px)',
                    zIndex: -1,
                    opacity: isMiddleSlots ? 0.5 : 1, // 中间球袋减弱外发光
                  }}
                />
                <div
                  className="absolute pointer-events-none"
                  style={{
                    left: '-4%',
                    right: '-4%',
                    top: `${-slotHeight * 0.04}px`,
                    bottom: `${-slotHeight * 0.04}px`,
                    borderRadius: `${Math.max(7, slotWidth * 0.43)}px`,
                    background: `linear-gradient(180deg, ${glowColorStrong} 0%, ${glowColorSoft} 38%, rgba(168, 210, 255, 0.18) 68%, rgba(168, 210, 255, 0.04) 100%)`,
                    opacity: isMiddleSlots ? 0.2 : 0.42, // 中间球袋减弱内发光
                    filter: 'blur(4px)',
                    zIndex: -1,
                  }}
                />
                <div
                  className="absolute"
                  style={{
                    left: '6%',
                    right: '6%',
                    top: 0,
                    height: `${Math.max(3, slotHeight * 0.2)}px`,
                    borderRadius: `${Math.max(3, slotHeight * 0.12)}px`,
                    background: 'linear-gradient(180deg, rgba(214, 234, 255, 0.62) 0%, rgba(174, 206, 255, 0.26) 56%, rgba(174, 206, 255, 0) 100%)',
                    opacity: isMiddleSlots ? 0.6 : 1, // 中间球袋减弱顶部高光
                  }}
                />
              </>
            )}
            <div
              className="absolute inset-0"
              style={{
                background: isActive
                  ? 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 22%, rgba(22, 44, 110, 0.12) 100%)'
                  : 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 24%, rgba(22, 44, 110, 0.16) 100%)',
              }}
            />
            <div className={"text-[14px] tracking-tighter items-center flex flex-col leading-none font-bold"}>
              {showValues ? (mult === 0 ? "0" : `${mult}`) : ""}
              <span className={'text-[10px] text-primary'}>X</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
