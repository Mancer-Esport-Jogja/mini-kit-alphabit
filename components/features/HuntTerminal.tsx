"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, Info, Loader2 } from "lucide-react";
import { TutorialOverlay } from "@/components/ui/TutorialOverlay";
import { useThetanutsOrders } from "@/hooks/useThetanutsOrders";
import { parseStrike, parsePrice } from "@/utils/decimals";

import { useAuth } from "@/context/AuthContext";

export const HuntTerminal = () => {
  const { isAuthenticated, login, isLoading: isAuthLoading } = useAuth();
  const [collateral, setCollateral] = useState(50);
  const [selectedTarget, setSelectedTarget] = useState<"MOON" | "DOOM" | null>(
    null,
  );
  const [showTutorial, setShowTutorial] = useState(false);

  // Fetch live orders
  const {
    data: orderData,
    isLoading,
    isError,
  } = useThetanutsOrders({
    target: selectedTarget || undefined,
    asset: "ETH",
  });

  const handleTargetSelect = (target: "MOON" | "DOOM") => {
    setSelectedTarget(target);
  };

  const bestOrder = orderData?.bestOrder;

  // Calculate Payout ROI Estimate
  const roiEstimate = useMemo(() => {
    if (!bestOrder) return 0;
    const [lower, upper] = bestOrder.order.strikes.map((s: string) =>
      parseStrike(s),
    );
    const strikeWidth = upper - lower;
    const premium = parsePrice(bestOrder.order.price);
    if (premium === 0) return 0;
    return Math.round((strikeWidth / premium - 1) * 100);
  }, [bestOrder]);

  const tutorialSteps = [
    {
      title: "ANALYZE",
      description:
        "Observe the Tactical Chart and market data. Identify potential price movements.",
    },
    {
      title: "SELECT TARGET",
      description:
        "Choose 'MOON' if you predict the price will rise. Choose 'DOOM' if you predict a fall.",
    },
    {
      title: "COMMIT & LAUNCH",
      description:
        "Set your collateral amount using the slider, then hit 'INITIATE SEQUENCE' to lock in your trade.",
    },
  ];

  return (
    <div className="w-full max-w-md mx-auto relative bg-slate-900 border-4 border-slate-700 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] overflow-hidden">
      <TutorialOverlay
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        title="HUNT TERMINAL MANUAL"
        steps={tutorialSteps}
      />

      {/* Tactical Header */}
      <div className="bg-slate-800 p-3 flex items-center justify-between border-b-4 border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
          <span className="text-xs font-pixel text-slate-300 tracking-wider">
            TACTICAL COMMAND
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowTutorial(true)}
            className="flex items-center gap-1 bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded transition-colors border border-slate-600"
          >
            <Info size={12} className="text-yellow-500" />
            <span className="text-[9px] font-mono text-yellow-500">
              DECODED TRANSMISSION
            </span>
          </button>
          <div className="text-[10px] font-mono text-slate-500">
            SYS.VER.2.0
          </div>
        </div>
      </div>

      {/* Main Display (CRT Effect) */}
      <div className="p-6 relative bg-black/80">
        {/* Scanline Overlay */}
        <div className="absolute inset-0 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-10"></div>
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-white/5 to-transparent h-1 animate-scanline opacity-20"></div>

        {/* Tactical Chart Visualization */}
        <div className="mb-6 relative h-40 bg-slate-900 border-2 border-slate-700 overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(30, 41, 59, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(30, 41, 59, 0.5) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          ></div>

          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 text-bit-green animate-spin" />
                <span className="text-[8px] font-pixel text-bit-green animate-pulse">
                  SCANNING LIQUIDITY...
                </span>
              </div>
            </div>
          ) : (
            <svg
              className="absolute inset-0 w-full h-full p-2"
              preserveAspectRatio="none"
            >
              <path
                d="M0,80 L20,75 L40,85 L60,60 L80,65 L100,50 L120,55 L140,40 L160,45 L180,30 L200,35 L220,15 L240,25 L260,10 L280,20 L300,5 L320,15 L340,0 L360,10 L380,5 L400,0"
                fill="none"
                stroke={selectedTarget === "DOOM" ? "#ef4444" : "#4ade80"}
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
                className="drop-shadow-[0_0_4px_rgba(74,222,128,0.5)]"
              />
              <path
                d="M0,80 L20,75 L40,85 L60,60 L80,65 L100,50 L120,55 L140,40 L160,45 L180,30 L200,35 L220,15 L240,25 L260,10 L280,20 L300,5 L320,15 L340,0 L360,10 L380,5 L400,0 V160 H0 Z"
                fill={`url(#gradient-${selectedTarget === "DOOM" ? "red" : "green"})`}
                opacity="0.2"
              />
              <defs>
                <linearGradient id="gradient-green" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4ade80" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
                <linearGradient id="gradient-red" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
            </svg>
          )}

          {/* Live Price Indicator */}
          <div className="absolute top-2 left-2 bg-black/50 backdrop-blur px-2 py-1 border border-slate-700 rounded">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full animate-pulse ${selectedTarget === "DOOM" ? "bg-red-500" : "bg-green-500"}`}
              ></div>
              <span className="font-mono text-[10px] text-slate-300">
                ETH/USD
              </span>
              <span
                className={`font-pixel text-xs ${selectedTarget === "DOOM" ? "text-red-400" : "text-green-400"}`}
              >
                ${orderData?.marketData.ETH.toLocaleString() || "---"}
              </span>
            </div>
          </div>
        </div>

        {/* Target Selection Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleTargetSelect("MOON")}
            className={`group relative h-40 border-4 transition-all duration-300 flex flex-col items-center justify-center gap-2
                            ${
                              selectedTarget === "MOON"
                                ? "bg-bit-green/10 border-bit-green shadow-[0_0_20px_rgba(74,222,128,0.2)]"
                                : "bg-slate-800/50 border-slate-600 hover:border-bit-green/50"
                            }`}
          >
            {selectedTarget === "MOON" && (
              <div className="absolute inset-0 border-2 border-bit-green pointer-events-none animate-pulse"></div>
            )}
            <TrendingUp
              className={`w-8 h-8 ${selectedTarget === "MOON" ? "text-bit-green" : "text-slate-500 group-hover:text-bit-green"}`}
            />
            <span
              className={`font-pixel text-sm mt-2 ${selectedTarget === "MOON" ? "text-bit-green" : "text-slate-400 group-hover:text-bit-green"}`}
            >
              TARGET: MOON
            </span>
            <div className="text-[10px] font-mono text-slate-500 mt-1 uppercase">
              {isLoading && selectedTarget === "MOON"
                ? "SCANNING..."
                : "LONG DEPLOYMENT"}
            </div>
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleTargetSelect("DOOM")}
            className={`group relative h-40 border-4 transition-all duration-300 flex flex-col items-center justify-center gap-2
                            ${
                              selectedTarget === "DOOM"
                                ? "bg-bit-coral/10 border-bit-coral shadow-[0_0_20px_rgba(232,90,90,0.2)]"
                                : "bg-slate-800/50 border-slate-600 hover:border-bit-coral/50"
                            }`}
          >
            {selectedTarget === "DOOM" && (
              <div className="absolute inset-0 border-2 border-bit-coral pointer-events-none animate-pulse"></div>
            )}
            <TrendingDown
              className={`w-8 h-8 ${selectedTarget === "DOOM" ? "text-bit-coral" : "text-slate-500 group-hover:text-bit-coral"}`}
            />
            <span
              className={`font-pixel text-sm mt-2 ${selectedTarget === "DOOM" ? "text-bit-coral" : "text-slate-400 group-hover:text-bit-coral"}`}
            >
              TARGET: DOOM
            </span>
            <div className="text-[10px] font-mono text-slate-500 mt-1 uppercase">
              {isLoading && selectedTarget === "DOOM"
                ? "SCANNING..."
                : "SHORT DEPLOYMENT"}
            </div>
          </motion.button>
        </div>

        {/* Collateral Throttle */}
        <div className="mb-6">
          <div className="flex justify-between items-end mb-2">
            <label className="text-[10px] font-pixel text-slate-400">
              COMMIT COLLATERAL
            </label>
            <span className="font-mono text-xl text-white tracking-widest">
              {collateral} <span className="text-xs text-slate-500">USDC</span>
            </span>
          </div>

          <div className="relative h-12 bg-slate-900 border-2 border-slate-700 flex items-center px-4">
            <input
              type="range"
              min="1"
              max="100"
              step="1"
              value={collateral}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCollateral(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-8 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-slate-400"
            />
            <div className="absolute inset-0 pointer-events-none flex justify-between px-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-full w-px bg-slate-800"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Mission Stats */}
        <div className="bg-slate-900/80 border border-slate-700 p-3 mb-6 grid grid-cols-2 gap-4">
          <div>
            <div className="text-[9px] text-slate-500 font-mono mb-1 uppercase">
              ROI ESTIMATE
            </div>
            <div
              className={`text-lg font-pixel transition-colors ${roiEstimate > 0 ? "text-bit-green" : "text-slate-500"}`}
            >
              {isLoading ? "..." : roiEstimate > 0 ? `+${roiEstimate}%` : "N/A"}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[9px] text-slate-500 font-mono mb-1 uppercase">
              TARGET STRIKE
            </div>
            <div className="text-lg font-pixel text-yellow-500">
              {isLoading
                ? "..."
                : bestOrder
                  ? `$${parseStrike(bestOrder.order.strikes[selectedTarget === "MOON" ? 0 : 1]).toLocaleString()}`
                  : "---"}
            </div>
          </div>
        </div>

        {/* Launch Button */}
        {!isAuthenticated ? (
          <button
            type="button"
            onClick={login}
            disabled={isAuthLoading}
            className="w-full py-4 bg-bit-green text-black font-pixel text-sm uppercase tracking-widest border-b-4 border-green-800 hover:bg-green-400 active:border-b-0 active:translate-y-1 transition-all shadow-[0_0_15px_rgba(74,222,128,0.4)]"
          >
            {isAuthLoading ? "SYNCHRONIZING..." : "LOGIN TO INITIATE"}
          </button>
        ) : (
          <button
            type="button"
            disabled={!selectedTarget || !bestOrder || isLoading}
            className={`w-full py-4 font-pixel text-sm uppercase tracking-widest transition-all duration-200 border-b-4 active:border-b-0 active:translate-y-1
                          ${
                            !selectedTarget || !bestOrder || isLoading
                              ? "bg-slate-700 text-slate-500 border-slate-900 cursor-not-allowed"
                              : selectedTarget === "MOON"
                                ? "bg-bit-green text-black border-green-800 hover:bg-green-400 shadow-[0_0_15px_rgba(74,222,128,0.4)]"
                                : "bg-bit-coral text-white border-red-900 hover:bg-red-400 shadow-[0_0_15px_rgba(232,90,90,0.4)]"
                          }`}
          >
            {isLoading
              ? "SYNCHRONIZING..."
              : !selectedTarget
                ? "SELECT TARGET"
                : !bestOrder
                  ? "NO MISSION AVAILABLE"
                  : "INITIATE SEQUENCE"}
          </button>
        )}

        {isError && (
          <div className="mt-4 p-2 bg-red-900/30 border border-red-500 text-[10px] font-mono text-red-400 text-center animate-pulse">
            COMMUNICATION ERROR: FAILED TO FETCH ORDER DATA
          </div>
        )}
      </div>

      {/* Decorative Footer */}
      <div className="bg-slate-800 p-2 flex justify-between border-t-4 border-slate-700">
        <div className="flex gap-1">
          <div className="w-16 h-2 bg-slate-700 animate-pulse"></div>
          <div className="w-8 h-2 bg-slate-600"></div>
        </div>
        <div className="text-[8px] font-mono text-slate-500 uppercase">
          {orderData?.marketData
            ? `BASE_MAINNET::CONNECTED`
            : `SEARCHING_NETWORK...`}
        </div>
      </div>
    </div>
  );
};
