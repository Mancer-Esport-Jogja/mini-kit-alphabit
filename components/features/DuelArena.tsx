"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Shield, Zap, Skull, Trophy, Flame, ChevronRight, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// --- POKEMON-STYLE CONFIG ---
const MONSTERS = {
    BULL: { name: 'BULLMANDER', color: 'text-orange-500', icon: '🔥', type: 'FIRE' },
    BEAR: { name: 'SQUIRTBEAR', color: 'text-blue-500', icon: '💧', type: 'WATER' },
    MARKET: { name: 'WILD VOLATILITY', color: 'text-purple-500', icon: '👻', type: 'GHOST' }
};

export function DuelArena() {
    const { user } = useAuth();

    // Game State
    const [gameState, setGameState] = useState<'INTRO' | 'BATTLE' | 'MENU' | 'ATTACK' | 'VICTORY'>('INTRO');
    const [playerMon, setPlayerMon] = useState<'BULL' | 'BEAR'>('BULL');
    const [marketHP, setMarketHP] = useState(100);
    const [playerHP, setPlayerHP] = useState(100);
    const [message, setMessage] = useState("Wild MARKET appeared!");
    const [energy, setEnergy] = useState(50); // Bet Amount

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
                    // Damage logic (simplified)
                    const damage = Math.floor(Math.random() * 8);
                    return Math.max(0, prev - damage);
                });
            }, 500); // Fast ticks
            return () => clearInterval(timer);
        }
    }, [gameState]);

    const handleAttack = () => {
        setGameState('ATTACK');
        setMessage(`${MONSTERS[playerMon].name} used ${playerMon === 'BULL' ? 'MOON BEAM' : 'DOOM CLAW'}!`);
    };

    const startBattle = (mon: 'BULL' | 'BEAR') => {
        setPlayerMon(mon);
        setGameState('BATTLE');
        setMessage(`Go! ${MONSTERS[mon].name}!`);
        setTimeout(() => {
            setGameState('MENU');
            setMessage("What will you do?");
        }, 1500);
    };

    const resetGame = () => {
        setGameState('INTRO');
        setMarketHP(100);
        setMessage("Wild MARKET appeared!");
    };

    return (
        <div className="relative w-full aspect-[4/3] bg-[#f8f9fa] border-8 border-slate-300 rounded-xl shadow-2xl overflow-hidden font-pixel select-none text-black">

            {/* 1. LAYER: BATTLE SCENE */}
            <div className="absolute inset-0 z-0 flex flex-col">
                {/* Background */}
                <div className="flex-1 bg-gradient-to-b from-blue-200 to-green-200 relative overflow-hidden">
                    {/* Battle Floor */}
                    <div className="absolute bottom-0 w-full h-1/3 bg-emerald-300 border-t-4 border-emerald-500 rounded-[50%_50%_0_0] scale-150"></div>
                </div>
                {/* Menu Space (covered by UI later) */}
                <div className="h-1/3 bg-slate-900"></div>
            </div>

            {/* 2. LAYER: SPRITES & HUDS */}
            <div className="absolute inset-x-0 top-0 h-2/3 p-4">

                {/* ENEMY HUD (Top Left) */}
                <motion.div
                    initial={{ x: -200 }} animate={{ x: 0 }}
                    className="absolute top-4 left-4 bg-white/90 border-2 border-slate-700 rounded-lg p-2 w-48 shadow-lg"
                >
                    <div className="flex justify-between items-baseline mb-1">
                        <span className="font-bold text-xs">{MONSTERS.MARKET.name}</span>
                        <span className="text-[10px] font-bold">Lv50</span>
                    </div>
                    {/* HP Bar */}
                    <div className="w-full bg-slate-200 h-3 rounded-full border border-slate-400 p-0.5">
                        <div className="text-[8px] absolute -mt-4 right-0 text-slate-500">HP</div>
                        <motion.div
                            className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                            initial={{ width: '100%' }}
                            animate={{ width: `${marketHP}%`, backgroundColor: marketHP < 20 ? '#ef4444' : marketHP < 50 ? '#eab308' : '#22c55e' }}
                        ></motion.div>
                    </div>
                </motion.div>

                {/* ENEMY SPRITE (Top Right) */}
                <motion.div
                    className="absolute top-12 right-12 text-6xl drop-shadow-xl"
                    animate={gameState === 'ATTACK' ? { x: [0, 5, -5, 0], opacity: [1, 0.5, 1] } : { y: [0, -5, 0] }}
                    transition={gameState === 'ATTACK' ? { duration: 0.2, repeat: 5 } : { duration: 2, repeat: Infinity }}
                >
                    {MONSTERS.MARKET.icon}
                </motion.div>

                {/* PLAYER SPRITE (Bottom Left) */}
                {(gameState !== 'INTRO') && (
                    <motion.div
                        initial={{ x: -200, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                        className="absolute bottom-4 left-12 text-8xl drop-shadow-xl transform scale-x-[-1]"
                    >
                        {MONSTERS[playerMon].icon}
                    </motion.div>
                )}

                {/* PLAYER HUD (Bottom Right) */}
                {(gameState !== 'INTRO') && (
                    <motion.div
                        initial={{ x: 200 }} animate={{ x: 0 }}
                        className="absolute bottom-8 right-4 bg-white/90 border-2 border-slate-700 rounded-lg p-3 w-52 shadow-lg z-10"
                    >
                        <div className="flex justify-between items-baseline mb-1">
                            <span className="font-bold text-xs">{MONSTERS[playerMon].name}</span>
                            <span className="text-[10px] font-bold">Lv{user?.streak || 5}</span>
                        </div>
                        <div className="w-full bg-slate-200 h-3 rounded-full border border-slate-400 p-0.5 mb-1">
                            <div className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full w-full"></div>
                        </div>
                        <div className="text-right text-[10px] font-mono font-bold">
                            {Math.floor(playerHP)}/100
                        </div>
                    </motion.div>
                )}
            </div>

            {/* 3. LAYER: DIALOGUE / MENU BOX */}
            <div className="absolute bottom-0 inset-x-0 h-1/3 bg-slate-800 border-t-4 border-orange-500 p-4 flex gap-4 text-white">

                {/* TEXT BOX */}
                <div className="flex-1 bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-slate-500 rounded p-4 shadow-inner relative">
                    <p className="font-mono text-xs md:text-sm leading-relaxed typing-effect">
                        {message}
                    </p>
                    {gameState === 'ATTACK' && (
                        <div className="absolute inset-0 bg-red-500/10 animate-pulse pointer-events-none"></div>
                    )}
                </div>

                {/* ACTION MENU */}
                {gameState === 'MENU' ? (
                    <div className="w-48 bg-white text-slate-900 border-2 border-slate-400 rounded grid grid-cols-2 text-xs font-bold shadow-lg overflow-hidden">
                        <button onClick={() => setGameState('BATTLE_SELECT')} className="hover:bg-orange-100 border-r border-b border-slate-200 flex items-center justify-center p-2 group">
                            <span className="group-hover:translate-x-1 transition-transform">FIGHT</span>
                        </button>
                        <button className="hover:bg-blue-100 border-b border-slate-200 flex items-center justify-center p-2 text-slate-400 cursor-not-allowed">
                            BAG
                        </button>
                        <button className="hover:bg-green-100 border-r border-slate-200 flex items-center justify-center p-2 text-slate-400 cursor-not-allowed">
                            POKEMON
                        </button>
                        <button onClick={resetGame} className="hover:bg-yellow-100 flex items-center justify-center p-2">
                            RUN
                        </button>
                    </div>
                ) : gameState === 'BATTLE_SELECT' ? (
                    <div className="w-48 bg-slate-700 border-2 border-slate-500 rounded p-2 text-white">
                        <div className="text-[8px] text-slate-400 mb-2 uppercase">Select Power</div>
                        <input
                            type="range" min="10" max="100" step="10"
                            value={energy} onChange={(e) => setEnergy(Number(e.target.value))}
                            className="w-full h-2 mb-2 bg-slate-900 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="text-center font-mono text-xs mb-2">$ {energy}</div>
                        <button
                            onClick={handleAttack}
                            className="w-full bg-red-500 hover:bg-red-400 text-white font-bold py-1 rounded border-b-4 border-red-700 active:border-b-0 active:translate-y-0.5"
                        >
                            {playerMon === 'BULL' ? 'MOON BEAM' : 'DOOM CLAW'}
                        </button>
                        <button
                            onClick={() => setGameState('MENU')}
                            className="w-full text-[8px] text-slate-400 mt-1 hover:text-white"
                        >
                            CANCEL
                        </button>
                    </div>
                ) : null}
            </div>

            {/* 4. INTRO SELECTION OVERLAY */}
            {gameState === 'INTRO' && (
                <div className="absolute inset-0 bg-slate-900/90 z-50 flex flex-col items-center justify-center p-6 text-white text-center">
                    <h2 className="text-xl font-bold mb-8 animate-pulse text-yellow-400">CHOOSE YOUR PARTNER!</h2>
                    <div className="flex gap-4">
                        <button
                            onClick={() => startBattle('BULL')}
                            className="group bg-slate-800 p-4 rounded-xl border-4 border-slate-600 hover:border-orange-500 hover:bg-slate-700 transition-all"
                        >
                            <div className="text-6xl mb-2 group-hover:scale-110 transition-transform">🔥</div>
                            <div className="font-bold text-orange-400">BULLMANDER</div>
                        </button>

                        <button
                            onClick={() => startBattle('BEAR')}
                            className="group bg-slate-800 p-4 rounded-xl border-4 border-slate-600 hover:border-blue-500 hover:bg-slate-700 transition-all"
                        >
                            <div className="text-6xl mb-2 group-hover:scale-110 transition-transform">💧</div>
                            <div className="font-bold text-blue-400">SQUIRTBEAR</div>
                        </button>
                    </div>
                </div>
            )}

            {/* 5. VICTORY OVERLAY */}
            {gameState === 'VICTORY' && (
                <div className="absolute inset-0 bg-white/90 z-50 flex flex-col items-center justify-center p-6 text-black text-center animate-in fade-in zoom-in">
                    <Trophy className="text-yellow-500 w-16 h-16 mb-4 animate-bounce" />
                    <h2 className="text-2xl font-bold mb-2">VICTORY!</h2>
                    <p className="text-xs font-mono mb-6 text-slate-600">Wild MARKET was defeated!</p>

                    <div className="bg-slate-100 p-4 rounded border-2 border-slate-300 w-full mb-4">
                        <div className="flex justify-between text-sm">
                            <span>XP Gained</span>
                            <span className="font-bold">+500</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Prize Money</span>
                            <span className="font-bold text-green-600">${energy * 1.8}</span>
                        </div>
                    </div>

                    <button
                        onClick={resetGame}
                        className="w-full py-3 bg-blue-600 text-white font-bold rounded shadow-lg hover:bg-blue-500"
                    >
                        CONTINUE
                    </button>
                </div>
            )}

        </div>
    );
}
