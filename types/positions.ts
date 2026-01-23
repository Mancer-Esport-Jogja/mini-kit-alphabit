export interface Position {
  address: `0x${string}`;
  status: 'open' | 'settled' | 'expired';
  buyer: `0x${string}`;
  seller: `0x${string}`;
  referrer: `0x${string}`;
  createdBy: `0x${string}`;
  entryTimestamp: number;
  entryTxHash: `0x${string}`;
  entryPremium: string;
  entryFeePaid: string;
  collateralToken: `0x${string}`;
  collateralSymbol: 'USDC' | 'WETH' | 'CBBTC';
  collateralDecimals: number;
  underlyingAsset: 'BTC' | 'ETH';
  priceFeed: `0x${string}`;
  strikes: string[];
  expiryTimestamp: number;
  numContracts: string;
  collateralAmount: string;
  optionType: number;
  settlement: Settlement | null;
  explicitClose: ExplicitClose | null;
}

export interface Settlement {
  settlementPrice: string;
  payoutBuyer: string;
  payoutSeller: string;
  settledAt: number;
  settlementTxHash: `0x${string}`;
}

export interface ExplicitClose {
  closedAt: number;
  closeTxHash: `0x${string}`;
}
