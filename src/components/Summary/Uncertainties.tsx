import { AlertTriangle } from 'lucide-react';
import type { StructuredSummary } from '../../types';

interface UncertaintiesProps {
    uncertainties?: StructuredSummary['uncertainties'];
}

export const Uncertainties = ({ uncertainties }: UncertaintiesProps) => {
    if (!uncertainties || uncertainties.length === 0) return null;

    return (
        <div className="bg-amber-500/5 backdrop-blur-md border border-amber-500/20 rounded-[2rem] p-8 mb-12 shadow-xl ring-1 ring-inset ring-amber-500/10">
            <div className="flex items-center gap-3 text-amber-500 font-extrabold mb-8 uppercase tracking-[0.2em] text-sm">
                <AlertTriangle className="w-6 h-6" />
                Ambiguous Information / Uncertainties
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {uncertainties.map((u, i) => (
                    <div key={i} className="bg-white/5 border border-white/5 p-6 rounded-2xl transition-all hover:bg-white/10">
                        <div className="font-bold text-slate-100 text-lg mb-3 leading-tight">{u.description}</div>
                        <div className="text-sm text-slate-400 font-medium">
                            <span className="text-amber-500 font-black uppercase tracking-widest text-[0.65rem] mr-2">Impact</span>
                            {u.potentialImpact}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
