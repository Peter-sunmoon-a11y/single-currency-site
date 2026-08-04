const toNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const CLAIMABLE_BONUS_KEYS = ["ClaimableBonus", "claimableBonus", "claimable_bonus"] as const;

const isUnclaimedBonusRow = (item: Record<string, any>) => {
  if ("claim_status" in item) return toNumber(item.claim_status) === 0;
  if ("handle_status" in item) return toNumber(item.handle_status) === 0;
  if ("status" in item) return toNumber(item.status) === 0;
  if ("is_claimed" in item) return !Boolean(item.is_claimed);
  if ("claimed" in item) return !Boolean(item.claimed);
  return true;
};

const getBonusRowAmount = (item: Record<string, any>) =>
  toNumber(
    item.claim_amount ??
    item.claimable_amount ??
    item.amount ??
    item.value ??
    item.bonus ??
    item.reward_amount
  );

const getClaimableBonusRows = (payload: Record<string, any>) => {
  for (const key of CLAIMABLE_BONUS_KEYS) {
    if (Array.isArray(payload?.[key])) {
      return payload[key] as Array<Record<string, any>>;
    }
  }
  return [] as Array<Record<string, any>>;
};

export function getRakebackClaimableSummary(response: any) {
  const root = response?.data?.data ?? response?.data ?? {};
  const claimableBonusRows = getClaimableBonusRows(root);
  const claimableBonusAmount = claimableBonusRows
    .filter(isUnclaimedBonusRow)
    .reduce((sum, item) => sum + getBonusRowAmount(item), 0);
  const amount = claimableBonusRows.length > 0 ? claimableBonusAmount : toNumber(root?.value);

  return {
    amount,
    currency: root?.currency || claimableBonusRows[0]?.currency || "USDT"
  };
}
