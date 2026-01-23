import { useState, useEffect } from 'react';

export type Sentiment = 'BULLISH' | 'BEARISH' | 'NEUTRAL' | 'DANGER' | 'IDLE' | 'TUTORIAL';

interface BrainOutput {
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
) => {
    const [brainState, setBrainState] = useState<BrainOutput>({
        dialogue: "Systems online. Awaiting market data...",
        sentiment: 'NEUTRAL',
        isTalking: false,
    });

    useEffect(() => {
        if (!isActive) return;

        // === TUTORIAL MODE ===
        if (tutorialStep > 0) {
            let tutorialDialogue = "";
            switch (tutorialStep) {
                case 1:
                    tutorialDialogue = "Greetings, Pilot! I am R.O.B.B.I.E. 9000. I will guide you through your first Hunt mission.";
                    break;
                case 2:
                    tutorialDialogue = "First, scan the TACTICAL CHART. Green Lines mean 'Up', Red Lines mean 'Down'. Simple enough.";
                    break;
                case 3:
                    tutorialDialogue = "Next, choose your TARGET. 'MOON' if you predict rising prices. 'DOOM' if you expect a crash.";
                    break;
                case 4:
                    tutorialDialogue = "Finally, commit your COLLATERAL using the slider. Then hit INITIATE to begin the mission.";
                    break;
                default:
                    tutorialDialogue = "Tutorial complete. Good luck out there, Pilot.";
            }

            setBrainState({
                dialogue: tutorialDialogue,
                sentiment: 'TUTORIAL', // Use a special color/anim for tutorial
                isTalking: true,
            });
            return;
        }

        // === STANDARD HEURISTIC MODE ===
        let newSentiment: Sentiment = 'NEUTRAL';
        let newDialogue = "Scanning frequencies...";

        const { callVolume, putVolume, spreadSize } = stats;
        const totalVolume = callVolume + putVolume;

        // 1. DANGER CHECK (High Volatility/Spread)
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

        setBrainState({
            dialogue: newDialogue,
            sentiment: newSentiment,
            isTalking: true,
        });

        // In tutorial mode we don't auto-hide, but in normal mode we do
        const timeout = setTimeout(() => {
            setBrainState(prev => ({ ...prev, isTalking: false }));
        }, 5000);

        return () => clearTimeout(timeout);

    }, [stats.callVolume, stats.putVolume, stats.spreadSize, isActive, tutorialStep]);

    return brainState;
};
