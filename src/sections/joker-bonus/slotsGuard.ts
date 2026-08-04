const normalizeGameCategory = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.flatMap(normalizeGameCategory);
  }

  if (typeof value !== "string") {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
};

export function isSlotsGame(game: unknown): boolean {
  if (!game || typeof game !== "object") {
    return false;
  }

  const record = game as Record<string, unknown>;
  const primaryCategories = normalizeGameCategory(record.game_category_1);
  if (primaryCategories.includes("slots")) {
    return true;
  }

  const secondaryCategories = normalizeGameCategory(record.game_category_2);
  return secondaryCategories.includes("slots");
}
