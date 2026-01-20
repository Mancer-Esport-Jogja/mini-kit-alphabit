"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { LandingPage } from "@/components/features/LandingPage";
import { HuntTerminal } from "@/components/features/HuntTerminal";
import { PositionsList } from "@/components/features/PositionsList";
import { LiquidityEngine } from "@/components/features/LiquidityEngine";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { TrendingUp, Hammer } from "lucide-react";

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState("landing");
  const [mode, setMode] = useState("HUNT");
  const [streak] = useState(5);
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

  // --- LOADING SCREEN ---
  if (isLoading) {
    return (
      <AnimatePresence mode="wait">
        <LoadingScreen
          onLoadingComplete={() => setIsLoading(false)}
          minDuration={2500}
        />
      </AnimatePresence>
    );
  }

  // --- LANDING VIEW ---
  if (view === "landing") {
    return (
      <div
        className={`min-h-screen bg-void-black text-slate-200 max-w-md mx-auto border-x border-slate-800/50 relative overflow-x-hidden ${glitch ? "opacity-95" : ""}`}
      >
        <LandingPage onStart={() => setView("home")} />
      </div>
    );
  }

  // --- HOME VIEW ---
  return (
    <div
      className={`min-h-screen bg-slate-900 text-slate-200 pb-10 ${glitch ? "opacity-95" : ""} max-w-md mx-auto border-x border-slate-800`}
    >
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none"></div>

      <Header streak={streak} />

      <main className="p-4 relative z-10">
        <div className="bg-black border-x-4 border-slate-700 h-6 mb-6 flex items-center overflow-hidden">
          <p className="text-[8px] text-green-400 whitespace-nowrap animate-[marquee_10s_linear_infinite] font-pixel">
            {`/// ALPHABIT SYSTEM READY /// CONNECTED TO BASE MAINNET /// THETANUTS PROTOCOL ACTIVE /// MODE: ${mode} ///`}
          </p>
        </div>

        {/* MODE SWITCHER */}
        <div className="flex bg-black p-1 border-2 border-slate-700 mb-6 relative">
          <button
            type="button"
            onClick={() => setMode("HUNT")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 font-bold text-[10px] uppercase tracking-wider relative z-10 font-pixel ${mode === "HUNT" ? "text-black" : "text-slate-500 hover:text-slate-300"}`}
          >
            <TrendingUp size={14} />
            HUNT
          </button>
          <button
            type="button"
            onClick={() => setMode("FARM")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 font-bold text-[10px] uppercase tracking-wider relative z-10 font-pixel ${mode === "FARM" ? "text-black" : "text-slate-500 hover:text-slate-300"}`}
          >
            <Hammer size={14} />
            FARM
          </button>
          <div
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white transition-all duration-300 ${mode === "HUNT" ? "left-1" : "left-[calc(50%+2px)]"}`}
          ></div>
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
    </div>
  );
}
