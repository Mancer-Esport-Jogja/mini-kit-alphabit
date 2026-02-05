"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateRiskScore, getRecommendation, PsychologyProfile, RiskAnswer } from '@/utils/riskEngine';
import { typewriterSafeSlice, getVisibleTextLength } from './typewriterHelper';

// --- DATA ---
const INITIAL_SCENARIO = [
    { id: 'init-1', speaker: "SYSTEM", text: "Detecting organic life signs... Neural sync starting in 3... 2... 1...", expression: "processing" },
    { id: 'init-2', speaker: "R.O.B.B.I.E. 9000", text: "Ah, finally. A new <b>'organic'</b> in the pilot seat. How many cycles have I waited in this silent hangar? <span class='text-yellow-400'>Dusty and boring.</span>", expression: "neutral" },
    { id: 'init-3', speaker: "R.O.B.B.I.E. 9000", text: "My name is <b>R.O.B.B.I.E. 9000</b>. I am the tactical brain of this ship. And you... you are the Pilot. Don't be so tense, I can feel your irregular heartbeat through the biometric seat sensors.", expression: "scan" },
    { 
        id: 'lossAversion', // Formerly 'void-sim'
        speaker: "R.O.B.B.I.E. 9000", 
        text: "Emergency scenario initiated: Your ship was just hit by a <b>DeFi meteor storm</b>. The main reactor is leaking energy! Ship power is dropping by 20% in seconds. If you stay still, we'll go dark. What's your protocol, Pilot?", 
        expression: "alert",
        options: [
            { label: "Eject Protocol", value: "A", desc: "Secure what remains." }, // Safe
            { label: "Stabilize Reactor", value: "A", desc: "Measured risk." }, // Safe (Balanced)
            { label: "Overload Engine!", value: "B", desc: "Double Down!" } // Degen
        ]
    },
    { 
        id: 'timePreference', // Formerly 'time-nav'
        speaker: "R.O.B.B.I.E. 9000", 
        text: "Where does your adrenaline trigger? Hunting small meteors flashing by in hours <b class='text-cyan-400'>(Blitz)</b>, or waiting for a massive supernova that takes days to ripen <b class='text-rose-500'>(Orbit)</b>?", 
        expression: "scan",
        options: [
            { label: "Blitz Hunt", value: "B", desc: "Instant results." }, // Short/Impatience
            { label: "Await Supernova", value: "A", desc: "Explorer's patience." } // Long/Patience
        ]
    },
    { 
        id: 'goal', // Formerly 'weapon-select'
        speaker: "R.O.B.B.I.E. 9000", 
        text: "One last thing, Pilot. In the Alphabit armory, we have two types of warheads. Which one do you feel is more 'powerful'?", 
        expression: "neutral",
        options: [
            { label: "'Moon' Missile (Call)", value: "B", desc: "Fly to the stars." }, // Aggressive/Moon
            { label: "'Doom' Nuke (Put)", value: "A", desc: "Watch the market burn." } // Defensive/Income
        ]
    }
];

interface OnboardingProps {
    onComplete: (profile: PsychologyProfile) => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
    const [scene, setScene] = useState<'CRAWL' | 'NOVEL'>('CRAWL');
    const [scenario, setScenario] = useState(INITIAL_SCENARIO); // Dynamic Scenario
    const [currentDialogIndex, setCurrentDialogIndex] = useState(0);
    const [displayedText, setDisplayedText] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [answers, setAnswers] = useState<Record<string, RiskAnswer>>({});
    
    // Result State
    const [calculatedProfile, setCalculatedProfile] = useState<PsychologyProfile | null>(null);

    // Audio / Effects Refs (if needed)
    const typeIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const crawlRef = useRef<HTMLDivElement>(null);
    const lastTapRef = useRef(0);
    const [isFastForward, setIsFastForward] = useState(false);

