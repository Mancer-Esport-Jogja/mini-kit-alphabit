import { useState, useCallback } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import { parseUnits } from 'viem';
import { THETANUTS_CONTRACTS } from '@/config/thetanuts';
import { ALPHABIT_REFERRER } from '@/config/thetanuts';
import { OPTION_BOOK_ABI } from '@/abi/optionBook';
import { ERC20_ABI } from '@/abi/erc20';
import type { SignedOrder } from '@/types/orders';
import { triggerSync } from '@/services/thetanutsApi';
import { useAuth } from '@/context/AuthContext';

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
    const actualUsdcAmount = Number(usdcAmount) / 1e6;
    const pricePerContract = Number(price) / 1e8;
    const numberOfContracts = actualUsdcAmount / pricePerContract;

    return BigInt(Math.floor(numberOfContracts * 1e6));
}

export function useFillOrder() {
    const { address } = useAccount();
    const { token } = useAuth();
    const publicClient = usePublicClient();

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

    const { isLoading: isApproveConfirming } = useWaitForTransactionReceipt({ hash: approveHash });
    const { isLoading: isFillConfirming, isSuccess: isFillSuccess } = useWaitForTransactionReceipt({ hash: fillHash });

    const [currentStep, setCurrentStep] = useState<'idle' | 'approve' | 'fillOrder' | 'success' | 'error'>('idle');

    const { data: allowance, refetch: refetchAllowance } = useReadContract({
        address: THETANUTS_CONTRACTS.TOKENS.USDC,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: address ? [address, THETANUTS_CONTRACTS.OPTION_BOOK] : undefined,
        query: {
            enabled: !!address,
        },
    });

    const { data: usdcBalance } = useReadContract({
        address: THETANUTS_CONTRACTS.TOKENS.USDC,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
        },
    });

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
            return true;
        } catch (error) {
            setCurrentStep('error');
            throw error;
        }
    }, [address, writeApprove]);

    const executeFillOrder = useCallback(async (
        order: SignedOrder,
        usdcSpendAmount: string
    ) => {
        if (!address) throw new Error('Wallet not connected');

        setCurrentStep('idle');
        const usdcAmount = parseUnits(usdcSpendAmount, 6);

        if (usdcBalance && usdcBalance < usdcAmount) {
            throw new Error(`Insufficient USDC balance.`);
        }

        const currentAllowance = (allowance ?? 0n) as bigint;
        if (currentAllowance < usdcAmount) {
            const hash = await writeApprove({
                address: THETANUTS_CONTRACTS.TOKENS.USDC,
                abi: ERC20_ABI,
                functionName: 'approve',
                args: [THETANUTS_CONTRACTS.OPTION_BOOK, usdcAmount],
            });

            setCurrentStep('approve');
            if (!publicClient) throw new Error("Public Client not initialized");
            await publicClient.waitForTransactionReceipt({ hash });
            await refetchAllowance();
        }

        setCurrentStep('fillOrder');
        const numContracts = calculateNumContracts(usdcAmount, BigInt(order.order.price));
        const normalizedOrder = normalizeOrder(order.order, numContracts);

        try {
            const hash = await writeFill({
                address: THETANUTS_CONTRACTS.OPTION_BOOK,
                abi: OPTION_BOOK_ABI,
                functionName: 'fillOrder',
                args: [normalizedOrder, order.signature as `0x${string}`, ALPHABIT_REFERRER],
            });

            // Trigger backend sync
            triggerSync(token || undefined).catch(console.error);

            setCurrentStep('success');

            return {
                hash,
                numContracts,
                pricePerContract: Number(order.order.price) / 1e8,
            };
        } catch (error) {
            setCurrentStep('error');
            throw error;
        }
    }, [address, usdcBalance, allowance, refetchAllowance, writeApprove, writeFill, publicClient, token]);

    const isPending = isApprovePending || isFillPending;
    const isConfirming = isApproveConfirming || isFillConfirming;
    const isSuccess = isFillSuccess;
    const error = approveError || fillError;
    const hash = fillHash || approveHash;

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
