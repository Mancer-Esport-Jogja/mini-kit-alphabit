import React, { useMemo, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PnLPoint {
  date: string;
  pnl: number;
  cumulativePnL: number;
}

interface PnLChartProps {
  data: PnLPoint[];
  height?: number;
  color?: string;
}

export const PnLChart = ({ data, height = 120, color = "#4ade80" }: PnLChartProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const { points, min, max, firstDate, lastDate, lastValue, chartData, margin } = useMemo(() => {
    if (!data.length) return { points: "", min: 0, max: 0, firstDate: "", lastDate: "", lastValue: 0, chartData: [] };

    const margin = 20;
    const chartHeight = height - margin * 2;
    const chartWidth = 300; 

    const values = data.map(d => d.cumulativePnL);
    const minVal = Math.min(...values, 0);
    const maxVal = Math.max(...values, 1);
    const range = maxVal - minVal;

    const mappedData = data.map((d, i) => {
      const x = (i / (data.length - 1)) * chartWidth;
      const y = margin + chartHeight - ((d.cumulativePnL - minVal) / range) * chartHeight;
      return { ...d, x, y };
    });

    const pointsStr = mappedData.map(d => `${d.x},${d.y}`).join(" ");

    return { 
      points: pointsStr, 
      min: minVal, 
      max: maxVal,
      firstDate: data[0].date,
      lastDate: data[data.length - 1].date,
      lastValue: data[data.length - 1].cumulativePnL,
      chartData: mappedData,
      margin // Return margin to use in render
    };
  }, [data, height]);

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!svgRef.current || !chartData.length) return;
    
    const svg = svgRef.current;
    const CTM = svg.getScreenCTM();
    if (!CTM) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const x = (clientX - CTM.e) / CTM.a;
    
    // Find closest index
    const index = Math.min(
      chartData.length - 1,
      Math.max(0, Math.round((x / 300) * (chartData.length - 1)))
    );
    
    setHoveredIndex(index);
  };

  if (!data || data.length < 2) {
    return (
      <div className="h-32 flex flex-col items-center justify-center border border-dashed border-slate-800 bg-black/20">
        <span className="text-[10px] font-pixel text-slate-700 uppercase tracking-widest animate-pulse">
          {data?.length === 1 ? "Awaiting next mission data..." : "No historical deployments found"}
        </span>
        <span className="text-[8px] font-mono text-slate-800 mt-1">DATA_STREAM: NULL</span>
      </div>
    );
  }

  const activePoint = hoveredIndex !== null ? chartData[hoveredIndex] : null;

  return (
    <div className="relative w-full" style={{ height: height + 20 }}>
      {/* Chart Header Info */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex flex-col">
          <span className="text-[8px] font-mono text-slate-600 uppercase">Trend Interval</span>
          <span className="text-[9px] font-pixel text-slate-400 capitalize">{firstDate} — {lastDate}</span>
        </div>
        <div className="text-right">
          <span className="text-[8px] font-mono text-slate-600 uppercase">Performance</span>
          <div className={`text-[10px] font-pixel ${lastValue >= 0 ? 'text-bit-green' : 'text-bit-coral'}`}>
            {lastValue >= 0 ? '+' : ''}{lastValue.toFixed(2)} USDC
          </div>
        </div>
      </div>

      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 300 ${height}`}
          className="w-full h-full overflow-visible touch-none cursor-crosshair"
          preserveAspectRatio="none"
          onMouseMove={handleMouseMove}
          onTouchMove={handleMouseMove}
          onMouseLeave={() => setHoveredIndex(null)}
          onTouchEnd={() => setHoveredIndex(null)}
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Zero Line */}
          {min < 0 && (
            <line 
              x1="0" 
              y1={20 + (height - 40) - ((0 - min) / (max - min)) * (height - 40)} 
              x2="300" 
              y2={20 + (height - 40) - ((0 - min) / (max - min)) * (height - 40)} 
              stroke="#1e293b" 
              strokeWidth="1" 
              strokeDasharray="4 4"
            />
          )}

          {/* Fill Area */}
          <motion.polyline
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            fill="url(#chartGradient)"
            points={`${points} 300,${height - (margin || 20)} 0,${height - (margin || 20)}`}
          />

          {/* Line */}
          <motion.polyline
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            points={points}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />

          {/* Latest Point Indicator (Always visible if not hovering) */}
          {!activePoint && (
            <motion.circle
              cx={chartData[chartData.length - 1].x}
              cy={chartData[chartData.length - 1].y}
              r="4"
              fill={color}
              stroke="#000"
              strokeWidth="1"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.5, 1] }}
              transition={{ delay: 1.5 }}
            />
          )}

          {/* Interaction Layer */}
          <AnimatePresence>
            {activePoint && (
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Vertical Cursor */}
                <line 
                  x1={activePoint.x} 
                  y1="0" 
                  x2={activePoint.x} 
                  y2={height} 
                  stroke="rgba(255,255,255,0.2)" 
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
                
                {/* Highlight Point */}
                <circle 
                  cx={activePoint.x} 
                  cy={activePoint.y} 
                  r="5" 
                  fill="#fff" 
                  className="shadow-xl"
                />
                <circle 
                  cx={activePoint.x} 
                  cy={activePoint.y} 
                  r="3" 
                  fill={color} 
                />
              </motion.g>
            )}
          </AnimatePresence>
        </svg>

        {/* Tooltip Overlay */}
        <AnimatePresence>
          {activePoint && (
            <motion.div
              initial={{ opacity: 0, y: 5, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute pointer-events-none z-50 bg-slate-900 border border-slate-700 p-2 shadow-2xl min-w-[80px]"
              style={{
                left: activePoint.x > 150 ? 'auto' : `${(activePoint.x / 300) * 100}%`,
                right: activePoint.x > 150 ? `${100 - (activePoint.x / 300) * 100}%` : 'auto',
                top: '-10px',
                transform: `translateX(${activePoint.x > 150 ? '5px' : '-5px'})`
              }}
            >
              <div className="text-[7px] font-mono text-slate-500 uppercase leading-none mb-1">
                {activePoint.date}
              </div>
              <div className={`text-[10px] font-pixel leading-none ${activePoint.cumulativePnL >= 0 ? 'text-bit-green' : 'text-bit-coral'}`}>
                {activePoint.cumulativePnL >= 0 ? '+' : ''}{activePoint.cumulativePnL.toFixed(2)} USDC
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
