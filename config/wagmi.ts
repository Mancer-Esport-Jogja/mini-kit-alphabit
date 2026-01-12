import { createConfig, http } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { coinbaseWallet } from 'wagmi/connectors';

export const config = createConfig({
    chains: [baseSepolia],
    connectors: [
        coinbaseWallet({
            appName: 'Alphabit',
        }),
    ],
    transports: {
        [baseSepolia.id]: http(),
    },
    ssr: true,
});
