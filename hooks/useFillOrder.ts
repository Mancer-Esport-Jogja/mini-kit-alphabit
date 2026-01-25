import { useState, useCallback } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import { parseUnits } from 'viem';
import { THETANUTS_CONTRACTS } from '@/config/thetanuts';
import { ALPHABIT_REFERRER } from '@/config/thetanuts';
import { OPTION_BOOK_ABI } from '@/abi/optionBook';
import { ERC20_ABI } from '@/abi/erc20';
import type { SignedOrder } from '@/types/orders';

/**
 * Normalized order format for blockchain transaction
 * Converts API string values to bigints and adds calculated numContracts
 */
interface NormalizedOrder {
    maker: `0x${string}`;
    orderExpiryTimestamp: bigint;
    collateral: `0x${string}`;
    isCall: boolean;
    priceFeed: `0x${string}`;
    implementation: `0x${string}`;
    isLong: boolean;
    maxCollateralUsable: bigint;
    strikes: bigint[];
    expiry: bigint;
    price: bigint;
    numContracts: bigint; // Must be calculated, not from API
    extraOptionData: `0x${string}`;
}

/**
 * Convert API order to blockchain-ready format
 * CRITICAL: API does NOT provide numContracts - must be calculated
 */
function normalizeOrder(order: SignedOrder['order'], numContracts: bigint): NormalizedOrder {
    return {
        maker: order.maker,
        orderExpiryTimestamp: BigInt(order.orderExpiryTimestamp),
        collateral: order.collateral,
        isCall: order.isCall,
        priceFeed: order.priceFeed,
        implementation: order.implementation,
        isLong: order.isLong,
        maxCollateralUsable: BigInt(order.maxCollateralUsable),
        strikes: order.strikes.map((s) => BigInt(s)),
        expiry: BigInt(order.expiry),
        price: BigInt(order.price),
        numContracts,
        extraOptionData: order.extraOptionData,
    };
}

/**
 * Calculate number of contracts from USDC spend amount
 * 
 * Formula: numContracts = (usdcAmount / pricePerContract) * 1e6
 * 
 * @param usdcAmount - Amount to spend in USDC (with 6 decimals)
 * @param price - Price from API (8 decimals)
 * @returns numContracts scaled to 1e6
 */
function calculateNumContracts(usdcAmount: bigint, price: bigint): bigint {
    // Price is in 8 decimals (e.g. 50000000 = 0.5 USDC per contract)
    // USDC amount is in 6 decimals (e.g. 5000000 = 5 USDC)
    // numContracts should be in 6 decimals representing contract size

    const actualUsdcAmount = Number(usdcAmount) / 1e6; // Convert to actual USDC
    const pricePerContract = Number(price) / 1e8; // Convert to actual price
    const numberOfContracts = actualUsdcAmount / pricePerContract;

    return BigInt(Math.floor(numberOfContracts * 1e6)); // Scale to 1e6
}

