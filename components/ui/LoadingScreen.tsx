"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface LoadingScreenProps {
    onLoadingComplete: () => void;
    minDuration?: number;
}

const LOADING_MESSAGES = [
    'INITIALIZING',
    'LOADING ASSETS',
    'CONNECTING TO BASE',
    'SYNCING PROTOCOL',
    'READY TO PLAY'
];

export const LoadingScreen = ({ onLoadingComplete, minDuration = 2500 }: LoadingScreenProps) => {
    const [progress, setProgress] = useState(0);
    const [loadingText, setLoadingText] = useState(LOADING_MESSAGES[0]);

    const handleLoadingComplete = useCallback(() => {
        onLoadingComplete();
    }, [onLoadingComplete]);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                const newProgress = prev + Math.random() * 15 + 5;

                // Update loading text based on progress
                if (newProgress > 20 && newProgress <= 40) {
                    setLoadingText(LOADING_MESSAGES[1]);
                } else if (newProgress > 40 && newProgress <= 60) {
                    setLoadingText(LOADING_MESSAGES[2]);
                } else if (newProgress > 60 && newProgress <= 80) {
                    setLoadingText(LOADING_MESSAGES[3]);
                } else if (newProgress > 80) {
                    setLoadingText(LOADING_MESSAGES[4]);
                }

                if (newProgress >= 100) {
                    clearInterval(interval);
                    setTimeout(handleLoadingComplete, 500);
                    return 100;
                }
                return newProgress;
            });
        }, minDuration / 10);

        return () => clearInterval(interval);
    }, [minDuration, handleLoadingComplete]);

    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[100] bg-void-black flex flex-col items-center justify-center"
        >
            {/* Retro Grid Background */}
            <div className="absolute inset-0 retro-grid opacity-20"></div>

            {/* Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="w-full h-1 bg-bit-coral/30 blur-sm animate-scanline"></div>
            </div>

            {/* Content Container */}
            <div className="relative z-10 text-center px-8">
                {/* Logo Animation */}
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, ease: "backOut" }}
                    className="mb-8"
                >
                    {/* Pixel Art Controller Icon */}
                    <div className="w-24 h-24 mx-auto mb-6 relative">
                        <div className="absolute inset-0 bg-bit-coral/20 blur-xl animate-pulse"></div>
                        <div className="relative w-full h-full border-4 border-bit-coral bg-void-black flex items-center justify-center">
                            <motion.span
                                className="text-4xl"
                                animate={{
                                    rotateY: [0, 360],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "linear"
                                }}
                            >
                                🎮
                            </motion.span>
                        </div>
                        {/* Corner decorations */}
                        <div className="absolute -top-1 -left-1 w-2 h-2 bg-bit-coral"></div>
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-bit-coral"></div>
                        <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-bit-coral"></div>
                        <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-bit-coral"></div>
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl font-pixel text-bit-coral tracking-wider mb-2 drop-shadow-[0_0_10px_rgba(232,90,90,0.5)]">
                        ALPHABIT
                    </h1>
                    <p className="text-[10px] font-mono text-slate-500 tracking-[0.3em]">
                        DEFI OPTIONS ARCADE
                    </p>
                </motion.div>

                {/* Progress Bar Container */}
                <div className="w-64 mx-auto mb-4">
                    {/* Progress Bar Frame */}
                    <div className="relative bg-void-black border-4 border-slate-700 p-1">
                        {/* Corner pixels */}
                        <div className="absolute -top-1 -left-1 w-2 h-2 bg-slate-600"></div>
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-slate-600"></div>
                        <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-slate-600"></div>
                        <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-slate-600"></div>

                        {/* Progress Fill */}
                        <div className="h-4 bg-slate-900 overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-bit-coral via-bit-coral to-bit-green"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.3 }}
                                style={{
                                    boxShadow: '0 0 10px rgba(232, 90, 90, 0.5), inset 0 1px 0 rgba(255,255,255,0.2)'
                                }}
                            />
                        </div>
                    </div>

                    {/* Progress Percentage */}
                    <div className="flex justify-between mt-2 text-[10px] font-mono">
                        <span className="text-slate-500">LOADING</span>
                        <span className="text-bit-coral">{Math.round(progress)}%</span>
                    </div>
                </div>

                {/* Loading Text */}
                <motion.div
                    key={loadingText}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[10px] font-pixel text-bit-green tracking-wider"
                >
                    {loadingText}
                    <motion.span
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                    >
                        _
                    </motion.span>
                </motion.div>

                {/* Decorative Elements */}
                <div className="mt-8 flex justify-center gap-2">
                    {[0, 1, 2, 3, 4].map((i) => (
                        <motion.div
                            key={i}
                            className="w-2 h-2 bg-bit-coral"
                            animate={{
                                opacity: progress > (i + 1) * 20 ? 1 : 0.2,
                                scale: progress > (i + 1) * 20 ? [1, 1.2, 1] : 1,
                            }}
                            transition={{ duration: 0.3 }}
                        />
                    ))}
                </div>
            </div>

            {/* Bottom Credits */}
            <div className="absolute bottom-8 text-center">
                <p className="text-[8px] font-mono text-slate-600">
                    POWERED BY BASE · THETANUTS · FARCASTER
                </p>
            </div>
        </motion.div>
    );
};
