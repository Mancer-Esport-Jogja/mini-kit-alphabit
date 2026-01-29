
export type RiskAnswer = 'A' | 'B';

export interface PsychologyProfile {
    lossAversion: RiskAnswer; // A=Panic(Safe), B=BuyMore(Degen)
    timePreference: RiskAnswer; // A=Days(Long), B=Minutes(Short) - Wait, let's align: A=Patient, B=Impatient
    goal: RiskAnswer; // A=Income(Safe), B=Moon(Degen)
}

export interface TradeRecommendation {
    profileType: 'SAFE' | 'BALANCED' | 'DEGEN';
    duration: 'BLITZ' | 'RUSH' | 'CORE' | 'ORBIT';
    reasoning: string;
}

/**
 * Calculates a Risk Score from 0 to 3.
 * 0 = Ultra Safe
 * 3 = Ultra Degen
 */
export const calculateRiskScore = (profile: PsychologyProfile): number => {
    let score = 0;
    if (profile.lossAversion === 'B') score++;
    if (profile.timePreference === 'B') score++;
    if (profile.goal === 'B') score++;
    return score;
};

export const getRecommendation = (profile: PsychologyProfile): TradeRecommendation => {
    const score = calculateRiskScore(profile);

    // Default Safe
    let rec: TradeRecommendation = {
        profileType: 'SAFE',
        duration: 'ORBIT',
        reasoning: "Maximize stability. Weekly contracts (ORBIT) offer time to recover from volatility."
    };

    if (score === 3) {
        rec = {
            profileType: 'DEGEN',
            duration: 'BLITZ',
            reasoning: "Maximum aggression. 2-Hour (BLITZ) contracts for instant feedback and high leverage."
        };
    } else if (score === 2) {
        // Leaning Degen
        rec = {
            profileType: 'DEGEN',
            duration: 'RUSH',
            reasoning: "Balanced aggression. 12-Hour (RUSH) contracts capture intraday moves."
        };
    } else if (score === 1) {
        // Leaning Safe
        rec = {
            profileType: 'BALANCED',
            duration: 'CORE',
            reasoning: "Strategic balance. Daily (CORE) contracts filter out noise while capturing trend."
        };
    }

    // Special override logic if patient but aggressive goal?
    // For now, simple score mapping is sufficient for MVP.

    return rec;
};
