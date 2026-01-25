import { createConnector } from 'wagmi';
import {
    createWalletClient,
    http,
    SwitchChainError,
    numberToHex,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';

export interface DevWalletConnectorOptions {
    privateKey: `0x${string}`;
    rpcUrl: string;
    chainId?: number;
}

export function devWalletConnector({ privateKey, rpcUrl, chainId = 8453 }: DevWalletConnectorOptions) {
    const account = privateKeyToAccount(privateKey);

    // Create the underlying WalletClient that can sign
    const walletClient = createWalletClient({
        account,
        chain: {
            ...base,
            id: chainId,
            rpcUrls: {
                default: { http: [rpcUrl] },
                public: { http: [rpcUrl] },
            }
        },
        transport: http(rpcUrl)
    });

    return createConnector((_config) => ({
        id: 'dev-wallet',
        name: 'Dev Wallet',
        type: 'dev-wallet',

        async connect({ chainId: targetChainId, withCapabilities }: { chainId?: number; isReconnecting?: boolean; withCapabilities?: boolean } = {}) {
            const connectedChainId = targetChainId || chainId;
            if (withCapabilities) {
                return {
                    accounts: [{ address: account.address, capabilities: {} }],
                    chainId: connectedChainId,
                } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
            }
            return {
                accounts: [account.address],
                chainId: connectedChainId,
            } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
        },

        async disconnect() {
            // No-op
        },

        async getAccounts() {
            return [account.address];
        },

        async getChainId() {
            return chainId;
        },

        async getProvider() {
            return {
                // Mock EIP-1193 Request Method
                request: async ({ method, params }: { method: string; params?: unknown[] }) => {
                    console.log(`[DevWallet] Request: ${method}`, params);

                    try {
                        switch (method) {
                            case 'eth_requestAccounts':
                            case 'eth_accounts':
                                return [account.address];

                            case 'eth_chainId':
                                return numberToHex(chainId);

                            case 'net_version':
                                return String(chainId);

                            case 'eth_sendTransaction':
                                const [txParams] = (params as [{ to?: string; data?: `0x${string}`; value?: string }]) || [{}];
                                // Use walletClient to sign and send
                                return await walletClient.sendTransaction({
                                    to: txParams.to,
                                    data: txParams.data,
                                    value: txParams.value ? BigInt(txParams.value) : undefined,
                                    account,
                                    chain: {
                                        ...base,
                                        id: chainId
                                    }
                                });

                            case 'personal_sign':
                                const [message, _address] = (params as [string, string]) || [];
                                return await walletClient.signMessage({
                                    message: { raw: message },
                                    account
                                });

                            case 'eth_signTypedData_v4':
                                const [__address, dataStr] = (params as [string, string]) || [];
                                const data = JSON.parse(dataStr);
                                return await walletClient.signTypedData({
                                    account,
                                    domain: data.domain,
                                    types: data.types,
                                    primaryType: data.primaryType,
                                    message: data.message
                                });

                            case 'wallet_switchEthereumChain':
                                // Mock successful switch if it matches our chain
                                const [switchParams] = (params as [{ chainId: string }]) || [{}];
                                const targetHex = switchParams?.chainId;
                                if (targetHex && parseInt(targetHex, 16) === chainId) return null;
                                throw new Error("DevWallet: Cannot switch chain dynamically. Configure correct chainID.");

                            default:
                                // Fallback: try using walletClient.request if it supports it (it wraps transport)
                                return await walletClient.request({ method: method as any, params: params as any });
                        }
                    } catch (error) {
                        console.error(`[DevWallet] Error in ${method}:`, error);
                        throw error;
                    }
                },
                // Standard event emitter methods (mocked)
                on: (_event: string, _listener: (...args: unknown[]) => void) => { },
                removeListener: (_event: string, _listener: (...args: unknown[]) => void) => { },
            };
        },

        async isAuthorized() {
            return true;
        },

        async switchChain({ chainId: targetChainId }) {
            if (targetChainId === chainId) return base;
            throw new SwitchChainError(new Error("Chain switch not supported in DevWallet"));
        },

        onAccountsChanged() { },
        onChainChanged() { },
        onDisconnect() { },
    }));
}
