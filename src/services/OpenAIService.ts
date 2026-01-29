
import OpenAI from "openai";

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY || "";
const openai = new OpenAI({
    apiKey: API_KEY,
    dangerouslyAllowBrowser: true // Since this is a client-side Vite app
});

export class OpenAIService {
    static async summarizeClinicalNote(note: string) {
        if (!API_KEY) {
            throw new Error("OpenAI API Key is missing. Please set VITE_OPENAI_API_KEY in your .env file.");
        }

        const prompt = `
            You are a medical expert assistant. Your task is to transform raw clinical notes into a highly structured, professional nursing handoff summary.
            
            Strictly follow this JSON format:
            {
                "handoffSummary": {
                    "briefOverview": "A concise 2-3 sentence overview of the patient's current status and reason for visit.",
                    "actionItems": ["List of immediate next steps for the incoming nurse"],
                    "pendingActions": [{"description": "Action details", "timeframe": "When it's due"}]
                },
                "sections": [
                    {
                        "sectionType": "CHIEF_COMPLAINT" | "HISTORY" | "VITALS" | "MEDICATIONS" | "ASSESSMENT" | "PLAN" | "LABS" | "IMAGING" | "PROCEDURE",
                        "summary": "Detailed narrative summary of this section",
                        "keyPoints": ["Bullet points of critical data"],
                        "confidenceScore": 0.0 to 1.0,
                        "sourceQuotes": ["Direct excerpts from the source note that support this summary"]
                    }
                ],
                "redFlags": [
                    {
                        "type": "vital_instability" | "abnormal_lab" | "safety_risk" | "urgent_finding",
                        "description": "Clear description of the alert",
                        "criticalityLevel": "critical" | "high" | "medium",
                        "rationale": "Clinical reasoning for the alert"
                    }
                ],
                "uncertainties": [
                    {
                        "description": "Ambiguous or unclear information from the source",
                        "potentialImpact": "How this might affect care"
                    }
                ]
            }

            If a section (like Allergies) is mentioned but not in the list above, categorize it into the closest relevant section or ASSESSMENT.
            
            Identify any 'Uncertainties' where the source note is contradictory, ambiguous, or lacks sufficient detail for a safe handoff.
            
            Clinical Note to Process:
            """
            ${note}
            """
        `;

        try {
            const response = await openai.chat.completions.create({
                model: "gpt-4o", // Using gpt-4o for clinical accuracy
                messages: [
                    { role: "system", content: "You are a professional clinical summarization assistant. Always output valid JSON." },
                    { role: "user", content: prompt }
                ],
                response_format: { type: "json_object" }
            });

            const text = response.choices[0].message.content;
            if (!text) {
                throw new Error("No response from OpenAI");
            }

            return JSON.parse(text);
        } catch (error: any) {
            console.error("OpenAI Error:", error);
            if (error.status === 401) {
                throw new Error("Invalid OpenAI API Key. Please verify the key in your .env file.");
            }
            throw new Error(`Summarization failed: ${error.message || 'Unknown error'}`);
        }
    }
}
