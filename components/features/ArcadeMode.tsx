"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, AlertTriangle, ChevronRight, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

import { useThetanutsOrders } from '@/hooks/useThetanutsOrders';
import { useFillOrder } from '@/hooks/useFillOrder';
import { useAccount } from 'wagmi';

import { ArcadeButton } from './arcade/ArcadeButton';
import { StoryScroll } from './arcade/StoryScroll';
import { PlanetCard } from './arcade/PlanetCard';

// --- GAME TYPES ---
type GameState = 'INTRO' | 'STORY' | 'SELECT_SHIP' | 'SELECT_PLANET' | 'SELECT_WEAPON' | 'ARM_WEAPON' | 'LAUNCH' | 'RESULT';
type ShipType = 'FIGHTER' | 'BOMBER'; // ETH vs BTC
type WeaponType = 'LASER' | 'MISSILE'; // Call vs Put

const PLANETS = [
    { type: 'MAGMA', name: 'BLITZ', timeframe: '2H-9H', minHours: 2, maxHours: 9 },
    { type: 'GAS', name: 'RUSH', timeframe: '9H-18H', minHours: 9, maxHours: 18 },
    { type: 'ICE', name: 'CORE', timeframe: '18H-36H', minHours: 18, maxHours: 36 },
    { type: 'TERRA', name: 'ORBIT', timeframe: '>36H', minHours: 36, maxHours: 9999 },
] as const;

