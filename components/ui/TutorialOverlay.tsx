"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HelpCircle, ChevronRight } from 'lucide-react';

interface TutorialOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    steps: {
        title: string;
        description: string;
        icon?: React.ReactNode;
    }[];
}

export const TutorialOverlay = ({ isOpen, onClose, title, steps }: TutorialOverlayProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col p-6"
                >
                    <div className="flex justify-between items-center mb-6 border-b-2 border-slate-700 pb-4">
                        <div className="flex items-center gap-2">
                            <HelpCircle className="text-yellow-400 animate-pulse" size={20} />
                            <h3 className="font-pixel text-yellow-400 text-sm">{title}</h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-slate-500 hover:text-white transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex gap-4"
                            >
                                <div className="flex-shrink-0 w-8 h-8 bg-slate-800 border-2 border-slate-600 flex items-center justify-center font-pixel text-xs text-yellow-500 rounded">
                                    {index + 1}
                                </div>
                                <div>
                                    <h4 className="font-pixel text-xs text-white mb-1 flex items-center gap-2">
                                        {step.title}
                                    </h4>
                                    <p className="font-grotesk text-sm text-slate-400 leading-relaxed">
                                        {step.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <button
                        onClick={onClose}
                        className="mt-6 w-full bg-yellow-500 text-black font-pixel text-xs py-3 hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2"
                    >
                        ACKNOWLEDGE MISSION <ChevronRight size={14} />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
