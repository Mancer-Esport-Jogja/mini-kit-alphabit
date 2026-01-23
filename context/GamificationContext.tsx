"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

// --- Types ---
export interface Mission {
    id: string;
    title: string;
    xpReward: number;
    isCompleted: boolean;
    type: 'DAILY' | 'ACHIEVEMENT';
}

export interface Achievement {
    id: string;
    icon: string;
    title: string;
    description: string;
    isUnlocked: boolean;
    xpReward: number;
}

interface GamificationState {
    level: number;
    xp: number;
    maxXp: number;
    rankTitle: string;
    streak: number;
    lastLoginDate: string | null;
    missions: Mission[];
    achievements: Achievement[];
    addXp: (amount: number) => void;
    completeMission: (id: string) => void;
    checkStreak: () => void;
}

// --- Constants ---
const RANK_TITLES = [
    "Cadet",        // Lvl 1
    "Scout",        // Lvl 2
    "Ranger",       // Lvl 3
    "Striker",      // Lvl 4
    "Ace",          // Lvl 5
    "Veteran",      // Lvl 6
    "Commander",    // Lvl 7
    "Legend",       // Lvl 8+
];

const INITIAL_MISSIONS: Mission[] = [
    { id: 'daily_login', title: 'Access Terminal', xpReward: 50, isCompleted: false, type: 'DAILY' },
    { id: 'market_watch', title: 'Market Recon (5s)', xpReward: 100, isCompleted: false, type: 'DAILY' },
    { id: 'first_strike', title: 'Deploy a Trade', xpReward: 250, isCompleted: false, type: 'DAILY' },
];

const INITIAL_ACHIEVEMENTS: Achievement[] = [
    { id: 'bootcamp', icon: '🎓', title: 'Bootcamp Grad', description: 'Complete the Tutorial', isUnlocked: false, xpReward: 200 },
    { id: 'first_blood', icon: '⚔️', title: 'First Blood', description: 'Execute your first trade', isUnlocked: false, xpReward: 300 },
    { id: 'diamond_hands', icon: '💎', title: 'Diamond Hands', description: ' reach Level 5', isUnlocked: false, xpReward: 1000 },
];

// --- Context ---
const GamificationContext = createContext<GamificationState | undefined>(undefined);

export const GamificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // State
    const [level, setLevel] = useState(1);
    const [xp, setXp] = useState(0);
    const [streak, setStreak] = useState(0);
    const [lastLoginDate, setLastLoginDate] = useState<string | null>(null);
    const [missions, setMissions] = useState<Mission[]>(INITIAL_MISSIONS);
    const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);

    const maxXp = level * 500; // Simple curve
    const rankTitle = RANK_TITLES[Math.min(level - 1, RANK_TITLES.length - 1)];

    // --- Persistence ---
    useEffect(() => {
        const saved = localStorage.getItem('alphabit_gamification');
        if (saved) {
            const parsed = JSON.parse(saved);
            setLevel(parsed.level || 1);
            setXp(parsed.xp || 0);
            setStreak(parsed.streak || 0);
            setLastLoginDate(parsed.lastLoginDate || null);
            if (parsed.missions) setMissions(parsed.missions);
            if (parsed.achievements) setAchievements(parsed.achievements);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('alphabit_gamification', JSON.stringify({
            level, xp, streak, lastLoginDate, missions, achievements
        }));
    }, [level, xp, streak, lastLoginDate, missions, achievements]);

    // --- Logic ---

    const addXp = (amount: number) => {
        setXp(prev => {
            const newXp = prev + amount;
            if (newXp >= maxXp) {
                // Level Up Logic
                setLevel(l => l + 1);
                return newXp - maxXp; // Rollover
            }
            return newXp;
        });
    };

    const completeMission = (id: string) => {
        setMissions(prev => {
            const mission = prev.find(m => m.id === id);
            if (mission && !mission.isCompleted) {
                addXp(mission.xpReward);
                return prev.map(m => m.id === id ? { ...m, isCompleted: true } : m);
            }
            return prev;
        });
    };

    const checkStreak = () => {
        const today = new Date().toDateString();
        if (lastLoginDate !== today) {
            // New day login
            const yesterday = new Date(Date.now() - 86400000).toDateString();
            if (lastLoginDate === yesterday) {
                setStreak(s => s + 1);
            } else if (lastLoginDate !== null) {
                // Broken streak (if not first login)
                // For forgiving UI, maybe we don't reset to 0 immediately in a hackathon demo, 
                // but strictly speaking we should. Let's be kind.
                setStreak(1);
            } else {
                // First ever login
                setStreak(1);
            }
            setLastLoginDate(today);

            // Reset Daily Missions
            setMissions(prev => prev.map(m => m.type === 'DAILY' ? { ...m, isCompleted: false } : m));

            // Auto-complete login mission
            completeMission('daily_login');
        }
    };

    // Check achievements
    useEffect(() => {
        // Example: Level 5 Achievement
        if (level >= 5) {
            const badge = achievements.find(a => a.id === 'diamond_hands');
            if (badge && !badge.isUnlocked) {
                setAchievements(prev => prev.map(a => a.id === 'diamond_hands' ? { ...a, isUnlocked: true } : a));
                // addXp(badge.xpReward); // Optional: recursive XP might be dangerous if not careful
            }
        }
    }, [level, achievements]);

    return (
        <GamificationContext.Provider value={{
            level, xp, maxXp, rankTitle, streak, lastLoginDate,
            missions, achievements,
            addXp, completeMission, checkStreak
        }}>
            {children}
        </GamificationContext.Provider>
    );
};

export const useGamification = () => {
    const context = useContext(GamificationContext);
    if (context === undefined) {
        throw new Error('useGamification must be used within a GamificationProvider');
    }
    return context;
};