    // --- CRAWL LOGIC ---
    useEffect(() => {
        if (scene === 'CRAWL') {
            const timer = setTimeout(() => {
                setIsTyping(true); // Pre-set typing for Novel start
                setScene('NOVEL');
            }, 35000); // Auto skip after 35s
            return () => clearTimeout(timer);
        }
    }, [scene]);

    // Fast Forward Handlers
    const startFastForward = () => {
        setIsFastForward(true);
        if (crawlRef.current) {
            const anims = crawlRef.current.getAnimations();
            anims.forEach(anim => anim.playbackRate = 4);
        }
    };

    const endFastForward = () => {
        setIsFastForward(false);
        if (crawlRef.current) {
            const anims = crawlRef.current.getAnimations();
            anims.forEach(anim => anim.playbackRate = 1);
        }
    };

    // --- VISUAL NOVEL LOGIC ---
    useEffect(() => {
        if (scene === 'NOVEL') {
            renderDialog();
        }
        return () => {
            if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
        };
    }, [scene, currentDialogIndex]);

    const renderDialog = () => {
        const data = scenario[currentDialogIndex];
        setIsTyping(true);
        setDisplayedText("");
        
        if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
        
        let charIndex = 0;
        const fullHtml = data.text;
        const totalChars = getVisibleTextLength(fullHtml);
        
        // Typing speed 30ms normally
        typeIntervalRef.current = setInterval(() => {
            charIndex++;
            const partialHtml = typewriterSafeSlice(fullHtml, charIndex);
            setDisplayedText(partialHtml);
            
            if (getVisibleTextLength(partialHtml) >= totalChars) {
                completeTyping();
            }
        }, 30);
    };

    const completeTyping = () => {
        if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
        const data = scenario[currentDialogIndex];
        setDisplayedText(data.text);
        setIsTyping(false);
    };

    const skipTyping = () => {
        if (isTyping) completeTyping();
    };

    const handleDoubleTap = (e: React.TouchEvent | React.MouseEvent) => {
        const now = Date.now();
        const timesince = now - lastTapRef.current;
        if (timesince < 300 && timesince > 0) {
            skipTyping();
        }
        lastTapRef.current = now;
    };

    const nextDialog = (force = false) => {
        if (isTyping) return;
        
        const currentData = scenario[currentDialogIndex];
        if (currentData.options && !force) {
            return;
        }

        if (currentDialogIndex < scenario.length - 1) {
            setIsTyping(true); // Immediate state update to hide buttons
            setDisplayedText(""); // Clear text immediately
            setCurrentDialogIndex(prev => prev + 1);
        } else {
            console.log("End of scenario reached unexpectedly");
        }
    };

    const handleOption = (value: string) => {
        const data = scenario[currentDialogIndex];
        
        const newAnswers = { ...answers, [data.id]: value as RiskAnswer };
        setAnswers(newAnswers);
        
        // Check if this was the last question of the INITIAL scenario
        if (data.id === 'goal') {
             finishNovel(newAnswers);
        } else if (data.id === 'launch') {
            handleLaunch();
        } else {
             nextDialog(true);
        }
    };

