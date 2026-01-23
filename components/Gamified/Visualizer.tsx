"use client";

interface VisualizerProps {
    type: "FARM" | "HUNT" | "SHIELD";
    currentPrice: number;
    strikes: number[];
    range?: { min: number; max: number };
}

export function Visualizer({ type, currentPrice, strikes, range = { min: 80000, max: 120000 } }: VisualizerProps) {
    // Normalize value to percentage for CSS positioning
    const toPercent = (val: number) => {
        const p = ((val - range.min) / (range.max - range.min)) * 100;
        return Math.max(0, Math.min(100, p));
    };

    const currentPercent = toPercent(currentPrice);

    return (
        <div className="w-full bg-slate-900 border border-slate-800 p-4 rounded-lg relative overflow-hidden">
            <div className="text-[10px] text-slate-500 font-mono mb-2 flex justify-between">
                <span>{range.min.toLocaleString()}</span>
                <span>CURRENT: ${currentPrice.toLocaleString()}</span>
                <span>{range.max.toLocaleString()}</span>
            </div>

            {/* Track */}
            <div className="h-8 bg-slate-800 rounded relative w-full mb-2">
                {/* Render Zones based on Type */}

                {type === "FARM" && (
                    // Short Put example: Profit above strike
                    <>
                        <div
                            className="absolute h-full bg-red-500/20 border-r border-red-500/50"
                            style={{ left: 0, width: `${toPercent(strikes[0])}%` }}
                        />
                        <div
                            className="absolute h-full bg-green-500/20"
                            style={{ left: `${toPercent(strikes[0])}%`, right: 0 }}
                        />
                        {/* Strike Line */}
                        <div className="absolute top-0 bottom-0 w-0.5 bg-yellow-400 z-10" style={{ left: `${toPercent(strikes[0])}%` }} />
                    </>
                )}

                {type === "HUNT" && (
                    // Long Call example: Profit above strike + premium (simplified to just strike for visual)
                    <>
                        <div
                            className="absolute h-full bg-red-500/20 border-r border-red-500/50"
                            style={{ left: 0, width: `${toPercent(strikes[0])}%` }}
                        />
                        <div
                            className="absolute h-full bg-green-500/20"
                            style={{ left: `${toPercent(strikes[0])}%`, right: 0 }}
                        />
                        {/* Strike Line */}
                        <div className="absolute top-0 bottom-0 w-0.5 bg-blue-400 z-10" style={{ left: `${toPercent(strikes[0])}%` }} />
                    </>
                )}

                {type === "SHIELD" && (
                    // Iron Condor: Profit between middle strikes
                    <>
                        <div
                            className="absolute h-full bg-red-500/20"
                            style={{ left: 0, width: `${toPercent(strikes[0])}%` }}
                        />
                        <div
                            className="absolute h-full bg-green-500/20 border-x border-green-500/50"
                            style={{ left: `${toPercent(strikes[0])}%`, width: `${toPercent(strikes[1]) - toPercent(strikes[0])}%` }}
                        />
                        <div
                            className="absolute h-full bg-red-500/20"
                            style={{ left: `${toPercent(strikes[1])}%`, right: 0 }}
                        />
                    </>
                )}

                {/* Current Price Marker */}
                <div
                    className="absolute top-[-4px] bottom-[-4px] w-1 bg-white shadow-[0_0_10px_white] z-20 pointer-events-none transition-all duration-500"
                    style={{ left: `${currentPercent}%` }}
                >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] bg-white text-black px-1 rounded font-bold">
                        You
                    </div>
                </div>

            </div>

            <div className="flex justify-center gap-4 text-[10px] font-mono">
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500/50 rounded-full"></div>
                    PROFIT
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-red-500/50 rounded-full"></div>
                    LOSS
                </div>
            </div>
        </div>
    );
}
