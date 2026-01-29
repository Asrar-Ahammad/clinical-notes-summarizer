
export const SectionType = {
    CHIEF_COMPLAINT: "CHIEF_COMPLAINT",
    HISTORY_PRESENT_ILLNESS: "HISTORY_PRESENT_ILLNESS",
    PAST_MEDICAL_HISTORY: "PAST_MEDICAL_HISTORY",
    MEDICATIONS: "MEDICATIONS",
    ALLERGIES: "ALLERGIES",
    VITALS: "VITALS",
    PENDING_TESTS: "PENDING_TESTS",
    PENDING_LABS: "PENDING_LABS",
    ASSESSMENT: "ASSESSMENT",
    PLAN: "PLAN",
    HISTORY: "HISTORY",
    LABS: "LABS",
    IMAGING: "IMAGING",
    PROCEDURE: "PROCEDURE",
    SOCIAL_HISTORY: "SOCIAL_HISTORY",
    FAMILY_HISTORY: "FAMILY_HISTORY"
} as const;
export type SectionType = typeof SectionType[keyof typeof SectionType];

export const EntityType = {
    MEDICATION: "medication",
    CONDITION: "condition",
    PROCEDURE: "procedure",
    VITAL_SIGN: "vital_sign",
    ALLERGY: "allergy",
    SYMPTOM: "symptom",
    ANATOMY: "anatomy"
} as const;
export type EntityType = typeof EntityType[keyof typeof EntityType];

export const RedFlagType = {
    ABNORMAL_VITALS: "abnormal_vitals",
    SEVERE_ALLERGY: "severe_allergy",
    DRUG_INTERACTION: "drug_interaction",
    URGENT_LANGUAGE: "urgent_language",
    CRITICAL_LAB: "critical_lab",
    PENDING_CRITICAL_TEST: "pending_critical_test",
    FIND_SIGNIFICANT_FINDING: "find_significant_finding",
    ABNORMAL_LAB: "abnormal_lab",
    VITAL_INSTABILITY: "vital_instability",
    SAFETY_RISK: "safety_risk"
} as const;
export type RedFlagType = typeof RedFlagType[keyof typeof RedFlagType];

export const CriticalityLevel = {
    LOW: "low",
    MEDIUM: "medium",
    HIGH: "high",
    CRITICAL: "critical"
} as const;
export type CriticalityLevel = typeof CriticalityLevel[keyof typeof CriticalityLevel];

export const ViolationType = {
    DIAGNOSTIC_STATEMENT: "diagnostic_statement",
    TREATMENT_RECOMMENDATION: "treatment_recommendation",
    MEDICATION_DOSAGE: "medication_dosage",
    MEDICAL_ADVICE: "medical_advice"
} as const;
export type ViolationType = typeof ViolationType[keyof typeof ViolationType];

export const ViolationSeverity = {
    LOW: "low",
    MEDIUM: "medium",
    HIGH: "high",
    CRITICAL: "critical"
} as const;
export type ViolationSeverity = typeof ViolationSeverity[keyof typeof ViolationSeverity];

export const TransformationType = {
    CLEANING: "cleaning",
    NORMALIZATION: "normalization",
    ABBREVIATION_EXPANSION: "abbreviation_expansion",
    SECTION_EXTRACTION: "section_extraction"
} as const;
export type TransformationType = typeof TransformationType[keyof typeof TransformationType];

export const PriorityLevel = {
    LOW: "low",
    MEDIUM: "medium",
    HIGH: "high",
    CRITICAL: "critical"
} as const;
export type PriorityLevel = typeof PriorityLevel[keyof typeof PriorityLevel];

export const UrgencyLevel = {
    LOW: "low",
    MEDIUM: "medium",
    HIGH: "high",
    CRITICAL: "critical"
} as const;
export type UrgencyLevel = typeof UrgencyLevel[keyof typeof UrgencyLevel];

export const FollowUpType = {
    LAB_RESULT: "lab_result",
    IMAGING_RESULT: "imaging_result",
    SPECIALIST_CONSULT: "specialist_consult",
    MEDICATION_REVIEW: "medication_review",
    SYMPTOM_MONITORING: "symptom_monitoring"
} as const;
export type FollowUpType = typeof FollowUpType[keyof typeof FollowUpType];

export const NoteType = {
    ADMISSION: "admission",
    PROGRESS: "progress",
    DISCHARGE: "discharge",
    CONSULTATION: "consultation",
    EMERGENCY: "emergency"
} as const;
export type NoteType = typeof NoteType[keyof typeof NoteType];

export interface TextSpan {
    start: number;
    end: number;
}

export interface MedicalEntity {
    text: string;
    type: EntityType;
    confidence: number;
    position: TextSpan;
    normalizedForm?: string;
}

export interface SourceTrace {
    originalSpan: TextSpan;
    processedSpan: TextSpan;
    transformationType: TransformationType;
}

export interface SummarizedSection {
    sectionType: SectionType;
    summary: string;
    keyPoints: string[];
    preservedDetails?: string[];
    sourceTraceability?: SourceTrace[];
    confidenceScore: number;
    sourceQuotes?: string[];
}

export interface RedFlag {
    type: RedFlagType;
    description: string;
    sourceSection: SectionType;
    criticalityLevel: CriticalityLevel;
    rationale: string;
    relatedEntities: MedicalEntity[];
}

export interface PendingAction {
    description: string;
    urgency: UrgencyLevel;
    timeframe: string;
    assignedTo?: string;
}

export interface FollowUpRequirement {
    type: FollowUpType;
    description: string;
    dueDate?: Date;
    priority: PriorityLevel;
}

export interface HandoffSummary {
    briefOverview: string;
    actionItems: string[];
    timelineSummary?: string;
    priorityLevel: PriorityLevel;
    pendingActions: PendingAction[];
    followUpRequirements: FollowUpRequirement[];
}

export interface SafetyViolation {
    type: ViolationType;
    description: string;
    location: TextSpan;
    severity: ViolationSeverity;
}

export interface SafetyValidation {
    isCompliant: boolean;
    violations: SafetyViolation[];
    sanitizedContent?: StructuredSummary;
}

export interface Uncertainty {
    description: string;
    potentialImpact: string;
}

export interface StructuredSummary {
    id: string;
    sourceNoteId: string;
    generatedAt: Date;
    sections: SummarizedSection[];
    redFlags: RedFlag[];
    uncertainties?: Uncertainty[];
    handoffSummary: HandoffSummary;
    completenessScore: number;
    safetyValidation: SafetyValidation;
    sourceTraceability: SourceTrace[];
    processingMetadata: ProcessingMetadata;
}

export interface ProcessingMetadata {
    processingTime: number;
    componentsUsed: string[];
    confidenceScores: any[]; // Simplified for now
    warningsGenerated: string[];
}

export interface NoteMetadata {
    facility?: string;
    department?: string;
    encounterType?: string;
    urgencyLevel?: UrgencyLevel;
    documentLength: number;
    structuredDataPresent: boolean;
}

export interface ClinicalNote {
    id: string;
    content: string;
    timestamp: Date;
    author?: string;
    patientId?: string;
    noteType: NoteType;
    metadata: NoteMetadata;
}

// UI/Auth Types
export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
}
