import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PixelButtonProps {
    onClick: () => void;
    color?: string;
    hoverColor?: string;
    label: string;
    subLabel?: string;
    icon?: LucideIcon;
    disabled?: boolean;
}

export const PixelButton = ({
    onClick,
    color = "bg-blue-600",
    hoverColor = "hover:bg-blue-500",
    label,
    subLabel,
    icon: Icon,
    disabled = false
}: PixelButtonProps) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`relative w-full group active:translate-y-1 active:translate-x-1 transition-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
        <div className="absolute top-2 left-2 w-full h-full bg-black -z-10"></div>
        <div className={`${color} ${disabled ? '' : hoverColor} border-4 border-black p-4 flex flex-col items-center justify-center text-white transition-colors`}>
            {Icon && <Icon className="w-8 h-8 mb-2 stroke-[3px]" />}
            <span className="text-sm font-bold uppercase tracking-wider font-pixel">{label}</span>
            {subLabel && <span className="text-[8px] opacity-80 mt-1 font-mono">{subLabel}</span>}
        </div>
    </button>
);
