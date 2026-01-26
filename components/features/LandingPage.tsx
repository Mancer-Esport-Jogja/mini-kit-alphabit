"use client";

import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, Github, Twitter, ExternalLink } from 'lucide-react';
import { PixelButton } from '@/components/ui/PixelButton';
import { GlitchText } from '@/components/ui/GlitchText';
import { PowerUpCard } from '@/components/ui/PowerUpCard';
import { TerminalWindow } from '@/components/ui/TerminalWindow';
import dynamic from 'next/dynamic';
import { useMiniApp } from '@neynar/react';

// Dynamic import for 3D component to avoid SSR issues
const FloatingCoin3D = dynamic(
    () => import('@/components/3d/FloatingCoin3D').then(mod => mod.FloatingCoin3D),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-64 flex items-center justify-center">
                <div className="text-neon-yellow font-pixel text-xs animate-pulse">
                    LOADING 3D...
                </div>
            </div>
        )
    }
);

interface LandingPageProps {
    onStart: () => void;
}

// Animation variants
const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }
    }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15 }
    }
};

const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] as const }
    }
};

// Developer logs data
const developerLogs = [
    {
        id: "log-01",
        title: "The Blitz Mode Dilemma",
        details: "Protocol Constraints vs Game Mechanics. We wanted real-time 'blitz' trading, but DeFi settlement takes time. Solved by visualizing pending liquidity states and simulating blitz mechanics with optimistic UI updates."
    },
    {
        id: "log-02",
        title: "Decoded Transmission",
        details: "Translating 'Greeks' to 'Pixels'. Delta, Gamma, Theta... pure jargon to most users. We built a translator layer that converts complex financial metrics into intuitive game stats like 'Power Level' and 'Risk Shield'."
    },
    {
        id: "log-03",
        title: "Mainnet Sandbox",
        details: "Testing on Mainnet is risky and expensive. We integrated Tenderly Mainnet Forks to create isolated testing environments that perfectly simulate real market conditions without risking actual funds."
    },
    {
        id: "log-04",
        title: "Logic Mapping",
        details: "Mapping simple 'UP/DOWN' predictions to complex Order Books and strike prices. Built a 'Best Execution Matcher' that automatically finds optimal options contracts matching user intent."
    },
    {
        id: "log-05",
        title: "Wallet Context",
        details: "Neynar Identity vs Wallet ambiguity in Farcaster Frames. Users have social identity but need wallet actions. Solved with environment-agnostic architecture that seamlessly bridges identity layers."
    }
];

