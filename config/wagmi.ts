import { createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { coinbaseWallet } from 'wagmi/connectors';
import { farcasterFrame } from '@farcaster/miniapp-wagmi-connector';

export const config = createConfig({
    chains: [base],
    connectors: [
        farcasterFrame(),
        coinbaseWallet({
            appName: 'Alphabit',
        }),
    ],
    transports: {
        [base.id]: http(),
    },
    ssr: true,
});