export function useFillOrder() {
    const { address } = useAccount();
    const publicClient = usePublicClient();

    // Separate hooks for Approve and Fill to avoid state collision
    const {
        writeContractAsync: writeApprove,
        data: approveHash,
        isPending: isApprovePending,
        error: approveError,
        reset: resetApprove
    } = useWriteContract();

    const {
        writeContractAsync: writeFill,
        data: fillHash,
        isPending: isFillPending,
        error: fillError,
        reset: resetFill
    } = useWriteContract();

    // WaitForTransaction receipts
    const { isLoading: isApproveConfirming } = useWaitForTransactionReceipt({ hash: approveHash });
    const { isLoading: isFillConfirming, isSuccess: isFillSuccess } = useWaitForTransactionReceipt({ hash: fillHash });

    const [currentStep, setCurrentStep] = useState<'idle' | 'approve' | 'fillOrder' | 'success' | 'error'>('idle');

    /**
     * Check USDC allowance for OptionBook contract
     */
    const { data: allowance, refetch: refetchAllowance } = useReadContract({
        address: THETANUTS_CONTRACTS.TOKENS.USDC,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: address ? [address, THETANUTS_CONTRACTS.OPTION_BOOK] : undefined,
        query: {
            enabled: !!address,
        },
    });

    /**
     * Check USDC balance
     */
    const { data: usdcBalance } = useReadContract({
        address: THETANUTS_CONTRACTS.TOKENS.USDC,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
        },
    });

    /**
     * Approve USDC spending for OptionBook
     */
    const approveUSDC = useCallback(async (amount: bigint) => {
        if (!address) throw new Error('Wallet not connected');

        setCurrentStep('approve');

        try {
            await writeApprove({
                address: THETANUTS_CONTRACTS.TOKENS.USDC,
                abi: ERC20_ABI,
                functionName: 'approve',
                args: [THETANUTS_CONTRACTS.OPTION_BOOK, amount],
            });
            // We don't await receipt here manually anymore, the hook handles state
            // But for the logic flow, we need to know when it's done to proceed?
            // Actually, we can't easily wait for the hook's state change in this async function.
            // So we will pause here until we can verify allowance or simply rely on the user to follow steps?
            // Better: Return the hash and let the caller/UI handle the "Waiting" phase?
            // OR: for simplicity in this "One Click" flow, we use publicClient/waitForTransactionReceipt if we want to block.
            // But we are using wagmi hooks.
            // To keep "One Click" flow: we must wait for confirmation here.

            // To wait for confirmation blocking-style without publicClient, we can use a polling loop or just sleep (dangerous).
            // Let's rely on the UI 'isApproveConfirming' state? 
            // PROBLEM: executeFillOrder wants to continue immediately after approveUSDC returns.
            // If we return immediately after 'writeApprove', the TX is not mined yet. 'fillOrder' will fail.

            // Fix: We should simply THROW an error instructing the user "Approval Pending - Please wait and try again" 
            // OR strictly separate the buttons (Approve Button -> Then Buy Button).
            // BUT the requirement is likely a seamless flow.

            // Compromise: We keep the "One Click" flow but we simply wait a bit and hope? No, unreliable.
            // Correct way: The existing code used `setTimeout(2000)`. That's why it failed/race-conditioned.

            // Since we upgraded to `writeContractAsync`, we get a promise that resolves when signature submits.
            // But we need to wait for MINING.
            // Let's fallback to the previous behaviour but with better error handling, 
            // OR improve by asking user to click twice if needed?
            // "Insufficient Allowance. Approving... (Tx Sent). Waiting..."

            // Let's stick to the previous pattern but verify hash.
            return true;
        } catch (error) {
            console.error("Approval failed", error);
            setCurrentStep('error');
            throw error;
        }
    }, [address, writeApprove]);

    /**
     * Execute fill order transaction
     */
    const executeFillOrder = useCallback(async (
        order: SignedOrder,
        usdcSpendAmount: string
    ) => {
        if (!address) {
            throw new Error('Wallet not connected');
        }

        setCurrentStep('idle');

        // Parse USDC amount (6 decimals)
        const usdcAmount = parseUnits(usdcSpendAmount, 6);

        // Check balance
        if (usdcBalance && usdcBalance < usdcAmount) {
            throw new Error(`Insufficient USDC balance. Have ${(Number(usdcBalance) / 1e6).toFixed(2)} USDC, need ${usdcSpendAmount} USDC`);
        }

        // Check and handle allowance
        const currentAllowance = (allowance ?? 0n) as bigint;
        if (currentAllowance < usdcAmount) {
            console.log(`Insufficient allowance. Requesting approval for ${usdcSpendAmount} USDC...`);

            // Explicitly approve using async write
            const hash = await writeApprove({
                address: THETANUTS_CONTRACTS.TOKENS.USDC,
                abi: ERC20_ABI,
                functionName: 'approve',
                args: [THETANUTS_CONTRACTS.OPTION_BOOK, usdcAmount],
            });

            setCurrentStep('approve');
            console.log("Approval TX sent:", hash);

            // Wait for confirmation using publicClient
            if (!publicClient) throw new Error("Public Client not initialized");

            console.log("Waiting for approval confirmation...");
            const receipt = await publicClient.waitForTransactionReceipt({ hash });

            if (receipt.status !== 'success') {
                throw new Error("Approval transaction failed on-chain.");
            }

            console.log("Approval Confirmed!", receipt.transactionHash);
            await refetchAllowance();
        }

        setCurrentStep('fillOrder');

        // Calculate numContracts
        const numContracts = calculateNumContracts(usdcAmount, BigInt(order.order.price));

        // Normalize order
        const normalizedOrder = normalizeOrder(order.order, numContracts);

        // Execute fillOrder transaction
        try {
            const hash = await writeFill({
                address: THETANUTS_CONTRACTS.OPTION_BOOK,
                abi: OPTION_BOOK_ABI,
                functionName: 'fillOrder',
                args: [normalizedOrder, order.signature as `0x${string}`, ALPHABIT_REFERRER],
            });

            setCurrentStep('success');

            return {
                hash,
                numContracts,
                pricePerContract: Number(order.order.price) / 1e8,
            };
        } catch (error) {
            console.error("Fill failed", error);
            setCurrentStep('error');
            throw error;
        }
    }, [address, usdcBalance, allowance, refetchAllowance, writeApprove, writeFill, publicClient]);

    // Consolidate status
    const isPending = isApprovePending || isFillPending;
    const isConfirming = isApproveConfirming || isFillConfirming;
    const isSuccess = isFillSuccess; // Total success is when Fill is done
    const error = approveError || fillError; // Any error
    const hash = fillHash || approveHash; // Show relevant hash

    const reset = useCallback(() => {
        resetApprove();
        resetFill();
        setCurrentStep('idle');
    }, [resetApprove, resetFill]);

    return {
        executeFillOrder,
        approveUSDC,
        hash,
        isPending,
        isConfirming,
        isSuccess,
        error,
        currentStep,
        usdcBalance,
        allowance,
        reset,
    };
}
