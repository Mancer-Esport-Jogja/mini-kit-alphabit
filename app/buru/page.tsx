"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { OrderBuilder } from "@/components/Gamified/OrderBuilder";
import { Visualizer } from "@/components/Gamified/Visualizer";
import { ArrowLeft, Crosshair } from "lucide-react";
import Link from "next/link";
import { Marquee } from "@/components/ui/Marquee";

export default function BuruPage() {
    // Mock Order Data
    const mockOrder = {
        id: "2",
        strike: 105000,
        leverage: "10x",
        expiry: "25 JAN 2025",
        type: "Long Call",
    };

    const handlePlaceOrder = (amount: string) => {
        alert(`Order Placed! Berburu ${amount} USDC on BTC.`);
    };

    return (
        <div className="min-h-screen bg-void-black text-slate-200">
            {/* SCANLINE EFFECT */}
            <div className="fixed inset-0 pointer-events-none z-[60] opacity-5">
                <div className="w-full h-2 bg-white blur-sm absolute animate-scanline"></div>
            </div>

            <div className="fixed inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none"></div>

            <div className="relative z-10 p-4 max-w-md mx-auto min-h-screen flex flex-col">
                <Header />

                <div className="mb-6">
                    <Link href="/gamified" className="text-[10px] text-slate-500 hover:text-blue-400 flex items-center gap-1 mb-4 font-mono transition-colors">
                        <ArrowLeft size={12} /> BACK TO DASHBOARD
                    </Link>

                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded">
                            <Crosshair className="text-blue-400" size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold font-pixel text-blue-400">BERBURU (HUNT)</h1>
                            <p className="text-xs text-slate-400">Capture massive gains on big moves.</p>
                        </div>
                    </div>
                </div>

                <div className="bg-black border-x-4 border-slate-700 h-6 mb-6 flex items-center overflow-hidden">
                    <Marquee
                        text={`/// MODE: HUNT /// LEVERAGE: ${mockOrder.leverage} /// STRIKE: $${mockOrder.strike} /// EXPIRY: ${mockOrder.expiry} /// `}
                        speed={20}
                        className="text-[8px] text-blue-400 font-pixel"
                    />
                </div>

                <div className="flex-1 flex flex-col gap-6">
                    <Visualizer
                        type="HUNT"
                        currentPrice={98000}
                        strikes={[mockOrder.strike]}
                    />

                    <OrderBuilder
                        balance="1,500.00"
                        isProcessing={false}
                        onPlaceOrder={handlePlaceOrder}
                        yieldInfo={{
                            label: "MAX PROFIT POTENTIAL",
                            value: "UNLIMITED",
                            subValue: "Cost limited to premium paid"
                        }}
                    />

                    <div className="bg-slate-900/50 p-4 rounded text-xs text-slate-400 border border-slate-800">
                        <h4 className="font-bold text-slate-300 mb-2">HOW IT WORKS</h4>
                        <p className="leading-relaxed">
                            You are buying a "Call Option". you pay a premium up front. If BTC price goes
                            <span className="text-green-400 font-bold"> ABOVE ${mockOrder.strike.toLocaleString()}</span>,
                            your profits can be massive. If not, you only lose your premium.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
