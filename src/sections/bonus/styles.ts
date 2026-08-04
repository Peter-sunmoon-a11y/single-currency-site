const BASE_SCRIM = "color-mix(in oklch, var(--color-base-300) 60%, transparent)";
const IS_ABSOLUTE_COLOR = /^(color-mix|var|rgba?|oklch|hsl)/i;

export const createBonusGradient = (baseAccent: string) => {
  const trimmed = baseAccent.trim();
  const accentStop = IS_ABSOLUTE_COLOR.test(trimmed)
    ? trimmed
    : `color-mix(in oklch, ${trimmed} 40%, transparent)`;

  return `
  radial-gradient(
    95.05% 100% at 0% 35.47%,
    ${accentStop} 0%,
    ${BASE_SCRIM} 100%
  ),
  linear-gradient(0deg, var(--color-base-300), var(--color-base-300))
`;
};

export const gradientStyles = {
  blue: createBonusGradient("#2B4EB1"),
  gold: createBonusGradient("#F0AA1E"),
  red: createBonusGradient("#D21D3B"),
  orange: createBonusGradient("#E77732"),
  purple: createBonusGradient("#554387"),
  green: createBonusGradient("#4F9437"),
};

export type GradientColor = keyof typeof gradientStyles;
