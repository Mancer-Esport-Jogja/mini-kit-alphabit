"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BarChart3, 
  Trophy, 
  History as HistoryIcon, 
  ArrowLeft, 
  Globe,
  Loader2,
  Share2,
  Crown,
} from "lucide-react";
import Image from "next/image";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { useUserTransactions } from "@/hooks/useUserTransactions";
import { parseStrike } from "@/utils/decimals";
import { PnLChart } from "@/components/ui/PnLChart";
import { ShareModal } from "@/components/features/ShareModal";
import type { LeaderboardEntry } from "@/types/analytics";
import { Position } from "@/types/positions";

interface PortfolioViewProps {
  onBack: () => void;
}

export const PortfolioView = ({ onBack }: PortfolioViewProps) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'leaderboard' | 'history'>('analytics');
  const [showShareModal, setShowShareModal] = useState(false);
  const { summary, pnlHistory, isLoading: isAnalyticsLoading } = useAnalytics();
  const { data: leaderboard, isLoading: isLeaderboardLoading } = useLeaderboard();
  const { data: history, isLoading: isHistoryLoading } = useUserTransactions();

  // Keep history in latest-first order for display
  const sortedHistory = useMemo(() => {
    if (!history) return [];
    return [...history].sort((a, b) => b.entryTimestamp - a.entryTimestamp);
  }, [history]);

  const tabs = [
    { id: 'analytics', label: 'ANALYTICS', icon: BarChart3 },
    { id: 'leaderboard', label: 'RANKINGS', icon: Trophy },
    { id: 'history', label: 'HISTORY', icon: HistoryIcon },
  ] as const;

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={onBack}
          className="p-2 bg-slate-800 border-2 border-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <h2 className="text-xl font-pixel text-white uppercase">Portfolio</h2>
        <button 
          onClick={() => setShowShareModal(true)}
          className="ml-auto p-2 bg-bit-green/20 border-2 border-bit-green text-bit-green hover:bg-bit-green/30 transition-colors"
          title="Share to Farcaster"
        >
          <Share2 size={16} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-black p-1 border-2 border-slate-700 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 font-bold text-[10px] uppercase tracking-wider transition-colors font-pixel ${activeTab === tab.id ? "bg-white text-black" : "text-slate-500 hover:text-slate-300"}`}
          >
            <tab.icon size={14} />
            <span className="hidden xs:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-grow">
        <AnimatePresence mode="wait">
          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {isAnalyticsLoading ? (
                <div className="py-20 flex flex-col items-center justify-center bg-black/20 border-2 border-slate-800">
                  <Loader2 className="w-8 h-8 text-bit-green animate-spin mb-4" />
                  <span className="text-xs font-pixel text-slate-500 uppercase">Syncing Analytics...</span>
                </div>
              ) : (
                <>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900 border-2 border-slate-800 p-4">
                      <div className="text-[10px] font-mono text-slate-500 mb-1 uppercase">TOTAL PNL</div>
                      <div className={`text-xl font-pixel ${Number(summary.data?.netPnL || 0) >= 0 ? "text-bit-green" : "text-bit-coral"}`}>
                        {Number(summary.data?.netPnL || 0) >= 0 ? "+" : ""}{Number(summary.data?.netPnL || 0).toFixed(2)} <span className="text-xs uppercase">USDC</span>
                      </div>
                    </div>
                    <div className="bg-slate-900 border-2 border-slate-800 p-4">
                      <div className="text-[10px] font-mono text-slate-500 mb-1 uppercase">WIN RATE</div>
                      <div className="text-xl font-pixel text-blue-400">
                        {(summary.data?.winRate || 0).toFixed(1)}%
                      </div>
                    </div>
                    <div className="bg-slate-900 border-2 border-slate-800 p-4">
                      <div className="text-[10px] font-mono text-slate-500 mb-1 uppercase">TOTAL VOLUME</div>
                      <div className="text-lg font-pixel text-slate-300">
                        {Number(summary.data?.totalVolume || 0).toFixed(2)} <span className="text-[10px] uppercase">USDC</span>
                      </div>
                    </div>
                    <div className="bg-slate-900 border-2 border-slate-800 p-4">
                      <div className="text-[10px] font-mono text-slate-500 mb-1 uppercase">TOTAL MISSIONS</div>
                      <div className="text-lg font-pixel text-slate-300">
                        {summary.data?.totalTrades || 0}
                      </div>
                    </div>
                  </div>

                  {/* Performance Chart */}
                  <div className="bg-black/40 border-2 border-slate-800 p-4">
                    <p className="text-[10px] font-pixel text-slate-500 uppercase mb-4 tracking-tighter">MISSION PERFORMANCE GRAPH</p>
                    <div key={pnlHistory.data?.length || 0}>
                      <PnLChart 
                        data={pnlHistory.data || []} 
                        height={100} 
                        color={Number(summary.data?.netPnL || 0) >= 0 ? "#4ade80" : "#fb7185"}
                      />
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {activeTab === 'leaderboard' && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="bg-slate-900 border-2 border-slate-700 overflow-hidden">
                <div className="bg-slate-800 p-3 border-b-2 border-slate-700 flex justify-between items-center">
                   <div className="flex items-center gap-2">
                     <Globe size={14} className="text-bit-green" />
                     <span className="text-[10px] font-pixel text-white uppercase">GLOBAL RANKINGS</span>
                   </div>
                   <div className="text-[8px] font-mono text-slate-500 uppercase">TOP PNL</div>
                </div>

                {isLeaderboardLoading ? (
                  <div className="p-10 flex flex-col items-center justify-center">
                    <Loader2 className="w-6 h-6 text-slate-500 animate-spin mb-2" />
                    <span className="text-[8px] font-pixel text-slate-600 uppercase">UPDATING LEADERBOARD...</span>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800">
                    {leaderboard?.map((entry: LeaderboardEntry, i: number) => {
                      // Determine rank styling
                      let rankStyles = "border-2 border-slate-700";
                      
                      if (i === 0) { // 1st Place - Gold
                        rankStyles = "border-4 border-double border-yellow-400 text-yellow-400";
                      } else if (i === 1) { // 2nd Place - Silver
                        rankStyles = "border-2 border-slate-300";
                      } else if (i === 2) { // 3rd Place - Bronze
                        rankStyles = "border-2 border-amber-700";
                      }
                      
                      return (
                      <div key={entry.userId || i} className="p-3 flex items-center gap-3 hover:bg-white/5 transition-colors">
                        <div className={`w-6 text-center font-pixel text-[10px] ${i === 0 ? "text-yellow-400" : i === 1 ? "text-slate-300" : i === 2 ? "text-amber-700" : "text-slate-500"}`}>#{i + 1}</div>
                        
                        <div className="relative shrink-0">
                          {i === 0 && (
                            <div className="absolute -top-2.5 -left-1.5 z-10 transform -rotate-12">
                              <Crown size={14} className="text-yellow-400 fill-yellow-400/20 drop-shadow-md" strokeWidth={2.5} />
                            </div>
                          )}
                          <div className={`w-8 h-8 bg-black ${rankStyles} overflow-hidden`}>
                            {entry.pfpUrl ? (
                              <Image src={entry.pfpUrl} alt={entry.username} width={32} height={32} unoptimized className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] font-pixel text-slate-800">?</div>
                            )}
                          </div>
                        </div>
                        <div className="flex-grow min-w-0">
                          <div className="text-xs font-pixel text-white truncate uppercase mb-0.5">{entry.username || `USER:${entry.userId?.slice(0, 4)}`}</div>
                          <div className="flex gap-3">
                            <span className="text-[8px] font-mono text-slate-500 uppercase">STREAK: <span className="text-orange-500">x{entry.streak || 0}</span></span>
                            <span className="text-[8px] font-mono text-slate-500 uppercase">WIN RATE: <span className="text-blue-400">{(entry.stats?.winRate || 0).toFixed(0)}%</span></span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-[10px] font-pixel leading-none mb-0.5 ${(entry.stats?.totalPnl || 0) >= 0 ? "text-bit-green" : "text-bit-coral"}`}>
                            {(entry.stats?.totalPnl || 0) >= 0 ? "+" : ""}
                            {(entry.stats?.totalPnl || 0).toFixed(2)}
                          </div>
                          <div className="text-[8px] font-pixel text-slate-500 opacity-80 uppercase leading-none">USDC</div>
                        </div>
                      </div>
                    );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="space-y-3">
                {isHistoryLoading ? (
                  <div className="p-10 flex flex-col items-center justify-center bg-black/20 border-2 border-slate-800">
                    <Loader2 className="w-6 h-6 text-slate-500 animate-spin mb-2" />
                    <span className="text-[8px] font-pixel text-slate-600 uppercase">LOADING HISTORY...</span>
                  </div>
                ) : !history || history.length === 0 ? (
                    <div className="p-10 text-center bg-black/20 border-2 border-slate-800 border-dashed">
                      <p className="text-[10px] font-pixel text-slate-600 uppercase mb-2">NO TRANSACTIONS RECORDED</p>
                      <p className="text-[8px] font-mono text-slate-700 uppercase">Complete your first mission to view history</p>
                    </div>
                ) : (
                  sortedHistory.map((pos: Position, i: number) => {
                    const isCall = pos.optionType === 256;
                    
                    // Calculate PNL with proper decimal normalization
                    const decimals = pos.collateralDecimals || 6;
                    const divisor = Math.pow(10, decimals);
                    const premium = Number(pos.entryPremium) / divisor;
                    const payout = pos.settlement ? Number(pos.settlement.payoutBuyer) / divisor : 0;
                    const pnl = payout - premium;
                    const isWin = pnl > 0;
                    
                    return (
                      <div key={pos.entryTxHash + i} className="bg-slate-900/50 border-2 border-slate-800 p-3 flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <HistoryIcon size={12} className="text-slate-600" />
                            <span className="text-[10px] font-pixel text-slate-300 uppercase">
                              {new Date(pos.entryTimestamp * 1000).toLocaleDateString()}
                            </span>
                          </div>
                          <span className={`text-[9px] font-pixel px-2 py-0.5 border ${isWin ? 'border-bit-green/50 text-bit-green bg-bit-green/5' : 'border-slate-700 text-slate-500'}`}>
                            {pos.status.toUpperCase()}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-end">
                          <div>
                            <div className="text-[11px] font-pixel text-white uppercase mb-1">
                              {pos.underlyingAsset} {isCall ? 'MOON' : 'DOOM'}
                            </div>
                            <div className="text-[9px] font-mono text-slate-500 uppercase">
                              STRIKES: {pos.strikes.map((s) => `$${parseStrike(s)}`).join(' / ')}
                            </div>
                          </div>
                          <div className="text-right">
                             <div className="text-[9px] font-mono text-slate-500 uppercase mb-0.5">PNL</div>
                             <div className={`text-xs font-pixel ${pnl > 0 ? 'text-bit-green' : pnl < 0 ? 'text-bit-coral' : 'text-slate-500'}`}>
                               {pnl > 0 ? '+' : ''}{pnl.toFixed(2)} USDC
                             </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-8 pb-4">
        <button 
          onClick={onBack}
          className="w-full flex items-center justify-center gap-2 py-3 bg-slate-800 text-slate-300 font-pixel text-sm uppercase border-b-4 border-slate-900 hover:bg-slate-700 transition-colors active:border-b-0 active:translate-y-1"
        >
          <ArrowLeft size={16} />
          RETURN TO COMMAND
        </button>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        analytics={summary.data}
        pnlHistory={pnlHistory.data}
      />
    </div>
  );
};
