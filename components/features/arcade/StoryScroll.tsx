"use client";

import React from "react";
import { motion } from "framer-motion";

export const StoryScroll = ({ onComplete }: { onComplete: () => void }) => {
  return (
    <div className="fixed inset-y-0 left-0 right-0 md:left-1/2 md:-translate-x-1/2 w-full max-w-md bg-gradient-to-b from-black via-slate-950 to-black z-[100] flex items-center justify-center overflow-hidden border-x border-slate-800/50">
      {/* Animated Starfield Background */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [0.5, 1.5, 0.5],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-[scan_4s_linear_infinite]" />
      </div>

      {/* Grid Overlay */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }} />

      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black opacity-60 pointer-events-none" />

      {/* Star Wars Style Crawl Container */}
      <div 
        className="absolute inset-0 flex items-end justify-center pb-0 overflow-hidden"
        style={{ 
          perspective: '500px',
          perspectiveOrigin: 'center top'
        }}
      >
        <motion.div
           initial={{ y: '100%', opacity: 0 }}
           animate={{ y: '-500%', opacity: 1 }}
           transition={{ 
             duration: 65, 
             ease: "linear",
             opacity: { duration: 4 }
           }}
           onAnimationComplete={onComplete}
           className="w-full max-w-2xl px-4 pb-60"
           style={{ 
             transform: 'rotateX(25deg)',
             transformStyle: 'preserve-3d',
             transformOrigin: 'bottom center'
           }}
         >
          {/* Episode Header with Glow */}
          <div className="text-center mb-12 space-y-4">
            <motion.div
              animate={{ 
                textShadow: [
                  '0 0 10px rgba(234, 179, 8, 0.5)',
                  '0 0 25px rgba(234, 179, 8, 0.8)',
                  '0 0 10px rgba(234, 179, 8, 0.5)',
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-4xl md:text-5xl font-black font-pixel text-yellow-400 tracking-widest drop-shadow-[0_0_30px_rgba(234,179,8,0.7)]"
            >
              EPISODE IV
            </motion.div>
            <h2 className="text-3xl md:text-4xl font-pixel text-cyan-300 tracking-wider drop-shadow-[0_0_20px_rgba(34,211,238,0.6)]">
              A NEW ALPHA
            </h2>
            <div className="h-1 w-32 mx-auto bg-gradient-to-r from-transparent via-yellow-400 to-transparent" />
          </div>

          {/* Story Text with Better Styling */}
          <div className="space-y-8 text-center">
            <p className="text-[10px] md:text-xs leading-loose text-yellow-400 font-pixel drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] text-balance uppercase tracking-[0.2em] antialiased [text-rendering:optimizeSpeed]">
              It is a time of <span className="text-rose-500 font-bold underline decoration-2 underline-offset-4">volatility</span>. 
              Monsters have overtaken the <span className="text-cyan-400">Bit Nebula</span>, 
              causing chaos in the markets.
            </p>
            
            <p className="text-[10px] md:text-xs leading-loose text-yellow-400 font-pixel drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] text-balance uppercase tracking-[0.2em] antialiased [text-rendering:optimizeSpeed]">
              You are an elite pilot of the <span className="text-yellow-200 font-bold">ALPHABIT SQUAD</span>. 
              Your mission: Hunt down the premiums and restore balance to the portfolio.
            </p>
            
            <p className="text-[10px] md:text-xs leading-loose text-yellow-400 font-pixel drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] text-balance uppercase tracking-[0.2em] antialiased [text-rendering:optimizeSpeed]">
              Choose your ship, lock your target, and <span className="text-emerald-400 font-bold">secure the bag</span>
              ... before the expiry strikes!
            </p>

            {/* Call to Action */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 3, duration: 1 }}
              className="pt-12"
            >
              <div className="inline-block px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-pixel text-xl rounded-lg shadow-[0_0_30px_rgba(234,179,8,0.6)] border-2 border-yellow-300">
                READY YOUR WEAPONS
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Enhanced Skip Button */}
      <motion.button 
        onClick={onComplete}
        whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
        whileTap={{ scale: 0.95 }}
        className="absolute bottom-6 right-6 text-xs font-pixel text-cyan-400 border-2 border-cyan-500/50 px-4 py-2 rounded hover:bg-cyan-500/10 transition-all backdrop-blur-sm shadow-[0_0_10px_rgba(34,211,238,0.3)]"
      >
        SKIP &gt;&gt;
      </motion.button>

      {/* Corner Decorations */}
      <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-yellow-400/30" />
      <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-cyan-400/30" />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-yellow-400/30" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-cyan-400/30" />
    </div>
  );
};
