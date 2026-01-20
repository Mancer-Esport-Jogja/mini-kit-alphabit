"use client";

import React, { useState } from 'react';
import { Activity, ShieldCheck, Power, AlertOctagon, ArrowUpRight, ArrowLeft, Info } from 'lucide-react';
import { TutorialOverlay } from '@/components/ui/TutorialOverlay';

export const LiquidityEngine = () => {
    const [engineStatus] = useState<'ONLINE' | 'STANDBY'>('ONLINE');
    const [efficiencyRating] = useState(15.4); // APY
    const [view, setView] = useState<'MAIN' | 'INJECT' | 'EXTRACT'>('MAIN');
    const [showTutorial, setShowTutorial] = useState(false);
    const [amount, setAmount] = useState<string>('');

    const tutorialSteps = [
        {
            title: "BE THE HOUSE",
            description: "As a Liquidity Provider, you fund the pool that traders bet against. You take the opposite side of every trade."
        },
        {
            title: "EARN YIELD",
            description: "You earn a share of the fees from every trade, plus potential profits if traders lose. Current Efficiency Rating is your APY."
        },
        {
            title: "MANAGE LIQUIDITY",
            description: "Use 'INJECT' to deposit USDC collateral. Use 'EXTRACT' to withdraw your capital and earnings."
        }
    ];

    return (
        <div className="w-full max-w-md mx-auto relative bg-slate-900 border-4 border-slate-700 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] overflow-hidden min-h-[500px] flex flex-col">
            <TutorialOverlay
                isOpen={showTutorial}
                onClose={() => setShowTutorial(false)}
                title="LIQUIDITY ENGINE MANUAL"
                steps={tutorialSteps}
            />

            {/* Engine Header */}
            <div className="bg-slate-800 p-3 flex items-center justify-between border-b-4 border-slate-700">
                <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full animate-pulse shadow-[0_0_8px_currentColor] 
                        ${engineStatus === 'ONLINE' ? 'bg-bit-green text-bit-green' : 'bg-yellow-500 text-yellow-500'}`}></div>
                    <span className="text-xs font-pixel text-slate-300 tracking-wider">
                        ENGINE: <span className={engineStatus === 'ONLINE' ? 'text-bit-green' : 'text-yellow-500'}>{engineStatus}</span>
                    </span>
                </div>
                <button
                    type="button"
                    onClick={() => setShowTutorial(true)}
                    className="flex items-center gap-1 bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded transition-colors border border-slate-600"
                >
                    <Info size={12} className="text-yellow-500" />
                    <span className="text-[9px] font-mono text-yellow-500">DECODED TRANSMISSION</span>
                </button>
            </div>

            {/* MAIN DASHBOARD VIEW */}
            {view === 'MAIN' && (
                <div className="p-6 relative bg-black/80 flex-1 flex flex-col">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,24,0.5)_2px,transparent_2px),linear-gradient(90deg,rgba(18,18,24,0.5)_2px,transparent_2px)] bg-[size:20px_20px] pointer-events-none"></div>

                    {/* Core Title */}
                    <div className="flex items-start justify-between mb-8 relative z-10">
                        <div>
                            <h2 className="text-xl font-pixel text-white mb-1">YIELD ENGINE</h2>
                            <div className="text-xs font-mono text-bit-teal tracking-widest">TYPE: USDC-V1</div>
                        </div>
                        <div className="w-12 h-12 border-2 border-slate-700 bg-slate-900 flex items-center justify-center">
                            <Activity className="text-bit-green animate-pulse" />
                        </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
                        <div className="bg-slate-900/50 border border-slate-700 p-3 relative group overflow-hidden">
                            <div className="absolute inset-0 bg-bit-green/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                            <div className="text-[9px] text-slate-500 font-mono mb-1 uppercase">Efficiency Rating</div>
                            <div className="text-2xl font-pixel text-white flex items-baseline gap-1">
                                {efficiencyRating}%
                                <span className="text-[10px] text-slate-500 font-sans">APY</span>
                            </div>
                        </div>

                        <div className="bg-slate-900/50 border border-slate-700 p-3 relative group overflow-hidden">
                            <div className="absolute inset-0 bg-blue-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                            <div className="text-[9px] text-slate-500 font-mono mb-1 uppercase">TVL Capacity</div>
                            <div className="text-xl font-pixel text-white flex items-baseline gap-1">
                                $2.4M
                            </div>
                        </div>
                    </div>

                    {/* Fuel/Liquidity Controls */}
                    <div className="space-y-3 mt-auto relative z-10">
                        <button
                            type="button"
                            onClick={() => setView('INJECT')}
                            className="w-full group relative overflow-hidden bg-slate-900 border-2 border-blue-500/50 hover:border-blue-400 p-4 transition-all duration-300"
                        >
                            <div className="absolute inset-0 bg-blue-500/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300"></div>
                            <div className="relative flex items-center justify-between">
                                <span className="font-pixel text-xs text-blue-400 group-hover:text-white flex items-center gap-2">
                                    <Power size={14} /> INJECT LIQUIDITY
                                </span>
                                <ArrowUpRight size={14} className="text-blue-500 group-hover:text-white" />
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => setView('EXTRACT')}
                            className="w-full group relative overflow-hidden bg-slate-900 border-2 border-orange-500/50 hover:border-orange-400 p-4 transition-all duration-300"
                        >
                            <div className="absolute inset-0 bg-orange-500/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300"></div>
                            <div className="relative flex items-center justify-between">
                                <span className="font-pixel text-xs text-orange-400 group-hover:text-white flex items-center gap-2">
                                    <AlertOctagon size={14} /> EXTRACT CAPITAL
                                </span>
                                <ArrowUpRight size={14} className="text-orange-500 group-hover:text-white rotate-180" />
                            </div>
                        </button>
                    </div>
                </div>
            )}

            {/* INJECT VIEW */}
            {view === 'INJECT' && (
                <div className="p-6 relative bg-black/80 flex-1 flex flex-col">
                    <button type="button" onClick={() => setView('MAIN')} className="text-slate-500 hover:text-white flex items-center gap-2 mb-6 text-xs font-mono">
                        <ArrowLeft size={14} /> BACK TO ENGINE
                    </button>

                    <h2 className="text-xl font-pixel text-blue-400 mb-6">INJECT LIQUIDITY</h2>

                    <div className="flex-1">
                        <label className="text-[10px] font-pixel text-slate-400 block mb-2">AMOUNT TO INJECT (USDC)</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={amount}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full bg-slate-900 border-2 border-blue-500/50 text-white p-4 font-mono text-lg focus:border-blue-400 outline-none placeholder:text-slate-700"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500 font-pixel text-xs">MX</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-2 font-mono">AVAILABLE: 1,000.00 USDC</p>
                    </div>

                    <div className="bg-blue-900/20 border border-blue-500/30 p-4 mb-6">
                        <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                            <span>PROJ. APY</span>
                            <span className="text-white">15.4%</span>
                        </div>
                        <div className="flex justify-between text-xs font-mono text-slate-400">
                            <span>LOCK PERIOD</span>
                            <span className="text-white">7 DAYS</span>
                        </div>
                    </div>

                    <button type="button" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-pixel text-xs py-4 border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all">
                        CONFIRM INJECTION
                    </button>
                </div>
            )}

            {/* EXTRACT VIEW */}
            {view === 'EXTRACT' && (
                <div className="p-6 relative bg-black/80 flex-1 flex flex-col">
                    <button type="button" onClick={() => setView('MAIN')} className="text-slate-500 hover:text-white flex items-center gap-2 mb-6 text-xs font-mono">
                        <ArrowLeft size={14} /> BACK TO ENGINE
                    </button>

                    <h2 className="text-xl font-pixel text-orange-400 mb-6">EXTRACT CAPITAL</h2>

                    <div className="flex-1">
                        <div className="bg-slate-800 p-4 rounded mb-6 border border-slate-600">
                            <div className="text-[10px] text-slate-400 font-mono mb-1">TOTAL POSITION</div>
                            <div className="text-2xl text-white font-mono">500.00 USDC</div>
                            <div className="text-[10px] text-green-400 font-mono mt-1">+12.45 EARNED</div>
                        </div>

                        <label className="text-[10px] font-pixel text-slate-400 block mb-2">AMOUNT TO EXTRACT</label>
                        <div className="relative">
                            <input
                                type="number"
                                placeholder="0.00"
                                className="w-full bg-slate-900 border-2 border-orange-500/50 text-white p-4 font-mono text-lg focus:border-orange-400 outline-none placeholder:text-slate-700"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-500 font-pixel text-xs">MX</span>
                        </div>
                    </div>

                    <button type="button" className="w-full bg-orange-600 hover:bg-orange-500 text-white font-pixel text-xs py-4 border-b-4 border-orange-800 active:border-b-0 active:translate-y-1 transition-all">
                        INITIATE WITHDRAWAL
                    </button>
                </div>
            )}

            {/* System Footer */}
            <div className="bg-slate-800 p-2 border-t-4 border-slate-700 text-center mt-auto">
                <div className="text-[8px] font-mono text-slate-500 flex items-center justify-center gap-2">
                    <ShieldCheck size={10} />
                    SYSTEM SECURED BY THETANUTS
                </div>
            </div>
        </div>
    );
};
