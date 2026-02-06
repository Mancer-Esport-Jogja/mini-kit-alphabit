import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, Rocket, ShieldAlert, ChevronRight, Activity, Clock, CheckCircle } from 'lucide-react';

interface PredictionStats {
    syncCount: number;
    overrideCount: number;
    totalVotes: number;
    consensus: number;
}

interface TacticalHUDProps {
    asset: 'ETH' | 'BTC';
    direction: 'MOON' | 'DOOM';
    confidence: number;
    reasoning: string;
    stats?: PredictionStats | null;
    onSync: () => void;
    onOverride: () => void;
    recommendedStrike: number;
    userVote?: 'SYNC' | 'OVERRIDE' | null;
    expiryTime?: string;
}

export const TacticalHUD = ({ asset, direction, confidence, reasoning, stats, onSync, onOverride, recommendedStrike, userVote, expiryTime }: TacticalHUDProps) => {
    const isMoon = direction === 'MOON';
    const mainColor = isMoon ? 'text-emerald-400' : 'text-rose-400';
    const borderColor = isMoon ? 'border-emerald-500/50' : 'border-rose-500/50';
    const glowColor = isMoon ? 'shadow-[0_0_20px_rgba(52,211,153,0.3)]' : 'shadow-[0_0_20px_rgba(244,63,94,0.3)]';

    // Countdown logic
    const [countdown, setCountdown] = useState<string>('');
    
    useEffect(() => {
        if (!expiryTime) return;
        
        const updateCountdown = () => {
            const now = new Date().getTime();
            const expiry = new Date(expiryTime).getTime();
            const diff = expiry - now;
            
            if (diff <= 0) {
                setCountdown('EXPIRED');
                return;
            }
            
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            
            setCountdown(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        };
        
        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);
        return () => clearInterval(interval);
    }, [expiryTime]);

    const hasVoted = !!userVote;

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg relative"
        >
            {/* Top Bar HUD */}
            <div className="flex justify-between items-end border-b border-white/20 pb-2 mb-6">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                    <Activity size={14} className="animate-pulse" />
                    <span>LIVE FEED // DROID-01</span>
                </div>
                <div className="text-right">
                    <div className="text-[10px] text-slate-500">CONFIDENCE LEVEL</div>
                    <div className="text-xl font-bold font-pixel text-yellow-400">{confidence}%</div>
                </div>
            </div>

            {/* Main Card */}
            <div className={`relative border ${borderColor} ${glowColor} rounded-lg overflow-hidden bg-black/50`}>
                {/* Inner Frame */}
                <div className="p-6">
                    {/* AI Reasoning Section */}
                    <div className="mb-6 p-4 bg-slate-900/50 rounded border border-white/5">
                        <div className="text-[10px] text-center font-mono text-slate-500 mb-3">INCOMING TRANSMISSION:</div>
                        <div className="flex items-start gap-4">
                            <div className="w-16 h-16 rounded-full bg-emerald-900/50 flex items-center justify-center border border-emerald-500/30">
                                <BrainCircuit className={`text-emerald-400 w-8 h-8`} />
                            </div>
                            <p className="text-sm italic text-slate-300 flex-1">
                                &quot;{reasoning}&quot;
                            </p>
                        </div>
                    </div>

                    {/* Analysis Content */}
                    <div className="space-y-0">
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 py-4 border-y border-white/10 bg-white/5">
                             <div className="flex items-center justify-between w-full sm:w-auto sm:block text-center px-4 sm:px-0">
                                <div className="text-[10px] font-mono text-slate-500 text-left sm:text-center">TARGET ASSET</div>
                                <div className="text-xl font-pixel text-white">{asset}</div>
                             </div>
                             
                             <ChevronRight className="text-slate-600 hidden sm:block" />
                             
                             <div className="flex items-center justify-between w-full sm:w-auto sm:block text-center px-4 sm:px-0">
                                <div className="text-[10px] font-mono text-slate-500 text-left sm:text-center">PREDICTED TRAJECTORY</div>
                                <div className={`text-xl sm:text-2xl font-black font-pixel ${mainColor} animate-pulse`}>
                                    {direction}
                                </div>
                             </div>
                             
                             <ChevronRight className="text-slate-600 hidden sm:block" />
                             
                             <div className="flex items-center justify-between w-full sm:w-auto sm:block text-center px-4 sm:px-0">
                                <div className="text-[10px] font-mono text-slate-500 text-left sm:text-center">TARGET STRIKE</div>
                                <div className="text-xl font-bold font-mono text-white">
                                    ${Number(recommendedStrike).toLocaleString()}
                                </div>
                             </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4 mt-8">
                {hasVoted ? (
                    // VOTED STATE - Show countdown and voted badge
                    <>
                        <div className={`relative overflow-hidden p-4 rounded-xl border ${userVote === 'SYNC' ? 'bg-emerald-900/60 border-emerald-500' : 'bg-slate-800/40 border-slate-600/50'}`}>
                            <div className="flex flex-col items-center gap-2">
                                {userVote === 'SYNC' ? (
                                    <CheckCircle className="text-emerald-400 w-8 h-8" />
                                ) : (
                                    <Rocket className="text-slate-500 w-8 h-8" />
                                )}
                                <div className="text-center">
                                    <div className={`text-sm font-black font-pixel ${userVote === 'SYNC' ? 'text-emerald-400' : 'text-slate-500'}`}>
                                        {userVote === 'SYNC' ? 'VOTED' : 'AGREE'}
                                    </div>
                                    {userVote === 'SYNC' && <div className="text-[9px] font-mono text-emerald-200/60 mb-2">YOUR CHOICE</div>}
                                    {stats && <div className={`text-xs font-mono px-2 py-1 rounded ${userVote === 'SYNC' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700/50 text-slate-400'}`}>{stats.syncCount} PILOTS</div>}
                                </div>
                            </div>
                        </div>
                        
                        <div className={`relative overflow-hidden p-4 rounded-xl border ${userVote === 'OVERRIDE' ? 'bg-rose-900/60 border-rose-500' : 'bg-slate-800/40 border-slate-600/50'}`}>
                            <div className="flex flex-col items-center gap-2">
                                {userVote === 'OVERRIDE' ? (
                                    <CheckCircle className="text-rose-400 w-8 h-8" />
                                ) : (
                                    <ShieldAlert className="text-slate-500 w-8 h-8" />
                                )}
                                <div className="text-center">
                                    <div className={`text-sm font-black font-pixel ${userVote === 'OVERRIDE' ? 'text-rose-400' : 'text-slate-500'}`}>
                                        {userVote === 'OVERRIDE' ? 'VOTED' : 'DISAGREE'}
                                    </div>
                                    {userVote === 'OVERRIDE' && <div className="text-[9px] font-mono text-rose-200/60 mb-2">YOUR CHOICE</div>}
                                    {stats && <div className={`text-xs font-mono px-2 py-1 rounded ${userVote === 'OVERRIDE' ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-700/50 text-slate-400'}`}>{stats.overrideCount} PILOTS</div>}
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    // NORMAL STATE - Clickable buttons
                    <>
                        <button
                            onClick={onSync}
                            className="group relative overflow-hidden bg-emerald-900/40 border border-emerald-500/50 hover:bg-emerald-800/60 p-4 rounded-xl hover:scale-[1.02] transition-all"
                        >
                            <div className="flex flex-col items-center gap-2">
                                <Rocket className="text-emerald-400 w-8 h-8 group-hover:animate-bounce" />
                                <div className="text-center">
                                    <div className="text-sm font-black font-pixel text-emerald-400">AGREE</div>
                                    <div className="text-[9px] font-mono text-emerald-200/60 mb-2">FOLLOW PREDICTION</div>
                                    {stats && <div className="text-xs font-mono bg-emerald-500/20 px-2 py-1 rounded text-emerald-300">{stats.syncCount} PILOTS</div>}
                                </div>
                            </div>
                        </button>

                        <button
                            onClick={onOverride}
                            className="group relative overflow-hidden bg-rose-900/40 border border-rose-500/50 hover:bg-rose-800/60 p-4 rounded-xl hover:scale-[1.02] transition-all"
                        >
                            <div className="flex flex-col items-center gap-2">
                                <ShieldAlert className="text-rose-400 w-8 h-8 group-hover:animate-pulse" />
                                <div className="text-center">
                                    <div className="text-sm font-black font-pixel text-rose-400">DISAGREE</div>
                                    <div className="text-[9px] font-mono text-rose-200/60 mb-2">BET AGAINST AI</div>
                                    {stats && <div className="text-xs font-mono bg-rose-500/20 px-2 py-1 rounded text-rose-300">{stats.overrideCount} PILOTS</div>}
                                </div>
                            </div>
                        </button>
                    </>
                )}
            </div>
            
            {/* Countdown Timer (if voted) */}
            {hasVoted && countdown && (
                <div className="mt-4 p-3 bg-slate-800/60 border border-slate-600/50 rounded-lg text-center">
                    <div className="flex items-center justify-center gap-2">
                        <Clock size={14} className="text-yellow-400" />
                        <span className="text-[10px] font-mono text-slate-400">PREDICTION EXPIRES IN</span>
                    </div>
                    <div className="text-lg font-mono font-bold text-yellow-400 mt-1">{countdown}</div>
                </div>
            )}
        </motion.div>
    );
};
