"use client";

import React from 'react';

interface PowerUpCardProps {
    icon: string;
    title: string;
    subtitle: string;
    description: string;
    borderColor?: string;
    glowColor?: string;
}

export const PowerUpCard = ({
    icon,
    title,
    subtitle,
    description,
    borderColor = "border-bit-green",
    glowColor = "hover:glow-green"
}: PowerUpCardProps) => {
    return (
        <div
            className={`relative bg-void-black border-2 ${borderColor} p-4 transition-all duration-300 hover:scale-[1.02] ${glowColor} group`}
        >
            {/* Corner Decorations */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-white/30"></div>
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-white/30"></div>
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-white/30"></div>
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-white/30"></div>

            {/* Item Header */}
            <div className="flex items-start gap-3 mb-3">
                {/* Pixel Art Icon Container */}
                <div className="w-12 h-12 bg-slate-900 border-2 border-slate-700 flex items-center justify-center text-2xl group-hover:animate-float">
                    {icon}
                </div>

                <div className="flex-1">
                    <h3 className="font-pixel text-sm text-white mb-1 leading-relaxed">
                        {title}
                    </h3>
                    <span className="text-[10px] font-mono text-bit-coral uppercase tracking-wider">
                        {subtitle}
                    </span>
                </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent mb-3"></div>

            {/* Description */}
            <p className="text-slate-400 font-grotesk text-sm leading-relaxed">
                {description}
            </p>

            {/* Stats Bar */}
            <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 h-1 bg-slate-800 rounded overflow-hidden">
                    <div
                        className={`h-full ${borderColor.replace('border', 'bg')} animate-pulse`}
                        style={{ width: '75%' }}
                    ></div>
                </div>
                <span className="text-[8px] font-mono text-slate-500">POWER</span>
            </div>
        </div>
    );
};
