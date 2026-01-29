import { AlertTriangle } from 'lucide-react';
import type { StructuredSummary } from '../../types';

interface SafetyWarningProps {
    safetyValidation: StructuredSummary['safetyValidation'];
}

export const SafetyWarning = ({ safetyValidation }: SafetyWarningProps) => {
    if (safetyValidation.isCompliant) return null;

    return (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-[2rem] p-8 shadow-xl backdrop-blur-md mb-8 ring-1 ring-inset ring-amber-500/10">
            <div className="flex items-center gap-4 text-amber-500 font-extrabold mb-4 uppercase tracking-[0.2em] text-sm">
                <AlertTriangle className="w-6 h-6" />
                Safety Warning: Potential Prescriptive Language Detected
            </div>
            <p className="text-slate-200 text-lg font-medium leading-relaxed">
                This summary may contain phrases that look like medical advice or specific dosages.
                Please review carefully against the original note.
            </p>
            <div className="mt-6 space-y-3">
                {safetyValidation.violations.map((v, i) => (
                    <div key={i} className="flex items-start gap-3 bg-amber-500/10 p-4 rounded-xl border border-amber-500/10">
                        <span className="text-amber-500 mt-1 font-black">•</span>
                        <p className="text-slate-300 text-sm font-medium">{v.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
