"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock } from "lucide-react";
import { useGamification } from "@/context/GamificationContext";

interface MedalCaseProps {
    isOpen: boolean;
    onClose: () => void;
}

export const MedalCase = ({ isOpen, onClose }: MedalCaseProps) => {
    const { achievements } = useGamification();

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative bg-slate-900 border-4 border-yellow-600 rounded-xl p-6 max-w-lg w-full shadow-[0_0_50px_rgba(202,138,4,0.3)]"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6 border-b border-slate-700 pb-4">
                            <div>
                                <h2 className="text-xl font-pixel text-yellow-500">MEDAL CASE</h2>
                                <p className="text-xs font-mono text-slate-400 uppercase mt-1">Service Record & Honors</p>
                            </div>
                            <button onClick={onClose} className="text-slate-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Grid */}
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                            {achievements.map((badge) => (
                                <div key={badge.id} className="group relative flex flex-col items-center">
                                    <div
                                        className={`w-16 h-16 rounded-full border-4 flex items-center justify-center text-2xl transition-all duration-300
                      ${badge.isUnlocked
                                                ? "bg-slate-800 border-yellow-500 shadow-[0_0_15px_#eab308] scale-100"
                                                : "bg-black border-slate-700 grayscale opacity-50"
                                            }`}
                                    >
                                        {badge.isUnlocked ? badge.icon : <Lock size={20} className="text-slate-600" />}
                                    </div>

                                    <div className="text-[10px] font-pixel text-center mt-2 leading-tight">
                                        <span className={badge.isUnlocked ? "text-white" : "text-slate-600"}>
                                            {badge.title}
                                        </span>
                                    </div>

                                    {/* Tooltip */}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-32 p-2 bg-black border border-slate-600 rounded text-[9px] text-center opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                                        <div className="text-yellow-500 font-bold mb-1">{badge.xpReward} XP</div>
                                        <div className="text-slate-300">{badge.description}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Footer Status */}
                        <div className="mt-8 text-center">
                            <div className="text-[10px] font-mono text-slate-500 bg-slate-800/50 py-1 rounded">
                                UNLOCKED: {achievements.filter(a => a.isUnlocked).length} / {achievements.length}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
