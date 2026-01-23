"use client";

import { Header } from "@/components/layout/Header";
import { StrategyCard } from "@/components/Gamified/StrategyCard";
import { Sprout, Crosshair, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { Marquee } from "@/components/ui/Marquee";

export default function GamifiedDashboard() {
    const router = useRouter();

    const strategies = [
        {
            title: "TANAM (FARM)",
            description: "Passive income from calm markets. Tanam modal, panen hasil rutin.",
            icon: <Sprout size={24} />,
            stats: [{ label: "TARGET APY", value: "12-25%", color: "text-green-400" }, { label: "RISK", value: "LOW/MED" }],
            path: "/tanam",
            theme: "green" as const,
        },
        {
            title: "BERBURU (HUNT)",
            description: "Aggressive profits from big moves. Kejar keuntungan besar saat pasar volatile.",
            icon: <Crosshair size={24} />,
            stats: [{ label: "POTENTIAL", value: "10x-50x", color: "text-blue-400" }, { label: "RISK", value: "HIGH" }],
            path: "/buru",
            theme: "blue" as const,
        },
        {
            title: "BENTENG (SHIELD)",
            description: "Profit from stability. Dapatkan hasil maksimal jika harga bertahan di zona aman.",
            icon: <Shield size={24} />,
            stats: [{ label: "TARGET APY", value: "20-40%", color: "text-yellow-400" }, { label: "RISK", value: "MEDIUM" }],
            path: "/benteng",
            theme: "yellow" as const,
        },
    ];

    return (
        <div className="min-h-screen bg-void-black text-slate-200">
            {/* SCANLINE EFFECT */}
            <div className="fixed inset-0 pointer-events-none z-[60] opacity-5">
                <div className="w-full h-2 bg-white blur-sm absolute animate-scanline"></div>
            </div>

            <div className="fixed inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none"></div>

            <div className="relative z-10 p-4 max-w-md mx-auto min-h-screen flex flex-col">
                <Header />

                <div className="mb-8 mt-2">
                    <h1 className="text-3xl font-bold font-pixel mb-2 text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-500">CHOOSE YOUR PATH</h1>
                    <p className="text-slate-400 text-sm">Select a strategy tailored to your market view.</p>
                </div>

                <div className="bg-black border-x-4 border-slate-700 h-6 mb-6 flex items-center overflow-hidden">
                    <Marquee
                        text="/// ALPHABIT EASY MODES /// SIMPLIFIED DEFI OPTIONS /// POWERED BY THETANUTS V4 /// "
                        speed={20}
                        className="text-[8px] text-slate-400 font-pixel"
                    />
                </div>

                <div className="flex-1 flex flex-col gap-4">
                    {strategies.map((strategy) => (
                        <StrategyCard
                            key={strategy.title}
                            title={strategy.title}
                            description={strategy.description}
                            icon={strategy.icon}
                            stats={strategy.stats}
                            onClick={() => router.push(strategy.path)}
                            colorTheme={strategy.theme}
                        />
                    ))}
                </div>

                <div className="text-center py-6 text-[10px] text-slate-600 font-mono">
                    [ SYSTEM: ONLINE ] [ READY FOR DEPLOYMENT ]
                </div>
            </div>
        </div>
    );
}
