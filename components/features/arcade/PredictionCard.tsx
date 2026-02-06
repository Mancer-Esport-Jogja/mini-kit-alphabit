import React from 'react';
import { motion } from 'framer-motion';
import { BadgeCheck, BrainCircuit, TrendingDown, TrendingUp } from 'lucide-react';
import Image from 'next/image';

interface PredictionCardProps {
    asset: 'ETH' | 'BTC';
    direction: 'MOON' | 'DOOM';
    targetStrike: number;
    currentPrice: number;
    expiry: string;
    reasoning: string;
    confidence: number; // 0-100
    onSelectYes: () => void;
    onSelectNo: () => void;
    isLoading?: boolean;
}

export const PredictionCard = ({ 
    asset, 
    direction, 
    targetStrike, 
    currentPrice, 
    expiry, 
    reasoning,
    confidence, 
    onSelectYes, 
    onSelectNo,
    isLoading 
}: PredictionCardProps) => {
    
    // Safety check just in case
    if (isLoading) {
        return (
            <div className="w-full max-w-sm bg-slate-900/80 border border-slate-700/50 rounded-xl p-8 flex flex-col items-center justify-center space-y-4 animate-pulse">
                <BrainCircuit className="w-16 h-16 text-emerald-500/50 animate-pulse" />
                <div className="text-sm font-pixel text-emerald-500/80">ANALYZING MARKET DATA...</div>
                <div className="flex gap-1">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.1s]" />
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" />
                </div>
            </div>
        );
    }

    const isMoon = direction === 'MOON';
    const accentColor = isMoon ? 'text-emerald-400' : 'text-red-400';
    const borderColor = isMoon ? 'border-emerald-500/30' : 'border-red-500/30';
    const bgGradient = isMoon ? 'from-emerald-900/20 to-emerald-950/40' : 'from-red-900/20 to-red-950/40';
    const shadowColor = isMoon ? 'shadow-emerald-500/20' : 'shadow-red-500/20';

    const priceDiff = ((targetStrike - currentPrice) / currentPrice) * 100;
    const priceDiffFormatted = (priceDiff > 0 ? '+' : '') + priceDiff.toFixed(2) + '%';

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className={`w-full max-w-sm relative overflow-hidden bg-gradient-to-b ${bgGradient} border ${borderColor} rounded-2xl shadow-xl ${shadowColor} backdrop-blur-sm`}
        >
            {/* Header / Confidence Badge */}
            <div className="absolute top-0 right-0 p-3">
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full border ${borderColor} bg-black/40 text-[10px] font-mono font-bold ${accentColor}`}>
                    <BadgeCheck size={12} />
                    {confidence}% CONFIDENCE
                </div>
            </div>

            <div className="p-6 space-y-6">
                
                {/* Asset & Direction Header */}
                <div className="flex items-center gap-4">
                    <div className="relative w-14 h-14">
                        <Image 
                            src={asset === 'ETH' ? "/assets/fighter-moon.svg" : "/assets/bomber-doom.svg"} 
                            alt={asset} 
                            fill 
                            className="object-contain drop-shadow-lg"
                        />
                    </div>
                    <div>
                        <div className="text-[10px] text-slate-400 font-mono tracking-widest">AI PREDICTION</div>
                        <div className={`text-2xl font-black font-pixel ${accentColor} flex items-center gap-2`}>
                            {direction}
                            {isMoon ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                        </div>
                    </div>
                </div>

                {/* Price targets */}
                <div className="bg-black/30 rounded-xl p-4 border border-white/5 space-y-2">
                    <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-slate-500">CURRENT PRICE</span>
                        <span className="text-white font-bold">${currentPrice.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-px bg-white/10" />
                    <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-slate-500">TARGET STRIKE</span>
                        <div className="text-right">
                            <span className={`block font-bold text-lg ${accentColor}`}>${targetStrike.toLocaleString()}</span>
                            <span className="text-[10px] text-slate-400">{priceDiffFormatted} Move</span>
                        </div>
                    </div>
                    <div className="flex justify-between items-center text-xs font-mono pt-2">
                        <span className="text-slate-500">EXPIRY</span>
                        <span className="text-yellow-400 font-bold">{expiry}</span>
                    </div>
                </div>

                {/* Reasoning */}
                <div className="relative">
                    <div className="absolute top-0 left-0 w-1 h-full bg-slate-700 rounded-full" />
                    <p className="pl-3 text-[11px] text-slate-300 italic leading-relaxed font-mono">
                        &quot;{reasoning}&quot;
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-2">
                    <div className="text-[10px] text-center font-pixel text-slate-500 uppercase tracking-widest">
                        Do you agree with the Droid?
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={onSelectYes}
                            className={`group relative overflow-hidden rounded-xl p-4 border border-white/10 hover:border-emerald-500/50 bg-gradient-to-b from-emerald-900/40 to-emerald-950/60 transition-all duration-300 active:scale-95`}
                        >
                            <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/10 transition-colors" />
                            <div className="flex flex-col items-center gap-1">
                                <span className="text-lg font-black font-pixel text-emerald-400 group-hover:text-emerald-300">YES</span>
                                <span className="text-[9px] font-mono text-emerald-500/70 uppercase">I Agree</span>
                            </div>
                        </button>

                        <button
                            onClick={onSelectNo}
                            className={`group relative overflow-hidden rounded-xl p-4 border border-white/10 hover:border-red-500/50 bg-gradient-to-b from-red-900/40 to-red-950/60 transition-all duration-300 active:scale-95`}
                        >
                            <div className="absolute inset-0 bg-red-500/0 group-hover:bg-red-500/10 transition-colors" />
                            <div className="flex flex-col items-center gap-1">
                                <span className="text-lg font-black font-pixel text-red-400 group-hover:text-red-300">NO</span>
                                <span className="text-[9px] font-mono text-red-500/70 uppercase">I Disagree</span>
                            </div>
                        </button>
                    </div>
                </div>

            </div>
        </motion.div>
    );
};
