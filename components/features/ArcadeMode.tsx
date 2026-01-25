"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Trophy, Swords } from 'lucide-react';

export function ArcadeMode() {
    const [gameState, setGameState] = useState<'IDLE' | 'CHARGING' | 'CLASH' | 'VICTORY'>('IDLE');
    const [power, setPower] = useState(50);
    const [side, setSide] = useState<'BULL' | 'BEAR' | null>(null);

    // --- HANDLERS ---
    const handleCharge = () => {
        if (gameState !== 'IDLE') return;
        setGameState('CHARGING');
    };

    const handlePush = () => {
        setGameState('CLASH');
        // Simulate result
        setTimeout(() => {
            setGameState('VICTORY');
        }, 2500);
    };

    const reset = () => {
        setGameState('IDLE');
        setSide(null);
        setPower(50);
    };

    return (
        <div className="min-h-[600px] bg-[#0f0f16] font-sans text-white overflow-hidden relative selection:bg-indigo-500/30 rounded-xl border-4 border-slate-700">

            {/* 1. AMBIENT BACKGROUND (Lava Lamp Blob) */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <div className="absolute top-[-20%] left-[-20%] w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-20%] right-[-20%] w-[600px] h-[600px] bg-rose-600/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>

                {/* Grid overlay */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            </div>

            {/* 2. HEADER (Bento Style) */}
            <div className="relative z-20 p-6 pt-8">
                <div className="flex justify-between items-center">
                    {/* Profile Pill */}
                    <motion.div
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-full pl-2 pr-4 py-2 border border-white/10 shadow-xl"
                    >
                        <div className="w-10 h-10 bg-gradient-to-tr from-yellow-400 to-orange-500 rounded-full border-2 border-white/50 flex items-center justify-center text-xl shadow-inner">
                            🦁
                        </div>
                        <div>
                            <div className="text-[10px] text-white/60 font-bold tracking-wider">LEVEL 5</div>
                            <div className="text-sm font-bold">KING_ALPHA</div>
                        </div>
                    </motion.div>

                    {/* Beast Streak */}
                    <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="relative"
                    >
                        <div className="absolute inset-0 bg-orange-500 blur-xl opacity-50"></div>
                        <div className="relative bg-gradient-to-br from-orange-500 to-red-600 w-12 h-12 rounded-2xl rotate-3 flex items-center justify-center text-2xl shadow-lg border-2 border-white/20">
                            🔥
                            <div className="absolute -bottom-2 -right-2 bg-white text-black text-xs font-black px-1.5 rounded-md shadow-sm">
                                x7
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* 3. MAIN ARENA (The Brawl) */}
            <div className="relative z-10 flex-1 h-[60vh] flex flex-col items-center justify-center">

                {/* THE PRICE BALL ORB */}
                <motion.div
                    className="w-32 h-32 rounded-full relative z-10"
                    animate={gameState === 'CLASH' ? {
                        x: [0, -10, 10, -10, 10, 500], // Shake then fly off
                        scale: [1, 0.9, 1.1, 0.5]
                    } : {
                        y: [0, -20, 0] // Idle hover
                    }}
                    transition={gameState === 'CLASH' ? { duration: 2, times: [0, 0.1, 0.2, 0.3, 0.4, 1] } : { repeat: Infinity, duration: 4, ease: "easeInOut" }}
                >
                    {/* Core */}
                    <div className="absolute inset-0 rounded-full bg-white shadow-[0_0_50px_rgba(255,255,255,0.8)]"></div>
                    {/* Aura */}
                    <div className="absolute -inset-4 rounded-full bg-indigo-500/50 blur-xl animate-pulse"></div>
                </motion.div>


                {/* CHARACTERS (Sumo Wrestlers) */}
                <div className="absolute inset-x-0 flex justify-between px-4 items-center top-1/2 -translate-y-1/2">

                    {/* BULL (Player) */}
                    <motion.div
                        animate={gameState === 'CLASH' ? { x: 100, scale: 1.2 } : { x: 0, scale: 1 }}
                        className={`relative transition-all duration-500 ${side === 'BULL' ? 'opacity-100 scale-110' : 'opacity-60'}`}
                    >
                        <div className="w-32 h-32 bg-emerald-500/20 rounded-3xl backdrop-blur-sm border-2 border-emerald-500/50 flex items-center justify-center transform -rotate-6">
                            <span className="text-6xl filter drop-shadow-[0_10px_0_rgba(0,0,0,0.5)]">🐂</span>
                        </div>
                        {side === 'BULL' && (
                            <motion.div
                                layoutId="indicator"
                                className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-emerald-400 font-black tracking-widest text-xs bg-emerald-900/50 px-3 py-1 rounded-full border border-emerald-500/50"
                            >
                                YOU
                            </motion.div>
                        )}
                    </motion.div>

                    {/* BEAR (Enemy) */}
                    <motion.div
                        animate={gameState === 'CLASH' ? { x: 400, opacity: 0, rotate: 90 } : { x: 0 }}
                        className={`relative transition-all duration-500 ${side === 'BEAR' ? 'opacity-100 scale-110' : 'opacity-60'}`}
                    >
                        <div className="w-32 h-32 bg-rose-500/20 rounded-3xl backdrop-blur-sm border-2 border-rose-500/50 flex items-center justify-center transform rotate-6">
                            <span className="text-6xl filter drop-shadow-[0_10px_0_rgba(0,0,0,0.5)]">🐻</span>
                        </div>
                        {side === 'BEAR' && (
                            <motion.div
                                layoutId="indicator"
                                className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-rose-400 font-black tracking-widest text-xs bg-rose-900/50 px-3 py-1 rounded-full border border-rose-500/50"
                            >
                                YOU
                            </motion.div>
                        )}
                    </motion.div>

                </div>

                {/* VS TEXT */}
                {gameState === 'IDLE' && (
                    <div className="absolute font-black text-6xl text-white/5 italic opacity-50 z-0">
                        BRAWL
                    </div>
                )}
            </div>

            {/* 4. CONTROLS (BottomSheet) */}
            <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                className="absolute bottom-0 inset-x-0 bg-white/5 backdrop-blur-xl border-t border-white/10 rounded-t-[3rem] p-8 pb-10 z-30"
            >

                <AnimatePresence mode='wait'>
                    {gameState === 'IDLE' && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="space-y-6"
                        >
                            <div className="text-center space-y-2">
                                <h2 className="text-2xl font-black text-white">PICK YOUR FIGHTER</h2>
                                <p className="text-white/40 text-sm">Who will push the price?</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => { setSide('BULL'); handleCharge(); }}
                                    className="h-32 bg-gradient-to-b from-emerald-500 to-emerald-700 rounded-3xl border-b-8 border-emerald-900 shadow-2xl flex flex-col items-center justify-center gap-2 group"
                                >
                                    <Shield size={32} className="text-white/80 group-hover:scale-110 transition-transform" />
                                    <span className="font-black text-xl text-white">BULL</span>
                                </motion.button>

                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => { setSide('BEAR'); handleCharge(); }}
                                    className="h-32 bg-gradient-to-b from-rose-500 to-rose-700 rounded-3xl border-b-8 border-rose-900 shadow-2xl flex flex-col items-center justify-center gap-2 group"
                                >
                                    <Swords size={32} className="text-white/80 group-hover:scale-110 transition-transform" />
                                    <span className="font-black text-xl text-white">BEAR</span>
                                </motion.button>
                            </div>
                        </motion.div>
                    )}

                    {gameState === 'CHARGING' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="space-y-8"
                        >
                            {/* Slider */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm font-bold tracking-widest">
                                    <span className="text-white/40">POWER (USDC)</span>
                                    <span className="text-white text-xl">{power}</span>
                                </div>
                                <input
                                    type="range"
                                    value={power} onChange={(e) => setPower(Number(e.target.value))}
                                    className="w-full h-8 bg-white/10 rounded-full appearance-none cursor-pointer overflow-hidden accent-white"
                                />
                            </div>

                            {/* BIG BUTTON */}
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={handlePush}
                                className={`w-full py-6 rounded-3xl font-black text-2xl tracking-widest text-white shadow-[0_0_40px_rgba(255,255,255,0.3)] border-b-8 active:border-b-0 active:translate-y-2 transition-all
                        ${side === 'BULL' ? 'bg-emerald-500 border-emerald-800' : 'bg-rose-500 border-rose-800'}`}
                            >
                                {side === 'BULL' ? 'PUSH UP!' : 'SMASH DOWN!'}
                            </motion.button>
                        </motion.div>
                    )}

                    {gameState === 'VICTORY' && (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                            className="text-center space-y-6"
                        >
                            <Trophy size={64} className="text-yellow-400 mx-auto animate-bounce" />
                            <div>
                                <h2 className="text-3xl font-black text-white italic">KNOCKOUT!</h2>
                                <p className="text-white/60">Balance updated.</p>
                            </div>

                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex justify-between items-center">
                                <span className="text-white/50 text-sm font-bold">REWARD</span>
                                <span className="text-2xl font-black text-emerald-400">+${(power * 1.8).toFixed(0)}</span>
                            </div>

                            <button
                                onClick={reset}
                                className="w-full py-4 bg-white text-black font-black rounded-2xl hover:bg-gray-200"
                            >
                                PLAY AGAIN
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

            </motion.div>

            {/* 5. PARTICLES (Simulated) */}
            {gameState === 'CLASH' && (
                <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center">
                    <div className="w-[150vw] h-[50px] bg-white absolute rotate-45 animate-ping opacity-20"></div>
                    <div className="w-[150vw] h-[50px] bg-white absolute -rotate-45 animate-ping opacity-20"></div>
                </div>
            )}

        </div>
    );
}
