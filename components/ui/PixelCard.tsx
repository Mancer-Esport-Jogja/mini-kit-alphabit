import React, { ReactNode } from 'react';

interface PixelCardProps {
    children: ReactNode;
    title?: string;
    color?: string;
    borderColor?: string;
    className?: string;
}

export const PixelCard = ({
    children,
    title,
    color = "bg-slate-800",
    borderColor = "border-slate-900",
    className = ""
}: PixelCardProps) => (
    <div className={`relative mb-6 group ${className}`}>
        <div className="absolute top-2 left-2 w-full h-full bg-black/50 -z-10"></div>
        <div className={`${color} border-4 ${borderColor} p-1 relative transition-colors duration-300`}>
            <div className="absolute -top-1 -left-1 w-2 h-2 bg-white"></div>
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-white"></div>
            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white"></div>
            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-white"></div>

            {title && (
                <div className={`${borderColor.replace('border', 'bg')} text-black px-2 py-1 mb-4 flex items-center justify-between border-b-4 ${borderColor}`}>
                    <span className="text-[10px] uppercase tracking-widest font-bold font-pixel">{title}</span>
                    <div className="flex gap-1">
                        <div className="w-2 h-2 bg-white rounded-full opacity-50"></div>
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                </div>
            )}
            <div className="px-2 pb-2">{children}</div>
        </div>
    </div>
);
