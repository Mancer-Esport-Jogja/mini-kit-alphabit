export const OPTION_BOOK_ABI = [
  {
    inputs: [
      {
        components: [
          { name: 'maker', type: 'address' },
          { name: 'orderExpiryTimestamp', type: 'uint256' },
          { name: 'collateral', type: 'address' },
          { name: 'isCall', type: 'bool' },
          { name: 'priceFeed', type: 'address' },
          { name: 'implementation', type: 'address' },
          { name: 'isLong', type: 'bool' },
          { name: 'maxCollateralUsable', type: 'uint256' },
          { name: 'strikes', type: 'uint256[]' },
          { name: 'expiry', type: 'uint256' },
          { name: 'price', type: 'uint256' },
          { name: 'numContracts', type: 'uint256' },
          { name: 'extraOptionData', type: 'bytes' },
        ],
        name: 'order',
        type: 'tuple',
      },
      { name: 'signature', type: 'bytes' },
      { name: 'referrer', type: 'address' },
    ],
    name: 'fillOrder',
    outputs: [{ name: 'optionAddress', type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'token', type: 'address' }],
    name: 'claimFees',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'referrer', type: 'address' },
    ],
    name: 'fees',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;
