import React from 'react';
import { motion } from 'framer-motion';
import { X, ExternalLink } from 'lucide-react';
import { Position } from '@/types/positions';
import { parseStrike } from '@/utils/decimals';
import { useOraclePrice } from '@/hooks/useOraclePrice';

interface MissionDetailPopupProps {
    position: Position;
    onClose: () => void;
}

export const MissionDetailPopup = ({ position, onClose }: MissionDetailPopupProps) => {
    const isCall = position.optionType === 256;
    
    // Fetch live price for the relevant asset
    const { currentPrice } = useOraclePrice({ 
        symbol: `${position.underlyingAsset}USDC`, 
        interval: '1m' 
    });

    const strikePrice = parseStrike(position.strikes[0]);
    const safeCurrentPrice = currentPrice || strikePrice;

    return (
        <motion.div 
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(4px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-8 cursor-default"
            onClick={onClose}
        >
            <motion.div 
                initial={{ scale: 0.9, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 10 }}
                className="w-full max-w-sm bg-slate-900 border-2 border-slate-600 rounded-xl p-4 shadow-[0_0_30px_rgba(0,0,0,0.8)]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-sm font-pixel text-white uppercase">Mission Intel</h3>
                        <div className="text-[10px] font-mono text-slate-400">{position.underlyingAsset} {'//'} {isCall ? 'CALL' : 'PUT'}</div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Content */}
                <div className="space-y-3 font-mono text-xs">
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                        <span className="text-slate-500">STRIKE PRICE</span>
                        <span className="text-white font-bold">${strikePrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                        <span className="text-slate-500">MARK PRICE</span>
                        <span className={`${isCall ? (safeCurrentPrice > strikePrice ? 'text-emerald-400' : 'text-rose-400') : (safeCurrentPrice < strikePrice ? 'text-emerald-400' : 'text-rose-400')}`}>
                            ${currentPrice?.toLocaleString() || "---"}
                        </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                        <span className="text-slate-500">EXPIRY</span>
                        <span className="text-white">{new Date(position.expiryTimestamp * 1000).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-1">
                        <span className="text-slate-500">STATUS</span>
                        <span className="text-yellow-400 font-pixel">IN PROGRESS</span>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-4 pt-4 border-t border-slate-800 flex justify-end gap-2">
                     <a
                        href={`https://basescan.org/tx/${position.entryTxHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-[10px] text-slate-500 hover:text-white transition-colors uppercase font-pixel"
                    >
                        View Logs <ExternalLink size={10} />
                    </a>
                </div>
            </motion.div>
        </motion.div>
    );
};
