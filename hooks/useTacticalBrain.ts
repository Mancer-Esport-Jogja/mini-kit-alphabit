import { useState, useEffect } from 'react';

export type Sentiment = 'BULLISH' | 'BEARISH' | 'NEUTRAL' | 'DANGER' | 'IDLE' | 'TUTORIAL';

export interface BrainOutput {
    dialogue: string;
    sentiment: Sentiment;
    isTalking: boolean;
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

    // === MAIN EFFECT LOOP ===
    useEffect(() => {
        if (!isActive) return;

        // If tutorial active, skip standard market commentary
        if (tutorialStep > 0) {
            let tutorialDialogue = "";
            switch (tutorialStep) {
                case 1: tutorialDialogue = "Greetings, Pilot! I am R.O.B.B.I.E. 9000. I will guide you through your first Hunt mission."; break;
                case 2: tutorialDialogue = "Step 1: The TACTICAL CHART. Green Lines = Up, Red Lines = Down. Analyze the trend."; break;
                case 3: tutorialDialogue = "Step 2: DURATION. Select 'BLITZ' for quick strikes or 'CORE' for daily missions."; break;
                case 4: tutorialDialogue = "Step 3: TARGET. Choose 'MOON' if you predict a pump, or 'DOOM' if you foresee a crash."; break;
                case 5: tutorialDialogue = "Step 4: COLLATERAL. Slide to commit your USDC. Higher collateral = Higher potential rewards."; break;
                case 6: tutorialDialogue = "Step 5: PAYLOAD. Use 'Auto Best' for optimal yield, or click to manually select a specific strike."; break;
                case 7: tutorialDialogue = "Final Step: INITIATE. Warning: Capital is at risk. Only fly what you can afford to lose. Good luck!"; break;
                default: tutorialDialogue = "Tutorial complete. Engaging Standard Monitoring Mode.";
            }
            setDialogue(tutorialDialogue);
            setSentiment('TUTORIAL');
            setIsTalking(true);
            return;
        }

        // === STANDARD HEURISTIC MODE ===
        // (Only runs if no tutorial active)

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

    }, [stats, isActive, tutorialStep]);

    return {
        dialogue,
        sentiment,
        isTalking
    };
};
