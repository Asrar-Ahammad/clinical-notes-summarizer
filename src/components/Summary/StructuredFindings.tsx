import { Activity, ClipboardCheck, FileText } from 'lucide-react';
import { SectionType } from '../../types';
import type { StructuredSummary } from '../../types';

interface StructuredFindingsProps {
    sections: StructuredSummary['sections'];
    redFlagsCount: number;
}

const getSectionIcon = (type: SectionType) => {
    switch (type) {
        case SectionType.VITALS: return <Activity className="w-5 h-5 text-emerald-400" />;
        case SectionType.MEDICATIONS: return <ClipboardCheck className="w-5 h-5 text-blue-400" />;
        default: return <FileText className="w-5 h-5 text-indigo-400" />;
    }
};

const formatSectionHeader = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
};

export const StructuredFindings = ({ sections, redFlagsCount }: StructuredFindingsProps) => {
    return (
        <>
            <div className="flex items-center gap-3 text-slate-500 font-extrabold mb-8 uppercase tracking-[0.2em] text-sm">
                Structured Findings
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sections.map((section, idx) => (
                    <div
                        key={idx}
                        className="group bg-slate-800/40 backdrop-blur-md border border-white/10 rounded-[2rem] p-8 transition-all duration-300 hover:bg-slate-800/60 hover:border-white/20 hover:-translate-y-1 shadow-xl animate-in fade-in slide-in-from-bottom-4"
                        style={{ animationDelay: `${(idx + redFlagsCount) * 0.1}s` }}
                    >
                        <div className="flex items-center gap-3 text-slate-400 font-black mb-6 uppercase tracking-widest text-[0.7rem] group-hover:text-slate-100 transition-colors">
                            {getSectionIcon(section.sectionType)}
                            {formatSectionHeader(section.sectionType)}
                        </div>
                        <p className="text-slate-200 text-lg font-medium leading-relaxed mb-6 group-hover:text-white transition-colors">
                            {section.summary}
                        </p>
                        {section.keyPoints.length > 0 && (
                            <ul className="space-y-3 pt-6 border-t border-white/5">
                                {section.keyPoints.map((kp, i) => (
                                    <li key={i} className="flex items-start gap-2 group/kp text-sm">
                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500/40 group-hover/kp:bg-indigo-500 transition-colors shrink-0" />
                                        <span className="text-slate-400 group-hover/kp:text-slate-200 transition-colors font-medium">{kp}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                ))}
            </div>
        </>
    );
};
