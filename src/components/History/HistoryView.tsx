import { History as HistoryIcon } from 'lucide-react';
import type { StructuredSummary } from '../../types';

interface HistoryViewProps {
    history: StructuredSummary[];
    setSummary: (summary: StructuredSummary) => void;
    setActiveView: (view: 'dashboard' | 'history') => void;
}

export const HistoryView = ({ history, setSummary, setActiveView }: HistoryViewProps) => {
    return (
        <section className="flex flex-col gap-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between border-b border-white/5 pb-6">
                <h2 className="text-2xl font-bold text-white tracking-tight">Processing History</h2>
                <span className="bg-white/5 px-4 py-1.5 rounded-full text-sm text-slate-400 font-medium">
                    {history.length} summarizations
                </span>
            </div>

            {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 bg-slate-800/20 border border-white/5 border-dashed rounded-[2.5rem] opacity-40">
                    <HistoryIcon className="w-16 h-16 text-slate-400 mb-6" />
                    <p className="text-xl font-medium text-slate-300">No summarization history yet</p>
                    <p className="text-slate-500 mt-2">Generate your first clinical summary to see it here</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {history.map((h) => (
                        <div
                            key={h.id}
                            className="group relative bg-slate-800/40 backdrop-blur-md border border-white/10 p-6 rounded-[1.5rem] cursor-pointer transition-all duration-300 hover:bg-slate-800/60 hover:border-indigo-500/30 hover:-translate-y-1 shadow-lg"
                            onClick={() => { setSummary(h); setActiveView('dashboard'); }}
                        >
                            <div className="flex justify-between items-start gap-6">
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-slate-100 group-hover:text-indigo-400 transition-colors line-clamp-1">
                                        {h.handoffSummary.briefOverview}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-3">
                                        <span className="text-sm text-slate-400 bg-white/5 px-3 py-1 rounded-lg">
                                            {h.generatedAt.toLocaleString()}
                                        </span>
                                        <span className="text-sm text-slate-400 bg-white/5 px-3 py-1 rounded-lg">
                                            {h.sections.length} structured findings
                                        </span>
                                    </div>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                    <HistoryIcon className="w-5 h-5 opacity-60 group-hover:opacity-100" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
};
