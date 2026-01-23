"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface StrategyCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    stats: { label: string; value: string; color?: string }[];
    onClick: () => void;
    colorTheme: "green" | "red" | "blue" | "yellow";
}

export function StrategyCard({ title, description, icon, stats, onClick, colorTheme }: StrategyCardProps) {
    const borderColors = {
        green: "group-hover:border-green-500/50",
        red: "group-hover:border-red-500/50",
        blue: "group-hover:border-blue-500/50",
        yellow: "group-hover:border-yellow-500/50",
    };

    const bgColors = {
        green: "group-hover:bg-green-500/5",
        red: "group-hover:bg-red-500/5",
        blue: "group-hover:bg-blue-500/5",
        yellow: "group-hover:bg-yellow-500/5",
    };

    const textColors = {
        green: "text-green-400",
        red: "text-red-400",
        blue: "text-blue-400",
        yellow: "text-yellow-400",
    };

    return (
        <motion.button
            onClick={onClick}
            className={`group relative w-full text-left p-6 bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors duration-300 overflow-hidden ${bgColors[colorTheme]}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            {/* Background Grid Effect */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:20px_20px] opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity" />

            <div className="relative z-10 flex items-start gap-4">
                <div className={`p-3 bg-black border border-slate-800 rounded-lg ${textColors[colorTheme]} ${borderColors[colorTheme]} transition-colors`}>
                    {icon}
                </div>

                <div className="flex-1">
                    <h3 className={`text-lg font-bold font-pixel mb-1 ${textColors[colorTheme]}`}>{title}</h3>
                    <p className="text-slate-400 text-sm mb-4 leading-relaxed">{description}</p>

                    <div className="grid grid-cols-2 gap-4">
                        {stats.map((stat, i) => (
                            <div key={i}>
                                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">{stat.label}</div>
                                <div className={`font-mono text-sm ${stat.color || "text-slate-200"}`}>{stat.value}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-4 group-hover:translate-x-0 duration-300">
                    <ArrowRight className={textColors[colorTheme]} />
                </div>
            </div>
        </motion.button>
    );
}
