"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

import { useThetanutsOrders } from '@/hooks/useThetanutsOrders';
import { useFillOrder } from '@/hooks/useFillOrder';
import { useAccount } from 'wagmi';
import { filterOrdersByDuration } from '@/services/thetanutsApi';
import { useAuth } from '@/context/AuthContext';
import { useGamification } from '@/context/GamificationContext';
import type { ParsedOrder } from '@/types/orders';

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

type AvailablePlanet = (typeof PLANETS)[number] & {
    index: number;
    count: number;
    isAvailable: boolean;
};

export function ArcadeMode() {
    const { address } = useAccount();
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
    const { completeMission, addXp } = useGamification();

    const [gameState, setGameState] = useState<GameState>('INTRO');
    
    // Selection State
    const [selectedShip, setSelectedShip] = useState<ShipType | null>(null);
    const [selectedPlanetIndex, setSelectedPlanetIndex] = useState<number | null>(null); 
    const [selectedWeapon, setSelectedWeapon] = useState<WeaponType | null>(null);

    const [inputAmount, setInputAmount] = useState<string>('50');

    // Data Hooks
    const { data: orderData } = useThetanutsOrders();
    const orders = orderData?.parsedOrders || [];
    const { executeFillOrder, isPending, isConfirming, isSuccess, error: txError, hash, reset: resetTx } = useFillOrder();
    
    // Result State
    const [lastSuccessOrder, setLastSuccessOrder] = useState<ParsedOrder | null>(null);

    // --- HELPER LOGIC ---
    
    // Filter planets (expiries) available for selected ship
    const getAvailablePlanets = (): AvailablePlanet[] => {
        if (!selectedShip) return [];
        const asset = selectedShip === 'FIGHTER' ? 'ETH' : 'BTC';
        const shipOrders = orders.filter(o => o.asset === asset);
        
        return PLANETS.map((p, idx): AvailablePlanet => {
            // Use real duration filtering logic
            const matchingOrders = filterOrdersByDuration(
                shipOrders.map(o => o.rawOrder), 
                p.name as 'BLITZ' | 'RUSH' | 'CORE' | 'ORBIT'
            );
            return { 
                ...p, 
                index: idx, 
                count: matchingOrders.length,
                isAvailable: matchingOrders.length > 0 
            };
        }); 
    };

    // Filter orders for the selected configuration
    const getTargetOrder = (): ParsedOrder | null => {
        if (!selectedShip || selectedPlanetIndex === null || !selectedWeapon) return null;
        
        const asset = selectedShip === 'FIGHTER' ? 'ETH' : 'BTC';
        const isCall = selectedWeapon === 'LASER';
        const planet = PLANETS[selectedPlanetIndex];
        
        const shipOrders = orders.filter(o => o.asset === asset && (o.direction === 'CALL') === isCall);
        
        // Find best order matching criteria (Asset + Direction + Duration)
        const durationOrders = filterOrdersByDuration(
            shipOrders.map(o => o.rawOrder), 
            planet.name as 'BLITZ' | 'RUSH' | 'CORE' | 'ORBIT'
        );

        if (durationOrders.length === 0) return null;

        // Find the one in our parsed list to return ParsedOrder type
        const bestRaw = durationOrders.reduce((best, curr) => 
            Number(curr.order.price) < Number(best.order.price) ? curr : best
        );

        return orders.find(o => o.rawOrder.order.ticker === bestRaw.order.ticker) ?? null;
    };

    const handleLaunch = async () => {
        const order = getTargetOrder();
        if (!order) return;
        
        try {
            await executeFillOrder(order.rawOrder, inputAmount);
            
            // Success! 
            setLastSuccessOrder(order);
            setGameState('RESULT');

            // Gamification: Reward the pilot
            completeMission('first_strike');
            addXp(100); // Bonus for arcade mission
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
                
                {/* Decorative HUD Lines */}
                <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
                <div className="absolute bottom-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

                <div className="text-center space-y-2 z-10">
                    <motion.h1 
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-5xl font-black font-pixel text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-orange-400 to-orange-600 drop-shadow-[0_0_15px_rgba(234,179,8,0.4)]"
                    >
                        ALPHA WAR
                    </motion.h1>
                    <p className="text-[10px] font-mono text-emerald-400 tracking-[0.3em] animate-pulse">
                        ACCESS TERMINAL :: INSERT COIN
                    </p>
                </div>

                {/* Fleet Preview Area */}
                <div className="relative w-full h-48 flex items-center justify-center z-10">
                    {/* Ships Formation */}
                    <div className="flex items-center gap-8">
                        <motion.div 
                            initial={{ x: -50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="relative w-24 h-24 animate-bounce"
                        >
                            <Image src="/assets/fighter-moon.svg" alt="Fighter" fill className="object-contain drop-shadow-[0_0_10px_rgba(52,211,153,0.4)]" />
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[8px] font-pixel text-emerald-400 opacity-60">FIGHTER</div>
                        </motion.div>

                        <motion.div 
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="relative w-24 h-24 animate-bounce [animation-delay:0.5s]"
                        >
                            <Image src="/assets/bomber-doom.svg" alt="Bomber" fill className="object-contain drop-shadow-[0_0_10px_rgba(251,146,60,0.4)]" />
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[8px] font-pixel text-orange-400 opacity-60">BOMBER</div>
                        </motion.div>
                    </div>
                </div>

                <div className="space-y-4 w-full max-w-xs z-10">
                    <ArcadeButton size="lg" onClick={() => setGameState('STORY')} className="animate-pulse">
                        START MISSION
                    </ArcadeButton>
                    <div className="flex justify-between px-2">
                        <span className="text-[8px] font-pixel text-slate-500">v2.2.0-ARCADE</span>
                        <span className="text-[8px] font-pixel text-slate-500">BETA_PILOT_ACCESS</span>
                    </div>
                </div>
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
                                    <div className="text-xl font-black font-pixel bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-400 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">
                                        FIGHTER
                                    </div>
                                    <div className="text-[10px] font-pixel text-emerald-400/80">Asset: ETH</div>
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
                                    <div className="text-xl font-black font-pixel bg-gradient-to-r from-orange-400 via-orange-300 to-orange-400 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]">
                                        BOMBER
                                    </div>
                                    <div className="text-[10px] font-pixel text-orange-400/80">Asset: BTC</div>
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
                            {getAvailablePlanets().map((planet) => (
                                <PlanetCard 
                                    key={planet.name}
                                    name={planet.name}
                                    type={planet.type}
                                    timeframe={planet.timeframe}
                                    isSelected={selectedPlanetIndex === planet.index}
                                    onClick={() => planet.isAvailable && setSelectedPlanetIndex(planet.index)}
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
                                    <div className="p-2 bg-emerald-500/20 border-2 border-emerald-500/30 rounded-xl text-black shadow-lg relative w-16 h-16">
                                        <Image src="/assets/missile-moon.svg" alt="Moon Laser" fill className="object-contain p-1" />
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
                                    <div className="p-2 bg-rose-500/20 border-2 border-rose-500/30 rounded-xl text-black shadow-lg relative w-16 h-16">
                                        <Image src="/assets/missile-doom.svg" alt="Doom Missile" fill className="object-contain p-1" />
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

                        {!isAuthenticated ? (
                            <div className="space-y-4">
                                <div className="p-3 bg-red-900/20 border border-red-500/50 text-[10px] font-pixel text-red-400 uppercase">
                                    {isAuthLoading ? "Synchronizing Comms..." : "Pilot Auth Required"}
                                </div>
                                <p className="text-[10px] font-mono text-slate-500">Log in via Header to initiate launch sequence.</p>
                            </div>
                        ) : (
                            <ArcadeButton 
                                size="lg" 
                                variant="danger" 
                                onClick={handleLaunch}
                                className="text-lg animate-pulse"
                            >
                                LAUNCH MISSION
                            </ArcadeButton>
                        )}
                        
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
                        {isPending || isConfirming ? (
                            <div className="space-y-4">
                                <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto" />
                                <div className="font-pixel text-yellow-400">
                                    {isPending ? 'TRANSMITTING...' : 'CONFIRMING ON BASE...'}
                                </div>
                                <div className="text-[10px] font-mono text-slate-500 animate-pulse uppercase">
                                    Awaiting stellar synchronization
                                </div>
                            </div>
                         ) : isSuccess ? (
                             <>
                                 <CheckCircle2 className="w-20 h-20 text-emerald-400 mx-auto" />
                                 <h2 className="text-2xl font-pixel text-white uppercase">Mission Confirmed</h2>
                                 
                                {(() => {
                                    if (!lastSuccessOrder) return null;

                                    const strikes = lastSuccessOrder.strikes;
                                    const premium = lastSuccessOrder.premium;
                                    const isSpread = lastSuccessOrder.isSpread;
                                    const isCall = lastSuccessOrder.direction === 'CALL';
                                    const strikeWidth = isSpread ? Math.abs(strikes[1] - strikes[0]) : 0;
                                    
                                    let roi = 0;
                                    if (isSpread) {
                                        const maxPayout = strikeWidth - premium;
                                        roi = premium > 0 ? Math.round((maxPayout / premium) * 100) : 0;
                                    } else {
                                        if (!isCall) {
                                            const maxPayout = strikes[0] - premium;
                                            roi = premium > 0 ? Math.round((maxPayout / premium) * 100) : 0;
                                        }
                                    }

                                    return (
                                        <div className="bg-emerald-900/20 border border-emerald-500/30 p-4 rounded-xl space-y-2 w-full max-w-xs mx-auto animate-in fade-in zoom-in duration-500">
                                            <div className="flex justify-between items-center text-[10px] font-mono">
                                                <span className="text-slate-400">TARGET:</span>
                                                <span className="text-emerald-400 font-bold">${lastSuccessOrder.strikeFormatted}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-[10px] font-mono">
                                                <span className="text-slate-400">EXPIRY:</span>
                                                <span className="text-white">{lastSuccessOrder.expiryFormatted}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-[10px] font-mono">
                                                <span className="text-slate-400">MISSION TYPE:</span>
                                                <span className="text-emerald-400">{lastSuccessOrder.direction}</span>
                                            </div>
                                            {(roi > 0 || !isCall) && (
                                                <div className="flex justify-between items-center text-[10px] font-mono border-t border-emerald-500/20 pt-2">
                                                    <span className="text-slate-400">EST. PROFIT POTENTIAL:</span>
                                                    <span className="text-emerald-400 font-bold">
                                                        {roi === 0 && isCall ? 'UNLIMITED' : `+${roi}%`}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}

                                <p className="text-[10px] font-mono text-slate-400">Orbits synchronized. Position secured.</p>
                                
                                <div className="flex flex-col gap-3 w-full max-w-xs">
                                    {hash && (
                                        <a 
                                            href={`https://basescan.org/tx/${hash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[9px] font-mono text-emerald-400 hover:text-emerald-300 underline underline-offset-4 decoration-emerald-500/30"
                                        >
                                            VIEW TRANSMISSION LOGS
                                        </a>
                                    )}

                                    {lastSuccessOrder && (
                                        <ArcadeButton 
                                            onClick={() => {
                                                const order = lastSuccessOrder;
                                                if (!order) return;

                                                const text = `Just secured a ${order.direction} mission on ${order.asset} via @alphabit! 🚀\n\nTarget: $${order.strikeFormatted}\nMode: Arcade 🕹️`;
                                                window.open(`https://warpcast.com/~/compose?text=${encodeURIComponent(text)}`, '_blank');
                                            }}
                                            variant="outline"
                                            className="text-[10px]"
                                        >
                                            SHARE MISSION
                                        </ArcadeButton>
                                    )}

                                    <ArcadeButton onClick={resetGame}>RETURN TO BASE</ArcadeButton>
                                </div>
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
