export interface OrdersApiResponse {
  data: {
    orders: SignedOrder[];
    market_data: MarketData;
  };
}

export interface SignedOrder {
  order: Order;
  nonce: string;
  signature: string;
  optionBookAddress: string;
}

export interface Order {
  maker: `0x${string}`;
  orderExpiryTimestamp: number;
  collateral: `0x${string}`;
  isCall: boolean;
  priceFeed: `0x${string}`;
  implementation: `0x${string}`;
  isLong: boolean;
  maxCollateralUsable: string;
  strikes: string[]; // strikes can come as strings from API
  expiry: number;
  price: string;
  numContracts: string;
  extraOptionData: `0x${string}`;
}

export interface MarketData {
  BTC: number;
  ETH: number;
}
