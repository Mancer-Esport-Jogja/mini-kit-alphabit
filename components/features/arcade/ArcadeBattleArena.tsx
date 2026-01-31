"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { useUserTransactions } from '@/hooks/useUserTransactions';
import { BattleScene } from './BattleScene';
import { Position } from '@/types/positions';

// MOCK DATA FOR TESTING
export const MOCK_POSITIONS: Position[] = [
    {
        address: '0x123', status: 'open', buyer: '0x123', seller: '0x456', referrer: '0x000', createdBy: '0x000',
        entryTimestamp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
        entryTxHash: '0xabc', entryPremium: '1000000', entryFeePaid: '0',
        collateralToken: '0x000', collateralSymbol: 'USDC', collateralDecimals: 6,
        underlyingAsset: 'ETH', priceFeed: '0x000', strikes: ['300000000000'],
        expiryTimestamp: Math.floor(Date.now() / 1000) + 7200, // Expires in 2 hours
        numContracts: '1', collateralAmount: '1000000', optionType: 256, // Call
        settlement: null, explicitClose: null
    },
    {
        address: '0x123', status: 'open', buyer: '0x123', seller: '0x456', referrer: '0x000', createdBy: '0x000',
        entryTimestamp: Math.floor(Date.now() / 1000) - 1000,
        entryTxHash: '0xdef', entryPremium: '500000', entryFeePaid: '0',
        collateralToken: '0x000', collateralSymbol: 'USDC', collateralDecimals: 6,
        underlyingAsset: 'BTC', priceFeed: '0x000', strikes: ['600000000000'],
        expiryTimestamp: Math.floor(Date.now() / 1000) + 36000, // Expires in 10 hours
        numContracts: '0.5', collateralAmount: '500000', optionType: 128, // Put (assuming non-256 is Put for visual)
        settlement: null, explicitClose: null
    }
];

export const ArcadeBattleArena = () => {
    const { data: history } = useUserTransactions();
    
    // Filter for Active positions (Open status)
    // We treat 'open' orders as active battles.
    const activePositions = useMemo(() => {
        // TEMPORARY: Use mock data if no history found, just to show the user
        if (!history || history.length === 0) return MOCK_POSITIONS;
        
        const realActive = history.filter(p => p.status === 'open');
        return realActive.length > 0 ? realActive : MOCK_POSITIONS;
    }, [history]);

    const [currentIndex, setCurrentIndex] = useState(0);

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % activePositions.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + activePositions.length) % activePositions.length);
    };

    const onDragEnd = (event: any, info: PanInfo) => {
        const threshold = 50;
        if (info.offset.x < -threshold) {
            handleNext();
        } else if (info.offset.x > threshold) {
            handlePrev();
        }
    };

    // Auto-cycle through multiple active battles
    useEffect(() => {
        if (activePositions.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % activePositions.length);
        }, 10000); // Swap every 10 seconds

        return () => clearInterval(interval);
    }, [activePositions.length, currentIndex]); // Restart timer on any change (manual or auto)

    // Reset index if list changes drastically
    useEffect(() => {
        if (currentIndex >= activePositions.length) {
            setCurrentIndex(0);
        }
    }, [activePositions.length, currentIndex]);

    if (activePositions.length === 0) return null;

    const currentPosition = activePositions[currentIndex];

    return (
        <div className="w-full bg-slate-900 border-b border-white/10 relative overflow-hidden group">
            {/* Header / HUD for Arena */}
            <div className="absolute top-2 left-0 w-full flex justify-between px-4 z-20 pointer-events-none">
                <div className="text-[9px] font-pixel text-slate-500 animate-pulse bg-black/50 px-2 rounded">
                    ACTIVE WARZONES: {activePositions.length}
                </div>
                <div className="text-[9px] font-pixel text-yellow-500 bg-black/50 px-2 rounded">
                    SECTOR {currentIndex + 1} / {activePositions.length}
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentPosition.entryTxHash}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={onDragEnd}
                    className="cursor-grab active:cursor-grabbing touch-pan-y"
                >
                    <BattleScene 
                        position={currentPosition} 
                        isActive={true} 
                    />
                </motion.div>
            </AnimatePresence>

            {/* Manual Controls (Only if > 1) */}
            {activePositions.length > 1 && (
                <>
                    <button 
                        onClick={handlePrev}
                        className="absolute left-2 top-1/2 -translate-y-1/2 z-30 p-2 bg-black/50 rounded-full text-white/50 hover:text-white hover:bg-black/80 transition-all opacity-100 hover:scale-110"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button 
                        onClick={handleNext}
                        className="absolute right-2 top-1/2 -translate-y-1/2 z-30 p-2 bg-black/50 rounded-full text-white/50 hover:text-white hover:bg-black/80 transition-all opacity-100 hover:scale-110"
                    >
                        <ChevronRight size={20} />
                    </button>

                    {/* Pagination Dots */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-20">
                        {activePositions.map((_, idx) => (
                            <button 
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                                    idx === currentIndex ? "bg-emerald-400" : "bg-slate-700 hover:bg-slate-500"
                                }`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};
