"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

interface PlanetCardProps {
  name: string;
  timeframe: string;
  type: "MAGMA" | "ICE" | "GAS" | "TERRA";
  isSelected: boolean;
  isAvailable?: boolean;
  onClick: () => void;
}

const PLANET_ASSETS = {
  MAGMA: "/assets/planet-magma.svg",
  ICE: "/assets/planet-nova.svg", 
  GAS: "/assets/planet-astra.svg",
  TERRA: "/assets/planet-pandora.svg",
};

export const PlanetCard = ({ name, timeframe, type, isSelected, isAvailable = true, onClick }: PlanetCardProps) => {
  return (
    <motion.div
      onClick={onClick}
      whileTap={isAvailable ? { scale: 0.95 } : {}}
      whileHover={isAvailable ? { scale: 1.02 } : {}}
      animate={isSelected ? { scale: 1.05, borderColor: "#10b981" } : { scale: 1, borderColor: "rgba(255,255,255,0.1)" }}
      className={`relative flex flex-col items-center justify-center p-4 border-2 rounded-xl backdrop-blur-sm transition-all duration-300 cursor-pointer group ${
        !isAvailable ? "opacity-60 border-slate-800 bg-slate-900/40" :
        isSelected ? "bg-emerald-900/20 shadow-[0_0_20px_rgba(16,185,129,0.3)] border-emerald-500" : 
        "bg-black/40 hover:bg-white/5 border-slate-700"
      }`}
    >
      <div className={`w-16 h-16 relative mb-2 ${isAvailable ? "animate-[spin_20s_linear_infinite]" : ""}`}>
        <Image 
          src={PLANET_ASSETS[type]} 
          alt={name} 
          fill 
          className="object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]" 
        />
      </div>
      
      <div className="text-center">
        <div className="text-sm font-black font-pixel text-white uppercase tracking-wider mb-1">{name}</div>
        <div className={`text-[10px] font-mono px-2 py-1 rounded border ${
            isAvailable ? "text-emerald-400 bg-emerald-900/30 border-emerald-800" : "text-slate-500 bg-slate-900/30 border-slate-800"
        }`}>
          {isAvailable ? timeframe : "0 TARGETS"}
        </div>
      </div>

      {isSelected && (
        <div className="absolute -top-2 -right-2 bg-emerald-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg border border-white animate-pulse">
            TARGETED
        </div>
      )}

      {!isAvailable && (
        <>
            <div className="absolute inset-0 bg-[url('/assets/grid-bg.png')] opacity-10 pointer-events-none" />
            <div className="absolute inset-0 flex items-center justify-center rounded-xl">
                <div className="font-pixel text-[8px] text-slate-400 bg-black/90 px-3 py-1.5 border border-slate-700 shadow-xl tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    SECTOR EMPTY
                </div>
            </div>
        </>
      )}
    </motion.div>
  );
};
