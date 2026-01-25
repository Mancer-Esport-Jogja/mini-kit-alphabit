import { createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { coinbaseWallet } from 'wagmi/connectors';
import { farcasterFrame } from '@farcaster/miniapp-wagmi-connector';
import { defineChain } from 'viem';
import { devWalletConnector } from './devWalletConnector';

// Environment-based configuration
const IS_DEV_MODE = process.env.NEXT_PUBLIC_ENABLE_TESTNET === 'true';
const TENDERLY_RPC = process.env.NEXT_PUBLIC_TENDERLY_RPC;
const DEV_PRIVATE_KEY = process.env.NEXT_PUBLIC_DEV_PRIVATE_KEY as `0x${string}`;

// Tenderly fork: Base mainnet state with fork RPC
// CRITICAL: Chain ID MUST be 8453 (same as Base) for signatures to work
const baseFork = defineChain({
    id: 8453,
    name: 'Base (Tenderly Fork)',
    nativeCurrency: base.nativeCurrency,
    rpcUrls: {
        default: { http: [TENDERLY_RPC!] },
        public: { http: [TENDERLY_RPC!] },
    },
    blockExplorers: base.blockExplorers,
});

export const config = createConfig({
    chains: IS_DEV_MODE && TENDERLY_RPC ? [baseFork] : [base],
    connectors: IS_DEV_MODE && DEV_PRIVATE_KEY && TENDERLY_RPC
        ? [
            // Dev mode: Use custom private key wallet
            devWalletConnector({
                privateKey: DEV_PRIVATE_KEY,
                rpcUrl: TENDERLY_RPC,
                chainId: 8453
            })
        ]
        : [
            // Prod mode: Farcaster Frame connector
            farcasterFrame(),
            coinbaseWallet({ appName: 'Alphabit' }),
        ],
    // Force transport mapping
    transports: IS_DEV_MODE && TENDERLY_RPC
        ? { [baseFork.id]: http(TENDERLY_RPC) }
        : { [base.id]: http() },
    ssr: true,
});

// Export for use in components
export const IS_TESTNET = IS_DEV_MODE;
