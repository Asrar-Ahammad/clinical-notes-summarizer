
import type {

    TextSpan
} from '../types';

import { SectionType } from '../types';

export interface SectionMapping {
    sectionType: SectionType;
    content: string;
    confidence: number;
    sourceSpan: TextSpan;
}

export class SectionClassifier {
    private static sectionMarkers: Partial<Record<SectionType, string[]>> = {
        [SectionType.CHIEF_COMPLAINT]: ['chief complaint', 'cc:', 'reason for visit', 'presenting problem'],
        [SectionType.HISTORY_PRESENT_ILLNESS]: ['history of present illness', 'hpi', 'history of current illness'],
        [SectionType.PAST_MEDICAL_HISTORY]: ['past medical history', 'pmh', 'medical history'],
        [SectionType.MEDICATIONS]: ['medications', 'current meds', 'medication list', 'meds:'],
        [SectionType.ALLERGIES]: ['allergies', 'allergy:', 'known allergies'],
        [SectionType.VITALS]: ['vitals', 'vital signs', 'vs:', 'physical exam'],
        [SectionType.PENDING_TESTS]: ['pending tests', 'tests ordered', 'imaging'],
        [SectionType.PENDING_LABS]: ['pending labs', 'labs ordered', 'laboratory']
    };

    static classifyContent(text: string): SectionMapping[] {
        const mappings: SectionMapping[] = [];
        const lines = text.split('\n');
        let currentSection: SectionType | null = null;
        let currentContent: string[] = [];
        let sectionStart = 0;

        lines.forEach((line) => {
            const lowerLine = line.toLowerCase().trim();
            let foundType: SectionType | null = null;

            for (const [type, markers] of Object.entries(this.sectionMarkers)) {
                if (markers.some(marker => lowerLine.startsWith(marker))) {
                    foundType = type as SectionType;
                    break;
                }
            }

            if (foundType) {
                if (currentSection) {
                    mappings.push({
                        sectionType: currentSection,
                        content: currentContent.join('\n').trim(),
                        confidence: 0.9,
                        sourceSpan: { start: sectionStart, end: text.indexOf(line) }
                    });
                }
                currentSection = foundType;
                currentContent = [line];
                sectionStart = text.indexOf(line);
            } else if (currentSection) {
                currentContent.push(line);
            }
        });

        if (currentSection) {
            mappings.push({
                sectionType: currentSection,
                content: currentContent.join('\n').trim(),
                confidence: 0.9,
                sourceSpan: { start: sectionStart, end: text.length }
            });
        }

        if (mappings.length === 0) {
            mappings.push({
                sectionType: SectionType.CHIEF_COMPLAINT,
                content: text,
                confidence: 0.5,
                sourceSpan: { start: 0, end: text.length }
            });
        }

        return mappings;
    }

    static identifyMissingSections(mappings: SectionMapping[]): SectionType[] {
        const presentSections = mappings.map(m => m.sectionType);
        const requiredSections = [
            SectionType.CHIEF_COMPLAINT,
            SectionType.HISTORY_PRESENT_ILLNESS,
            SectionType.PAST_MEDICAL_HISTORY,
            SectionType.MEDICATIONS,
            SectionType.ALLERGIES
        ];

        return requiredSections.filter(s => !presentSections.includes(s));
    }
}
