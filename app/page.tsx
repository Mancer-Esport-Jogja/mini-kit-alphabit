"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { HuntView } from "@/components/features/HuntView";
import { VaultView } from "@/components/features/VaultView";
import { VaultBriefing } from "@/components/features/VaultBriefing";
import { TrendingUp, Hammer, Shield, Trophy, Share2 } from "lucide-react";
import { PixelButton } from "@/components/ui/PixelButton";

import { VaultConfig } from "@/components/features/VaultBriefing";

export default function App() {
  const [view, setView] = useState('home');
  const [mode, setMode] = useState('HUNT');
  const [selectedDirection, setSelectedDirection] = useState<string | null>(null);
  const [selectedVault, setSelectedVault] = useState<VaultConfig | null>(null);
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

  const executeTrade = (direction: string) => {
    setSelectedDirection(direction);
    setView('processing');
    setTimeout(() => {
      setView('success');
    }, 2500);
  };

  const openVaultBriefing = (vault: VaultConfig) => {
    setSelectedVault(vault);
    setView('vault_briefing');
  };


  // --- PROCESSING & SUCCESS VIEWS ---
  if (view.startsWith('processing')) {
    const isVault = view === 'processing_vault';
    return (
      <div className="min-h-screen bg-slate-950 font-pixel flex flex-col items-center justify-center p-8 text-center relative overflow-hidden max-w-md mx-auto border-x border-slate-800">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20"></div>
        <div className={`border-4 ${isVault ? 'border-blue-500' : 'border-green-500'} p-8 bg-black relative shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)]`}>
          <div className={`animate-bounce mb-6 mx-auto w-12 h-12 border-4 ${isVault ? 'border-blue-500 bg-blue-900' : 'border-green-500 bg-green-900'} flex items-center justify-center`}>
            {isVault ? <Shield className="text-blue-400 w-6 h-6" /> : <div className="text-green-400 w-6 h-6 animate-pulse">⚡</div>}
          </div>
          <h2 className={`${isVault ? 'text-blue-400' : 'text-green-400'} text-sm mb-4 font-pixel leading-relaxed`}>
            {isVault ? 'PRESSURIZING...' : 'MINING TX...'}
          </h2>
          <div className={`w-48 h-4 border-2 ${isVault ? 'border-blue-700' : 'border-green-700'} p-0.5 mx-auto`}>
            <div className={`h-full ${isVault ? 'bg-blue-500' : 'bg-green-500'} animate-[width_2s_ease-in-out_infinite]`} style={{ width: '100%' }}></div>
          </div>
          <p className="text-[8px] text-slate-500 mt-4 font-mono">CONFIRMING ON BASE...</p>
        </div>
      </div>
    );
  }

  if (view.startsWith('success')) {
    const isVault = view === 'success_vault';
    return (
      <div className="min-h-screen bg-indigo-950 font-pixel p-4 flex flex-col relative overflow-hidden max-w-md mx-auto border-x border-slate-800">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(255, 255, 255, .1) 25%, rgba(255, 255, 255, .1) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .1) 75%, rgba(255, 255, 255, .1) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255, 255, 255, .1) 25%, rgba(255, 255, 255, .1) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .1) 75%, rgba(255, 255, 255, .1) 76%, transparent 77%, transparent)', backgroundSize: '50px 50px' }}></div>

        <div className="flex-1 flex flex-col items-center justify-center z-10">
          <div className="relative mb-8">
            <div className="absolute top-0 left-0 w-full h-full bg-green-500 blur-xl opacity-20 animate-pulse"></div>
            {isVault ? <Shield className="w-24 h-24 text-blue-400 stroke-[3px]" /> : <Trophy className="w-24 h-24 text-yellow-400 stroke-[3px]" />}
          </div>

          <h1 className="text-xl text-center text-white font-pixel mb-2 leading-loose">
            <span className={isVault ? "text-blue-400" : "text-green-400"}>{isVault ? 'GENERATOR' : 'POSITION'}</span><br />{isVault ? 'ONLINE!' : 'LOCKED!'}
          </h1>

          <div className="bg-black border-4 border-white p-4 mb-8 text-center w-full max-w-xs shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)]">
            {isVault ? (
              <>
                <p className="text-[10px] text-slate-400 mb-2 font-mono">DEPLOYED TO</p>
                <p className="text-sm text-blue-400 font-pixel mb-1">{selectedVault?.alias}</p>
                <p className="text-[8px] text-slate-500">TYPE: {selectedVault?.name}</p>
                <div className="h-0.5 w-full bg-slate-800 my-3"></div>
                <p className="text-[10px] text-green-400 font-bold animate-pulse">OUTPUT: {selectedVault?.apy}</p>
              </>
            ) : (
              <>
                <p className="text-[10px] text-slate-400 mb-2 font-mono">YOUR BET</p>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className={`text-xl ${selectedDirection === 'UP' ? 'text-green-500' : 'text-red-500'} font-pixel`}>{selectedDirection}</span>
                  <span className="text-[10px] text-slate-500 border border-slate-700 px-1">DAILY</span>
                </div>
                <div className="h-0.5 w-full bg-slate-800 my-3"></div>
                <p className="text-[8px] text-slate-500 font-mono">SETTLEMENT: TOMORROW 10:00</p>
              </>
            )}
          </div>

          <PixelButton onClick={() => { }} label="FLEX ON WARPCAST" icon={Share2} color="bg-purple-600" hoverColor="hover:bg-purple-500" />
          <button onClick={() => setView('home')} className="mt-8 text-[10px] text-white underline decoration-2 decoration-indigo-500 hover:text-indigo-300 font-pixel">[ RETURN TO BASE ]</button>
        </div>
      </div>
    );
  }

  // --- SUBVIEWS ---
  if (view === 'vault_briefing' && selectedVault) {
    return (
      <div className={`min-h-screen bg-slate-900 text-slate-200 pb-10 ${glitch ? 'opacity-95' : ''} max-w-md mx-auto border-x border-slate-800`}>
        <VaultBriefing
          vault={selectedVault}
          onBack={() => setView('home')}
          onSuccess={() => setView('success_vault')}
        />
      </div>
    )
  }

  // --- HOME VIEW ---
  return (
    <div className={`min-h-screen bg-slate-900 text-slate-200 pb-10 ${glitch ? 'opacity-95' : ''} max-w-md mx-auto border-x border-slate-800`}>
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
            onClick={() => setMode('HUNT')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 font-bold text-[10px] uppercase tracking-wider relative z-10 font-pixel ${mode === 'HUNT' ? 'text-black' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <TrendingUp size={14} />
            HUNT
          </button>
          <button
            onClick={() => setMode('FARM')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 font-bold text-[10px] uppercase tracking-wider relative z-10 font-pixel ${mode === 'FARM' ? 'text-black' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Hammer size={14} />
            FARM
          </button>
          <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white transition-all duration-300 ${mode === 'HUNT' ? 'left-1' : 'left-[calc(50%+2px)]'}`}></div>
        </div>

        {mode === 'HUNT' ? (
          <HuntView onTrade={executeTrade} />
        ) : (
          <VaultView onSelectVault={openVaultBriefing} />
        )}

      </main>

      <div className="text-center pb-4 font-mono text-[8px] text-slate-600">
        [ SYSTEM_ID: BASE_MAINNET ] [ v2.1.0 ]
      </div>
    </div>
  );
}
