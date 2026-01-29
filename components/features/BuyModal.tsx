"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, Loader2, ExternalLink, AlertCircle } from "lucide-react";
import { useFillOrder } from "@/hooks/useFillOrder";
// import { parseStrike, parsePrice } from "@/utils/decimals";
import type { ParsedOrder } from "@/types/orders";
import { THETANUTS_CONTRACTS } from "@/config/thetanuts";

interface BuyModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: ParsedOrder | null;
  target: "MOON" | "DOOM" | null;
  initialCollateral: number;
}

export const BuyModal: React.FC<BuyModalProps> = ({ isOpen, onClose, order, target, initialCollateral }) => {
  const [usdcAmount, setUsdcAmount] = useState(initialCollateral.toString());
  
  // Update local state when prop changes or modal opens
  React.useEffect(() => {
    if (isOpen) {
      setUsdcAmount(initialCollateral.toString());
    }
  }, [initialCollateral, isOpen]);

  const { 
    executeFillOrder, 
    hash, 
    isPending, 
    isConfirming, 
    isSuccess, 
    error,
    currentStep,
    usdcBalance,
    reset,
  } = useFillOrder();

  const handleBuy = async () => {
    if (!order) return;
    
    try {
      await executeFillOrder(order.rawOrder, usdcAmount);
      // Success handling - modal will show success state
    } catch (err) {
      console.error("Fill order failed:", err);
    }
  };

  const handleClose = () => {
    if (!isPending && !isConfirming) {
      reset();
      onClose();
    }
  };

  if (!order || !target) return null;

  const strikes = order.strikes;
  const premium = order.premium;

  // Safe checks for strikes
  const isSpread = order.isSpread;
  const isCall = order.direction === 'CALL';
  const strikeWidth = isSpread ? Math.abs(strikes[1] - strikes[0]) : 0;
  
  // Calculate Payout & ROI based on type
  let maxPayout = 0;
  let roi = 0;

  if (isSpread) {
    // Spread (Call or Put Spread)
    // Max Payout = Width - Premium
    maxPayout = strikeWidth - premium;
    roi = premium > 0 ? Math.round((maxPayout / premium) * 100) : 0;
  } else {
    // Vanilla Option (Single Strike)
    if (isCall) {
      // Buying a Call: Unlimited Upside
      maxPayout = Infinity;
      roi = Infinity;
    } else {
      // Buying a Put: Max Profit is if price goes to 0 (Strike - Premium)
      // Strike[0] is the strike price
      maxPayout = strikes[0] - premium;
      roi = premium > 0 ? Math.round((maxPayout / premium) * 100) : 0;
    }
  }


  // Calculate estimated premium cost - REMOVED as per user request
  // const estimatedPremium = ...

  const balanceUSDC = usdcBalance ? (Number(usdcBalance) / 1e6).toFixed(2) : "0.00";
  const hasInsufficientBalance = usdcBalance && parseFloat(usdcAmount) > Number(usdcBalance) / 1e6;

  // Max Buy Amount Logic
  let maxBuyAmount = Infinity;
  let limitMsg = "";
  
  if (order) {
     const maxCollateral = order.maxCollateral; // Already parsed to USDC (6 decimals normalized)
     const isUSDCCollateral = order.rawOrder.order.collateral.toLowerCase() === THETANUTS_CONTRACTS.TOKENS.USDC.toLowerCase();
     
     if (isUSDCCollateral && strikes.length > 0 && strikes[0] > 0) {
        // USDC Collateral: MaxContracts = MaxCollateral / Strike
        // MaxCollateral from API is in USDC 
        const collateralReal = maxCollateral; 
        const maxContracts = collateralReal / strikes[0];
        
        // Ensure we don't have extremely small fractions causing issues
        if (maxContracts > 0) {
            maxBuyAmount = maxContracts * premium;
            limitMsg = `Max buy size: ~$${maxBuyAmount.toFixed(2)} based on available collateral`;
        }
     }
  }

  const exceedsMaxBuy = parseFloat(usdcAmount) > maxBuyAmount;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm pt-16 sm:pt-0"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-[95%] md:w-full max-w-md bg-slate-900 border-4 border-slate-700 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[90vh] sm:max-h-auto relative"
          >


            {/* Content */}
            <div className="p-6 space-y-4 pt-8 overflow-y-auto custom-scrollbar">
              {/* Header (Integrated) */}
              <div className="flex items-center justify-center gap-2 mb-2">
                {target === "MOON" ? (
                  <TrendingUp className="w-5 h-5 text-bit-green" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-bit-coral" />
                )}
                <h2 className="font-pixel text-sm text-white uppercase tracking-widest">
                  Execute {target} Mission
                </h2>
              </div>

              {/* Order Details */}
              <div className="bg-slate-800 border border-slate-700 p-4 rounded relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 p-2 opacity-5">
                    <TrendingUp size={100} />
                </div>

                <div className="text-[10px] font-mono text-slate-500 mb-2 uppercase flex justify-between">
                    <span>Order Details</span>
                    <span className="text-slate-400">{order.expiryFormatted ? order.expiryFormatted : order.expiry.toLocaleDateString()} EXPIRY</span>
                </div>
                <div className="grid grid-cols-2 gap-4 relative z-10">
                  <div>
                    <div className="text-[9px] text-slate-500 mb-1">Target Strike</div>
                    <div className="font-pixel text-lg text-yellow-500">
                      ${strikes[target === "MOON" || !isSpread ? 0 : 1].toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-500 mb-1">Max ROI</div>
                    <div className={`font-pixel text-lg ${roi === Infinity ? 'text-bit-green animate-pulse' : 'text-bit-green'}`}>
                      {roi === Infinity ? 'UNLIMITED' : `+${roi}%`}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-500 mb-1">Premium (per spread)</div>
                    <div className="font-mono text-sm text-white">
                      ${premium.toFixed(4)} USDC
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-500 mb-1">Max Payout</div>
                    <div className="font-mono text-sm text-white">
                       {maxPayout === Infinity ? 'UNLIMITED' : `$${maxPayout.toFixed(2)} USDC`}
                    </div>
                  </div>
                </div>
              </div>

              {/* USDC Amount Input */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[10px] font-pixel text-slate-400 uppercase">
                    Spend Amount (USDC)
                  </label>
                  <span className="text-[9px] font-mono text-slate-500">
                    Balance: {balanceUSDC} USDC
                  </span>
                </div>
                <input
                  type="number"
                  min="0.1"
                  max={maxBuyAmount !== Infinity ? Math.floor(maxBuyAmount) : 1000}
                  step="0.1"
                  value={usdcAmount}
                  onChange={(e) => setUsdcAmount(e.target.value)}
                  disabled={isPending || isConfirming || isSuccess}
                  className="w-full px-4 py-3 bg-slate-800 border-2 border-slate-700 text-white font-mono text-lg text-center focus:outline-none focus:border-bit-green transition-colors disabled:opacity-50"
                  placeholder="Enter amount"
                />
                {hasInsufficientBalance && (
                  <div className="mt-2 text-[10px] text-bit-coral flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Insufficient balance
                  </div>
                )}
                </div>
                {/* Max Buy Amount Warning */}
                {exceedsMaxBuy && (
                  <div className="mt-2 text-[10px] text-orange-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {limitMsg}
                  </div>
                )}

              {/* Transaction Status */}
              {(isPending || isConfirming || isSuccess || error) && (
                <div className={`border-2 p-3 rounded ${
                  error ? 'bg-red-900/20 border-red-500' 
                  : isSuccess ? 'bg-green-900/20 border-green-500'
                  : 'bg-blue-900/20 border-blue-500'
                }`}>
                  {currentStep === 'approve' && (
                    <div className="flex items-center gap-2 text-blue-400">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-[10px] font-mono">Approving USDC...</span>
                    </div>
                  )}
                  {currentStep === 'fillOrder' && (
                    <div className="flex items-center gap-2 text-blue-400">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-[10px] font-mono">Executing fillOrder...</span>
                    </div>
                  )}
                  {isConfirming && (
                    <div className="flex items-center gap-2 text-blue-400">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-[10px] font-mono">Confirming transaction...</span>
                    </div>
                  )}
                  {isSuccess && hash && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-green-400">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-mono">Trade executed successfully!</span>
                      </div>
                      <a
                        href={`https://basescan.org/tx/${hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[9px] text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        View on BaseScan <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                  {error && (
                    <div className="text-[10px] text-red-400 font-mono">
                      Error: {error.message || "Transaction failed"}
                    </div>
                  )}
                </div>
              )}

              {/* MAX RISK WARNING - Moved above buttons */}
               <div className="bg-red-900/30 border-2 border-red-500 p-3 rounded animate-pulse">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-[10px] font-black text-red-500 uppercase flex items-center gap-1 relative z-10">
                    <AlertCircle className="w-4 h-4" />
                    MAXIMUM RISK WARNING
                  </div>
                  <div className="text-[9px] font-mono text-red-400">100% CAPITAL AT RISK</div>
                </div>
                <div className="text-[9px] text-red-300 font-mono leading-tight">
                  If the market moves against your target, you will lose your <strong>ENTIRE COLLATERAL</strong>. There are no partial refunds.
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  disabled={isPending || isConfirming}
                  className="flex-1 py-3 bg-slate-700 text-slate-300 font-pixel text-sm uppercase border-b-4 border-slate-900 hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:border-b-0 active:translate-y-1"
                >
                  {isSuccess ? "Close" : "Cancel"}
                </button>
                {!isSuccess && (
                  <button
                    onClick={handleBuy}
                    disabled={isPending || isConfirming || hasInsufficientBalance || exceedsMaxBuy || !usdcAmount || parseFloat(usdcAmount) <= 0}
                    className={`flex-1 py-3 font-pixel text-sm uppercase border-b-4 transition-all active:border-b-0 active:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed ${
                      target === "MOON"
                        ? "bg-bit-green text-black border-green-800 hover:bg-green-400"
                        : "bg-bit-coral text-white border-red-900 hover:bg-red-400"
                    }`}
                  >
                    {isPending || isConfirming ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      "Execute Trade"
                    )}
                  </button>
                )}
              </div>


            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
