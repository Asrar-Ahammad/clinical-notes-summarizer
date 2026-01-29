
import type {
    MedicalEntity,

} from '../types';

import { EntityType } from '../types';

export class NLPEngine {
    static extractEntities(text: string): MedicalEntity[] {
        const entities: MedicalEntity[] = [];
        const lowerText = text.toLowerCase();

        const meds = ['aspirin', 'lisinopril', 'metformin', 'atorvastatin', 'furosemide', 'lasix', 'insulin', 'warfarin'];
        meds.forEach(med => {
            let pos = lowerText.indexOf(med);
            while (pos !== -1) {
                entities.push({
                    text: text.substring(pos, pos + med.length),
                    type: EntityType.MEDICATION,
                    confidence: 0.95,
                    position: { start: pos, end: pos + med.length },
                    normalizedForm: med.charAt(0).toUpperCase() + med.slice(1)
                });
                pos = lowerText.indexOf(med, pos + 1);
            }
        });

        const vitalPatterns = [
            { pattern: /bp:?\s*(\d{2,3}\/\d{2,3})/gi, type: EntityType.VITAL_SIGN, name: 'Blood Pressure' },
            { pattern: /hr:?\s*(\d{2,3})/gi, type: EntityType.VITAL_SIGN, name: 'Heart Rate' },
            { pattern: /spo2:?\s*(\d{2,3}%?)/gi, type: EntityType.VITAL_SIGN, name: 'Oxygen Saturation' },
            { pattern: /temp:?\s*(\d{2,3}\.?\d?)/gi, type: EntityType.VITAL_SIGN, name: 'Temperature' },
            { pattern: /weight:?\s*(\d{2,3}\s*(lbs|kg))/gi, type: EntityType.VITAL_SIGN, name: 'Weight' }
        ];

        vitalPatterns.forEach(() => {
            // In a real NLP engine, patterns would be used here
            // This is a simplified version for mock extraction
        });

        // Pattern based extraction for vitals
        vitalPatterns.forEach(({ pattern, name }) => {
            let match;
            while ((match = pattern.exec(text)) !== null) {
                entities.push({
                    text: match[0],
                    type: EntityType.VITAL_SIGN,
                    confidence: 0.9,
                    position: { start: match.index, end: match.index + match[0].length },
                    normalizedForm: name
                });
            }
        });

        if (lowerText.includes('allergy') || lowerText.includes('allergies')) {
            const parts = text.split(/allergies/i);
            const allergySection = parts.length > 1 ? parts[1].split('\n\n')[0] : '';
            const knownAllergies = ['penicillin', 'sulfa', 'latex', 'peanuts', 'aspirin'];
            knownAllergies.forEach(allergy => {
                if (allergySection.toLowerCase().includes(allergy)) {
                    const pos = text.toLowerCase().indexOf(allergy);
                    entities.push({
                        text: allergy,
                        type: EntityType.ALLERGY,
                        confidence: 0.85,
                        position: { start: pos, end: pos + allergy.length },
                        normalizedForm: allergy
                    });
                }
            });
        }

        return entities;
    }

    static resolveAbbreviations(text: string): string {
        const abbreviations: Record<string, string> = {
            'bid': 'twice a day',
            'tid': 'three times a day',
            'qid': 'four times a day',
            'qd': 'daily',
            'prn': 'as needed',
            'po': 'by mouth',
            'iv': 'intravenous',
            'doe': 'dyspnea on exertion',
            'sob': 'shortness of breath',
            'htn': 'hypertension',
            'dm': 'diabetes mellitus',
            'chf': 'congestive heart failure',
            'afib': 'atrial fibrillation'
        };

        let resolvedText = text;
        Object.entries(abbreviations).forEach(([abbr, full]) => {
            const regex = new RegExp(`\\b${abbr}\\b`, 'gi');
            resolvedText = resolvedText.replace(regex, full);
        });

        return resolvedText;
    }

    static extractTemporalInfo(text: string) {
        const datePattern = /\d{1,2}\/\d{1,2}\/\d{2,4}/g;
        const timePattern = /\d{1,2}:\d{2}\s*(am|pm|pm)?/gi;

        const dates = Array.from(text.matchAll(datePattern)).map(m => ({ text: m[0], index: m.index }));
        const times = Array.from(text.matchAll(timePattern)).map(m => ({ text: m[0], index: m.index }));

        return { dates, times };
    }
}
