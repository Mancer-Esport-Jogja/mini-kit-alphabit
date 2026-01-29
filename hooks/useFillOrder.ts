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

/**
 * Calculate the maximum USDC amount a user can spend on this order
 * based on the Maker's available collateral.
 */
export function calculateMaxSpend(order: SignedOrder['order']): number {
    const collateral = order.collateral.toLowerCase();
    const usdc = THETANUTS_CONTRACTS.TOKENS.USDC.toLowerCase();
    const isUsdcCollateral = collateral === usdc;

    const maxCollateral = BigInt(order.maxCollateralUsable);
    const price = BigInt(order.price); // 8 decimals
    const strikes = order.strikes.map(s => BigInt(s)); // 8 decimals

    let maxContracts = 0n; // Scaled 1e6

    if (isUsdcCollateral) {
        // MAKER IS SHORT PUT (or Spread)
        // Collateral locked = Contracts * (StrikeDiff or Strike)
        let collateralPerContract = 0n;

        if (strikes.length === 1) {
            // Vanilla Put: Collateral = Strike
            // Strike is 8 decimals. Collateral is 6 decimals (USDC).
            // We need to match scales.
            // Collateral (Units) = Contracts * Strike (Price).
            // 7500 USDC = C * 3000 USDC.
            // 7500e6 = C_units * 3000e8 ? No.
            // Standard: 1 Contract (1e6 units) locks 1 Token * Strike.
            // If Strike=3000 (3000*1e8).
            // Collateral Required = 1 * 3000 * 1e6 = 3000e6.
            // So CollatReq = Strike / 100.

            // Formula: CollatReq = Strike / 100 (Convert 8 dec to 6 dec)
            collateralPerContract = strikes[0] / 100n;
        } else if (strikes.length === 2) {
            // Put Spread: Collateral = HigherStrike - LowerStrike
            const diff = strikes[1] > strikes[0] ? strikes[1] - strikes[0] : strikes[0] - strikes[1];
            collateralPerContract = diff / 100n;
        } else {
            // Butterfly/Condor - Conservative estimate or assume Strike1
            collateralPerContract = strikes[0] / 100n;
        }

        if (collateralPerContract === 0n) return 0; // Avoid div by zero
        // maxContracts (1e6) = (maxCollateral / collatPerContract) * 1e6
        maxContracts = (maxCollateral * 1000000n) / collateralPerContract;

    } else {
        // MAKER IS SHORT CALL (Asset Collateral)
        // Collateral locked = Contracts * 1 Asset (usually)
        // maxCollateral is in Asset Units.
        // If ETH (18 dec). Contract (6 dec).
        // 1 Contract (1e6) -> 1 ETH (1e18).
        // scale = 1e12.
        // maxContracts = maxCollateral / 1e12.
        // Default assumption for Asset collateral
        maxContracts = maxCollateral / 1000000000000n; // 1e12

        // Safety: If maxContracts is extremely small, maybe different scale?
        // But Thetanuts usually uses 1e18 for ETH.
    }

    // Calculate Max Spend (Premium)
    // Spend = (maxContracts * price) / 1e6 ?
    // maxContracts is 1e6 scaled. Price is 1e8.
    // Cost = (C * P) / 1e8. (Result in USDC 6 dec? No)
    // Cost (USDC 6dec) = Units * Price (USDC 6dec? No price is 8dec).
    // Let's re-verify cost formula:
    // calcNumContracts: (USDC * 1e8) / Price.
    // So USDC = (Contracts * Price) / 1e8.

    const maxSpendRaw = (maxContracts * price) / 100000000n;

    // Return Number (USDC 6 decimals -> Float)
    return Number(maxSpendRaw) / 1e6;
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
        if (ALPHABIT_REFERRER === '0x1A0e000000000000000000000000000000000000') {
            console.warn('ALPHABIT_REFERRER is using the fallback placeholder. Set NEXT_PUBLIC_ALPHABIT_REFERRER in .env to your platform referrer address.');
        }

        setCurrentStep('idle');
        const usdcAmount = parseUnits(usdcSpendAmount, 6);

        // Guard: prevent user from signing a transaction that is guaranteed
        // to revert because the RFQ quote has already expired.
        const now = Math.floor(Date.now() / 1000);
        if (order.order.orderExpiryTimestamp <= now + 5) {
            // add small buffer for mempool delay
            throw new Error('This quote has expired. Refresh orders and try again.');
        }
        // Guard: prevent taking options that are already past their actual expiry
        if (order.order.expiry <= now + 30) {
            throw new Error('This option series has already expired. Please pick another order.');
        }

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
