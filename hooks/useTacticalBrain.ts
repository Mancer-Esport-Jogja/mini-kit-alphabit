
import { useState, useEffect, useCallback } from 'react';

export type Sentiment = 'BULLISH' | 'BEARISH' | 'NEUTRAL' | 'DANGER' | 'IDLE' | 'TUTORIAL' | 'INTERVIEW';

export type InterviewStage = 'IDLE' | 'INTRO' | 'RISK' | 'TIMELINE' | 'RECOMMENDING';
export type RiskProfile = 'SAFE' | 'DEGEN' | null;
export type TimelineProfile = 'SHORT' | 'LONG' | null;

export interface BrainOutput {
    dialogue: string;
    sentiment: Sentiment;
    isTalking: boolean;
    // Interview State
    interviewStage: InterviewStage;
    interviewData: {
        risk: RiskProfile;
        timeline: TimelineProfile;
    };
    startInterview: () => void;
    handleDetailInput: (type: 'RISK' | 'TIMELINE', value: string) => void;
    cancelInterview: () => void;
}

interface MarketStats {
    callVolume: number;
    putVolume: number;
    spreadSize: number;
}

/**
 * useTacticalBrain
 * The logic core for R.O.B.B.I.E.
 * Analyzes market stats and returns appropriate dialogue.
 */
export const useTacticalBrain = (
    stats: MarketStats,
    isActive: boolean = true,
    tutorialStep: number = 0 // 0 = standard mode, >0 = tutorial mode
): BrainOutput => {
    // Standard Brain State
    const [dialogue, setDialogue] = useState("Systems online. Awaiting market data...");
    const [sentiment, setSentiment] = useState<Sentiment>('NEUTRAL');
    const [isTalking, setIsTalking] = useState(false);

    // Interview State
    const [interviewStage, setInterviewStage] = useState<InterviewStage>('IDLE');
    const [interviewData, setInterviewData] = useState<{ risk: RiskProfile, timeline: TimelineProfile }>({
        risk: null,
        timeline: null
    });

    const startInterview = useCallback(() => {
        setInterviewStage('INTRO');
        setSentiment('INTERVIEW');
        setIsTalking(true);
        setDialogue("Tactical Interview Initiated. I will analyze your risk profile to find the optimal mission.");

        // Auto-advance to first question after brief intro
        setTimeout(() => {
            setInterviewStage('RISK');
            setDialogue("First Question: Define your Risk Tolerance. Are you looking for safe, steady yields, or high-risk 'Degen' multiples?");
        }, 3000);
    }, []);

    const handleDetailInput = useCallback((type: 'RISK' | 'TIMELINE', value: string) => {
        // Calculate new state first
        let newRisk = interviewData.risk;
        let newTimeline = interviewData.timeline;

        if (type === 'RISK') newRisk = value as RiskProfile;
        if (type === 'TIMELINE') newTimeline = value as TimelineProfile;

        setInterviewData({ risk: newRisk, timeline: newTimeline });

        if (type === 'RISK') {
            setInterviewStage('TIMELINE');
            setDialogue("Understood. And what is your Mission Timeline? 'Short' interactions, or 'Long' term holding?");
        } else if (type === 'TIMELINE') {
            setInterviewStage('RECOMMENDING');

            // Logic for recommendation
            // const risk = newRisk;
            const time = value;
            let recText = "";

            if (newRisk === 'SAFE' && time === 'SHORT') recText = "Recommendation: CORE Strategy (18-36H). Stable theta decay. Limit exposure.";
            else if (newRisk === 'DEGEN' && time === 'SHORT') recText = "Recommendation: BLITZ Strategy (2-9H). Maximize Gamma. Hunt the volatility.";
            else if (newRisk === 'SAFE' && time === 'LONG') recText = "Recommendation: ORBIT Strategy (>36H). Weekly cycles. Passive accumulation.";
            else if (newRisk === 'DEGEN' && time === 'LONG') recText = "Recommendation: RUSH Strategy (9-18H). Balanced attack. High leverage potential.";
            else recText = "Analysis complete. Optimal strategy calculated.";

            setDialogue(`Analyzing parameters... Match found. ${recText}`);
        }
    }, [interviewData]);

    const cancelInterview = useCallback(() => {
        setInterviewStage('IDLE');
        setInterviewData({ risk: null, timeline: null });
        setDialogue("Interview aborted. Returning to standard monitoring.");
        setSentiment('NEUTRAL');
        setTimeout(() => setIsTalking(false), 2000);
    }, []);


    // === MAIN EFFECT LOOP ===
    useEffect(() => {
        if (!isActive) return;

        // If in interview or tutorial, skip standard market commentary
        if (interviewStage !== 'IDLE' || tutorialStep > 0) {

            // Handle Tutorial specific updates
            if (tutorialStep > 0 && interviewStage === 'IDLE') {
                let tutorialDialogue = "";
                switch (tutorialStep) {
                    case 1: tutorialDialogue = "Greetings, Pilot! I am R.O.B.B.I.E. 9000. I will guide you through your first Hunt mission."; break;
                    case 2: tutorialDialogue = "First, scan the TACTICAL CHART. Green Lines mean 'Up', Red Lines mean 'Down'. Simple enough."; break;
                    case 3: tutorialDialogue = "Next, choose your TARGET. 'MOON' if you predict rising prices. 'DOOM' if you expect a crash."; break;
                    case 4: tutorialDialogue = "Finally, commit your COLLATERAL using the slider. Then hit INITIATE to begin the mission."; break;
                    default: tutorialDialogue = "Tutorial complete. Good luck out there, Pilot.";
                }
                setDialogue(tutorialDialogue);
                setSentiment('TUTORIAL');
                setIsTalking(true);
            }
            return;
        }

        // === STANDARD HEURISTIC MODE ===
        // (Only runs if no interview/tutorial active)

        let newSentiment: Sentiment = 'NEUTRAL';
        let newDialogue = "Scanning frequencies...";

        const { callVolume, putVolume, spreadSize } = stats;
        const totalVolume = callVolume + putVolume;

        // 1. DANGER CHECK
        if (spreadSize > 50) {
            newSentiment = 'DANGER';
            newDialogue = "WARNING: Market turbulence detected! High spreads. Deploy Risk Shields (Collateral) immediately!";
        }
        // 2. TREND CHECK
        else if (totalVolume > 0) {
            if (callVolume > putVolume * 1.5) {
                newSentiment = 'BULLISH';
                newDialogue = "Sensors indicate strong UPWARD draft. The herd is targeting the MOON. Suggest following vector.";
            } else if (putVolume > callVolume * 1.5) {
                newSentiment = 'BEARISH';
                newDialogue = "Gravity anomalies detected. Heavy downside pressure. DOOM strategies are optimal.";
            } else {
                newSentiment = 'NEUTRAL';
                newDialogue = "Market direction uncertain. Chop fest likely. Maintain holding pattern or farm yields.";
            }
        } else {
            newSentiment = 'IDLE';
            newDialogue = "No signal... Is anyone out there? Insert coin to start analysis.";
        }

        setDialogue(newDialogue);
        setSentiment(newSentiment);
        setIsTalking(true);

        const timeout = setTimeout(() => {
            setIsTalking(false);
        }, 5000);

        return () => clearTimeout(timeout);

    }, [stats, isActive, tutorialStep, interviewStage]);

    return {
        dialogue,
        sentiment,
        isTalking,
        interviewStage,
        interviewData,
        startInterview,
        handleDetailInput,
        cancelInterview
    };
};
