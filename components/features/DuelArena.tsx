"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// --- POKEMON-STYLE CONFIG ---
const MONSTERS = {
    BULL: { name: 'BULLMANDER', color: 'text-orange-600', hue: 'bg-orange-500', icon: '🔥', type: 'CALL' },
    BEAR: { name: 'SQUIRTBEAR', color: 'text-cyan-600', hue: 'bg-cyan-500', icon: '💧', type: 'PUT' },
    MARKET: { name: 'WILD MARKET', color: 'text-purple-600', hue: 'bg-purple-500', icon: '�', type: 'VOLATILITY' }
};

export function DuelArena() {
    const { user } = useAuth();

    // Game State
    const [gameState, setGameState] = useState<'INTRO' | 'BATTLE' | 'MENU' | 'ATTACK' | 'VICTORY' | 'BATTLE_SELECT'>('INTRO');
    const [playerMon, setPlayerMon] = useState<'BULL' | 'BEAR'>('BULL');
    const [marketHP, setMarketHP] = useState(100);
    const [message, setMessage] = useState("");
    const [energy, setEnergy] = useState(10); // Bet Amount

    // Typing Effect Logic
    const typeMessage = (text: string, callback?: () => void) => {
        setMessage("");
        let i = 0;
        const interval = setInterval(() => {
            setMessage(text.substring(0, i + 1));
            i++;
            if (i === text.length) {
                clearInterval(interval);
                if (callback) setTimeout(callback, 500);
            }
        }, 30);
    };

    // --- BATTLE LOOP ---
    useEffect(() => {
        if (gameState === 'ATTACK') {
            const timer = setInterval(() => {
                setMarketHP((prev) => {
                    if (prev <= 0) {
                        clearInterval(timer);
                        setGameState('VICTORY');
                        return 0;
                    }
                    // Damage logic
                    const damage = 25; // Fixed chunks for demo
                    return Math.max(0, prev - damage);
                });
            }, 200);
            return () => clearInterval(timer);
        }
    }, [gameState]);

    const handleAttack = () => {
        setGameState('ATTACK');
        // typeMessage(`${MONSTERS[playerMon].name} used SUPER TRADE!`);
    };

    const startBattle = (mon: 'BULL' | 'BEAR') => {
        setPlayerMon(mon);
        setGameState('BATTLE');
        typeMessage(`Go! ${MONSTERS[mon].name}!`, () => {
            setGameState('MENU');
            typeMessage("What will you do?");
        });
    };

    const resetGame = () => {
        setGameState('INTRO');
        setMarketHP(100);
        setMessage("");
    };

    return (
        <div className="relative w-full aspect-[4/3] bg-[#f8f9fa] border-4 border-slate-300 rounded-xl shadow-2xl overflow-hidden font-pixel select-none text-black">

            {/* 1. LAYER: BATTLE SCENE */}
            <div className="absolute inset-0 z-0 flex flex-col">
                {/* Background */}
                <div className="flex-1 bg-[#d8fcf8] relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#4fd1c5_2px,transparent_2px)] bg-[size:20px_20px]"></div>
                    {/* Enemy Base */}
                    <div className="absolute top-1/4 right-8 w-48 h-16 bg-[#a5f3fc] rounded-[50%] border-4 border-[#22d3ee]/30 scale-y-50"></div>
                    {/* Player Base */}
                    <div className="absolute bottom-4 left-8 w-56 h-20 bg-[#86efac] rounded-[50%] border-4 border-[#4ade80]/50 scale-y-50"></div>
                </div>
                {/* Menu Space Reserved */}
                <div className="h-1/3 bg-slate-900"></div>
            </div>

            {/* 2. LAYER: SPRITES & HUDS */}
            <div className="absolute inset-x-0 top-0 h-2/3 pointer-events-none">

                {/* ENEMY HUD */}
                <AnimatePresence>
                    {gameState !== 'INTRO' && (
                        <motion.div
                            initial={{ x: -300 }} animate={{ x: 0 }}
                            className="absolute top-6 left-6 bg-[#f8f9fa] border-b-4 border-r-4 border-slate-300 rounded-lg p-2 w-48 shadow-lg"
                        >
                            <div className="flex justify-between items-baseline mb-1 px-1">
                                <span className="font-bold text-xs tracking-tighter text-slate-700">{MONSTERS.MARKET.name}</span>
                                <span className="text-[10px] font-bold text-slate-500">Lv100</span>
                            </div>
                            <div className="w-full bg-slate-200 h-3 rounded-full border-2 border-slate-400 relative overflow-hidden">
                                <div className="absolute top-0 bottom-0 left-0 bg-yellow-300 w-full opacity-20 animate-pulse"></div>
                                <motion.div
                                    className="h-full bg-gradient-to-b from-green-400 to-green-600 shadow-[inset_0_-2px_0_rgba(0,0,0,0.2)]"
                                    initial={{ width: '100%' }}
                                    animate={{ width: `${marketHP}%`, backgroundColor: marketHP < 20 ? '#ef4444' : '#22c55e' }}
                                ></motion.div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ENEMY SPRITE */}
                <motion.div
                    className="absolute top-16 right-16 text-8xl filter drop-shadow-xl"
                    animate={gameState === 'ATTACK' ? {
                        x: [0, 10, -10, 10, -10, 0], // Shake
                        filter: ["brightness(1)", "brightness(10)", "brightness(1)"] // Flash
                    } : { y: [0, -5, 0] }}
                    transition={gameState === 'ATTACK' ? { duration: 0.4 } : { duration: 2, repeat: Infinity }}
                >
                    {MONSTERS.MARKET.icon}
                </motion.div>

                {/* PLAYER SPRITE */}
                {(gameState !== 'INTRO') && (
                    <motion.div
                        initial={{ x: -200, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                        className="absolute bottom-8 left-16 text-9xl filter drop-shadow-2xl transform scale-x-[-1]"
                    >
                        {MONSTERS[playerMon].icon}
                    </motion.div>
                )}

                {/* PLAYER HUD */}
                {(gameState !== 'INTRO') && (
                    <motion.div
                        initial={{ x: 300 }} animate={{ x: 0 }}
                        className="absolute bottom-12 right-6 bg-[#f8f9fa] border-b-4 border-r-4 border-slate-300 rounded-lg p-3 w-52 shadow-lg z-10"
                    >
                        <div className="flex justify-between items-baseline mb-1 px-1">
                            <span className="font-bold text-xs tracking-tighter text-slate-700">{MONSTERS[playerMon].name}</span>
                            <span className="text-[10px] font-bold text-slate-500">Lv{user?.streak || 5}</span>
                        </div>
                        <div className="w-full bg-slate-200 h-3 rounded-full border-2 border-slate-400 relative overflow-hidden mb-1">
                            <div className="h-full bg-gradient-to-b from-green-400 to-green-600 w-full shadow-[inset_0_-2px_0_rgba(0,0,0,0.2)]"></div>
                        </div>
                        <div className="text-right text-[10px] font-mono font-bold text-slate-600">
                            100/100
                        </div>
                    </motion.div>
                )}
            </div>

            {/* 3. LAYER: INTERACTIVE MENU */}
            <div className="absolute bottom-0 inset-x-0 h-1/3 bg-[#2d3748] border-t-8 border-[#a0aec0] p-1 flex gap-2">

                {/* TEXT BOX */}
                <div className="flex-1 bg-[#1a202c] border-4 border-double border-[#718096] rounded-lg p-3 relative shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
                    <p className="font-pixel text-xs md:text-sm text-white leading-relaxed tracking-wide drop-shadow-md">
                        {message}
                        <span className="animate-pulse">_</span>
                    </p>
                </div>

                {/* COMMAND MENU (Only visible in MENU/BATTLE_SELECT) */}
                {(gameState === 'MENU' || gameState === 'BATTLE_SELECT') && (
                    <div className="w-56 bg-white border-l-4 border-t-4 border-[#718096] rounded-tl-xl p-1 grid grid-cols-2 gap-1 text-[10px] font-bold shadow-2xl relative z-20">
                        {gameState === 'MENU' ? (
                            <>
                                <button onClick={() => { setGameState('BATTLE_SELECT'); typeMessage("Choose Investment Power...") }} className="bg-white hover:bg-red-50 hover:text-red-600 border border-slate-200 rounded flex items-center pl-2 group transition-colors">
                                    <span className="opacity-0 group-hover:opacity-100 mr-1">▶</span> FIGHT
                                </button>
                                <button className="bg-white hover:bg-blue-50 hover:text-blue-600 border border-slate-200 rounded flex items-center pl-2 text-slate-400 cursor-not-allowed">
                                    BAG
                                </button>
                                <button className="bg-white hover:bg-green-50 hover:text-green-600 border border-slate-200 rounded flex items-center pl-2 text-slate-400 cursor-not-allowed">
                                    PKMN
                                </button>
                                <button onClick={resetGame} className="bg-white hover:bg-yellow-50 hover:text-yellow-600 border border-slate-200 rounded flex items-center pl-2 group transition-colors">
                                    <span className="opacity-0 group-hover:opacity-100 mr-1">▶</span> RUN
                                </button>
                            </>
                        ) : (
                            <div className="col-span-2 flex flex-col p-2 bg-[#f7fafc]">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-slate-500">POWER</span>
                                    <span className="font-mono text-lg">${energy}</span>
                                </div>
                                <input
                                    type="range" min="10" max="100" step="10"
                                    value={energy} onChange={(e) => setEnergy(Number(e.target.value))}
                                    className="w-full h-2 mb-3 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-red-500"
                                />
                                <div className="grid grid-cols-2 gap-2 mt-auto">
                                    <button onClick={() => setGameState('MENU')} className="text-xs text-slate-400 text-center py-1">BACK</button>
                                    <button
                                        onClick={handleAttack}
                                        className="bg-red-500 text-white rounded shadow-[0_2px_0_#991b1b] active:shadow-none active:translate-y-[2px] text-center py-1"
                                    >
                                        Trade!
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* 4. INTRO OVERLAY */}
            {gameState === 'INTRO' && (
                <div className="absolute inset-0 bg-slate-900/95 z-50 flex flex-col items-center justify-center p-6 text-white text-center">
                    <div className="mb-8">
                        <h2 className="text-xl font-bold mb-2 text-yellow-400 drop-shadow-md">DAKOTA REGION</h2>
                        <p className="text-slate-400 text-xs">Choose your starter to begin trading!</p>
                    </div>

                    <div className="flex gap-4 items-center">
                        <motion.button
                            whileHover={{ scale: 1.05, y: -5 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => startBattle('BULL')}
                            className="w-32 h-40 bg-white rounded-xl border-4 border-slate-300 p-2 flex flex-col items-center justify-between shadow-[0_0_20px_rgba(255,255,255,0.1)] group"
                        >
                            <div className="text-xs text-slate-400 font-bold self-start pl-1">#004</div>
                            <div className="text-6xl drop-shadow-md scale-100 group-hover:scale-110 transition-transform">🔥</div>
                            <div className="w-full bg-orange-500 text-white font-bold text-xs py-1 rounded">BULLMANDER</div>
                        </motion.button>

                        <div className="text-xs text-slate-600 font-bold">OR</div>

                        <motion.button
                            whileHover={{ scale: 1.05, y: -5 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => startBattle('BEAR')}
                            className="w-32 h-40 bg-white rounded-xl border-4 border-slate-300 p-2 flex flex-col items-center justify-between shadow-[0_0_20px_rgba(255,255,255,0.1)] group"
                        >
                            <div className="text-xs text-slate-400 font-bold self-start pl-1">#007</div>
                            <div className="text-6xl drop-shadow-md scale-100 group-hover:scale-110 transition-transform">💧</div>
                            <div className="w-full bg-blue-500 text-white font-bold text-xs py-1 rounded">SQUIRTBEAR</div>
                        </motion.button>
                    </div>
                </div>
            )}

            {/* 5. VICTORY OVERLAY */}
            {gameState === 'VICTORY' && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-white/95 z-50 flex flex-col items-center justify-center p-8 text-black text-center"
                >
                    <Trophy className="text-yellow-500 w-20 h-20 mb-4 animate-bounce drop-shadow" />
                    <div className="text-4xl font-bold mb-2 tracking-tight">VICTORY!</div>
                    <p className="text-xs font-mono mb-8 text-slate-500">Wild MARKET was defeated!</p>

                    <div className="bg-[#f8f9fa] p-4 rounded-xl border-2 border-slate-200 w-full mb-6 shadow-sm">
                        <div className="flex justify-between text-sm mb-2 border-b border-slate-200 pb-2">
                            <span className="text-slate-500">XP Gained</span>
                            <span className="font-bold text-blue-600">+500 XP</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Yield Earned</span>
                            <span className="font-bold text-emerald-600 font-mono">${(energy * 1.8).toFixed(2)}</span>
                        </div>
                    </div>

                    <button
                        onClick={resetGame}
                        className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 transition-colors"
                    >
                        CONTINUE JOURNEY
                    </button>
                </motion.div>
            )}

        </div>
    );
}
