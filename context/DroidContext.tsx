"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type RiskProfile = 'SAFE' | 'DEGEN' | null;
export type TimelineProfile = 'SHORT' | 'LONG' | null;

export interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
}

export interface TradeIntent {
    target: 'MOON' | 'DOOM';
    duration: 'BLITZ' | 'RUSH' | 'CORE' | 'ORBIT';
    asset: 'ETH' | 'BTC'; // Default to ETH for now, or allow param
    strike?: number; // Optional target strike price
}

interface DroidContextType {
    isDrawerOpen: boolean;
    openDrawer: () => void;
    closeDrawer: () => void;
    
    isOnboarding: boolean;
    completeOnboarding: (risk: RiskProfile, timeline: TimelineProfile) => void;
    
    riskProfile: RiskProfile;
    timelineProfile: TimelineProfile;
    
    messages: Message[];
    addMessage: (role: 'user' | 'assistant', content: string) => void;
    isThinking: boolean;
    setIsThinking: (thinking: boolean) => void;

    tradeIntent: TradeIntent | null;
    triggerTrade: (intent: TradeIntent) => void;
    clearTradeIntent: () => void;
    
    marketStats: Record<string, MarketStats>;
    updateMarketData: (data: MarketStats) => void;
}

export interface MarketStats {
    currentPrice: number;
    priceChange: number; // 24h change %
    volume24h: number;
    callVolume: number;
    putVolume: number;
    sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    priceHistory: number[]; // Simplified array of recent prices for trend analysis
    asset: 'ETH' | 'BTC';
}

const DroidContext = createContext<DroidContextType | undefined>(undefined);

export const DroidProvider = ({ children }: { children: ReactNode }) => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isOnboarding, setIsOnboarding] = useState(true); // Default to true for new users
    
    const [riskProfile, setRiskProfile] = useState<RiskProfile>('SAFE');
    const [timelineProfile, setTimelineProfile] = useState<TimelineProfile>('SHORT');
    const [tradeIntent, setTradeIntent] = useState<TradeIntent | null>(null);
    const [marketStats, setMarketStats] = useState<Record<string, MarketStats>>({});
    
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'init-1',
            role: 'assistant',
            content: "Systems Online. I am R.O.B.B.I.E. 9000. Ready for tactical analysis.",
            timestamp: Date.now()
        }
    ]);
    const [isThinking, setIsThinking] = useState(false);

    // Load state from localStorage on mount
    useEffect(() => {
        const savedRisk = localStorage.getItem('alphabit_risk_profile');
        const savedTimeline = localStorage.getItem('alphabit_timeline_profile');
        if (savedRisk) {
            setRiskProfile(savedRisk as RiskProfile);
            setTimelineProfile(savedTimeline as TimelineProfile);
            setIsOnboarding(false); // If profile exists, skip onboarding
        }
    }, []);

    const openDrawer = () => setIsDrawerOpen(true);
    const closeDrawer = () => setIsDrawerOpen(false);

    const completeOnboarding = (risk: RiskProfile, timeline: TimelineProfile) => {
        setRiskProfile(risk);
        setTimelineProfile(timeline);
        setIsOnboarding(false);
        localStorage.setItem('alphabit_risk_profile', risk || '');
        localStorage.setItem('alphabit_timeline_profile', timeline || '');
        
        // Add a context-aware welcome message
        addMessage('assistant', `Profile Calibrated. Risk: ${risk}. Timeline: ${timeline}. Accessing Market Data...`);
    };

    const addMessage = (role: 'user' | 'assistant', content: string) => {
        const newMessage: Message = {
            id: crypto.randomUUID(),
            role,
            content,
            timestamp: Date.now()
        };
        setMessages(prev => [...prev, newMessage]);
    };

    const triggerTrade = (intent: TradeIntent) => {
        setTradeIntent(intent);
        closeDrawer(); // Close chat so user can see the modal
    };

    const clearTradeIntent = () => {
        setTradeIntent(null);
    };

    const updateMarketData = React.useCallback((data: MarketStats) => {
        setMarketStats(prev => {
            // Check if data for this asset has actually changed to avoid re-renders
            const currentAssetData = prev[data.asset];
            if (JSON.stringify(currentAssetData) === JSON.stringify(data)) return prev;
            
            return {
                ...prev,
                [data.asset]: data
            };
        });
    }, []);

    return (
        <DroidContext.Provider value={{
            isDrawerOpen,
            openDrawer,
            closeDrawer,
            isOnboarding,
            completeOnboarding,
            riskProfile,
            timelineProfile,
            messages,
            addMessage,
            isThinking,
            setIsThinking,
            tradeIntent,
            triggerTrade,
            clearTradeIntent,
            marketStats,
            updateMarketData
        }}>
            {children}
        </DroidContext.Provider>
    );
};

export const useDroid = () => {
    const context = useContext(DroidContext);
    if (!context) {
        throw new Error('useDroid must be used within a DroidProvider');
    }
    return context;
};