    const finishNovel = (finalAnswers: Record<string, RiskAnswer>) => {
        // Calculate Profile
        const profile: PsychologyProfile = {
            lossAversion: finalAnswers['lossAversion'] || 'A',
            timePreference: finalAnswers['timePreference'] || 'A',
            goal: finalAnswers['goal'] || 'A',
        };
        
        setCalculatedProfile(profile);
        const score = calculateRiskScore(profile);
        const isDegen = score >= 2;
        
        const profileName = isDegen ? "DEGEN PILOT" : "TACTICAL PILOT";
        const profileColor = isDegen ? "text-red-500" : "text-green-400";
        const desc = isDegen 
            ? `"You possess steel nerves (or perhaps a short circuit). I have prepared <b>aggressive strategies</b> for your courage. Let's conquer the market!"`
            : `"You are measured and methodical. I have prepared <b>solid defensive radars</b> for your mission. Safety is our priority."`;

        // Create Result Scenario Nodes
        const resultNodes = [
            { 
                id: 'result-proc', 
                speaker: "SYSTEM", 
                text: "ANALYZING BIOMETRIC FEEDBACK... CALCULATING RISK TOLERANCE... GENERATING PILOT PROFILE...", 
                expression: "processing" 
            },
            { 
                id: 'result-reveal', 
                speaker: "R.O.B.B.I.E. 9000", 
                text: `CALCULATION COMPLETE. Pilot, your designation is: <b class='${profileColor} text-xl'>${profileName}</b>.`, 
                expression: isDegen ? "alert" : "neutral"
            },
            { 
                id: 'result-desc', 
                speaker: "R.O.B.B.I.E. 9000", 
                text: desc,
                expression: "neutral" 
            },
            { 
                id: 'launch', 
                speaker: "R.O.B.B.I.E. 9000", 
                text: "All systems are green. The Arcade requires your skill. Are you ready to engage?", 
                expression: "scan",
                options: [
                    { label: "LAUNCH MISSION", value: "LAUNCH", desc: "Start trading." }
                ]
            }
        ];

        setScenario(prev => [...prev, ...resultNodes]);
        setIsTyping(true);
        setDisplayedText("");
        setCurrentDialogIndex(prev => prev + 1);
    };

    const handleLaunch = () => {
        if (calculatedProfile) {
            onComplete(calculatedProfile);
        }
    };

    // --- RENDERERS ---

