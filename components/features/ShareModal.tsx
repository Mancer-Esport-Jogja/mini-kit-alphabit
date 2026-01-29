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

// Mini chart component for Performance card
const MiniChart = ({ data }: { data: PnLPoint[] }) => {
  const chartData = useMemo(() => {
    if (!data || data.length < 2) return null;
    
    const height = 60;
    const width = 200;
    const margin = 5;
    
    const values = data.map(d => d.cumulativePnL);
    const minVal = Math.min(...values, 0);
    const maxVal = Math.max(...values, 1);
    const range = maxVal - minVal || 1;
    
    const points = data.map((d, i) => {
      const x = margin + (i / (data.length - 1)) * (width - margin * 2);
      const y = margin + (height - margin * 2) - ((d.cumulativePnL - minVal) / range) * (height - margin * 2);
      return `${x},${y}`;
    }).join(' ');
    
    const lastValue = data[data.length - 1].cumulativePnL;
    const isPositive = lastValue >= 0;
    
    return { points, lastValue, isPositive, width, height };
  }, [data]);
  
  if (!chartData) {
    return (
      <div className="text-[10px] font-mono text-slate-500">No chart data</div>
    );
  }
  
  const color = chartData.isPositive ? '#4ade80' : '#fb7185';
  
  return (
    <div className="w-full">
      <svg 
        viewBox={`0 0 ${chartData.width} ${chartData.height}`} 
        className="w-full h-16"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="miniChartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Fill Area */}
        <polyline
          fill="url(#miniChartGradient)"
          points={`${chartData.points} ${chartData.width - 5},${chartData.height - 5} 5,${chartData.height - 5}`}
        />
        
        {/* Line */}
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={chartData.points}
        />
      </svg>
      
      <div className={`text-xl font-pixel text-center ${chartData.isPositive ? 'text-bit-green' : 'text-bit-coral'}`}>
        {chartData.isPositive ? '+' : ''}{chartData.lastValue.toFixed(2)} USDC
      </div>
    </div>
  );
};

export const ShareModal = ({ isOpen, onClose, analytics, pnlHistory }: ShareModalProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSharing, setIsSharing] = useState(false);
  const { user } = useAuth();

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
      const shareUrl = `${ROOT_URL}/share/${card.id}?pnl=${encodeURIComponent(pnl)}&username=${encodeURIComponent(username)}&winrate=${winRate}&missions=${missions}`;
      
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
        return `🎮 Completed ${a?.totalTrades || 0} missions on @alphabit!\n\nJoin the trading adventure`;
      case 'performance':
        return `📈 Check out my trading performance on @alphabit\n\n#DeFi #Options`;
      default:
        return `Trading on @alphabit 🚀`;
    }
  };

  if (!isOpen) return null;

  const currentCard = shareCards[currentIndex];
  const isPerformanceCard = currentCard.id === 'performance';

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
          className="w-full max-w-sm bg-slate-900 border-2 border-slate-700 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b-2 border-slate-800">
            <div className="flex items-center gap-2">
              <Share2 size={16} className="text-bit-green" />
              <span className="text-sm font-pixel text-white uppercase">Share to Farcaster</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-slate-500 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Carousel */}
          <div className="relative p-4">
            {/* Navigation Arrows */}
            <button
              onClick={goToPrev}
              className={`absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 bg-slate-800/80 border border-slate-700 transition-opacity ${currentIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'opacity-100 hover:bg-slate-700'}`}
              disabled={currentIndex === 0}
            >
              <ChevronLeft size={16} className="text-white" />
            </button>
            <button
              onClick={goToNext}
              className={`absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 bg-slate-800/80 border border-slate-700 transition-opacity ${currentIndex === shareCards.length - 1 ? 'opacity-30 cursor-not-allowed' : 'opacity-100 hover:bg-slate-700'}`}
              disabled={currentIndex === shareCards.length - 1}
            >
              <ChevronRight size={16} className="text-white" />
            </button>

            {/* Card Display - Single card with animation */}
            <div className="overflow-hidden mx-8">
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
                className="cursor-grab active:cursor-grabbing"
              >
                <div className={`border-2 ${currentCard.bgColor} p-6 flex flex-col items-center`}>
                  {isPerformanceCard && pnlHistory && pnlHistory.length >= 2 ? (
                    // Performance card with chart
                    <>
                      <h3 className={`text-lg font-pixel ${currentCard.color} uppercase mb-1`}>
                        {currentCard.title}
                      </h3>
                      <p className="text-[10px] font-mono text-slate-500 uppercase mb-3">
                        {currentCard.subtitle}
                      </p>
                      <MiniChart data={pnlHistory} />
                    </>
                  ) : (
                    // Standard card layout
                    <>
                      <div className={`w-16 h-16 flex items-center justify-center ${currentCard.color} mb-4`}>
                        <currentCard.icon size={40} />
                      </div>
                      <h3 className={`text-lg font-pixel ${currentCard.color} uppercase mb-1`}>
                        {currentCard.title}
                      </h3>
                      <p className="text-[10px] font-mono text-slate-500 uppercase mb-4">
                        {currentCard.subtitle}
                      </p>
                      <div className={`text-2xl font-pixel ${currentCard.color}`}>
                        {currentCard.getValue(analytics)}
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center gap-2 mt-4">
              {shareCards.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-2 h-2 transition-colors ${i === currentIndex ? 'bg-bit-green' : 'bg-slate-700'}`}
                />
              ))}
            </div>
          </div>

          {/* Share Button */}
          <div className="p-4 border-t-2 border-slate-800">
            <button
              onClick={handleShare}
              disabled={isSharing || !analytics}
              className={`w-full py-3 font-pixel text-sm uppercase border-b-4 transition-all active:border-b-0 active:translate-y-1 ${
                isSharing || !analytics
                  ? 'bg-slate-700 border-slate-800 text-slate-500 cursor-not-allowed'
                  : `${currentCard.bgColor} ${currentCard.color} border-slate-900 hover:brightness-110`
              }`}
            >
              {isSharing ? 'SHARING...' : `SHARE ${currentCard.title}`}
            </button>
          </div>

          {/* Hint */}
          <div className="px-4 pb-4">
            <p className="text-[8px] font-mono text-slate-600 text-center uppercase">
              Swipe left/right to choose • Tap share to post
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

