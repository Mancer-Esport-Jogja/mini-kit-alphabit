import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, ShieldCheck, Zap } from 'lucide-react';
import { useDroid } from '@/context/DroidContext';

interface TradeRecommendationCardProps {
    type: 'SAFE' | 'DEGEN' | 'BALANCED';
    target: 'MOON' | 'DOOM';
    duration: 'BLITZ' | 'RUSH' | 'CORE' | 'ORBIT';
    asset?: 'ETH' | 'BTC';
    strike?: number;
    reasoning: string;
}

export const TradeRecommendationCard = ({ type, target, duration, asset = 'ETH', strike, reasoning }: TradeRecommendationCardProps) => {
    const { triggerTrade } = useDroid();

    const isDoom = target === 'DOOM';
    
    // Theme logic based on Target (Direction) rather than Risk Profile
    const borderColor = isDoom ? 'border-red-500/50' : 'border-green-500/50';
    const bgColor = isDoom ? 'bg-red-900/20' : 'bg-green-900/20';
    const accentColor = isDoom ? 'text-red-400' : 'text-green-400';
    const buttonClass = isDoom 
        ? 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_10px_rgba(220,38,38,0.4)]'
        : 'bg-green-600 hover:bg-green-500 text-white shadow-[0_0_10px_rgba(22,163,74,0.4)]';

    const handleExecute = () => {
        triggerTrade({
            target,
            duration,
            asset,
            strike
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-3 rounded-lg border ${borderColor} ${bgColor} my-2 font-mono text-xs`}
        >
            <div className={`flex items-center gap-2 mb-2 pb-2 border-b border-white/10 ${accentColor}`}>
                {isDoom ? <Zap size={14} /> : <ShieldCheck size={14} />}
                <div className="flex-1 flex justify-between items-center">
                    <span className="font-bold tracking-wider">TACTICAL REC.</span>
                    <span className="text-[10px] bg-black/30 px-1.5 py-0.5 rounded border border-white/10">{asset}</span>
                </div>
            </div>

            <div className="space-y-1 mb-3">
                <div className="flex justify-between">
                    <span className="text-slate-400">STRATEGY:</span>
                    <span className={`font-bold ${accentColor}`}>
                        {target} / {duration}
                    </span>
                </div>
                {strike && (
                    <div className="flex justify-between">
                        <span className="text-slate-400">TARGET STRIKE:</span>
                        <span className="font-bold text-yellow-400">${strike.toLocaleString()}</span>
                    </div>
                )}
                <div className="flex justify-between">
                    <span className="text-slate-400">PROFILE:</span>
                    <span className="text-white">{type}</span>
                </div>
            </div>

            <p className="text-[10px] text-slate-300 italic mb-3 leading-relaxed">
                &quot;{reasoning}&quot;
            </p>

            <button
                onClick={handleExecute}
                className={`w-full py-2 flex items-center justify-center gap-2 rounded font-bold transition-all ${buttonClass}`}
            >
                INITIATE SEQUENCE <ExternalLink size={12} />
            </button>
        </motion.div>
    );
};
