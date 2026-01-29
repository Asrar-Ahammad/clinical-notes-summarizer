
import type {
    SafetyValidation,
    SafetyViolation,
    StructuredSummary,
    TextSpan
} from '../types';

import { ViolationType, ViolationSeverity } from '../types';

export class SafetyValidator {
    private static medicalAdvicePatterns = [
        {
            type: ViolationType.DIAGNOSTIC_STATEMENT,
            pattern: /\b(patient has|diagnosed with|diagnosis is|likely|suggests)\b.*\b(pneumonia|mi|failure|diabetes)\b/i,
            severity: ViolationSeverity.HIGH,
            description: "Potential diagnostic statement detected."
        },
        {
            type: ViolationType.TREATMENT_RECOMMENDATION,
            pattern: /\b(should|recommend|prescribe|administer|give)\b.*\b(mg|daily|dose|treatment)\b/i,
            severity: ViolationSeverity.CRITICAL,
            description: "Potential treatment recommendation detected."
        },
        {
            type: ViolationType.MEDICATION_DOSAGE,
            pattern: /\b\d+\s*(mg|g|mcg|ml|units)\b/i,
            severity: ViolationSeverity.MEDIUM,
            description: "Medication dosage identified in summary."
        }
    ];

    static validateOutput(summary: StructuredSummary): SafetyValidation {
        const violations: SafetyViolation[] = [];

        summary.sections.forEach(section => {
            this.medicalAdvicePatterns.forEach(rule => {
                const match = section.summary.match(rule.pattern);
                if (match) {
                    violations.push({
                        type: rule.type as any,
                        description: rule.description,
                        severity: rule.severity as any,
                        location: { start: match.index || 0, end: (match.index || 0) + match[0].length }
                    });
                }
            });
        });

        return {
            isCompliant: violations.length === 0,
            violations
        };
    }

    static sanitizeContent(text: string): string {
        return text
            .replace(/\b(I recommend that|The patient should be given)\b/gi, '[Prescriptive language removed]')
            .replace(/\b(the diagnosis is)\b/gi, '[Diagnostic phrasing removed]');
    }
}
