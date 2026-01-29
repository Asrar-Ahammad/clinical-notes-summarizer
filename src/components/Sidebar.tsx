import { LayoutDashboard, History, LogOut, ClipboardCheck } from 'lucide-react';
import type { StructuredSummary } from '../types';

interface SidebarProps {
    activeView: 'dashboard' | 'history';
    setActiveView: (view: 'dashboard' | 'history') => void;
    history: StructuredSummary[];
    setSummary: (summary: StructuredSummary) => void;
    logout: () => void;
}

export const Sidebar = ({ activeView, setActiveView, history, setSummary, logout }: SidebarProps) => {
    return (
        <aside className="w-[300px] bg-slate-900/40 backdrop-blur-xl border-r border-white/10 flex flex-col p-6">
            <div className="text-xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-8 flex items-center gap-2">
                <ClipboardCheck className="w-8 h-8 text-indigo-400" />
                <span>Kiro Clinical</span>
            </div>

            <nav>
                <div
                    className={`flex items-center gap-3 p-3 px-4 rounded-xl cursor-pointer transition-all duration-200 mb-2 ${activeView === 'dashboard' ? 'bg-white/5 text-slate-50' : 'text-slate-400 hover:bg-white/5 hover:text-slate-50'
                        }`}
                    onClick={() => setActiveView('dashboard')}
                >
                    <LayoutDashboard className="w-5 h-5" />
                    <span>Dashboard</span>
                </div>
                <div
                    className={`flex items-center gap-3 p-3 px-4 rounded-xl cursor-pointer transition-all duration-200 mb-2 ${activeView === 'history' ? 'bg-white/5 text-slate-50' : 'text-slate-400 hover:bg-white/5 hover:text-slate-50'
                        }`}
                    onClick={() => setActiveView('history')}
                >
                    <History className="w-5 h-5" />
                    <span>History</span>
                </div>
                <div
                    className="flex items-center gap-3 p-3 px-4 rounded-xl cursor-pointer transition-all duration-200 mb-2 mt-4 text-red-500/80 hover:bg-white/5 hover:text-red-500"
                    onClick={logout}
                >
                    <LogOut className="w-5 h-5" />
                    <span>Log Out</span>
                </div>
            </nav>

            <div className="mt-auto">
                <div className="text-xs uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">Recent History</div>
                {history.length === 0 && <p className="text-[0.75rem] text-slate-500">No recent activity</p>}
                {history.slice(0, 3).map(h => (
                    <div
                        key={h.id}
                        className="flex items-center gap-3 p-3 px-4 rounded-xl cursor-pointer transition-all duration-200 mb-2 text-[0.8rem] text-slate-400 hover:bg-white/5 hover:text-slate-50"
                        onClick={() => { setSummary(h); setActiveView('dashboard'); }}
                    >
                        <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                            {h.generatedAt.toLocaleTimeString()} - {h.handoffSummary.briefOverview}
                        </div>
                    </div>
                ))}
            </div>
        </aside>
    );
};