    const renderCrawl = () => (
        <div 
            className="h-screen w-full bg-gradient-to-b from-black via-slate-950 to-black overflow-hidden relative cursor-pointer select-none font-sans"
            onMouseDown={startFastForward}
            onMouseUp={endFastForward}
            onMouseLeave={endFastForward}
            onTouchStart={startFastForward}
            onTouchEnd={endFastForward}
        >
             {/* Animated Starfield Background (Matched to StoryScroll) */}
             <div className="absolute inset-0 pointer-events-none">
                {[...Array(50)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full"
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            opacity: [0.2, 1, 0.2],
                            scale: [0.5, 1.5, 0.5],
                        }}
                        transition={{
                            duration: 2 + Math.random() * 3,
                            repeat: Infinity,
                            delay: Math.random() * 2,
                        }}
                    />
                ))}
            </div>

            {/* Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none opacity-10 z-10">
                <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-[scan_4s_linear_infinite]" />
            </div>

            {/* Grid Overlay */}
            <div className="absolute inset-0 opacity-5 pointer-events-none z-10" style={{
                backgroundImage: 'linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)',
                backgroundSize: '50px 50px'
            }} />

            {/* Vignette */}
            <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black opacity-60 pointer-events-none z-10" />

            {/* Fade Overlay (Top) - Retained for smooth exit */}
            <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-black via-black/80 to-transparent z-20 pointer-events-none" />

            {/* 3D Stage */}
            <div 
                className="flex justify-center h-full overflow-hidden origin-[50%_100%] absolute inset-0 pb-0"
                style={{ 
                    perspective: '500px',
                    perspectiveOrigin: 'center top'
                }}
            >
                 <div 
                    ref={crawlRef} 
                    className="relative origin-[50%_100%] animate-[crawl_80s_linear_forwards] text-center w-[90%] md:w-[70%] max-w-3xl will-change-transform pb-[200vh] px-4"
                    style={{ 
                        transform: 'rotateX(25deg)',
                        transformStyle: 'preserve-3d',
                        // transformOrigin handled by class but explicit style is safer for consistency
                    }}
                 >
                    {/* Header */}
                    <div className="text-center mb-16 space-y-6">
                        <motion.div
                            animate={{ 
                                textShadow: [
                                '0 0 10px rgba(234, 179, 8, 0.5)',
                                '0 0 25px rgba(234, 179, 8, 0.8)',
                                '0 0 10px rgba(234, 179, 8, 0.5)',
                                ]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="text-4xl md:text-6xl font-black font-pixel text-yellow-400 tracking-widest drop-shadow-[0_0_30px_rgba(234,179,8,0.7)]"
                        >
                            EPISODE I
                        </motion.div>
                        <h2 className="text-3xl md:text-5xl font-pixel text-cyan-300 tracking-wider drop-shadow-[0_0_20px_rgba(34,211,238,0.6)] uppercase">
                            THE ALPHA AWAKENING
                        </h2>
                        <div className="h-1 w-32 mx-auto bg-gradient-to-r from-transparent via-yellow-400 to-transparent" />
                    </div>

                    {/* Body Text */}
                    <div className="text-lg md:text-2xl leading-loose text-yellow-400 font-pixel drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] text-center uppercase tracking-[0.2em] space-y-16">
                        <p>In a galaxy ruled by <span className="text-rose-500 font-bold underline decoration-2 underline-offset-4">EXTREME VOLATILITY</span>...</p>
                        <p>DeFi chaos has shattered the hopes of veteran traders.</p>
                        <p>Yet, in a dark corner of the Base Network, a <span className="text-cyan-400 font-bold">new hope rises</span>.</p>
                        <p>Tactical Droid Unit 9000 has been reactivated.</p>
                        <p>Now, a new Pilot arrives at the hangar.</p>
                        <p>The fate of the market is in your hands.</p>
                        <p>Prepare yourself, Pilot... <span className="text-emerald-400 font-bold">calibration begins now</span>.</p>
                    </div>
                </div>
            </div>
            
            {/* FF HINT */}
            <div className={`absolute bottom-24 left-1/2 -translate-x-1/2 px-4 py-1 rounded text-[10px] tracking-[0.2em] font-pixel border transition-all duration-300 pointer-events-none z-50 ${
                isFastForward 
                    ? "bg-white text-black border-white opacity-100 scale-110" 
                    : "bg-yellow-900/10 text-yellow-500 border-yellow-500/30 opacity-40"
            }`}>
                {isFastForward ? ">> FAST FORWARDING >>" : "HOLD TO FAST FORWARD"}
            </div>

            <button 
                onClick={(e) => { e.stopPropagation(); setScene('NOVEL'); }}
                className="absolute bottom-10 right-10 z-50 text-[10px] font-pixel text-cyan-400 border-b border-cyan-400 uppercase hover:text-white hover:border-white tracking-widest"
            >
                Skip Prologue
            </button>
        </div>
    );

    const renderNovel = () => {
        const data = scenario[currentDialogIndex];
        if (!data) return null;

        const isRobbie = data.speaker.includes("R.O.B.B.I.E.");
        const expression = data.expression; 

        // Determine Eye/Body Color based on expression
        let colorClass = "bg-green-500 shadow-[0_0_15px_#22c55e]";
        let bodyBorder = "border-black";
        if (expression === 'alert') {
            colorClass = "bg-red-500 shadow-[0_0_15px_#ef4444]";
            bodyBorder = "border-red-500";
        }
        if (expression === 'processing') {
            colorClass = "bg-yellow-400 shadow-[0_0_15px_#facc15] animate-pulse";
        }

        return (
            <div className="h-screen flex flex-col relative z-20 overflow-hidden">
                {/* Background Image with Blur */}
                <div className="absolute inset-0 bg-[url('/assets/cockpit-bg.jpg')] bg-cover bg-center bg-no-repeat blur-[3px] scale-105" />
                <div className="absolute inset-0 bg-black/40 pointer-events-none" /> {/* Mild overlay for contrast */}
                
                <div className="flex-1 flex items-center justify-center p-4 relative z-10">
                    {/* ROBBIE DROID */}
                    <div className="animate-[floating_4s_ease-in-out_infinite] relative flex items-center justify-center scale-150 md:scale-[2.5]">
                        <div className="relative w-24 h-24">
                            <div className={`absolute top-2 left-2 w-20 h-16 bg-slate-700 border-4 ${bodyBorder} rounded-lg overflow-hidden transition-colors duration-500`}>
                                <div className="absolute top-3 left-2 w-14 h-6 bg-black rounded-sm flex items-center justify-center gap-2 overflow-hidden">
                                    <div className={`w-3 h-4 ${colorClass} transition-all duration-300`} />
                                    <div className={`w-3 h-4 ${colorClass} transition-all duration-300`} />
                                </div>
                                <div className="absolute bottom-2 left-4 w-10 h-2 flex gap-[2px]">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="flex-1 bg-slate-500" />
                                    ))}
                                </div>
                            </div>
                            <div className="absolute -top-2 right-6 w-1 h-6 bg-slate-500 border border-black origin-bottom">
                                <div className="absolute -top-1 -left-1 w-3 h-3 bg-red-500 rounded-full border border-black animate-pulse" />
                            </div>
                        </div>
                    </div>
                </div>

                <div 
                    className="bg-[rgba(0,15,0,0.95)] border-t-4 border-green-800 shadow-[0_-10px_50px_rgba(0,0,0,0.8)] w-full p-6 md:p-12 min-h-[250px] md:min-h-[300px] flex flex-col justify-between relative cursor-default select-none z-10"
                    // Changed: Remove click-to-next. Only double-click skips typing.
                    onDoubleClick={skipTyping} 
                    onTouchEnd={handleDoubleTap} 
                >
                    <div className="absolute -top-6 left-6 md:left-12 bg-green-600 text-black px-4 md:px-6 py-1 font-black italic skew-x-[-12deg] shadow-lg text-xs md:text-sm">
                        {data.speaker}
                    </div>
                    
                    <div className="max-w-4xl mx-auto w-full">
                        <p 
                            className="text-lg md:text-3xl font-mono leading-relaxed text-green-500 relative"
                            dangerouslySetInnerHTML={{ __html: displayedText + (isTyping ? '<span class="animate-pulse ml-1 opacity-80">|</span>' : '') }}
                        >
                        </p>
                    </div>
                    <div className="absolute bottom-4 right-6 text-[9px] text-green-900 uppercase opacity-40 select-none">
                        Double-Click to auto-complete
                    </div>

                    <div className={`max-w-4xl mx-auto w-full mt-6 md:mt-8 flex flex-col items-end ${isTyping ? 'opacity-0 pointer-events-none transition-none' : 'opacity-100 transition-opacity duration-300'}`}>
                        {data.options ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                                {data.options.map((opt, idx) => (
                                    <button 
                                        key={idx}
                                        onClick={(e) => { e.stopPropagation(); handleOption(opt.value); }}
                                        className="bg-[rgba(22,101,52,0.1)] border-2 border-green-800 hover:bg-green-500 hover:text-black hover:-translate-y-1 transition-all duration-200 p-3 md:p-4 text-left flex flex-col gap-1 group"
                                    >
                                        <span className="font-black uppercase italic text-xs md:text-sm">{opt.label}</span>
                                        <span className="text-[8px] md:text-[10px] opacity-60 uppercase group-hover:opacity-80">{opt.desc}</span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <button 
                                onClick={(e) => { e.stopPropagation(); nextDialog(true); }}
                                className="flex items-center gap-3 text-black bg-green-500 px-6 py-3 md:px-10 md:py-4 font-black text-sm md:text-xl hover:bg-white transition-all italic uppercase group"
                            >
                                CONTINUE 
                                <span className="group-hover:translate-x-2 transition-transform">&gt;</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="relative w-full h-full font-mono">
            {scene === 'CRAWL' && renderCrawl()}
            {scene === 'NOVEL' && renderNovel()}
        </div>
    );
}