export function ArcadeMode() {
    const { address } = useAccount();
    const [gameState, setGameState] = useState<GameState>('INTRO');
    
    // Selection State
    const [selectedShip, setSelectedShip] = useState<ShipType | null>(null);
    const [selectedPlanetIndex, setSelectedPlanetIndex] = useState<number | null>(null); 
    const [selectedWeapon, setSelectedWeapon] = useState<WeaponType | null>(null);

    const [inputAmount, setInputAmount] = useState<string>('50');

    // Data Hooks
    const { data } = useThetanutsOrders();
    const orders = data?.parsedOrders || [];
    const { executeFillOrder, isPending, isSuccess, error: txError, reset: resetTx } = useFillOrder();

    // --- HELPER LOGIC ---
    
    // Filter available ships based on orders
    const availableShips = ['FIGHTER', 'BOMBER'].filter(ship => {
        const asset = ship === 'FIGHTER' ? 'ETH' : 'BTC';
        return orders.some(o => o.asset === asset); // Only show if we have orders
    });

    // Filter planets (expiries) available for selected ship
    const getAvailablePlanets = () => {
        if (!selectedShip) return [];
        const asset = selectedShip === 'FIGHTER' ? 'ETH' : 'BTC';
        const shipOrders = orders.filter(o => o.asset === asset);
        
        // Return planets that have matching orders
        // This logic is simplified; real mapping would check expiry dates
        return PLANETS.map((p, idx) => ({ ...p, index: idx, count: shipOrders.length })); 
    };

    // Filter orders for the selected configuration
    const getTargetOrder = () => {
        if (!selectedShip || selectedPlanetIndex === null || !selectedWeapon) return null;
        
        const asset = selectedShip === 'FIGHTER' ? 'ETH' : 'BTC';
        const isCall = selectedWeapon === 'LASER';
        
        // Find best order matching criteria (Asset + Direction + "Planet Duration")
        // Simplified: Just picking first available valid order for demo
        return orders.find((o) => 
            o.asset === asset && 
            (o.direction === 'CALL') === isCall
        );
    };

    const handleLaunch = async () => {
        const order = getTargetOrder();
        if (!order) return;
        
        try {
            await executeFillOrder(order.rawOrder, inputAmount);
            setGameState('RESULT');
        } catch (e) {
            console.error(e);
        }
    };

    const resetGame = () => {
        setGameState('INTRO');
        setSelectedShip(null);
        setSelectedPlanetIndex(null);
        setSelectedWeapon(null);
        resetTx();
    };

    // --- RENDERERS ---

    if (gameState === 'INTRO') {
        return (
            <div className="h-full flex flex-col items-center justify-center space-y-8 p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/assets/grid-bg.png')] opacity-20 animate-[pulse_4s_infinite]"></div>
                
                <div className="text-center space-y-2 z-10">
                    <h1 className="text-4xl font-black font-pixel text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-orange-500 drop-shadow-sm">
                        ALPHA WAR
                    </h1>
                    <p className="text-[10px] font-mono text-emerald-400 tracking-[0.2em] animate-pulse">
                        INSERT COIN TO START
                    </p>
                </div>

                <div className="relative w-32 h-32 animate-bounce z-10">
                    <Image src="/assets/fighter-moon.svg" alt="Ship" fill className="object-contain" />
                </div>

                <ArcadeButton size="lg" onClick={() => setGameState('STORY')} className="z-10 animate-pulse">
                    START MISSION
                </ArcadeButton>
            </div>
        );
    }

    if (gameState === 'STORY') {
        return <StoryScroll onComplete={() => setGameState('SELECT_SHIP')} />;
    }

    return (
        <div className="h-full flex flex-col relative overflow-hidden">
            {/* Header / HUD */}
            <div className="flex justify-between items-center p-4 bg-black/40 border-b border-white/10 z-20">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${address ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`} />
                    <span className="text-[10px] font-pixel text-slate-400">
                        {address ? `PILOT: ${address.slice(0, 4)}...${address.slice(-4)}` : 'OFFLINE'}
                    </span>
                </div>
                <div className="text-[10px] font-pixel text-yellow-400">CREDITS: ∞</div>
            </div>

            <AnimatePresence mode="wait">
                
                {/* 1. SELECT SHIP */}
                {gameState === 'SELECT_SHIP' && (
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        className="flex-1 p-6 flex flex-col items-center justify-center space-y-8"
                        key="ship"
                    >
                        <h2 className="text-xl font-pixel text-white text-center">CHOOSE YOUR SHIP</h2>
                        
                        <div className="grid grid-cols-2 gap-4 w-full">
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                whileHover={{ scale: 1.05 }}
                                onClick={() => { setSelectedShip('FIGHTER'); setGameState('SELECT_PLANET'); }}
                                className="group relative bg-slate-800/50 border-2 border-slate-700 hover:border-emerald-500 rounded-xl p-4 flex flex-col items-center gap-3 transition-all duration-300"
                            >
                                <div className="w-20 h-20 relative">
                                    <Image src="/assets/fighter-moon.svg" alt="Fighter" fill className="object-contain group-hover:scale-110 transition-transform" />
                                </div>
                                <div className="text-center space-y-1">
                                    <div className="text-2xl font-black font-pixel bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-400 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">
                                        FIGHTER
                                    </div>
                                    <div className="text-sm font-pixel text-emerald-400/80">Asset: ETH</div>
                                    <div className="text-[8px] font-mono text-slate-500 uppercase">Speed • Agile</div>
                                </div>
                            </motion.button>

                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                whileHover={{ scale: 1.05 }}
                                onClick={() => { setSelectedShip('BOMBER'); setGameState('SELECT_PLANET'); }}
                                className="group relative bg-slate-800/50 border-2 border-slate-700 hover:border-orange-500 rounded-xl p-4 flex flex-col items-center gap-3 transition-all duration-300"
                            >
                                <div className="w-20 h-20 relative">
                                    <Image src="/assets/bomber-doom.svg" alt="Bomber" fill className="object-contain group-hover:scale-110 transition-transform" />
                                </div>
                                <div className="text-center space-y-1">
                                    <div className="text-2xl font-black font-pixel bg-gradient-to-r from-orange-400 via-orange-300 to-orange-400 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]">
                                        BOMBER
                                    </div>
                                    <div className="text-sm font-pixel text-orange-400/80">Asset: BTC</div>
                                    <div className="text-[8px] font-mono text-slate-500 uppercase">Heavy • Armor</div>
                                </div>
                            </motion.button>
                        </div>
                    </motion.div>
                )}

                {/* 2. SELECT PLANET (EXPIRY) */}
                {gameState === 'SELECT_PLANET' && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                        className="flex-1 p-6 flex flex-col space-y-6"
                        key="planet"
                    >
                        <div className="text-center">
                            <h2 className="text-lg font-pixel text-white mb-1">TARGET SECTOR</h2>
                            <p className="text-[10px] font-mono text-slate-400">Where are the monsters hiding?</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 p-2 overflow-visible">
                            {PLANETS.map((planet, idx) => (
                                <PlanetCard 
                                    key={planet.name}
                                    name={planet.name}
                                    type={planet.type as any}
                                    timeframe={planet.timeframe}
                                    isSelected={selectedPlanetIndex === idx}
                                    onClick={() => setSelectedPlanetIndex(idx)}
                                />
                            ))}
                        </div>

                        <div className="mt-auto">
                            <ArcadeButton 
                                size="lg" 
                                disabled={selectedPlanetIndex === null}
                                onClick={() => setGameState('SELECT_WEAPON')}
                                className={selectedPlanetIndex === null ? 'opacity-50 grayscale' : ''}
                            >
                                LOCK COORDINATES
                            </ArcadeButton>
                        </div>
                    </motion.div>
                )}

                {/* 3. SELECT WEAPON (STRATEGY) */}
                {gameState === 'SELECT_WEAPON' && (
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        className="flex-1 p-6 flex flex-col space-y-8"
                        key="weapon"
                    >
                        <div className="text-center">
                            <h2 className="text-lg font-pixel text-white">SELECT WEAPON</h2>
                            <p className="text-[10px] font-mono text-slate-400">Predict the market trajectory</p>
                        </div>

                        <div className="space-y-4">
                            <button
                                onClick={() => { setSelectedWeapon('LASER'); setGameState('ARM_WEAPON'); }}
                                className="w-full bg-gradient-to-r from-emerald-900/40 to-emerald-800/40 border-2 border-emerald-500/50 p-6 rounded-xl flex flex-col items-center gap-3 hover:from-emerald-900/60 hover:to-emerald-800/60 transition-all duration-300 group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors" />
                                <div className="relative z-10 flex flex-col items-center gap-2">
                                    <div className="p-3 bg-emerald-500 rounded-lg text-black shadow-lg">
                                        <Rocket size={32} className="rotate-45" />
                                    </div>
                                    <div className="text-center space-y-1">
                                        <div className="text-2xl font-black font-pixel bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-400 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">
                                            MOON LASER
                                        </div>
                                        <div className="text-sm font-pixel text-emerald-400/80">Strategy: CALL</div>
                                        <div className="text-[10px] font-mono text-slate-400">Long • Bullish</div>
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={() => { setSelectedWeapon('MISSILE'); setGameState('ARM_WEAPON'); }}
                                className="w-full bg-gradient-to-r from-rose-900/40 to-rose-800/40 border-2 border-rose-500/50 p-6 rounded-xl flex flex-col items-center gap-3 hover:from-rose-900/60 hover:to-rose-800/60 transition-all duration-300 group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-rose-500/5 group-hover:bg-rose-500/10 transition-colors" />
                                <div className="relative z-10 flex flex-col items-center gap-2">
                                    <div className="p-3 bg-rose-500 rounded-lg text-black shadow-lg">
                                        <Rocket size={32} className="rotate-[135deg]" />
                                    </div>
                                    <div className="text-center space-y-1">
                                        <div className="text-2xl font-black font-pixel bg-gradient-to-r from-rose-400 via-rose-300 to-rose-400 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]">
                                            DOOM MISSILE
                                        </div>
                                        <div className="text-sm font-pixel text-rose-400/80">Strategy: PUT</div>
                                        <div className="text-[10px] font-mono text-slate-400">Long • Bearish</div>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* 4. ARM WEAPON (AMOUNT) + LAUNCH */}
                {gameState === 'ARM_WEAPON' && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="flex-1 p-6 flex flex-col justify-center space-y-8 text-center"
                        key="arm"
                    >
                        <div className="space-y-2">
                            <AlertTriangle className="w-8 h-8 text-yellow-400 mx-auto animate-pulse" />
                            <h2 className="text-xl font-pixel text-white">ARMING SEQUENCE</h2>
                        </div>

                        <div className="bg-slate-800 border-2 border-slate-600 p-6 rounded-2xl">
                            <label className="text-[10px] font-mono text-slate-400 mb-2 block uppercase">Payload Size (USDC)</label>
                            <input 
                                type="number" 
                                value={inputAmount}
                                onChange={(e) => setInputAmount(e.target.value)}
                                className="w-full bg-black border-none text-center text-3xl font-pixel text-white py-2 focus:ring-0"
                            />
                        </div>

                        <ArcadeButton 
                            size="lg" 
                            variant="danger" 
                            onClick={handleLaunch}
                            className="text-lg animate-pulse"
                        >
                            LAUNCH MISSION
                        </ArcadeButton>
                        
                        <button onClick={() => setGameState('SELECT_WEAPON')} className="text-[10px] font-pixel text-slate-500 hover:text-white">
                            ABORT SEQUENCE
                        </button>
                    </motion.div>
                )}

                {/* 5. RESULT */}
                {gameState === 'RESULT' && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                        className="flex-1 p-8 flex flex-col items-center justify-center text-center space-y-6"
                        key="result"
                    >
                        {isPending ? (
                            <div className="space-y-4">
                                <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto" />
                                <div className="font-pixel text-yellow-400">TRANSMITTING...</div>
                            </div>
                        ) : isSuccess ? (
                            <>
                                <CheckCircle2 className="w-20 h-20 text-emerald-400 mx-auto" />
                                <h2 className="text-2xl font-pixel text-white">MISSION CONFIRMED</h2>
                                <p className="text-xs font-mono text-slate-400">Orbits synchronized. Target locked.</p>
                                <ArcadeButton onClick={resetGame}>RETURN TO BASE</ArcadeButton>
                            </>
                        ) : (
                            <>
                                <AlertTriangle className="w-20 h-20 text-rose-500 mx-auto" />
                                <h2 className="text-xl font-pixel text-white">LAUNCH FAILURE</h2>
                                <p className="text-xs font-mono text-slate-400">{txError?.message || "Signal lost."}</p>
                                <ArcadeButton variant="warning" onClick={() => setGameState('ARM_WEAPON')}>RETRY</ArcadeButton>
                            </>
                        )}
                    </motion.div>
                )}

            </AnimatePresence>
        </div>
    );
}
