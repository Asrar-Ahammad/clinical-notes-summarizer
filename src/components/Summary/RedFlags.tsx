import { AlertTriangle } from 'lucide-react';
import type { StructuredSummary } from '../../types';

interface RedFlagsProps {
    redFlags: StructuredSummary['redFlags'];
}

export const RedFlags = ({ redFlags }: RedFlagsProps) => {
    if (redFlags.length === 0) return null;

    return (
        <div className="mb-12">
            <div className="flex items-center gap-3 text-red-400 font-extrabold mb-6 uppercase tracking-[0.2em] text-sm">
                <AlertTriangle className="w-6 h-6" />
                Critical Alerts
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                {redFlags.map((rf, idx) => (
                    <div
                        key={idx}
                        className="group relative bg-red-500/5 backdrop-blur-md border border-red-500/20 rounded-[2rem] p-8 transition-all duration-300 hover:bg-red-500/10 hover:border-red-500/40 shadow-xl overflow-hidden w-full"
                        style={{ animationDelay: `${idx * 0.1}s` }}
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <AlertTriangle className="w-24 h-24 text-red-500" />
                        </div>
                        <div className="flex justify-between items-center mb-6 relative">
                            <span className="bg-red-500/20 text-red-400 text-[0.7rem] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-red-500/20">
                                {rf.type.replace('_', ' ')}
                            </span>
                            <span className="text-red-500/60 font-black text-xs uppercase tracking-widest">
                                {rf.criticalityLevel.toUpperCase()}
                            </span>
                        </div>
                        <h3 className="text-xl font-black text-slate-100 mb-4 group-hover:text-red-400 transition-colors relative">
                            {rf.description}
                        </h3>
                        <p className="text-slate-400 font-medium leading-relaxed relative">
                            {rf.rationale}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};
