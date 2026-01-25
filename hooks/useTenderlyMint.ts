import { useWalletClient } from 'wagmi';
import { parseUnits, toHex, type Hex } from 'viem';
import { THETANUTS_CONTRACTS } from '@/config/thetanuts';
import { IS_TESTNET } from '@/config/wagmi';

/**
 * Tenderly custom RPC method types
 * @see https://docs.tenderly.co/reference/json-rpc-methods
 */
interface TenderlyRpcSchema {
    method: 'tenderly_setErc20Balance';
    params: [tokenAddress: Hex, walletAddress: Hex, balance: Hex];
    ReturnType: void;
}

/**
 * Mint test USDC on Tenderly fork using tenderly_setErc20Balance cheatcode
 * Only works when NEXT_PUBLIC_ENABLE_TESTNET=true
 */
export function useTenderlyMint() {
    const { data: walletClient } = useWalletClient();

    const mintUSDC = async (amount: string = '10000') => {
        if (!IS_TESTNET) {
            throw new Error('Minting only available in testnet mode');
        }

        if (!walletClient) {
            throw new Error('Wallet not connected');
        }

        const amountBigInt = parseUnits(amount, 6); // USDC has 6 decimals

        // Tenderly-specific cheatcode - use typed request
        await walletClient.request<TenderlyRpcSchema>({
            method: 'tenderly_setErc20Balance',
            params: [
                THETANUTS_CONTRACTS.TOKENS.USDC,
                walletClient.account.address,
                toHex(amountBigInt),
            ],
        });

        return { address: walletClient.account.address, amount: amountBigInt };
    };

    return { mintUSDC, isTestnet: IS_TESTNET };
}
