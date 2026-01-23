import React from 'react';
import { Shield, Star, Crown, Zap } from 'lucide-react';

interface LevelBadgeProps {
    level: number;
    size?: 'sm' | 'md' | 'lg';
    showLevel?: boolean;
}

export const LevelBadge = ({ level, size = 'md', showLevel = true }: LevelBadgeProps) => {
    const getIcon = () => {
        if (level >= 8) return <Crown className="text-yellow-400" />;
        if (level >= 5) return <Star className="text-purple-400" />;
        if (level >= 3) return <Shield className="text-blue-400" />;
        return <Zap className="text-slate-400" />;
    };

    const getColors = () => {
        if (level >= 8) return "bg-yellow-900/30 border-yellow-500 shadow-[0_0_10px_#eab308]";
        if (level >= 5) return "bg-purple-900/30 border-purple-500 shadow-[0_0_10px_#a855f7]";
        if (level >= 3) return "bg-blue-900/30 border-blue-500 shadow-[0_0_10px_#3b82f6]";
        return "bg-slate-800 border-slate-600";
    };

    const sizeClasses = {
        sm: "w-6 h-6 p-0.5",
        md: "w-10 h-10 p-2",
        lg: "w-16 h-16 p-3"
    };

    return (
        <div className="relative inline-block">
            <div className={`relative ${sizeClasses[size]} rounded-lg border-2 flex items-center justify-center ${getColors()}`}>
                {getIcon()}
            </div>
            {showLevel && (
                <div className="absolute -bottom-2 -right-2 bg-black border border-white/20 text-[8px] font-pixel text-white px-1 rounded-sm">
                    LVL {level}
                </div>
            )}
        </div>
    );
};
