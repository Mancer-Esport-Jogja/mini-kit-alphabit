"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { LandingPage } from "@/components/features/LandingPage";
import { HuntTerminal } from "@/components/features/HuntTerminal";
import { PositionsList } from "@/components/features/PositionsList";
import { LiquidityEngine } from "@/components/features/LiquidityEngine";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { TrendingUp, Hammer } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Marquee } from "@/components/ui/Marquee";

export default function App() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState("landing");
  const [mode, setMode] = useState("HUNT");
  const [glitch, setGlitch] = useState(false);



  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.95) {
        setGlitch(true);
        setTimeout(() => setGlitch(false), 200);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`min-h-screen h-screen bg-void-black text-slate-200 max-w-md mx-auto border-x border-slate-800/50 relative overflow-y-auto overflow-x-hidden scroll-smooth ${glitch ? "opacity-95" : ""}`}>
      {/* SCANLINE EFFECT GLOBAL */}
      <div className="fixed inset-0 pointer-events-none z-[60] opacity-5">
          <div className="w-full h-2 bg-white blur-sm absolute animate-scanline"></div>
      </div>
      
      <AnimatePresence mode="wait">
        {isLoading ? (
          <LoadingScreen
            key="loader"
            onLoadingComplete={() => setIsLoading(false)}
            minDuration={2500}
          />
        ) : view === "landing" ? (
          <motion.div 
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <LandingPage onStart={() => setView("home")} />
          </motion.div>
        ) : (
          <motion.div 
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-slate-900 pb-10 relative min-h-full"
          >
            <div className="fixed inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none"></div>

            <Header />

            <main className="p-4 relative z-10">
              <div className="bg-black border-x-4 border-slate-700 h-6 mb-6 flex items-center overflow-hidden">
                <Marquee 
                  text={`/// ALPHABIT SYSTEM READY /// CONNECTED TO BASE MAINNET /// THETANUTS PROTOCOL ACTIVE /// MODE: ${mode} /// `}
                  speed={20}
                  className="text-[8px] text-green-400 font-pixel"
                />
              </div>

              {/* MODE SWITCHER */}
              <div className="flex bg-black p-1 border-2 border-slate-700 mb-6 relative">
                <button
                  type="button"
                  onClick={() => setMode("HUNT")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 font-bold text-[10px] uppercase tracking-wider relative z-10 font-pixel transition-colors duration-300 ${mode === "HUNT" ? "text-black" : "text-slate-500 hover:text-slate-300"}`}
                >
                  <TrendingUp size={14} />
                  HUNT
                </button>
                <button
                  type="button"
                  onClick={() => setMode("FARM")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 font-bold text-[10px] uppercase tracking-wider relative z-10 font-pixel transition-colors duration-300 ${mode === "FARM" ? "text-black" : "text-slate-500 hover:text-slate-300"}`}
                >
                  <Hammer size={14} />
                  FARM
                </button>
                <motion.div
                  layoutId="mode-bg"
                  className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white"
                  initial={false}
                  animate={{ x: mode === "HUNT" ? 0 : "100%" }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              </div>

              {mode === "HUNT" ? (
                <>
                  <HuntTerminal />
                  <PositionsList />
                </>
              ) : (
                <LiquidityEngine />
              )}
            </main>

            <div className="text-center pb-4 font-mono text-[8px] text-slate-600">
              [ SYSTEM_ID: BASE_MAINNET ] [ v2.1.0 ]
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
