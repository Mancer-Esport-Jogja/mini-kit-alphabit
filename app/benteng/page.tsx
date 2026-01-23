"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { OrderBuilder } from "@/components/Gamified/OrderBuilder";
import { Visualizer } from "@/components/Gamified/Visualizer";
import { ArrowLeft, Shield } from "lucide-react";
import Link from "next/link";
import { Marquee } from "@/components/ui/Marquee";

export default function BentengPage() {
    const mockOrder = {
        id: "3",
        strikes: [90000, 110000],
        apy: "22.5%",
        expiry: "25 JAN 2025",
        type: "Iron Condor",
    };

    const handlePlaceOrder = (amount: string) => {
        alert(`Order Placed! Benteng ${amount} USDC on BTC.`);
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
                    <Link href="/gamified" className="text-[10px] text-slate-500 hover:text-yellow-400 flex items-center gap-1 mb-4 font-mono transition-colors">
                        <ArrowLeft size={12} /> BACK TO DASHBOARD
                    </Link>

                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-yellow-500/10 border border-yellow-500/30 rounded">
                            <Shield className="text-yellow-400" size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold font-pixel text-yellow-400">BENTENG (SHIELD)</h1>
                            <p className="text-xs text-slate-400">Profit from stability and sideways markets.</p>
                        </div>
                    </div>
                </div>

                <div className="bg-black border-x-4 border-slate-700 h-6 mb-6 flex items-center overflow-hidden">
                    <Marquee
                        text={`/// MODE: SHIELD /// YIELD: ${mockOrder.apy} /// RANGE: $${mockOrder.strikes[0]}-$${mockOrder.strikes[1]} /// EXPIRY: ${mockOrder.expiry} /// `}
                        speed={20}
                        className="text-[8px] text-yellow-400 font-pixel"
                    />
                </div>

                <div className="flex-1 flex flex-col gap-6">
                    <Visualizer
                        type="SHIELD"
                        currentPrice={98000}
                        strikes={mockOrder.strikes}
                    />

                    <OrderBuilder
                        balance="1,500.00"
                        isProcessing={false}
                        onPlaceOrder={handlePlaceOrder}
                        yieldInfo={{
                            label: "ESTIMATED YIELD (APY)",
                            value: mockOrder.apy,
                            subValue: "If price stays in range"
                        }}
                    />

                    <div className="bg-slate-900/50 p-4 rounded text-xs text-slate-400 border border-slate-800">
                        <h4 className="font-bold text-slate-300 mb-2">HOW IT WORKS</h4>
                        <p className="leading-relaxed">
                            You profit if BTC stays <span className="text-green-400 font-bold">BETWEEN ${mockOrder.strikes[0].toLocaleString()} and ${mockOrder.strikes[1].toLocaleString()}</span>.
                            If it breaks out of this "fortress", your losses are capped but you may lose collateral.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
