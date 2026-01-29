
import type {
    RedFlag,
    SummarizedSection,
    MedicalEntity
} from '../types';

import { RedFlagType, SectionType, CriticalityLevel, EntityType } from '../types';

export class RedFlagDetector {
    static identifyRedFlags(sections: SummarizedSection[], entities: MedicalEntity[]): RedFlag[] {
        const redFlags: RedFlag[] = [];

        sections.filter(s => s.sectionType === SectionType.VITALS).forEach(s => {
            const content = s.summary.toLowerCase();

            const hrMatch = content.match(/hr:?\s*(\d{2,3})/);
            if (hrMatch) {
                const hr = parseInt(hrMatch[1]);
                if (hr > 100 || hr < 60) {
                    redFlags.push({
                        type: RedFlagType.ABNORMAL_VITALS,
                        description: `Abnormal heart rate: ${hr} bpm`,
                        sourceSection: SectionType.VITALS,
                        criticalityLevel: hr > 120 || hr < 50 ? CriticalityLevel.CRITICAL : CriticalityLevel.HIGH,
                        rationale: `Heart rate is outside the normal physiologic range (60-100 bpm).`,
                        relatedEntities: entities.filter(e => e.type === EntityType.VITAL_SIGN && e.text.includes(hrMatch[1]))
                    });
                }
            }

            const spo2Match = content.match(/spo2:?\s*(\d{2,3})/);
            if (spo2Match) {
                const spo2 = parseInt(spo2Match[1]);
                if (spo2 < 94) {
                    redFlags.push({
                        type: RedFlagType.ABNORMAL_VITALS,
                        description: `Low oxygen saturation: ${spo2}%`,
                        sourceSection: SectionType.VITALS,
                        criticalityLevel: spo2 < 90 ? CriticalityLevel.CRITICAL : CriticalityLevel.HIGH,
                        rationale: `Hypoxemia detected (SpO2 < 94% on room air).`,
                        relatedEntities: entities.filter(e => e.type === EntityType.VITAL_SIGN && e.text.includes(spo2Match[1]))
                    });
                }
            }
        });

        sections.filter(s => s.sectionType === SectionType.ALLERGIES).forEach(s => {
            const content = s.summary.toLowerCase();
            if (content.includes('anaphylaxis') || content.includes('hives') || content.includes('shortness of breath')) {
                redFlags.push({
                    type: RedFlagType.SEVERE_ALLERGY,
                    description: `History of severe allergic reaction`,
                    sourceSection: SectionType.ALLERGIES,
                    criticalityLevel: CriticalityLevel.HIGH,
                    rationale: `Documented severe reaction (hives/anaphylaxis) to allergen.`,
                    relatedEntities: entities.filter(e => e.type === EntityType.ALLERGY)
                });
            }
        });

        sections.forEach(s => {
            const content = s.summary.toLowerCase();
            if (content.includes('chest pain') || content.includes('stroke') || content.includes('unresponsive') || content.includes('stat')) {
                redFlags.push({
                    type: RedFlagType.URGENT_LANGUAGE,
                    description: `Urgent clinical language detected: ${content.includes('chest pain') ? 'Chest Pain' : 'Critical state'}`,
                    sourceSection: s.sectionType,
                    criticalityLevel: CriticalityLevel.CRITICAL,
                    rationale: `Keywords associated with life-threatening conditions identified.`,
                    relatedEntities: []
                });
            }
        });

        return redFlags;
    }
}
