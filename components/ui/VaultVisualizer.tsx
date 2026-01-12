import React from 'react';
import { TrendingUp, Activity, LucideIcon } from 'lucide-react';

interface VaultConfig {
    id: string;
    name: string;
    alias: string;
    color: string;
    bg: string;
    borderColor: string;
    barColor: string;
    icon: LucideIcon;
    risk: string;
    status: string;
    apy: string;
    apyVal: number;
    tvl: string;
    tvlVal: number;
}

export const VaultVisualizer = ({ vault }: { vault: VaultConfig }) => (
    <div className="mb-4">
        <div className={`bg-black border-2 ${vault.borderColor} p-4 relative overflow-hidden h-28 flex items-center justify-center mb-3`}>
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%,transparent_100%)] bg-[length:10px_10px]"></div>
            <div className="relative z-10 flex items-center justify-center">
                <div className={`absolute inset-0 rounded-full border-2 ${vault.borderColor} opacity-30 ${vault.risk === 'HIGH' ? 'animate-ping' : 'animate-pulse'}`}></div>
                <div className={`w-12 h-12 ${vault.bg} rounded-full flex items-center justify-center border-4 ${vault.borderColor} relative shadow-[0_0_15px_rgba(0,0,0,0.5)]`}>
                    <vault.icon className={`w-6 h-6 text-white ${vault.risk === 'HIGH' ? 'animate-[spin_3s_linear_infinite]' : ''}`} />
                </div>
            </div>
            <div className={`absolute top-2 right-2 flex flex-col gap-1 items-end`}>
                <div className="flex items-center gap-1">
                    <span className={`text-[6px] ${vault.color} animate-pulse`}>{vault.status}</span>
                    <div className={`w-1.5 h-1.5 rounded-full ${vault.barColor} animate-pulse`}></div>
                </div>
                <span className="text-[6px] text-slate-500 font-mono">SYS.NOMINAL</span>
            </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-slate-800 p-2 border border-slate-700">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-[8px] text-slate-400">POWER OUTPUT</span>
                    <TrendingUp size={8} className={vault.color} />
                </div>
                <div className={`text-xs font-bold ${vault.color} mb-1`}>{vault.apy}</div>
                <div className="w-full h-1.5 bg-black border border-slate-600 relative">
                    <div style={{ width: `${vault.apyVal}%` }} className={`h-full ${vault.barColor} absolute left-0 top-0`}></div>
                </div>
            </div>
            <div className="bg-slate-800 p-2 border border-slate-700">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-[8px] text-slate-400">FUEL TANK</span>
                    <Activity size={8} className="text-slate-400" />
                </div>
                <div className="text-xs font-bold text-white mb-1">{vault.tvl}</div>
                <div className="w-full h-1.5 bg-black border border-slate-600 relative">
                    <div style={{ width: `${vault.tvlVal}%` }} className={`h-full bg-slate-400 absolute left-0 top-0`}></div>
                </div>
            </div>
        </div>
    </div>
);
