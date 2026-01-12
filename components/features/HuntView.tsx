import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { PixelCard } from '@/components/ui/PixelCard';
import { PixelButton } from '@/components/ui/PixelButton';

const TIMEFRAME_CONFIG = {
    '6H': {
        id: '6H',
        label: 'BLITZ (6H)',
        expiryDesc: 'TODAY 22:00',
        strikePrice: 3245.00,
        multiplier: '3x',
        color: 'text-red-400',
        borderColor: 'border-red-500'
    },
    '24H': {
        id: '24H',
        label: 'DAILY',
        expiryDesc: 'TOMORROW 10:00',
        strikePrice: 3260.00,
        multiplier: '2x',
        color: 'text-yellow-400',
        borderColor: 'border-yellow-500'
    },
    '1W': {
        id: '1W',
        label: 'WEEKLY',
        expiryDesc: 'FRI 16:00',
        strikePrice: 3300.00,
        multiplier: '1x',
        color: 'text-green-400',
        borderColor: 'border-green-500'
    }
};

const PixelChart = ({ activeTimeframe }: { activeTimeframe: string }) => {
    const points = activeTimeframe === '6H'
        ? [40, 60, 30, 80, 45, 90, 20, 50, 60, 40, 75, 85]
        : activeTimeframe === '24H'
            ? [40, 45, 55, 50, 60, 55, 65, 60, 70, 75, 80, 85]
            : [40, 42, 45, 48, 50, 55, 60, 65, 70, 75, 80, 85];

    const width = 100; const height = 50; const maxY = 100;
    const polylinePoints = points.map((y, i) => `${(i / (points.length - 1)) * width},${height - (y / maxY) * height}`).join(' ');

    return (
        <div className="bg-black border-2 border-slate-700 p-2 mb-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:10px_10px] opacity-30"></div>
            <div className="absolute top-[30%] left-0 w-full border-t border-dashed border-indigo-500/50 z-0"></div>
            <div className="absolute top-[30%] right-1 text-[6px] text-indigo-400 bg-black px-1">TARGET</div>
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-24 overflow-visible relative z-10 preserve-3d">
                <polyline fill="none" stroke={activeTimeframe === '6H' ? '#f87171' : '#22c55e'} strokeWidth="2" points={polylinePoints} vectorEffect="non-scaling-stroke" className="drop-shadow-[0_0_4px_rgba(34,197,94,0.8)]" />
                <circle cx="100" cy={height - (points[points.length - 1] / maxY) * height} r="3" fill={activeTimeframe === '6H' ? '#f87171' : '#22c55e'} className="animate-pulse" />
            </svg>
            <div className="absolute top-2 left-2 flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-[8px] text-red-500 font-mono">LIVE</span>
            </div>
        </div>
    );
};

export const HuntView = ({ onTrade }: { onTrade: (direction: string) => void }) => {
    const [activeTimeframe, setActiveTimeframe] = useState<keyof typeof TIMEFRAME_CONFIG>('1W');
    const currentConfig = TIMEFRAME_CONFIG[activeTimeframe];
    const currentPrice = 3240.50;

    return (
        <div>
            <div className="mb-4 text-center">
                <h1 className="text-sm text-yellow-400 mb-2 font-pixel tracking-wider">HUNTING GROUNDS</h1>
                <p className="text-[8px] text-slate-400 font-mono">PREDICT PRICE TO EARN STREAK</p>
            </div>

            <div className="flex gap-2 mb-4">
                {Object.values(TIMEFRAME_CONFIG).map((tf) => {
                    const isActive = activeTimeframe === tf.id;
                    return (
                        <button key={tf.id} onClick={() => setActiveTimeframe(tf.id as keyof typeof TIMEFRAME_CONFIG)} className={`flex-1 relative group h-10`}>
                            <div className={`absolute top-1 left-1 w-full h-full bg-black -z-10 ${isActive ? 'translate-x-0 translate-y-0' : ''}`}></div>
                            <div className={`w-full h-full border-2 border-black flex flex-col items-center justify-center ${isActive ? 'bg-indigo-600 translate-y-1 translate-x-1' : 'bg-slate-800 hover:bg-slate-700'} transition-all`}>
                                <span className={`text-[8px] font-bold ${isActive ? 'text-white' : 'text-slate-400'} font-pixel`}>{tf.label}</span>
                            </div>
                        </button>
                    );
                })}
            </div>

            <PixelCard title={`MARKET_FEED: ${currentConfig.label}`} borderColor={currentConfig.borderColor}>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-2xl font-pixel">Ξ</span>
                            <h1 className="text-lg text-white font-pixel">ETH/USD</h1>
                        </div>
                        <div className="flex gap-2">
                            <span className="bg-indigo-900 text-indigo-200 text-[8px] px-1 py-0.5 font-pixel">EPOCH #402</span>
                            <span className="bg-orange-900 text-orange-200 text-[8px] px-1 py-0.5 animate-pulse font-pixel">XP {currentConfig.multiplier}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[8px] text-slate-400 mb-1 font-mono">EXPIRES</p>
                        <p className={`text-xs ${currentConfig.color} font-pixel`}>{currentConfig.expiryDesc}</p>
                    </div>
                </div>

                <PixelChart activeTimeframe={activeTimeframe} />

                <div className="bg-black border-2 border-slate-700 p-3 mb-4 flex justify-between items-center">
                    <div className="text-center w-1/2 border-r-2 border-slate-800">
                        <p className="text-[8px] text-slate-500 mb-1 font-mono">CURRENT</p>
                        <p className="text-sm text-white font-pixel">${currentPrice.toLocaleString('en-US')}</p>
                    </div>
                    <div className="text-center w-1/2">
                        <p className="text-[8px] text-indigo-400 mb-1 font-mono">STRIKE</p>
                        <p className="text-sm text-indigo-400 font-pixel">${currentConfig.strikePrice.toLocaleString('en-US')}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <PixelButton label="HIGHER" subLabel="CALL" color="bg-green-600" hoverColor="hover:bg-green-500" icon={ArrowRight} onClick={() => onTrade('UP')} />
                    <PixelButton label="LOWER" subLabel="PUT" color="bg-red-600" hoverColor="hover:bg-red-500" icon={ArrowRight} onClick={() => onTrade('DOWN')} />
                </div>
            </PixelCard>
        </div>
    );
}
