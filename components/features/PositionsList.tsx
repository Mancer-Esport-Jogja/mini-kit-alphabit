"use client";

import React from "react";
import { useUserPositions } from "@/hooks/useUserPositions";
import { Position } from "@/types/positions";

import { parseStrike } from "@/utils/decimals";
import { Loader2, History, ExternalLink, ShieldCheck, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Countdown } from "@/components/ui/Countdown";
import { MissionDetailPopup } from "./arcade/MissionDetailPopup";

export const PositionsList = ({ onOpenHistory }: { onOpenHistory?: () => void }) => {
  const { data: positions, isLoading, isError, refetch, isRefetching } = useUserPositions();
  const [selectedPosition, setSelectedPosition] = React.useState<Position | null>(null);

  // Debug: surface raw positions payload in console to diagnose NaN/missing fields in prod
  React.useEffect(() => {
    if (positions) {
      console.debug("[PositionsList] positions payload", positions);
    }
  }, [positions]);



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
        <div className="flex items-center gap-3">
          <div className="text-[8px] font-mono text-slate-500">
            {openPositions.length} ACTIVE BATTLES
          </div>
          <button 
            onClick={() => refetch()} 
            disabled={isRefetching}
            className={`text-slate-500 hover:text-white transition-colors ${isRefetching ? 'animate-spin' : ''}`}
          >
            <RefreshCw size={10} />
          </button>
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
              const isCall = pos.optionType === 256; // 256 for Call (Moon), 257 for Put (Doom)

              return (
                <motion.div
                  key={pos.entryTxHash + idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => setSelectedPosition(pos)}
                  className="p-3 border-b border-slate-800 hover:bg-white/5 transition-colors group cursor-pointer"
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
                    {/* Removed individual link to prevent double click actions, moved to popup */}
                    <div className="text-slate-600 group-hover:text-white transition-colors">
                        <ExternalLink size={10} />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <div className="text-[7px] text-slate-500 font-mono uppercase">
                        Trade Amount
                      </div>
                      <div className="text-[10px] font-pixel text-slate-300">
                        {(Number(pos.entryPremium) / (10 ** (pos.collateralDecimals || 6))).toFixed(2)}{" "}
                        <span className="text-[8px]">USDC</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[7px] text-slate-500 font-mono uppercase">
                        Goal Line
                      </div>
                      <div className="text-[10px] font-pixel text-yellow-500">
                        {pos.strikes && pos.strikes.length > 0
                          ? pos.strikes.map((s) => `$${parseStrike(s)}`).join(" / ")
                          : "—"}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[7px] text-slate-500 font-mono uppercase">
                        Expiry
                      </div>
                      <div className="text-[10px] font-pixel text-slate-400">
                        {pos.expiryTimestamp ? (
                          <Countdown 
                            targetTimestamp={pos.expiryTimestamp} 
                            onExpire={() => refetch()}
                          />
                        ) : "—"}
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
        <button 
          onClick={onOpenHistory}
          className="text-[10px] font-pixel text-slate-300 hover:text-white transition-colors uppercase flex items-center gap-1.5"
        >
          <ShieldCheck size={12} /> View Analytics & History
        </button>
      </div>

        {/* Mission Detail Popup */}
        <AnimatePresence>
            {selectedPosition && (
                <MissionDetailPopup 
                    position={selectedPosition} 
                    onClose={() => setSelectedPosition(null)} 
                />
            )}
        </AnimatePresence>
    </div>
  );
};

