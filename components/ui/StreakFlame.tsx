"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StreakFlameProps {
    streak: number;
    size?: 'sm' | 'md';
}

// 10 Level Streak Animation Styles
const STREAK_STYLES = [
    // Level 0: Idle - Brown border (like original), no animation
    { name: "STBY", color: "#475569", glow: "none", borderColor: "border-[#854d0e]", bgColor: "bg-black", particles: 0 },
    // Level 1: Spark - Blue, subtle pulse
    { name: "SPARK", color: "#60a5fa", glow: "0 0 8px #3b82f6", borderColor: "border-blue-500/50", bgColor: "bg-blue-950/30", particles: 0 },
    // Level 2: Flicker - Green
    { name: "FLKR", color: "#34d399", glow: "0 0 10px #10b981", borderColor: "border-emerald-500/50", bgColor: "bg-emerald-950/30", particles: 2 },
    // Level 3: Kindle - Lime
    { name: "KNDL", color: "#a3e635", glow: "0 0 12px #84cc16", borderColor: "border-lime-500/50", bgColor: "bg-lime-950/30", particles: 3 },
    // Level 4: Glow - Yellow
    { name: "GLOW", color: "#fbbf24", glow: "0 0 15px #f59e0b", borderColor: "border-yellow-500/50", bgColor: "bg-yellow-950/30", particles: 4 },
    // Level 5: Burn - Orange
    { name: "BURN", color: "#fb923c", glow: "0 0 18px #f97316", borderColor: "border-orange-500/50", bgColor: "bg-orange-950/30", particles: 5 },
    // Level 6: Blaze - Red
    { name: "BLZE", color: "#f87171", glow: "0 0 22px #ef4444", borderColor: "border-red-500/50", bgColor: "bg-red-950/40", particles: 6 },
    // Level 7: Inferno - Purple
    { name: "INFR", color: "#c084fc", glow: "0 0 26px #a855f7", borderColor: "border-purple-500/50", bgColor: "bg-purple-950/40", particles: 8 },
    // Level 8: Plasma - Pink
    { name: "PLSM", color: "#f472b6", glow: "0 0 30px #ec4899", borderColor: "border-pink-500/50", bgColor: "bg-pink-950/40", particles: 10 },
    // Level 9: Supernova - Cyan
    { name: "NOVA", color: "#22d3ee", glow: "0 0 35px #06b6d4", borderColor: "border-cyan-400/70", bgColor: "bg-cyan-950/50", particles: 12 },
    // Level 10: Godly - Rainbow/White
    { name: "GODLY", color: "#ffffff", glow: "0 0 40px #ffffff, 0 0 60px #f59e0b", borderColor: "border-white", bgColor: "bg-gradient-to-r from-red-900/40 via-yellow-900/40 to-cyan-900/40", particles: 15 }
];

