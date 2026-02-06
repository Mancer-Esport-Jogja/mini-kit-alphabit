import React from 'react';
import { motion } from 'framer-motion';
import { Crosshair, Radio } from 'lucide-react';

export const TargetingSystem = () => {
    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-md mx-auto aspect-square relative flex items-center justify-center overflow-hidden bg-black/40 border border-emerald-900/30 rounded-full"
        >
             {/* Rotating Radar Sweep */}
             <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 4, ease: "linear", repeat: Infinity }}
                className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(16,185,129,0.2)_360deg)] rounded-full z-0"
            />
            
            {/* Grid Lines */}
            <div className="absolute inset-0 z-0 opacity-20">
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-emerald-500/50" />
                <div className="absolute top-1/2 left-0 right-0 h-px bg-emerald-500/50" />
                <div className="absolute inset-[15%] border border-emerald-500/30 rounded-full" />
                <div className="absolute inset-[35%] border border-emerald-500/30 rounded-full" />
                <div className="absolute inset-[60%] border border-emerald-500/30 rounded-full" />
            </div>

            {/* Central Targeting Reticle */}
            <div className="relative z-10 flex flex-col items-center gap-4">
                <motion.div
                    animate={{ scale: [1, 0.9, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <Crosshair className="w-16 h-16 text-emerald-400 opacity-80" />
                </motion.div>
                
                <div className="flex items-center gap-2 text-emerald-400/80">
                     <Radio className="w-4 h-4 animate-pulse" />
                     <span className="text-xs font-pixel tracking-widest animate-pulse">ACQUIRING SIGNAL...</span>
                </div>
            </div>

            {/* Scrolling Code / Data Stream */}
            <div className="absolute bottom-10 left-0 right-0 px-12 text-center overflow-hidden h-12">
                <motion.div
                    initial={{ y: 20 }}
                    animate={{ y: -200 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="flex flex-col gap-1"
                >
                    {Array.from({ length: 20 }).map((_, i) => (
                        <div key={i} className="text-[8px] font-mono text-emerald-500/50 whitespace-nowrap">
                            {`0x${Math.random().toString(16).slice(2, 10).toUpperCase()} :: ANALYZING VECTOR [${Math.floor(Math.random() * 999)}]`}
                        </div>
                    ))}
                </motion.div>
            </div>
            
            {/* Corner Indicators */}
            <div className="absolute top-4 left-4 text-[8px] font-mono text-emerald-600">SYS.NORMAL</div>
            <div className="absolute top-4 right-4 text-[8px] font-mono text-emerald-600">NET.SECURE</div>
            <div className="absolute bottom-4 left-4 text-[8px] font-mono text-emerald-600">LAT.00.00</div>
            <div className="absolute bottom-4 right-4 text-[8px] font-mono text-emerald-600">LON.00.00</div>
        </motion.div>
    );
};
