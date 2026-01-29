
import type {
    SummarizedSection,
    HandoffSummary
} from '../types';

import { SectionType, PriorityLevel, UrgencyLevel, FollowUpType } from '../types';

export class OutputFormatter {
    static formatForReview(sections: SummarizedSection[]): SummarizedSection[] {
        return sections.map(s => ({
            ...s,
            summary: this.ensureBulletPoints(s.summary),
            keyPoints: s.keyPoints.slice(0, 5)
        }));
    }

    private static ensureBulletPoints(text: string): string {
        if (text.includes('\n- ') || text.includes('\n* ')) return text;

        if (text.split(',').length > 3) {
            return text.split(',').map(item => `• ${item.trim()}`).join('\n');
        }

        return text;
    }

    static generateHandoffSummary(sections: SummarizedSection[], redFlagsCount: number): HandoffSummary {
        const cc = sections.find(s => s.sectionType === SectionType.CHIEF_COMPLAINT);

        return {
            briefOverview: cc?.summary || "Patient encounter summary",
            actionItems: this.extractActionItems(sections),
            priorityLevel: redFlagsCount > 0 ? PriorityLevel.CRITICAL : PriorityLevel.HIGH,
            pendingActions: [
                {
                    description: "Monitor for changes in clinical status",
                    urgency: UrgencyLevel.MEDIUM,
                    timeframe: "Ongoing"
                }
            ],
            followUpRequirements: [
                {
                    type: FollowUpType.SYMPTOM_MONITORING,
                    description: "Routine assessment",
                    priority: PriorityLevel.MEDIUM
                }
            ]
        };
    }

    private static extractActionItems(sections: SummarizedSection[]): string[] {
        const items: string[] = [];
        sections.forEach(s => {
            const actions = s.summary.match(/\b(order|check|follow up|monitor|evaluate)\b[^.!?]*/gi);
            if (actions) items.push(...actions.map(a => a.trim()));
        });
        return items.slice(0, 3);
    }
}
