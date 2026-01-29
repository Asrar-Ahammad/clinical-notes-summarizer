
import type {
    NoteMetadata
} from '../types';

import { UrgencyLevel } from '../types';

export interface ValidationSummary {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

export interface ProcessingResult {
    cleanedText: string;
    metadata: NoteMetadata;
}

export class InputProcessor {
    static validateInput(clinicalNote: string): ValidationSummary {
        const errors: string[] = [];
        const warnings: string[] = [];

        if (!clinicalNote || clinicalNote.trim().length === 0) {
            errors.push("Clinical note cannot be empty.");
        }

        if (clinicalNote && clinicalNote.length < 50) {
            warnings.push("Clinical note is very short, which might lead to an incomplete summary.");
        }

        const nonPrintable = clinicalNote.match(/[^\x20-\x7E\s]/g);
        if (nonPrintable && nonPrintable.length > clinicalNote.length * 0.1) {
            errors.push("Clinical note appears to contain corrupted or non-text data.");
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    static preprocessText(rawText: string): string {
        return rawText
            .replace(/\r\n/g, '\n')
            .replace(/[ \t]+/g, ' ')
            .trim();
    }

    static extractMetadata(text: string): NoteMetadata {
        return {
            documentLength: text.length,
            structuredDataPresent: text.includes(':') && text.includes('\n'),
            facility: this.searchPattern(text, /facility:\s*(.*)/i),
            department: this.searchPattern(text, /department:\s*(.*)/i),
            urgencyLevel: this.extractUrgency(text)
        };
    }

    private static searchPattern(text: string, pattern: RegExp): string | undefined {
        const match = text.match(pattern);
        return match ? match[1].trim() : undefined;
    }

    private static extractUrgency(text: string): UrgencyLevel {
        const content = text.toLowerCase();
        if (content.includes('stat') || content.includes('emergency') || content.includes('critical')) {
            return UrgencyLevel.CRITICAL;
        }
        if (content.includes('urgent') || content.includes('asap')) {
            return UrgencyLevel.HIGH;
        }
        return UrgencyLevel.MEDIUM;
    }
}
