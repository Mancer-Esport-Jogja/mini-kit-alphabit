"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { LandingPage } from "@/components/features/LandingPage";
import { HuntTerminal } from "@/components/features/HuntTerminal";
import { PositionsList } from "@/components/features/PositionsList";
import { ArcadeMode } from "@/components/features/ArcadeMode";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { TrendingUp, Gamepad2 } from "lucide-react";

import { Marquee } from "@/components/ui/Marquee";
import { Onboarding } from "@/components/features/onboarding/Onboarding";
import { PortfolioView } from "@/components/features/PortfolioView";

export default function App() {

  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState("landing");
  const [mode, setMode] = useState<'PRO' | 'ARCADE'>("PRO");
  const [glitch, setGlitch] = useState(false);

  // Check onboarding status on start
  const handleStart = () => {
    const hasOnboarded = localStorage.getItem("has_onboarded");
    if (hasOnboarded) {
      setMode("ARCADE");
      setView("home");
    } else {
      setView("onboarding");
    }
  };

  const handleOnboardingComplete = (profile: any) => {
    // Save profile to local storage (and potentially sync to backend later)
    localStorage.setItem("has_onboarded", "true");
    localStorage.setItem("risk_profile", JSON.stringify(profile));
    
    setMode("ARCADE");
    setView("home");
  };

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
            <LandingPage onStart={handleStart} />
          </motion.div>
        ) : view === "onboarding" ? (
          <motion.div
            key="onboarding"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
             <Onboarding onComplete={handleOnboardingComplete} />
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
              {view === "portfolio" ? (
                <PortfolioView onBack={() => setView("home")} />
              ) : (
                <>
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
                      onClick={() => setMode("ARCADE")}
                      className={`relative flex-1 flex items-center justify-center gap-2 py-2 font-bold text-[10px] uppercase tracking-wider font-pixel transition-colors duration-300 ${mode === "ARCADE" ? "text-black" : "text-slate-500 hover:text-slate-300"}`}
                    >
                      {mode === "ARCADE" && (
                        <motion.div
                          layoutId="mode-bg"
                          className="absolute inset-0 bg-white pointer-events-none"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        <Gamepad2 size={14} />
                        ARCADE
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode("PRO")}
                      className={`relative flex-1 flex items-center justify-center gap-2 py-2 font-bold text-[10px] uppercase tracking-wider font-pixel transition-colors duration-300 ${mode === "PRO" ? "text-black" : "text-slate-500 hover:text-slate-300"}`}
                    >
                      {mode === "PRO" && (
                        <motion.div
                          layoutId="mode-bg"
                          className="absolute inset-0 bg-white pointer-events-none"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        <TrendingUp size={14} />
                        PRO
                      </span>
                    </button>
                  </div>

                  {mode === "ARCADE" ? (
                    <ArcadeMode onViewAnalytics={() => setView("portfolio")} />
                  ) : (
                    <>
                      <HuntTerminal />
                      <div className="mt-2 text-center">
                        <button 
                          onClick={() => setView("portfolio")}
                          className="text-[8px] font-pixel text-slate-500 hover:text-white transition-colors uppercase border border-slate-800 px-3 py-1 bg-black/20"
                        >
                          Access Full Mission Records / History
                        </button>
                      </div>
                      <PositionsList onOpenHistory={() => setView("portfolio")} />
                    </>
                  )}
                </>
              )}
            </main>

            <div className="text-center pb-4 font-mono text-[8px] text-slate-600">
              [ SYSTEM_ID: BASE_MAINNET ] [ v2.2.0-{mode} ]
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
