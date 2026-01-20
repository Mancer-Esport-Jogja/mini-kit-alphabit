/**
 * Decimal specifications for Thetanuts data
 */
export const DECIMALS = {
  STRIKES: 8,        // Strike prices use 8 decimals
  PRICE: 8,          // Option premium uses 8 decimals
  USDC: 6,           // USDC uses 6 decimals
  CONTRACTS: 6,      // numContracts uses 6 decimals
  WETH: 18,          // WETH uses 18 decimals
} as const;

/**
 * Parse strike price from raw value
 * @example parseStrike(100000000000) => 1000 (USD)
 */
export function parseStrike(raw: bigint | number | string): number {
  return Number(raw) / 10 ** DECIMALS.STRIKES;
}

/**
 * Parse option price from raw value
 * @example parsePrice(5000000) => 0.05 (USDC per contract)
 */
export function parsePrice(raw: string | bigint | number): number {
  return Number(raw) / 10 ** DECIMALS.PRICE;
}

/**
 * Format USDC amount for contract
 * @example formatUsdc(100) => 100000000n (100 USDC)
 */
export function formatUsdc(amount: number): bigint {
  return BigInt(Math.floor(amount * 10 ** DECIMALS.USDC));
}

/**
 * Calculate number of contracts from USDC amount
 * @param usdcAmount Amount in USDC
 * @param pricePerContract Raw price from order
 */
export function calculateContracts(usdcAmount: number, pricePerContract: string | bigint | number): bigint {
  const price = parsePrice(pricePerContract);
  if (price === 0) return BigInt(0);
  const contracts = usdcAmount / price;
  return BigInt(Math.floor(contracts * 10 ** DECIMALS.CONTRACTS));
}
