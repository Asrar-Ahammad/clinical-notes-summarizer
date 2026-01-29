import { CheckCircle2 } from 'lucide-react';
import type { StructuredSummary } from '../../types';

interface HandoffSynthesisProps {
    handoffSummary: StructuredSummary['handoffSummary'];
}

export const HandoffSynthesis = ({ handoffSummary }: HandoffSynthesisProps) => {
    return (
        <div className="bg-slate-800/40 backdrop-blur-md border border-indigo-500/30 rounded-[2.5rem] p-10 mb-12 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] -mr-32 -mt-32 transition-opacity group-hover:opacity-100 opacity-50" />

            <div className="flex items-center gap-3 text-indigo-400 font-extrabold mb-8 uppercase tracking-[0.2em] text-sm relative">
                <CheckCircle2 className="w-6 h-6" />
                Clinical Handoff Synthesis
            </div>

            <p className="text-2xl font-semibold text-slate-100 mb-10 leading-relaxed tracking-tight relative">
                {handoffSummary.briefOverview}
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative">
                <div>
                    <h4 className="text-[0.7rem] font-black text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        Key Actions
                    </h4>
                    <ul className="space-y-4">
                        {handoffSummary.actionItems.map((item, i) => (
                            <li key={i} className="flex items-start gap-3 group/item">
                                <span className="mt-1.5 w-2 h-2 rounded-full bg-indigo-500/50 group-hover/item:bg-indigo-500 transition-colors" />
                                <span className="text-slate-300 font-medium leading-relaxed group-hover/item:text-slate-100 transition-colors">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-slate-900/40 p-8 rounded-3xl border border-white/5">
                    <h4 className="text-[0.7rem] font-black text-amber-500/80 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        Pending Actions
                    </h4>
                    <div className="space-y-4">
                        {handoffSummary.pendingActions.map((pa, i) => (
                            <div key={i} className="bg-white/5 p-5 rounded-2xl border border-white/5 transition-all hover:bg-white/10 hover:border-amber-500/20">
                                <div className="text-slate-200 font-bold mb-2">{pa.description}</div>
                                <div className="text-[0.7rem] font-black text-amber-500 uppercase tracking-widest bg-amber-500/10 inline-block px-3 py-1 rounded-full">
                                    Due: {pa.timeframe}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
