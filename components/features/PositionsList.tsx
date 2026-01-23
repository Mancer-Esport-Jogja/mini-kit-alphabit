"use client";

import React from "react";
import { useUserPositions } from "@/hooks/useUserPositions";
import { Position } from "@/types/positions";
import { parseStrike } from "@/utils/decimals";
import { Loader2, History, ExternalLink, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const PositionsList = () => {
  const { data: positions, isLoading, isError } = useUserPositions();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-black/40 border-2 border-slate-800 border-t-0">
        <Loader2 className="w-6 h-6 text-slate-500 animate-spin mb-2" />
        <span className="text-[10px] font-pixel text-slate-500">
          DECRYPTING POSITIONS...
        </span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 bg-red-900/20 border-2 border-red-900/50 border-t-0 text-center">
        <span className="text-[10px] font-pixel text-red-500">
          FAILED TO CONNECT TO INDEXER
        </span>
      </div>
    );
  }

  const openPositions = positions?.filter((p) => p.status === "open") || [];

  return (
    <div className="bg-slate-900/50 border-2 border-slate-700 mt-0">
      <div className="bg-slate-800 p-2 border-b-2 border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History size={12} className="text-slate-400" />
          <span className="text-[9px] font-pixel text-slate-300">
            MISSION LOGS
          </span>
        </div>
        <div className="text-[8px] font-mono text-slate-500">
          {openPositions.length} ACTIVE BATTLES
        </div>
      </div>

      <div className="max-h-60 overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {openPositions.length === 0 ? (
            <div className="p-8 text-center bg-black/20">
              <p className="text-[10px] font-pixel text-slate-600">
                NO ACTIVE HUNTS
              </p>
              <p className="text-[8px] font-mono text-slate-700 mt-1 uppercase">
                Select target to initiate
              </p>
            </div>
          ) : (
            openPositions.map((pos: Position, idx) => {
              const isCall = pos.optionType === 1; // 1 for Call, 2 for Put spreads usually
              const lowerStrike = parseStrike(pos.strikes[0]);
              const upperStrike = parseStrike(pos.strikes[1]);

              return (
                <motion.div
                  key={pos.entryTxHash + idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-3 border-b border-slate-800 hover:bg-white/5 transition-colors group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${isCall ? "bg-bit-green" : "bg-bit-coral"} shadow-[0_0_8px_rgba(74,222,128,0.4)]`}
                      ></div>
                      <span className="text-[11px] font-pixel text-white uppercase">
                        {pos.underlyingAsset} {isCall ? "MOON" : "DOOM"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={`https://basescan.org/tx/${pos.entryTxHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-600 hover:text-white transition-colors"
                      >
                        <ExternalLink size={10} />
                      </a>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <div className="text-[7px] text-slate-500 font-mono uppercase">
                        Collateral
                      </div>
                      <div className="text-[10px] font-pixel text-slate-300">
                        {Number(pos.collateralAmount) / 10 ** 6}{" "}
                        <span className="text-[8px]">USDC</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[7px] text-slate-500 font-mono uppercase">
                        Goal Line
                      </div>
                      <div className="text-[10px] font-pixel text-yellow-500">
                        ${(isCall ? lowerStrike : upperStrike).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[7px] text-slate-500 font-mono uppercase">
                        Expiry
                      </div>
                      <div className="text-[10px] font-pixel text-slate-400">
                        {new Date(
                          pos.expiryTimestamp * 1000,
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-bit-green/30 animate-pulse width-[40%]"></div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      <div className="bg-slate-900/80 p-2 border-t border-slate-800 flex justify-center">
        <button className="text-[8px] font-pixel text-slate-500 hover:text-white transition-colors uppercase flex items-center gap-1">
          <ShieldCheck size={8} /> View Historical Rewards
        </button>
      </div>
    </div>
  );
};
