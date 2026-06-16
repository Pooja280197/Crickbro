/** Same rules as backend category budget locks — for live admin & overlay team cards */
export function computeCategoryLockReserveForTeam(
  lockCategories,
  soldByCategory,
  bidContext,
) {
  if (!Array.isArray(lockCategories) || lockCategories.length === 0) {
    return { reserve: 0 };
  }
  const bidCat = bidContext?.categoryId ? String(bidContext.categoryId) : null;
  const consume = Boolean(bidContext?.consumeSlotFromBidCategory) && bidCat;
  let reserve = 0;
  for (const cat of lockCategories) {
    const maxP = Math.min(
      500,
      Math.max(0, Math.floor(Number(cat.maxPlayersPerTeam) || 0)),
    );
    if (maxP < 1) continue;
    const base = Number(cat.baseAmount) || 0;
    if (base <= 0) continue;
    const id = String(cat.categoryId);
    const purchased = Number(soldByCategory?.[id]) || 0;
    if (consume && id === bidCat) {
      reserve += base * Math.max(0, maxP - purchased - 1);
    } else {
      reserve += base * Math.max(0, maxP - purchased);
    }
  }
  return { reserve };
}