export const StreakFlame: React.FC<StreakFlameProps> = ({ streak, size = 'sm' }) => {
    // Cap level at 10
    const level = Math.min(streak, 10);
    const style = STREAK_STYLES[level];

    // Size configurations - increased flame sizes for better visibility
    const sizeConfig = {
        sm: { containerClass: "px-2 py-1", iconSize: 16, textSize: "text-xs", flameViewBox: "0 0 14 14" },
        md: { containerClass: "px-3 py-1.5", iconSize: 20, textSize: "text-sm", flameViewBox: "0 0 16 16" }
    };
    const cfg = sizeConfig[size];

    // Flame trembling for high levels
    const containerVariants = {
        idle: {},
        tremble: {
            x: [-0.3, 0.3, -0.3],
            transition: { repeat: Infinity, duration: 0.08 }
        },
        godly: {
            filter: ["hue-rotate(0deg)", "hue-rotate(360deg)"],
            transition: { repeat: Infinity, duration: 2, ease: "linear" as const }
        }
    };

    const getContainerAnimation = () => {
        if (level === 10) return "godly";
        if (level >= 7) return "tremble";
        return "idle";
    };

    return (
        <motion.div
            variants={containerVariants}
            animate={getContainerAnimation()}
            className={`
                relative flex items-center gap-1.5 
                ${cfg.containerClass} 
                border ${style.borderColor} ${style.bgColor}
                transition-all duration-300
            `}
            style={{ boxShadow: level > 0 ? style.glow : 'none' }}
        >
            {/* Flame Icon with Animation */}
            <div className="relative flex items-center justify-center" style={{ marginTop: '-1px' }}>
                <motion.svg
                    width={cfg.iconSize}
                    height={cfg.iconSize}
                    viewBox="0 0 24 24"
                    animate={level > 0 ? {
                        scale: [1, 1.05 + (level * 0.02), 1],
                    } : {}}
                    transition={{ repeat: Infinity, duration: 0.4 + (10 - level) * 0.05 }}
                >
                    {/* Main Flame Path */}
                    <motion.path
                        d="M12 2C12 2 7 7.5 7 12C7 14.7614 9.23858 17 12 17C14.7614 17 17 14.7614 17 12C17 7.5 12 2 12 2Z"
                        fill={style.color}
                        animate={level > 0 ? {
                            d: [
                                "M12 2C12 2 7 7.5 7 12C7 14.7614 9.23858 17 12 17C14.7614 17 17 14.7614 17 12C17 7.5 12 2 12 2Z",
                                "M12 1.5C12 1.5 6.5 7 6.5 12C6.5 15 9 17.5 12 17.5C15 17.5 17.5 15 17.5 12C17.5 7 12 1.5 12 1.5Z",
                                "M12 2C12 2 7 7.5 7 12C7 14.7614 9.23858 17 12 17C14.7614 17 17 14.7614 17 12C17 7.5 12 2 12 2Z"
                            ]
                        } : {}}
                        transition={{ repeat: Infinity, duration: 0.35 }}
                    />
                    {/* Inner Core (appears at level 1+) */}
                    {level > 0 && (
                        <motion.path
                            d="M12 8C12 8 10 10 10 12C10 13.1046 10.8954 14 12 14C13.1046 14 14 13.1046 14 12C14 10 12 8 12 8Z"
                            fill={level >= 10 ? "#000" : "#fff"}
                            animate={{ opacity: [0.4, 0.9, 0.4], scale: [0.95, 1.05, 0.95] }}
                            transition={{ repeat: Infinity, duration: 0.3 }}
                        />
                    )}
                </motion.svg>

                {/* Particle Embers (appears at level 2+) */}
                <AnimatePresence>
                    {style.particles > 0 && [...Array(style.particles)].map((_, i) => (
                        <motion.div
                            key={`ember-${level}-${i}`}
                            className="absolute rounded-full"
                            style={{
                                width: 2,
                                height: 2,
                                backgroundColor: style.color,
                                left: '50%',
                                top: '50%',
                            }}
                            initial={{ x: 0, y: 0, opacity: 1 }}
                            animate={{
                                x: (Math.random() - 0.5) * (15 + level * 3),
                                y: -(Math.random() * (20 + level * 4)),
                                opacity: 0,
                                scale: 0
                            }}
                            transition={{
                                repeat: Infinity,
                                duration: 0.5 + Math.random() * 0.4,
                                delay: Math.random() * 0.8
                            }}
                        />
                    ))}
                </AnimatePresence>
            </div>

            {/* Streak Counter */}
            <div className="flex items-center gap-0.5">
                <span className={`font-bold ${level === 0 ? 'text-slate-500' : 'text-white/30'} ${cfg.textSize} font-pixel`}>
                    x
                </span>
                <AnimatePresence mode="popLayout">
                    <motion.span
                        key={streak}
                        initial={{ scale: 0.5, opacity: 0, y: 5 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 1.3, opacity: 0, y: -5 }}
                        transition={{ type: "spring", stiffness: 500, damping: 25 }}
                        className={`font-bold font-pixel ${cfg.textSize}`}
                        style={{ color: style.color }}
                    >
                        {streak}
                    </motion.span>
                </AnimatePresence>
            </div>

            {/* Level Label (appears at level 1+) */}
            {level > 0 && (
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[6px] font-pixel tracking-wider ml-0.5 hidden sm:inline"
                    style={{ color: style.color }}
                >
                    {style.name}
                </motion.span>
            )}
        </motion.div>
    );
};

export default StreakFlame;
