import type { StructuredSummary } from '../../types';

interface TechnicalMetadataProps {
    summary: StructuredSummary;
}

const formatSectionHeader = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
};

export const TechnicalMetadata = ({ summary }: TechnicalMetadataProps) => {
    return (
        <div className="mt-24 pt-12 border-t border-white/5 space-y-12">
            <div>
                <div className="text-[0.65rem] font-black text-slate-600 uppercase tracking-[0.3em] mb-8">
                    Technical Metadata & Traceability
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-slate-900/40 p-6 rounded-2xl border border-white/5">
                        <div className="text-[0.65rem] font-black text-slate-500 uppercase tracking-widest mb-3">Processing Time</div>
                        <div className="text-2xl font-black text-slate-100">{summary.processingMetadata.processingTime}<span className="text-sm font-medium text-slate-500 ml-1">ms</span></div>
                    </div>
                    <div className="bg-slate-900/40 p-6 rounded-2xl border border-white/5">
                        <div className="text-[0.65rem] font-black text-slate-500 uppercase tracking-widest mb-3">Confidence Score</div>
                        <div className="text-2xl font-black text-slate-100">{(summary.completenessScore * 100).toFixed(0)}<span className="text-sm font-medium text-slate-500 ml-1">%</span></div>
                    </div>
                    <div className="bg-slate-900/40 p-6 rounded-2xl border border-white/5 overflow-hidden">
                        <div className="text-[0.65rem] font-black text-slate-500 uppercase tracking-widest mb-3">Components Used</div>
                        <div className="text-sm font-bold text-slate-300 truncate">{summary.processingMetadata.componentsUsed.join(', ')}</div>
                    </div>
                </div>
            </div>

            {summary.sections.some(s => s.sourceQuotes && s.sourceQuotes.length > 0) && (
                <div>
                    <h4 className="text-[0.65rem] font-black text-slate-600 uppercase tracking-[0.3em] mb-8">Evidence-Based Traceability (Source Quotes)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {summary.sections.filter(s => s.sourceQuotes && s.sourceQuotes.length > 0).map((s, i) => (
                            <div key={i} className="bg-slate-900/40 p-8 rounded-3xl border border-white/5 hover:border-indigo-500/20 transition-all">
                                <div className="text-[0.65rem] font-black text-indigo-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                    <span className="w-1 h-1 rounded-full bg-indigo-500" />
                                    {formatSectionHeader(s.sectionType)}
                                </div>
                                <div className="space-y-4">
                                    {s.sourceQuotes?.map((quote, qi) => (
                                        <div key={qi} className="text-sm italic text-slate-400 font-medium border-l-2 border-indigo-500/30 pl-4 py-1 hover:text-slate-300 transition-colors">
                                            "{quote}"
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
