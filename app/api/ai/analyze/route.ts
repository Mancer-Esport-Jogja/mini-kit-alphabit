import { NextResponse } from "next/server";
import { groq, DROID_SYSTEM_PROMPT } from "@/lib/groq";

export async function POST(req: Request) {
    try {
        const { messages, marketData } = await req.json();

        if (!process.env.GROQ_API_KEY) {
            return NextResponse.json(
                { error: "Neural Link Offline: API Key Missing" },
                { status: 503 }
            );
        }

        // Prepare context message with market data if available
        const systemMessage = {
            role: "system",
            content: DROID_SYSTEM_PROMPT +
                (marketData ? `\n\nCURRENT MARKET DATA SCAN:\n${JSON.stringify(marketData)}` : "") +
                `\n\nCRITICAL INSTRUCTION: If you identify a high-conviction trade setup based on the profile and data, append a JSON block at the VERY END of your response (after your text analysis) in this EXACT format (minified):
            {"REC_DATA":{"profileType":"SAFE"|"DEGEN","target":"MOON"|"DOOM","duration":"BLITZ"|"RUSH"|"CORE"|"ORBIT","asset":"ETH"|"BTC","recommendedStrike":number,"reasoning":"Brief 1-sentence rationale."}}
            Only provide this JSON if you have a clear recommendation. Do not format it as markdown code.`
        };

        const completion = await groq.chat.completions.create({
            messages: [
                systemMessage,
                ...messages
            ],
            model: "groq/compound", // Fast, efficient model for chat
            temperature: 0.7,
            max_tokens: 300,
        });

        const responseContent = completion.choices[0]?.message?.content || "Signal lost...";

        return NextResponse.json({
            content: responseContent,
            // In a real app, we might parse JSON output for structured recommendations here
        });

    } catch (error) {
        console.error("Droid Brain Error:", error);
        return NextResponse.json(
            { error: "System Malfunction: efficient processing failed." },
            { status: 500 }
        );
    }
}