export const LandingPage = ({ onStart }: LandingPageProps) => {
    const { isSDKLoaded, actions } = useMiniApp();

    const handleStart = async () => {
        if (isSDKLoaded && actions?.addMiniApp) {
            try {
                const result = await actions.addMiniApp();
                if (result.notificationDetails) {
                    console.log('Notification token:', result.notificationDetails.token);
                }
            } catch (e) {
                console.error("Failed to add mini app", e);
            }
        }
        onStart();
    };

    return (
        <div className="flex flex-col gap-0 relative">
            {/* SCANLINE EFFECT */}
            <div className="fixed inset-0 pointer-events-none z-50 opacity-5">
                <div className="w-full h-2 bg-white blur-sm absolute animate-scanline"></div>
            </div>

            {/* CRT Overlay */}
            <div className="crt-overlay opacity-30"></div>

            {/* ==================== SECTION 1: HERO ==================== */}
            <section className="min-h-screen relative flex flex-col items-center justify-center p-4">
                {/* Background Grid */}
                <div className="absolute inset-0 retro-grid opacity-30"></div>

                {/* 3D Coin */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="w-full max-w-sm mb-4"
                >
                    <Suspense fallback={
                        <div className="w-full h-64 flex items-center justify-center">
                            <div className="text-neon-red font-pixel text-xs animate-pulse">
                                LOADING...
                            </div>
                        </div>
                    }>
                        <FloatingCoin3D />
                    </Suspense>
                </motion.div>

                {/* Title */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                    className="text-center mb-8"
                >
                    <motion.div variants={fadeInUp}>
                        <span className="text-[10px] font-mono text-neon-red tracking-[0.3em] mb-2 block">
                            POWERED BY BASE & THETANUTS
                        </span>
                    </motion.div>

                    <motion.h1
                        variants={fadeInUp}
                        className="text-3xl md:text-4xl font-pixel text-white mb-4 leading-relaxed"
                    >
                        <span className="text-neon-yellow">Trade Options.</span>
                        <br />
                        <span className="text-neon-red">Play the Market.</span>
                    </motion.h1>

                    <motion.p
                        variants={fadeInUp}
                        className="text-slate-400 font-grotesk text-sm max-w-xs mx-auto"
                    >
                        Gamified DeFi Options on Base. Powered by Thetanuts & Farcaster.
                    </motion.p>
                </motion.div>

                {/* CTA Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="w-full max-w-xs"
                >
                    <div className="animate-pulse">
                        <PixelButton
                            label="INSERT COIN TO START"
                            icon={Gamepad2}
                            color="bg-neon-red"
                            hoverColor="hover:bg-red-500"
                            onClick={handleStart}
                        />
                    </div>
                </motion.div>

                {/* Scroll indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2"
                >
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-[8px] font-mono text-slate-600">SCROLL DOWN</span>
                        <div className="w-px h-8 bg-gradient-to-b from-neon-red to-transparent animate-pulse"></div>
                    </div>
                </motion.div>
            </section>

            {/* ==================== SECTION 2: THE GLITCH (Problem) ==================== */}
            <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={staggerContainer}
                className="py-16 px-4 relative bg-gradient-to-b from-neon-black via-neon-red/10 to-neon-black"
            >
                {/* Glitch lines decoration */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-0 w-full h-px bg-neon-red/30 animate-glitch"></div>
                    <div className="absolute top-1/2 left-0 w-full h-px bg-neon-red/20 animate-glitch" style={{ animationDelay: '0.1s' }}></div>
                    <div className="absolute top-3/4 left-0 w-full h-px bg-neon-red/30 animate-glitch" style={{ animationDelay: '0.2s' }}></div>
                </div>

                <motion.div variants={fadeInUp} className="text-center mb-8">
                    <div className="inline-block bg-neon-red/20 border-2 border-neon-red px-4 py-2 mb-4">
                        <span className="font-pixel text-neon-red text-xs animate-pulse">⚠ SYSTEM ERROR</span>
                    </div>

                    <h2 className="text-2xl font-pixel mb-4">
                        <GlitchText className="text-neon-red">GAME OVER:</GlitchText>
                        <br />
                        <span className="text-white">The Old Way</span>
                    </h2>
                </motion.div>

                <motion.div
                    variants={scaleIn}
                    className="bg-neon-black border-2 border-neon-red/50 p-6 max-w-md mx-auto relative"
                >
                    {/* Screen crack effect */}
                    <div className="absolute top-2 right-2 text-neon-red opacity-50">
                        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                            <path d="M0 0L15 20L5 25L20 40" stroke="currentColor" strokeWidth="1" />
                            <path d="M15 20L25 15L30 25" stroke="currentColor" strokeWidth="1" />
                        </svg>
                    </div>

                    <p className="text-slate-300 font-grotesk text-sm leading-relaxed mb-4">
                        DeFi options feel like a <span className="text-neon-red font-bold">high-stakes cockpit</span> filled
                        with jargon — Delta, Gamma, Theta...
                    </p>

                    <p className="text-slate-400 font-grotesk text-sm leading-relaxed mb-4">
                        It&apos;s lonely, complex, and <span className="text-neon-red">intimidates newcomers</span>.
                    </p>

                    <div className="flex flex-wrap gap-2 mt-4">
                        {['DELTA', 'GAMMA', 'THETA', 'IV', 'STRIKE'].map((term) => (
                            <span
                                key={term}
                                className="text-[8px] font-mono bg-neon-red/20 text-neon-red px-2 py-1 border border-neon-red/30"
                            >
                                {term}?
                            </span>
                        ))}
                    </div>
                </motion.div>
            </motion.section>

            {/* ==================== SECTION 3: LEVEL UP (Solution) ==================== */}
            <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={staggerContainer}
                className="py-16 px-4 bg-gradient-to-b from-neon-black via-neon-yellow/5 to-neon-black"
            >
                <motion.div variants={fadeInUp} className="text-center mb-8">
                    <div className="inline-block bg-neon-yellow/20 border-2 border-neon-yellow px-4 py-2 mb-4">
                        <span className="font-pixel text-neon-yellow text-xs">★ LEVEL UP ★</span>
                    </div>

                    <h2 className="text-2xl font-pixel text-white mb-2">
                        Power-Up <span className="text-neon-yellow">Acquired</span>
                    </h2>
                    <p className="text-slate-500 font-grotesk text-sm">
                        Solving DeFi&apos;s User Experience Crisis
                    </p>
                </motion.div>

                <div className="space-y-4 max-w-md mx-auto">
                    <motion.div variants={scaleIn}>
                        <PowerUpCard
                            icon="👾"
                            title="Abstracted Math"
                            subtitle="SIMPLICITY"
                            description="We replaced Greeks with Game Logic. No complex order books—just Strategy. HUNT(Buy) or FARM(Yield) with 0 friction."
                            borderColor="border-neon-yellow"
                            glowColor="hover:glow-yellow"
                        />
                    </motion.div>

                    <motion.div variants={scaleIn}>
                        <PowerUpCard
                            icon="🔥"
                            title="Fire Status"
                            subtitle="RETENTION"
                            description="Combating 'Mercenary Capital' with streaks. Build your 'Fire' status daily. Play for social prestige, not just profit."
                            borderColor="border-neon-red"
                            glowColor="hover:glow-red"
                        />
                    </motion.div>

                    <motion.div variants={scaleIn}>
                        <PowerUpCard
                            icon="🏆"
                            title="Verifiable Flexing"
                            subtitle="SOCIAL"
                            description="Farcaster Native. Compete in 'Weekly Survivors'. Share verifiable On-Chain Proofs of your wins. No fake screenshots."
                            borderColor="border-neon-red"
                            glowColor="hover:glow-red"
                        />
                    </motion.div>
                </div>
            </motion.section>

            {/* ==================== SECTION 3.5: MISSION BRIEFING (English Explanation) ==================== */}
            <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={staggerContainer}
                className="py-16 px-4 bg-slate-900 border-y-4 border-slate-800"
            >
                <motion.div variants={fadeInUp} className="text-center mb-10">
                    <div className="inline-block bg-slate-800 border-2 border-slate-600 px-4 py-2 mb-4">
                        <span className="font-pixel text-white text-xs">MISSION BRIEFING</span>
                    </div>

                    <h2 className="text-2xl font-pixel text-white mb-2">
                        CHOOSE YOUR <span className="text-neon-yellow">ROLE</span>
                    </h2>
                    <p className="text-slate-400 font-grotesk text-sm max-w-xs mx-auto">
                        Two ways to play. What is your style?
                    </p>
                </motion.div>

                <div className="grid gap-6 max-w-md mx-auto">
                    {/* HUNT MODE EXPLANATION */}
                    <motion.div
                        variants={scaleIn}
                        className="bg-neon-black border-4 border-neon-yellow p-6 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-100 transition-opacity">
                            <Gamepad2 className="w-16 h-16 text-neon-yellow" />
                        </div>

                        <div className="relative z-10">
                            <h3 className="text-xl font-pixel text-bit-green mb-1">HUNT MODE</h3>
                            <div className="text-[10px] font-mono text-slate-500 mb-4">ROLE: TRADER / SNIPER</div>

                            <p className="text-slate-300 font-grotesk text-sm mb-4 leading-relaxed">
                                <strong className="text-white">Objective:</strong> Predict price direction. <span className="text-yellow-400 font-bold">⏱ 6-HOUR EXPIRY</span> (on-chain settlement).
                            </p>

                            <ul className="text-xs font-mono text-slate-400 space-y-2 mb-4">
                                <li className="flex items-center gap-2">
                                    <span className="text-bit-green">➤</span> Select <span className="text-white">TARGET: MOON</span> (Call) if bullish.
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-bit-green">➤</span> Select <span className="text-bit-coral">TARGET: DOOM</span> (Put) if bearish.
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-neon-red">⚠</span> <span className="text-neon-red">Max Risk: 100% of your collateral.</span>
                                </li>
                            </ul>

                            <div className="bg-slate-900/50 p-3 border border-slate-700 rounded text-[10px] text-slate-300 italic">
                                &quot;Fast-paced action. Real on-chain options with 6-hour expiry.&quot;
                            </div>
                        </div>
                    </motion.div>

                    {/* FARM MODE EXPLANATION */}
                    <motion.div
                        variants={scaleIn}
                        className="bg-neon-black border-4 border-neon-yellow p-6 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-100 transition-opacity">
                            <div className="text-6xl text-neon-yellow font-pixel">🏦</div>
                        </div>

                        <div className="relative z-10">
                            <h3 className="text-xl font-pixel text-neon-yellow mb-1">FARM MODE</h3>
                            <div className="text-[10px] font-mono text-slate-500 mb-4">ROLE: THE HOUSE / REACTOR ENGINEER</div>

                            <p className="text-slate-300 font-grotesk text-sm mb-4 leading-relaxed">
                                <strong className="text-white">Objective:</strong> Build <strong>YIELD REACTORS</strong> by locking assets.
                            </p>

                            <ul className="text-xs font-mono text-slate-400 space-y-2 mb-4">
                                <li className="flex items-center gap-2">
                                    <span className="text-neon-yellow">➤</span> Deposit USDC into Vaults (&quot;Shields&quot;).
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-neon-yellow">➤</span> Your capital backs the HUNT players.
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-neon-yellow">➤</span> Earn automatic yield from premiums.
                                </li>
                            </ul>

                            <div className="bg-slate-900/50 p-3 border border-slate-700 rounded text-[10px] text-slate-300 italic">
                                &quot;Passive strategy. Become the liquidity backbone of the ecosystem.&quot;
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.section>

            {/* ==================== SECTION 4: DEVELOPER CONSOLE ==================== */}
            <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={fadeInUp}
                className="py-16 px-4 bg-gradient-to-b from-neon-black to-slate-950"
            >
                <div className="text-center mb-8">
                    <div className="inline-block bg-neon-red/20 border-2 border-neon-red px-4 py-2 mb-4">
                        <span className="font-pixel text-neon-red text-xs">{"<DEV/>"}</span>
                    </div>

                    <h2 className="text-2xl font-pixel text-white mb-2">
                        Developer <span className="text-neon-yellow">Console</span>
                    </h2>
                    <p className="text-slate-500 font-grotesk text-sm">
                        The Hackathon Journey
                    </p>
                </div>

                <div className="max-w-md mx-auto">
                    <TerminalWindow
                        title="hackathon.log"
                        logs={developerLogs}
                    />
                </div>
            </motion.section>

            {/* ==================== SECTION 5: FOOTER ==================== */}
            <motion.footer
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="py-12 px-4 bg-neon-black border-t border-slate-800"
            >
                <div className="max-w-md mx-auto text-center">
                    {/* Mission */}
                    <div className="mb-8">
                        <div className="w-12 h-12 mx-auto mb-4 bg-neon-red/20 border-2 border-neon-red flex items-center justify-center">
                            <span className="text-2xl">🚀</span>
                        </div>
                        <h3 className="font-pixel text-white text-sm mb-3">MISSION</h3>
                        <p className="text-slate-400 font-grotesk text-sm leading-relaxed">
                            Democratizing DeFi on Base. Paving the way for a vibrant onchain future.
                        </p>
                    </div>

                    {/* Links */}
                    <div className="flex justify-center gap-4 mb-8">
                        <a
                            href="https://github.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 bg-slate-900 border border-slate-700 flex items-center justify-center hover:border-neon-yellow hover:text-neon-yellow transition-colors"
                        >
                            <Github size={18} />
                        </a>
                        <a
                            href="https://twitter.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 bg-slate-900 border border-slate-700 flex items-center justify-center hover:border-neon-red hover:text-neon-red transition-colors"
                        >
                            <Twitter size={18} />
                        </a>
                        <a
                            href="https://warpcast.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 bg-slate-900 border border-slate-700 flex items-center justify-center hover:border-neon-red hover:text-neon-red transition-colors"
                        >
                            <ExternalLink size={18} />
                        </a>
                    </div>

                    {/* Copyright */}
                    <div className="text-[10px] font-mono text-slate-600">
                        <p>ALPHABIT © 2025 | BUILT ON BASE</p>
                        <p className="mt-1">[ THETANUTS PROTOCOL ] [ FARCASTER FRAMES ]</p>
                    </div>
                </div>
            </motion.footer>
        </div>
    );
};
