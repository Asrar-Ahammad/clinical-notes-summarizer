
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export class GeminiService {
    static async summarizeClinicalNote(note: string) {
        if (!API_KEY) {
            throw new Error("Gemini API Key is missing. Please ensure VITE_GEMINI_API_KEY is set in your .env file and RESTART the dev server.");
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

        // Attempting multiple models including Gemini 2.0 (referenced by user as Gemini 3)
        const modelsToTry = ["gemini-2.0-flash-exp", "gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
        let lastError = null;

        for (const modelName of modelsToTry) {
            try {
                console.log(`Attempting clinical summarization with model: ${modelName}`);
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();

                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (!jsonMatch) {
                    throw new Error("FormatError");
                }
                return JSON.parse(jsonMatch[0]);
            } catch (error: any) {
                lastError = error;
                console.warn(`Model ${modelName} failed:`, error.message);

                // If the error is an invalid API key, don't bother trying other models
                if (error.message?.includes('API key')) {
                    throw new Error("Invalid Gemini API Key. Please verify the key in your .env file and RESTART the dev server.");
                }

                // Continue to the next model in the fallback list
                continue;
            }
        }

        // if we reach here, all models failed
        const finalErrorMsg = lastError?.message || 'Unknown error';
        if (finalErrorMsg.includes('404')) {
            throw new Error("Gemini Model Not Found: Your API key may not have access to these models yet (e.g. 1.5 or 2.0). Please check your Google AI Studio account.");
        }

        throw new Error(`Summarization failed after trying all available models: ${finalErrorMsg}`);
    }
}
