import { NextResponse } from "next/server";
import { groq, DROID_SYSTEM_PROMPT } from "@/lib/groq";

// Define the response type for clarity
export type AI_Prediction_Response = {
    direction: 'MOON' | 'DOOM';
    duration: 'BLITZ' | 'RUSH' | 'CORE' | 'ORBIT';
    recommendedStrike: number;
    confidence: number; // 0-100
    reasoning: string;
};

export async function POST(req: Request) {
    try {
        const { asset, marketData } = await req.json();

        if (!process.env.GROQ_API_KEY) {
            return NextResponse.json(
                { error: "Neural Link Offline: API Key Missing" },
                { status: 503 }
            );
        }

        const prompt = `
            SYS: ${DROID_SYSTEM_PROMPT}

            TASK: Analyze the provided market data for ${asset} and generate a single high-conviction prediction for an arcade game scenario.
            
            MARKET DATA:
            ${JSON.stringify(marketData)}

            INSTRUCTION:
            - Decide if the asset is bullish (MOON) or bearish (DOOM) based on the data.
            - Select a duration (BLITZ=2h, RUSH=12h, CORE=24h, ORBIT=Weekly).
            - Recommend a target strike price (make it realistic based on current price).
            - Assign a confidence score (0-100).
            - Provide a short, pithy reasoning (1 sentence).

            OUTPUT FORMAT:
            You must output ONLY a valid JSON object. Do not include markdown formatting or extra text.
            {
                "direction": "MOON" | "DOOM",
                "duration": "BLITZ" | "RUSH" | "CORE" | "ORBIT",
                "recommendedStrike": number,
                "confidence": number,
                "reasoning": "string"
            }
        `;

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "user", content: prompt } // Using user role for the specific task prompt
            ],
            model: "groq/compound",
            temperature: 0.5, // Lower temperature for more deterministic output
            max_tokens: 200,
        });

        const content = completion.choices[0]?.message?.content?.trim() || "";

        // Clean up potential markdown code blocks if the model adds them
        const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();

        let prediction: AI_Prediction_Response;
        try {
            prediction = JSON.parse(cleanContent);
        } catch (_e) {
            console.error("Failed to parse AI output:", content);
            return NextResponse.json({ error: "Data Corruption" }, { status: 500 });
        }

        return NextResponse.json({ prediction });

    } catch (error) {
        console.error("Oracle Error:", error);
        return NextResponse.json(
            { error: "Oracle Unreachable" },
            { status: 500 }
        );
    }
}
