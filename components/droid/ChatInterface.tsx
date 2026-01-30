"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, Cpu, Zap, Clock, X } from 'lucide-react';
import { useDroid } from '@/context/DroidContext';
import { motion } from 'framer-motion';
import { TradeRecommendation, PsychologyProfile, RiskAnswer } from '@/utils/riskEngine';
import { TradeRecommendationCard } from './TradeRecommendationCard';
import ReactMarkdown from 'react-markdown';

type TacticalRecommendation = TradeRecommendation & { 
    target: 'MOON' | 'DOOM';
    asset: 'ETH' | 'BTC';
    recommendedStrike?: number;
};

export const ChatInterface = () => {
    const { messages, addMessage, isThinking, setIsThinking, riskProfile, timelineProfile, marketStats, closeDrawer } = useDroid();
    const [input, setInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);
    const [calibrationStep, setCalibrationStep] = useState<'IDLE' | 'Q1_LOSS' | 'Q2_TIME' | 'Q3_GOAL'>('IDLE');
    const [psyProfile, setPsyProfile] = useState<PsychologyProfile>({ lossAversion: 'A', timePreference: 'A', goal: 'A' });
    const [recommendation, setRecommendation] = useState<TacticalRecommendation | null>(null);

    const startCalibration = () => {
        setCalibrationStep('Q1_LOSS');
        addMessage('assistant', "RISK PROTOCOL INITIATED. Question 1: How do you react to a sudden -50% drop?");
    };

    const handleAnswer = (question: 'Q1' | 'Q2' | 'Q3', answer: string) => {
        if (question === 'Q1') {
            setPsyProfile(prev => ({ ...prev, lossAversion: answer === 'PANIC' ? 'A' : 'B' }));
            addMessage('user', answer);
            setTimeout(() => {
                setCalibrationStep('Q2_TIME');
                addMessage('assistant', "Question 2: What is your preferred mission duration?");
            }, 500);
        } else if (question === 'Q2') {
             setPsyProfile(prev => ({ ...prev, timePreference: answer === 'DAYS' ? 'A' : 'B' }));
             addMessage('user', answer);
             setTimeout(() => {
                 setCalibrationStep('Q3_GOAL');
                 addMessage('assistant', "Question 3: What is your primary objective?");
             }, 500);
        } else if (question === 'Q3') {
             const newProfile = { ...psyProfile, goal: answer === 'INCOME' ? 'A' : 'B' as RiskAnswer }; 
             setPsyProfile(newProfile);
             addMessage('user', answer);
             
             // End Calibration - Decoupled Flow
             setTimeout(() => {
                 setCalibrationStep('IDLE');
                 addMessage('assistant', "Protocol Calibrated. I am now synchronized with your risk parameters. Systems ready. Awaiting target coordinates.");
             }, 500);
        }
    };

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isThinking]);

    const handleSend = async (overrideInput?: string) => {
        const userMsg = overrideInput || input;
        if (!userMsg.trim() || isThinking || calibrationStep !== 'IDLE') return;

        setInput('');
        addMessage('user', userMsg);
        setIsThinking(true);

        try {
            // Prepare context
            const contextMsg = {
                role: 'system' as const,
                content: `User Profile: Risk=${riskProfile}, Timeline=${timelineProfile}.`
            };
            
            // Format recent history for API
            const apiMessages = [
                contextMsg,
                ...messages.slice(-5).map(m => ({ role: m.role, content: m.content })),
                { role: 'user' as const, content: userMsg }
            ];

            const res = await fetch('/api/ai/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    messages: apiMessages,
                    marketData: marketStats // Pass ALL Market Data
                })
            });

            const data = await res.json();
            
            if (data.content) {
                let contentToShow = data.content;
                
                // Parse for Recommendation JSON
                const jsonMatch = contentToShow.match(/\{"REC_DATA":.*\}/s);
                if (jsonMatch) {
                    try {
                        const jsonBlock = JSON.parse(jsonMatch[0]);
                        if (jsonBlock.REC_DATA) {
                            setRecommendation(jsonBlock.REC_DATA);
                            // Remove the JSON from the text message to keep it clean
                            contentToShow = contentToShow.replace(jsonMatch[0], '').trim();
                        }
                    } catch (e) {
                        console.error("Failed to parse recommendation JSON", e);
                    }
                }

                addMessage('assistant', contentToShow);
            } else {
                addMessage('assistant', "ERROR: Connection interrupted.");
            }
        } catch {
            addMessage('assistant', "ERROR: Critical failure in neural link.");
        } finally {
            setIsThinking(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-950 border-x border-slate-800">
            {/* Header */}
            {/* Header */}
            <div className="bg-slate-900 border-b border-slate-800 flex flex-col">
                <div className="p-3 pb-1 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="font-pixel text-[10px] text-green-500">R.O.B.B.I.E. 9000</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono flex items-center gap-2">
                        <span>{riskProfile} | {timelineProfile}</span>
                    </div>
                </div>
                
                {/* Controls */}
                <div className="px-3 pb-2 flex gap-2">
                    <button
                        onClick={closeDrawer}
                        className="p-1.5 bg-slate-900/50 hover:bg-slate-800 border border-green-500/30 rounded text-green-500/80 hover:text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.3)] hover:shadow-[0_0_15px_rgba(34,197,94,0.5)] transition-all"
                        title="Close System"
                    >
                        <X size={14} />
                    </button>
                    <button 
                        onClick={startCalibration}
                        disabled={calibrationStep !== 'IDLE' || isThinking}
                        className="flex-1 py-1.5 bg-slate-900/50 hover:bg-slate-800 border border-green-500/30 rounded text-[9px] font-pixel text-green-500/80 hover:text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.3)] hover:shadow-[0_0_15px_rgba(34,197,94,0.5)] transition-all disabled:opacity-50 disabled:shadow-none uppercase tracking-wider"
                        title="Recalibrate Protocol"
                    >
                         {isThinking || calibrationStep !== 'IDLE' ? '[ SYSTEM BUSY ]' : '[ CALIBRATE PROTOCOL ]'}
                    </button>
                </div>
            </div>

            {/* Chat Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                    <motion.div 
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div 
                            className={`max-w-[85%] p-3 rounded-lg text-xs leading-relaxed font-mono
                            ${msg.role === 'user' 
                                ? 'bg-blue-900/30 border border-blue-500/30 text-blue-100 rounded-tr-none' 
                                : 'bg-green-900/20 border border-green-500/30 text-green-100 rounded-tl-none'
                            }`}
                        >
                            {msg.role === 'assistant' && (
                                <div className="text-[8px] text-green-500/50 mb-1 flex items-center gap-1">
                                    <Cpu size={8} /> TACTICAL DROID
                                </div>
                            )}
                            {msg.role === 'assistant' ? (
                                <ReactMarkdown 
                                    components={{
                                        p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                                        ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                                        ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
                                        li: ({node, ...props}) => <li className="pl-1" {...props} />,
                                        h1: ({node, ...props}) => <h1 className="text-sm font-bold text-green-400 mt-3 mb-2 uppercase tracking-wide border-b border-green-500/30 pb-1" {...props} />,
                                        h2: ({node, ...props}) => <h2 className="text-xs font-bold text-green-400 mt-2 mb-1 uppercase" {...props} />,
                                        h3: ({node, ...props}) => <h3 className="text-xs font-bold text-green-500/80 mt-2 mb-1" {...props} />,
                                        strong: ({node, ...props}) => <strong className="text-green-300 font-bold" {...props} />,
                                        code: ({node, ...props}) => <code className="bg-green-900/30 px-1 py-0.5 rounded text-[10px] font-mono border border-green-500/20" {...props} />,
                                        blockquote: ({node, ...props}) => <blockquote className="border-l-2 border-green-500/50 pl-2 italic text-green-500/70 my-2" {...props} />,
                                    }}
                                >
                                    {msg.content}
                                </ReactMarkdown>
                            ) : (
                                msg.content
                            )}
                        </div>
                    </motion.div>
                ))}

                {/* Q1: Loss Aversion */}
                {calibrationStep === 'Q1_LOSS' && !isThinking && (
                     <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end gap-2">
                        <button
                            onClick={() => handleAnswer('Q1', 'PANIC')}
                            className="bg-green-900/20 border border-green-500 hover:bg-green-900/40 text-green-300 p-2 rounded flex items-center gap-2 text-xs transition-colors"
                        >
                            PANIC SELL
                        </button>
                        <button
                            onClick={() => handleAnswer('Q1', 'BUY MORE')}
                            className="bg-red-900/20 border border-red-500 hover:bg-red-900/40 text-red-300 p-2 rounded flex items-center gap-2 text-xs transition-colors"
                        >
                            BUY MORE
                        </button>
                    </motion.div>
                )}

                {/* Q2: Time Preference */}
                {calibrationStep === 'Q2_TIME' && !isThinking && (
                     <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end gap-2">
                        <button
                            onClick={() => handleAnswer('Q2', 'MINUTES')}
                            className="bg-yellow-900/20 border border-yellow-500 hover:bg-yellow-900/40 text-yellow-300 p-2 rounded flex items-center gap-2 text-xs transition-colors"
                        >
                            <Zap size={14} /> MINUTES
                        </button>
                        <button
                            onClick={() => handleAnswer('Q2', 'DAYS')}
                            className="bg-blue-900/20 border border-blue-500 hover:bg-blue-900/40 text-blue-300 p-2 rounded flex items-center gap-2 text-xs transition-colors"
                        >
                            <Clock size={14} /> DAYS
                        </button>
                    </motion.div>
                )}

                {/* Q3: Goal */}
                {calibrationStep === 'Q3_GOAL' && !isThinking && (
                     <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end gap-2">
                        <button
                            onClick={() => handleAnswer('Q3', 'INCOME')}
                            className="bg-purple-900/20 border border-purple-500 hover:bg-purple-900/40 text-purple-300 p-2 rounded flex items-center gap-2 text-xs transition-colors"
                        >
                            STEADY INCOME
                        </button>
                        <button
                            onClick={() => handleAnswer('Q3', 'MOON')}
                            className="bg-orange-900/20 border border-orange-500 hover:bg-orange-900/40 text-orange-300 p-2 rounded flex items-center gap-2 text-xs transition-colors"
                        >
                            MOONSHOT
                        </button>
                    </motion.div>
                )}

                {recommendation && !isThinking && (
                    <TradeRecommendationCard 
                        type={recommendation.profileType}
                        target={recommendation.target}
                        duration={recommendation.duration}
                        asset={recommendation.asset}
                        strike={recommendation.recommendedStrike}
                        reasoning={recommendation.reasoning}
                    />
                )}

                {isThinking && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                        <div className="bg-green-900/10 border border-green-500/10 p-3 rounded-lg rounded-tl-none">
                            <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce"></span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-3 bg-slate-900 border-t border-slate-800">
                {/* SUGGESTED CHIPS */}
                {!isThinking && calibrationStep === 'IDLE' && (
                    <div className="flex gap-2 mb-2 overflow-x-auto pb-1 scrollbar-hide">
                        {["Scan ETH", "Scan BTC", "Check Risk Score", "Market Sentiment"].map((q, i) => (
                            <button
                                key={i}
                                onClick={() => handleSend(q)}
                                className="whitespace-nowrap px-2 py-1 bg-slate-800 border border-slate-700 rounded text-[9px] text-slate-400 hover:text-green-400 hover:border-green-500/50 transition-colors font-pixel"
                            >
                                {q}
                            </button>
                        ))}
                    </div>
                )}
                
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask for tactical analysis..."
                        className="flex-1 bg-black border border-slate-700 rounded px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-green-500 transition-colors font-mono"
                    />
                    <button
                        onClick={() => handleSend()}
                        disabled={isThinking || !input.trim() || calibrationStep !== 'IDLE'}
                        className="bg-green-600 hover:bg-green-500 disabled:bg-slate-700 text-white p-2 rounded transition-colors"
                    >
                        <Send size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};
