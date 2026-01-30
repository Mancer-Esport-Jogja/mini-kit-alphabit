"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { X, Share2, ChevronLeft, ChevronRight, TrendingUp, Target, Gamepad2, BarChart3, LucideIcon } from "lucide-react";
import sdk from "@farcaster/miniapp-sdk";
import { useAuth } from "@/context/AuthContext";

interface PnLPoint {
  date: string;
  pnl: number;
  cumulativePnL: number;
}

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  analytics: {
    netPnL: string;
    winRate: number;
    totalTrades: number;
  } | undefined;
  pnlHistory?: PnLPoint[];
}

type ShareCategory = 'pnl' | 'winrate' | 'missions' | 'performance';

interface ShareCard {
  id: ShareCategory;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  getValue: (analytics: ShareModalProps['analytics']) => string;
}

const shareCards: ShareCard[] = [
  {
    id: 'pnl',
    title: 'TOTAL PNL',
    subtitle: 'Share your profit/loss',
    icon: TrendingUp,
    color: 'text-bit-green',
    bgColor: 'bg-bit-green/10 border-bit-green/30',
    getValue: (a) => {
      const pnl = Number(a?.netPnL || 0);
      return `${pnl >= 0 ? '+' : ''}${pnl.toFixed(2)} USDC`;
    },
  },
  {
    id: 'winrate',
    title: 'WIN RATE',
    subtitle: 'Share your accuracy',
    icon: Target,
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10 border-blue-400/30',
    getValue: (a) => `${(a?.winRate || 0).toFixed(1)}%`,
  },
  {
    id: 'missions',
    title: 'TOTAL MISSIONS',
    subtitle: 'Share your experience',
    icon: Gamepad2,
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/10 border-purple-400/30',
    getValue: (a) => `${a?.totalTrades || 0} Missions`,
  },
  {
    id: 'performance',
    title: 'PERFORMANCE',
    subtitle: 'Share your trading graph',
    icon: BarChart3,
    color: 'text-orange-400',
    bgColor: 'bg-orange-400/10 border-orange-400/30',
    getValue: (a) => {
      const pnl = Number(a?.netPnL || 0);
      return `${pnl >= 0 ? '+' : ''}${pnl.toFixed(2)} USDC`;
    },
  },
];

