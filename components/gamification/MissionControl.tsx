"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckSquare, Square, Trophy, X, ChevronRight } from "lucide-react";
import { useGamification } from "@/context/GamificationContext";
import { LevelBadge } from "./LevelBadge";
import { MedalCase } from "./MedalCase";

interface MissionControlProps {
    isOpen: boolean;
    onClose: () => void;
}

export const MissionControl = ({ isOpen, onClose }: MissionControlProps) => {
    const {
        level, xp, maxXp, rankTitle, missions,
    } = useGamification();

    const [showMedals, setShowMedals] = useState(false);
    const xpPercentage = Math.min((xp / maxXp) * 100, 100);

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="absolute inset-0 bg-black/60 z-30"
                        />

                        {/* Drawer Panel */}
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            className="absolute top-12 left-2 right-2 z-40 bg-slate-900 border-2 border-slate-600 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden"
                        >
                            {/* Header Section */}
                            <div className="bg-slate-800 p-4 pb-6 flex items-start justify-between relative overflow-hidden">
                                {/* Background Decor - Added pointer-events-none */}
                                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                    <Trophy size={100} />
                                </div>

                                <div className="flex gap-3 relative z-10">
                                    <LevelBadge level={level} size="lg" />
                                    <div>
                                        <h2 className="text-sm font-pixel text-white uppercase tracking-wider">{rankTitle}</h2>
                                        <div className="text-[10px] font-mono text-slate-400 mb-2">Level {level} Pilot</div>

                                        {/* XP Bar */}
                                        <div className="w-32">
                                            <div className="h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-700 relative">
                                                <motion.div
                                                    className="absolute h-full bg-gradient-to-r from-blue-500 to-purple-500"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${xpPercentage}%` }}
                                                    transition={{ duration: 1 }}
                                                />
                                            </div>
                                            <div className="flex justify-between text-[8px] font-mono text-slate-500 mt-1">
                                                <span>{xp} XP</span>
                                                <span>{maxXp} XP</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Close Button - Increased z-index and padding */}
                                <button
                                    onClick={onClose}
                                    className="relative z-20 p-2 -mr-2 -mt-2 text-slate-500 hover:text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Dashboard Actions */}
                            <div className="p-4 bg-slate-900 relative">
                                {/* Wave Separator */}
                                <div className="absolute -top-3 left-0 right-0 h-3 bg-slate-900" style={{ borderRadius: '50% 50% 0 0 / 100% 100% 0 0' }}></div>

                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-[10px] font-pixel text-slate-500 uppercase tracking-widest">Active Bounties</h3>
                                    <button
                                        onClick={() => setShowMedals(true)}
                                        className="flex items-center gap-1 text-[10px] font-mono text-yellow-500 hover:text-yellow-400 transition-colors"
                                    >
                                        <Trophy size={12} />
                                        <span>MEDALS &gt;&gt;</span>
                                    </button>
                                </div>

                                {/* Mission List */}
                                <div className="space-y-2">
                                    {missions.filter(m => m.type === 'DAILY').map((mission) => (
                                        <div
                                            key={mission.id}
                                            className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${mission.isCompleted
                                                    ? "bg-slate-800/30 border-slate-800 opacity-60"
                                                    : "bg-slate-800 border-slate-700 shadow-sm"
                                                }`}
                                        >
                                            <div className={`p-1.5 rounded-md ${mission.isCompleted ? "bg-green-500/10 text-green-500" : "bg-slate-700 text-slate-400"}`}>
                                                {mission.isCompleted ? <CheckSquare size={16} /> : <Square size={16} />}
                                            </div>
                                            <div className="flex-1">
                                                <div className={`text-xs font-mono mb-0.5 ${mission.isCompleted ? "text-slate-500" : "text-white"}`}>
                                                    {mission.title}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] text-yellow-500 font-bold">+{mission.xpReward} XP</span>
                                                    {mission.isCompleted && <span className="text-[9px] text-green-500 uppercase">COMPLETED</span>}
                                                </div>
                                            </div>
                                            {!mission.isCompleted && <ChevronRight size={14} className="text-slate-600" />}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="bg-slate-900 p-3 pt-0 text-center">
                                <span className="text-[8px] font-mono text-slate-600">Daily assignments reset in 12:45:00</span>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Achievement Modal - Placed here to share the context scope if needed, though strictly it's independent */}
            <MedalCase isOpen={showMedals} onClose={() => setShowMedals(false)} />
        </>
    );
};
