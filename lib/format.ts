/** Format a token count compactly, e.g. 1234 -> "1.2k". */
export function formatTokens(n: number): string {
  return n >= 1000
    ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`
    : String(n);
}

/**
 * Format a USD cost for display. Uses adaptive precision so tiny-but-nonzero
 * costs don't round to "$0.0000".
 */
export function formatCost(usd: number): string {
  if (usd <= 0) return "$0";
  if (usd < 0.0001) return "<$0.0001";
  if (usd < 1) return `$${usd.toFixed(4)}`;
  return `$${usd.toFixed(2)}`;
}
