
import type { StructuredSummary } from '../types';
import { InputProcessor } from './InputProcessor';
import { SafetyValidator } from './SafetyValidator';
import { OpenAIService } from './OpenAIService';

export class ClinicalSummarizationAssistant {
    static async processNote(rawNote: string): Promise<StructuredSummary> {
        const startTime = Date.now();
        const processingSteps: string[] = [];

        const { isValid, errors, warnings } = InputProcessor.validateInput(rawNote);
        if (!isValid) {
            throw new Error(`Input validation failed: ${errors.join(', ')}`);
        }
        const cleanNote = InputProcessor.preprocessText(rawNote);
        processingSteps.push('input_processing');

        // Use OpenAI for the core summarization logic
        const openAIResult = await OpenAIService.summarizeClinicalNote(cleanNote);
        processingSteps.push('openai_summarization');

        const redFlags = openAIResult.redFlags || [];
        const uncertainties = openAIResult.uncertainties || [];
        const handoffSummary = openAIResult.handoffSummary;
        const formattedSections = openAIResult.sections || [];

        const structuredSummary: StructuredSummary = {
            id: Math.random().toString(36).substr(2, 9),
            sourceNoteId: '1',
            generatedAt: new Date(),
            sections: formattedSections,
            redFlags,
            uncertainties,
            handoffSummary,
            completenessScore: (formattedSections.length / 8),
            safetyValidation: { isCompliant: true, violations: [] },
            sourceTraceability: [],
            processingMetadata: {
                processingTime: Date.now() - startTime,
                componentsUsed: processingSteps,
                confidenceScores: [],
                warningsGenerated: warnings
            }
        };

        const safetyCheck = SafetyValidator.validateOutput(structuredSummary);
        structuredSummary.safetyValidation = safetyCheck;

        return structuredSummary;
    }
}

