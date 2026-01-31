"use client";

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Position } from '@/types/positions';
import { parseStrike } from '@/utils/decimals';

import { Info, X } from 'lucide-react';

interface BattleSceneProps {
    position: Position;
    isActive: boolean;
    currentPrice?: number | null;
    onToggleDetails?: (isOpen: boolean) => void;
}

// --- ASSET MAPPING ---
// Keep this in sync with ArcadeMode / PlanetCard
const PLANET_ASSETS: Record<string, string> = {
    MAGMA: "/assets/planet-magma.svg",
    GAS: "/assets/planet-astra.svg",
    ICE: "/assets/planet-nova.svg",
    TERRA: "/assets/planet-pandora.svg",
};

const getPlanetType = (durationHours: number) => {
    if (durationHours < 9) return 'MAGMA';
    if (durationHours < 18) return 'GAS';
    if (durationHours < 36) return 'ICE';
    return 'TERRA';
};

const formatCountdown = (ms: number) => {
    if (ms <= 0) return "00:00:00";
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / 1000 / 60) % 60);
    const hours = Math.floor((ms / 1000 / 60 / 60));
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const BattleScene = ({ position, isActive, currentPrice, onToggleDetails }: BattleSceneProps) => {
    const isCall = position.optionType === 256; // 256 usually standard for CALL in many protocols, verifying with Portfolio logic
    const isEth = position.underlyingAsset === 'ETH';
    
    // Data Calculation
    const strikePrice = parseStrike(position.strikes[0]);
    // Fix: Ensure we fallback correctly if price is 0/null to avoid false "Win" or "Loss"
    const safeCurrentPrice = currentPrice || strikePrice; 

    const durationSeconds = position.expiryTimestamp - position.entryTimestamp;
    const durationHours = durationSeconds / 3600;
    const planetType = getPlanetType(durationHours);
    
    const [timeLeftStr, setTimeLeftStr] = useState("00:00:00");
    const [hpPercent, setHpPercent] = useState(100);
    const [showDetails, setShowDetails] = useState(false);

    // Toggle Handler
    const handleToggleDetails = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent firing click (which might be used for shooting if we didn't guard it)
        const newState = !showDetails;
        setShowDetails(newState);
        if (onToggleDetails) onToggleDetails(newState);
    };

    // Update Timer & HP Logic
    useEffect(() => {
        const updateState = () => {
            const now = Date.now();
            const expiry = position.expiryTimestamp * 1000;
            const diff = expiry - now;
            setTimeLeftStr(formatCountdown(diff));

            // HP LOGIC (Option B: Win/Loss Status)
            if (currentPrice && strikePrice) {
                const isWinning = isCall 
                    ? currentPrice > strikePrice 
                    : currentPrice < strikePrice;
                
                if (isWinning) {
                    // Calculate "Damage" based on Moneyness (Distance ITM)
                    const dist = Math.abs(currentPrice - strikePrice);
                    const distPct = dist / strikePrice;
                    
                    // 2% ITM = 100% Damage (Dead Planet)
                    // 0% ITM = 0% Damage (Full HP)
                    const damage = Math.min(100, (distPct / 0.02) * 100);
                    setHpPercent(Math.max(0, 100 - damage));
                } else {
                    // OTM = Planet Regenerates / Stays Full
                    setHpPercent(100);
                }
            } else {
                // Fallback to Time Decay if no price feed (e.g. initial load)
                const nowSec = Math.floor(Date.now() / 1000);
                const timeRemaining = Math.max(0, position.expiryTimestamp - nowSec);
                const percent = (timeRemaining / durationSeconds) * 100;
                setHpPercent(Math.min(100, Math.max(0, percent)));
            }
        };

        updateState();
        const interval = setInterval(updateState, 1000);
        return () => clearInterval(interval);
    }, [position.expiryTimestamp, position.entryTimestamp, durationSeconds, currentPrice, strikePrice, isCall]);

    // Assets
    const shipAsset = isEth ? "/assets/fighter-moon.svg" : "/assets/bomber-doom.svg";
    const missileAsset = isCall ? "/assets/missile-moon.svg" : "/assets/bomber-doom.svg";
    const planetAsset = PLANET_ASSETS[planetType];

    // Animation States
    const [isShooting, setIsShooting] = useState(false);
    const [isHit, setIsHit] = useState(false);

    // Manual Laser Shots (allow rapid taps)
    const [laserShots, setLaserShots] = useState<Array<{ id: number; offset: number }>>([]);
    const laserShotId = useRef(0);

    const handleFire = () => {
        if (!isActive || showDetails) return; // Disable shooting if details open

        // Randomize Y position (Spread within ship height)
        const offset = Math.floor(Math.random() * 40) - 20;
        const id = laserShotId.current++;

        setLaserShots((prev) => [...prev, { id, offset }]);

        // Impact Delay (Travel time)
        setTimeout(() => {
            setIsHit(true);
            setTimeout(() => setIsHit(false), 300);
        }, 500); // 0.5s travel time

        // Clear this shot after travel finishes
        setTimeout(() => {
            setLaserShots((prev) => prev.filter((shot) => shot.id !== id));
        }, 500);
    };

    // Auto-fire loop only when active
    useEffect(() => {
        if (!isActive) return;

        const shootLoop = setInterval(() => {
            if (showDetails) return; // Pause auto-fire visual if details open

            setIsShooting(true);
            
            // Trigger impact 600ms later (flight time)
            setTimeout(() => {
                setIsHit(true);
                setTimeout(() => setIsHit(false), 300); // Shake duration
            }, 600);

            setTimeout(() => setIsShooting(false), 1200); // Reset for next shot
        }, 2000); // Shoot every 2 seconds

        return () => clearInterval(shootLoop);
    }, [isActive, showDetails]);

    if (!isActive) return null;

    return (
        <div 
            onClick={handleFire}
            className="w-full h-[280px] relative flex items-center justify-between px-2 sm:px-4 overflow-hidden bg-black/20 border-b border-white/10 cursor-pointer active:scale-[0.98] transition-all select-none group/scene"
        >
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[url('/assets/grid-bg.png')] opacity-10 animate-[pulse_10s_infinite]" />
            
            {/* --- DETAILS OVERLAY --- */}
            <AnimatePresence>
                {showDetails && (
                    <motion.div 
                        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        animate={{ opacity: 1, backdropFilter: "blur(4px)" }}
                        exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        className="absolute inset-0 z-50 bg-black/60 flex items-center justify-center p-8 cursor-default"
                        onClick={(e) => e.stopPropagation()} 
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 10 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 10 }}
                            className="w-full max-w-sm bg-slate-900 border-2 border-slate-600 rounded-xl p-4 shadow-[0_0_30px_rgba(0,0,0,0.8)]"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-sm font-pixel text-white uppercase">Mission Intel</h3>
                                    <div className="text-[10px] font-mono text-slate-400">{position.underlyingAsset} {'//'} {isCall ? 'CALL' : 'PUT'}</div>
                                </div>
                                <button 
                                    onClick={handleToggleDetails}
                                    className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                                >
                                    <X size={16} />
                                </button>
                            </div>

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
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* --- LASER BEAM (Manual Fire) --- */}
            <AnimatePresence>
                {laserShots.map((shot) => (
                    <motion.div
                        key={`laser-${shot.id}`}
                        initial={{ left: '80px', opacity: 1, scale: 1 }}
                        animate={{ left: 'calc(100% - 8.5rem)', opacity: 1, scale: 1 }} // End near planet
                        exit={{ opacity: 0, scale: 1 }} // Fade only
                        transition={{ duration: 0.5, ease: "linear" }}
                        style={{ marginTop: shot.offset }} // Random Y Position
                        className="absolute top-1/2 -translate-y-1/2 w-8 h-8 z-25 pointer-events-none drop-shadow-[0_0_6px_rgba(229,231,235,0.7)]"
                    >
                        {/* Laser SVG (Rotated 90deg to travel right) */}
                        <svg
                            viewBox="0 0 16 16"
                            xmlns="http://www.w3.org/2000/svg"
                            shapeRendering="crispEdges"
                            className="w-full h-full rotate-90 origin-center"
                        >
                            <rect x="7" y="2" width="1" height="12" fill="#e5e7eb">
                                <animate attributeName="height" values="12;14;12" dur="0.2s" repeatCount="indefinite" />
                            </rect>
                            <rect x="9" y="2" width="1" height="12" fill="#e5e7eb">
                                <animate attributeName="height" values="12;14;12" dur="0.2s" repeatCount="indefinite" />
                            </rect>
                            <rect x="8" y="0" width="1" height="16" fill="#e5e7eb" opacity="0.3">
                                <animate attributeName="opacity" values="0.6;0.9;0.6" dur="0.2s" repeatCount="indefinite" />
                            </rect>
                        </svg>
                    </motion.div>
                ))}
            </AnimatePresence>
            
            {/* Separate Muzzle Flash (Static at Ship) */}
            <AnimatePresence>
                {laserShots.map((shot) => (
                    <motion.div 
                        key={`muzzle-${shot.id}`}
                        initial={{ opacity: 1, scale: 0.5 }}
                        animate={{ opacity: 0, scale: 1.5 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        style={{ marginTop: shot.offset }} // Sync with Laser Y
                        className="absolute left-[84px] top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full blur-[4px] z-25 pointer-events-none"
                    />
                ))}
            </AnimatePresence>
            
            {/* --- SHIP (LEFT) --- */}
            <motion.div 
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1, y: [0, -10, 0] }}
                transition={{ 
                    x: { duration: 0.5 },
                    y: { repeat: Infinity, duration: 4, ease: "easeInOut" }
                }}
                className="relative z-10 flex flex-col items-center" // Flex col to stack ship and tag
            >
                <div className="w-20 h-20 relative">
                    <Image 
                        src={shipAsset} 
                        alt="Ship" 
                        fill 
                        className="object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] -rotate-90 scale-y-[-1]" 
                    />
                    
                    {/* ENGINE NITRO - PLASMA EFFECT */}
                    {/* Moved further left (-left-8) to avoid overlap. Added z-index to stay behind if needed, but relative positioning handles it contextually. */}
                    <div className="absolute -left-6 top-1/2 -translate-y-1/2 flex items-center z-[-1]">
                         {/* Main Plasma Core - smoother gradients */}
                        <motion.div 
                            animate={{ scaleX: [1, 1.3, 1], opacity: [0.7, 0.9, 0.7] }}
                            transition={{ duration: 0.15, repeat: Infinity, ease: "linear" }}
                            className={`w-16 h-8 rounded-full blur-[4px] mix-blend-screen ${
                                isEth 
                                ? "bg-[radial-gradient(ellipse_at_right,_var(--tw-gradient-stops))] from-white via-emerald-400 to-transparent" 
                                : "bg-[radial-gradient(ellipse_at_right,_var(--tw-gradient-stops))] from-white via-orange-400 to-transparent"
                            }`} 
                        />
                        
                        {/* Secondary Glow - larger and softer */}
                         <motion.div 
                            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                            transition={{ duration: 0.4, repeat: Infinity, ease: "easeInOut" }}
                            className={`absolute left-2 w-24 h-12 rounded-full blur-[8px] mix-blend-add ${
                                isEth ? "bg-emerald-600/50" : "bg-red-600/50"
                            }`} 
                        />

                         {/* Speed Lines/Particles - subtle */}
                         <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-full overflow-visible">
                            {[...Array(4)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ x: 0, opacity: 0.8, scale: 0.5 }}
                                    animate={{ x: -60, opacity: 0, scale: 0 }}
                                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15, ease: 'easeOut' }}
                                    className={`absolute top-1/2 left-4 w-1 h-0.5 rounded-full blur-[1px] ${isEth ? "bg-white" : "bg-yellow-100"}`}
                                />
                            ))}
                         </div>
                    </div>
                </div>

                {/* Pilot Info - Tactical Data (Moved to follow ship) */}
                <div className="z-20"> {/* Negative margin to pull it closer to ship if needed */}
                    <div className="text-[10px] font-pixel text-slate-300 bg-black/60 px-2 py-0.5 rounded border border-white/10 text-center backdrop-blur-sm whitespace-nowrap">
                        <div>{position.underlyingAsset} {isCall ? 'STRIKER' : 'BOMBER'}</div>
                        <div className="text-[8px] text-slate-500 font-mono">TARGET: ${strikePrice?.toLocaleString()}</div>
                    </div>
                </div>
            </motion.div>

            {/* --- MISSILES --- */}
            <AnimatePresence>
                {isShooting && (
                    <>
                        {/* Top Wing Missile */}
                        <motion.div
                            key="missile-top"
                            initial={{ left: '80px', top: 'calc(50% - 32px)', opacity: 1, scale: 0.5 }}
                            animate={{ left: 'calc(100% - 90px)', opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.5 }} 
                            transition={{ duration: 0.6, ease: "linear" }}
                            className="absolute w-6 h-6 z-20 pointer-events-none"
                        >
                            <Image src={missileAsset} alt="Missile" fill className="object-contain rotate-90 drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]" />
                        </motion.div>

                        {/* Bottom Wing Missile */}
                        <motion.div
                            key="missile-bottom"
                            initial={{ left: '80px', top: 'calc(50% + 8px)', opacity: 1, scale: 0.5 }}
                            animate={{ left: 'calc(100% - 90px)', opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.5 }} 
                            transition={{ duration: 0.6, ease: "linear" }}
                            className="absolute w-6 h-6 z-20 pointer-events-none"
                        >
                            <Image src={missileAsset} alt="Missile" fill className="object-contain rotate-90 drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]" />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* --- PLANET (RIGHT) --- */}
            <motion.div 
                initial={{ x: 100, opacity: 0 }}
                animate={{ 
                    opacity: 1,
                    // Shake when hit (sync with shooting duration approx)
                    x: isHit ? [0, 5, -5, 5, -5, 0] : 0,
                    scale: isHit ? [1, 0.95, 1.05, 1] : 1
                }}
                transition={{ 
                    x: { duration: 0.3 },
                    scale: { duration: 0.2 },
                    default: { duration: 0.5 }
                }}
                // Translate Y to center the PLANET body with the missiles (compensating for HP bar)
                className="relative z-30 flex flex-col items-center gap-2 translate-y-4"
            >
                <div className="relative w-24 h-24">
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                        className="w-full h-full"
                    >
                        <Image 
                            src={planetAsset} 
                            alt="Target Planet" 
                            fill 
                            className="object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]" 
                        />
                    </motion.div>
                    
                    {/* IMPACT EXPLOSION ACROSS PLANET */}
                    <AnimatePresence>
                        {isHit && (
                            <svg viewBox="0 0 16 16" className="absolute inset-0 w-full h-full z-20 pointer-events-none overflow-visible">
                                {[
                                    // Core
                                    {x: 7, y: 7}, {x: 8, y: 7}, {x: 7, y: 8}, {x: 8, y: 8},
                                    // Ring 1
                                    {x: 6, y: 7}, {x: 9, y: 7}, {x: 7, y: 6}, {x: 7, y: 9},
                                    {x: 6, y: 8}, {x: 9, y: 8}, {x: 8, y: 6}, {x: 8, y: 9},
                                    // Outer Debris
                                    {x: 5, y: 5}, {x: 10, y: 5}, {x: 5, y: 10}, {x: 10, y: 10},
                                    {x: 4, y: 7}, {x: 11, y: 7}, {x: 7, y: 4}, {x: 7, y: 11},
                                    {x: 8, y: 3}, {x: 3, y: 8}, {x: 12, y: 8}, {x: 8, y: 12}
                                ].map((p, i) => (
                                    <motion.rect
                                        key={i}
                                        x={p.x}
                                        y={p.y}
                                        width="1"
                                        height="1"
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{
                                            scale: [0, 1, 1, 1, 1.5],
                                            opacity: [0, 1, 1, 1, 0],
                                            fill: ["#ffffff", "#ffffff", "#ffff00", "#ff6600", "#444444"]
                                        }}
                                        transition={{
                                            duration: 0.6,
                                            times: [0, 0.1, 0.3, 0.6, 1],
                                            delay: (Math.random() * 0.15), // Remove base delay if using isHit (triggered on impact)
                                            ease: "easeOut"
                                        }}
                                        style={{ 
                                            transformOrigin: `${p.x + 0.5}px ${p.y + 0.5}px` 
                                        }}
                                    />
                                ))}
                            </svg>
                        )}
                    </AnimatePresence>
                </div>

                {/* HP BAR */}
                <div className="w-32 space-y-1">
                    <div className="flex justify-between text-[8px] font-mono text-slate-400 uppercase">
                        <span>{planetType} CORE</span>
                        <span>{hpPercent.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                        <motion.div 
                            className="h-full bg-gradient-to-r from-red-600 to-red-400"
                            animate={{ width: `${hpPercent}%` }}
                        />
                    </div>
                </div>
            </motion.div>

            {/* --- HUD FOOTER (ABSOLUTE BOTTOM of FRAME) --- */}
            {/* Added pointer-events-auto for buttons */}
            <div className="absolute bottom-0 left-0 right-0 z-40 flex items-end justify-between px-4 pb-2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
                 {/* Left: Spacer (was Ship Tag) */}
                 <div className="w-20"></div>

                {/* Center: Countdown Timer */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 pb-1">
                    <div className="text-xl font-mono font-bold text-white bg-slate-900/90 px-4 py-1 rounded-t-xl border-t border-x border-white/20 shadow-[0_0_15px_rgba(0,0,0,0.8)]">
                        {timeLeftStr}
                    </div>
                </div>

                {/* Right: Info Button (Replaces Mark Price) */}
                <button 
                    onClick={handleToggleDetails}
                    className="p-2 bg-slate-800/80 border border-white/20 rounded hover:bg-slate-700 hover:text-white text-emerald-400 transition-all pointer-events-auto shadow-lg active:scale-95"
                >
                    <Info size={16} />
                </button>
            </div>
        </div>
    );
};