export const ShareModal = ({ isOpen, onClose, analytics, pnlHistory }: ShareModalProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSharing, setIsSharing] = useState(false);
  const [themeColor, setThemeColor] = useState('#4ade80');
  const { user } = useAuth();
  
  // Reset sharing state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setIsSharing(false);
    }
  }, [isOpen]);
  
  const colors = [
    '#4ade80', // Green (Default)
    '#60a5fa', // Blue
    '#a855f7', // Purple
    '#fb923c', // Orange
    '#f472b6', // Pink
    '#ef4444', // Red
  ];

  // Colors map for standard cards to fallback
  const Colors: Record<string, string> = {
    'bit-green': '#4ade80',
    'blue-400': '#60a5fa',
    'purple-400': '#a855f7',
    'orange-400': '#fb923c',
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.x > threshold && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (info.offset.x < -threshold && currentIndex < shareCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const goToNext = () => {
    if (currentIndex < shareCards.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const currentCard = shareCards[currentIndex];
  const isPerformanceCard = currentCard.id === 'performance';
  const activeColor = isPerformanceCard ? themeColor : Colors[currentCard.color.replace('text-', '') as keyof typeof Colors] || themeColor;

  const handleShare = async () => {
    if (isSharing || !analytics) return;
    
    setIsSharing(true);
    
    try {
      const ROOT_URL = process.env.NEXT_PUBLIC_URL || 'https://mini-kit-alphabit.vercel.app';
      const card = shareCards[currentIndex];
      const username = user?.username || 'Trader';
      const pnl = analytics.netPnL || '0';
      const winRate = analytics.winRate || 0;
      const missions = analytics.totalTrades || 0;
      
      // Build share URL with query params
      let shareUrl = `${ROOT_URL}/share/${card.id}?pnl=${encodeURIComponent(pnl)}&username=${encodeURIComponent(username)}&winrate=${winRate}&missions=${missions}`;
      
      // For performance card, add simplified chart data and color
      if (card.id === 'performance') {
        let chartPointsStr = '';
        
        if (pnlHistory && pnlHistory.length >= 2) {
           // Use actual history data
           const maxPoints = 12;
           const step = Math.max(1, Math.floor(pnlHistory.length / maxPoints));
           const sampledPoints = pnlHistory
             .filter((_, i) => i % step === 0 || i === pnlHistory.length - 1)
             .slice(0, maxPoints)
             .map(p => p.cumulativePnL.toFixed(2));
           
           chartPointsStr = sampledPoints.join(',');
        } else {
           // Fallback: Generate synthetic chart from PnL value
           const pnlValue = Number(pnl) || 0;
           const numPoints = 8;
           const variation = Math.abs(pnlValue) * 0.15 || 10;
           const chartPoints: number[] = [];
           
           for (let i = 0; i < numPoints; i++) {
             const progress = i / (numPoints - 1);
             const baseValue = pnlValue * progress;
             const randomVariation = (Math.random() - 0.5) * variation;
             chartPoints.push(Number((baseValue + randomVariation).toFixed(2)));
           }
           // Ensure last point matches actual PnL
           chartPoints[chartPoints.length - 1] = pnlValue;
           chartPointsStr = chartPoints.join(',');
        }
        
        shareUrl += `&chart=${encodeURIComponent(chartPointsStr)}`;
        shareUrl += `&color=${encodeURIComponent(themeColor)}`;
      }
      
      // Get cast text based on category
      const castText = getCastText(card.id, analytics, username);
      
      await sdk.actions.composeCast({
        text: castText,
        embeds: [shareUrl],
      });
      
      onClose();
    } catch (error) {
      console.error("Failed to compose cast:", error);
    } finally {
      setIsSharing(false);
    }
  };

  const getCastText = (category: ShareCategory, a: ShareModalProps['analytics'], _username: string): string => {
    const pnl = Number(a?.netPnL || 0);
    switch (category) {
      case 'pnl':
        return `📊 My Alphabit PNL: ${pnl >= 0 ? '+' : ''}${pnl.toFixed(2)} USDC\n\nTrade options on @alphabit 🚀`;
      case 'winrate':
        return `🎯 My Win Rate: ${(a?.winRate || 0).toFixed(1)}%\n\nTrading smarter with @alphabit`;
      case 'missions':
        return `🎮 Completed ${a?.totalTrades || 0} missions on @alphabit!\n\nJoin the adventure`;
      case 'performance':
        return `📈 Check out my Alphabit performance on @alphabit safe, scalable & smart!\n\n`;
      default:
        return `Trading on @alphabit 🚀`;
    }
  };

  // Helper for Chart in Performance Card
  const PerformanceChart = ({ data, color }: { data: PnLPoint[], color: string }) => {
     const chartData = useMemo(() => {
        if (!data || data.length < 2) return null;
        
        const height = 40;
        const width = 280;
        const values = data.map(d => d.cumulativePnL);
        const minVal = Math.min(...values, 0);
        const maxVal = Math.max(...values, 1);
        const range = maxVal - minVal || 1;
        
        const points = data.map((d, i) => {
          const x = (i / (data.length - 1)) * width;
          const y = height - ((d.cumulativePnL - minVal) / range) * height;
          return `${x},${y}`;
        }).join(' ');
        
        const fillPath = `M ${points} L ${width},${height} L 0,${height} Z`;
        const linePath = `M ${points}`;
        const lastY = height - ((data[data.length - 1].cumulativePnL - minVal) / range) * height;
        
        return { fillPath, linePath, width, height, lastY };
      }, [data]);

      if (!chartData) return null;

      return (
        <div className="relative w-full h-full">
          <svg width="100%" height="100%" viewBox={`0 0 ${chartData.width} ${chartData.height}`} preserveAspectRatio="none" className="overflow-visible">
            <defs>
              <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={chartData.fillPath} fill={`url(#gradient-${color.replace('#', '')})`} />
            <path 
              d={chartData.linePath} 
              fill="none" 
              stroke={color} 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              style={{ filter: `drop-shadow(0 0 4px ${color}66)` }}
            />
             {/* End Dot */}
             <circle cx={chartData.width} cy={chartData.lastY} r="3" fill={color} />
          </svg>
        </div>
      );
  };

  if (!isOpen) return null;


  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-sm bg-slate-900 border-2 border-slate-700 overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b-2 border-slate-800 shrink-0">
            <div className="flex items-center gap-2">
              <Share2 size={16} className="text-bit-green" />
              <span className="text-sm font-pixel text-white uppercase">Share to Farcaster</span>
            </div>
            <button onClick={onClose} className="p-1 text-slate-500 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Carousel */}
          <div className="relative p-6 bg-[#070a13]">
             {/* Background Grid Pattern for Preview Area */}
            {isPerformanceCard && (
               <div className="absolute inset-0 opacity-[0.06] pointer-events-none" 
                  style={{ 
                    backgroundImage: `linear-gradient(${themeColor} 1px, transparent 1px), linear-gradient(90deg, ${themeColor} 1px, transparent 1px)`, 
                    backgroundSize: '24px 24px' 
                  }}>
               </div>
            )}

            {/* Navigation Arrows */}
            <button
              onClick={goToPrev}
              className={`absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 bg-slate-800/80 border border-slate-700 transition-opacity rounded-full hover:bg-slate-700 ${currentIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'opacity-100'}`}
              disabled={currentIndex === 0}
            >
              <ChevronLeft size={16} className="text-white" />
            </button>
            <button
              onClick={goToNext}
              className={`absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 bg-slate-800/80 border border-slate-700 transition-opacity rounded-full hover:bg-slate-700 ${currentIndex === shareCards.length - 1 ? 'opacity-30 cursor-not-allowed' : 'opacity-100'}`}
              disabled={currentIndex === shareCards.length - 1}
            >
              <ChevronRight size={16} className="text-white" />
            </button>

            {/* Card Display */}
            <div className="overflow-hidden">
              <motion.div
                key={currentIndex}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={handleDragEnd}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="cursor-grab active:cursor-grabbing flex justify-center"
              >
                {isPerformanceCard ? (
                  /* --- NEW PREMIUM PERFORMANCE CARD --- */
                   <div className="w-[300px] h-[200px] relative group select-none overflow-hidden rounded-lg bg-[#070a13] shadow-2xl border border-slate-800">
                      {/* Background Grid */}
                      <div 
                        className="absolute inset-0 opacity-[0.03] pointer-events-none"
                        style={{ 
                          backgroundImage: `linear-gradient(${themeColor} 1px, transparent 1px), linear-gradient(90deg, ${themeColor} 1px, transparent 1px)`, 
                          backgroundSize: '20px 20px' 
                        }}
                      />
                      
                      {/* Content */}
                      <div className="relative h-full flex flex-col items-center justify-between py-4 px-4">
                          {/* Logo */}
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 border-2 rounded-lg overflow-hidden" style={{ borderColor: themeColor }}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src="/hero.png" alt="Alphabit" className="w-full h-full object-cover" />
                            </div>
                            <span className="text-sm font-bold text-white uppercase tracking-tight">
                              ALPHA<span style={{ color: themeColor }}>BIT</span>
                            </span>
                          </div>
                          
                          {/* Header */}
                          <div className="text-center">
                            <h3 className="text-sm font-bold tracking-[0.15em] leading-none mb-1 font-pixel" style={{ color: themeColor }}>PERFORMANCE</h3>
                            <p className="text-slate-500 text-[7px] tracking-wider font-bold uppercase">@{user?.username || 'TRADER'}&apos;S STATS</p>
                          </div>

                          {/* Chart - Compact */}
                          {pnlHistory && pnlHistory.length >= 2 && (
                            <div className="w-full h-[40px]">
                              <PerformanceChart data={pnlHistory} color={themeColor} />
                            </div>
                          )}

                          {/* Value */}
                          <div className="text-center">
                            <div className="text-2xl font-black leading-none tracking-tight flex items-baseline justify-center gap-1 font-sans">
                               <span style={{ color: themeColor }}>{Number(analytics?.netPnL || 0) >= 0 ? '+' : ''}</span>
                               <span className="text-white">{Number(analytics?.netPnL || 0).toFixed(2)}</span>
                               <span className="text-xs opacity-80" style={{ color: themeColor }}>USDC</span>
                            </div>
                          </div>
                      </div>

                      {/* Corners */}
                      <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-slate-700/50 rounded-tl"></div>
                      <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-slate-700/50 rounded-br"></div>
                      
                      {/* Global Glow */}
                      <div className="absolute inset-0 pointer-events-none mix-blend-screen"
                           style={{ background: `radial-gradient(circle at 50% 30%, ${themeColor}20, transparent 60%)` }}></div>
                   </div>
                ) : (
                  /* --- STANDARD CARD --- */
                  <div className={`w-[280px] aspect-square border-2 ${currentCard.bgColor} p-6 flex flex-col items-center justify-center rounded-xl`}>
                    <div className={`w-16 h-16 flex items-center justify-center ${currentCard.color} mb-4`}>
                      <currentCard.icon size={40} />
                    </div>
                    <h3 className={`text-lg font-pixel ${currentCard.color} uppercase mb-1`}>
                      {currentCard.title}
                    </h3>
                    <p className="text-[10px] font-mono text-slate-500 uppercase mb-4 text-center">
                      {currentCard.subtitle}
                    </p>
                    <div className={`text-2xl font-pixel ${currentCard.color}`}>
                      {currentCard.getValue(analytics)}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center gap-2 mt-6">
              {shareCards.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${i === currentIndex ? 'bg-white' : 'bg-slate-700'}`}
                />
              ))}
            </div>
          </div>

          {/* Color Picker (Only for Performance Card) */}
          <AnimatePresence>
            {isPerformanceCard && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-6 pb-2 bg-slate-900 border-t border-slate-800"
              >
                  <div className="flex items-center gap-2 pt-4 justify-center">
                    <span className="text-[10px] uppercase font-pixel text-slate-500 mr-2">Theme:</span>
                    {colors.map((c) => (
                      <button
                        key={c}
                        onClick={() => setThemeColor(c)}
                        className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${themeColor === c ? 'border-white scale-110' : 'border-transparent'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Share Button */}
          <div className="p-4 bg-slate-900">
            <button
              onClick={handleShare}
              disabled={isSharing || !analytics}
              className={`w-full py-3 font-pixel text-sm uppercase rounded-lg transition-all transform active:scale-[0.98] ${
                isSharing || !analytics
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'text-black font-bold hover:brightness-110 shadow-lg'
              }`}
              style={{ backgroundColor: activeColor }}
            >
              {isSharing ? 'Sharing...' : `Share ${currentCard.title}`}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

