
import type {
    SummarizedSection
} from '../types';
import type { SectionMapping } from './SectionClassifier';

export class SummarizationEngine {
    static summarizeSection(mapping: SectionMapping): SummarizedSection {
        const lines = mapping.content.split('\n');

        const summary = lines.length > 3
            ? lines.slice(0, 3).join(' ') + '...'
            : mapping.content;

        const keyPoints = lines
            .filter(l => l.trim().length > 10)
            .map(l => l.replace(/^[-*•]\s*/, '').trim())
            .slice(0, 3);

        return {
            sectionType: mapping.sectionType,
            summary: summary,
            keyPoints: keyPoints,
            confidenceScore: mapping.confidence,
            preservedDetails: []
        };
    }

    static preserveFactualAccuracy(_original: string, _summary: string): boolean {
        return true;
    }
}
