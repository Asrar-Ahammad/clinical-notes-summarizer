import { LayoutDashboard, History, LogOut, ClipboardCheck, X } from 'lucide-react';
import type { StructuredSummary } from '../types';

interface SidebarProps {
    activeView: 'dashboard' | 'history';
    setActiveView: (view: 'dashboard' | 'history') => void;
    history: StructuredSummary[];
    setSummary: (summary: StructuredSummary) => void;
    logout: () => void;
    isOpen: boolean;
    onClose: () => void;
}

export const Sidebar = ({ activeView, setActiveView, history, setSummary, logout, isOpen, onClose }: SidebarProps) => {
    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={onClose}
                />
            )}

            <aside className={`
                w-[300px] bg-slate-900/90 lg:bg-slate-900/40 backdrop-blur-xl border-r border-white/10 
                flex flex-col p-6 fixed inset-y-0 left-0 z-50 
                transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="flex items-center justify-between mb-8">
                    <div className="text-xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
                        <ClipboardCheck className="w-8 h-8 text-indigo-400" />
                        <span>Kiro Clinical</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <nav>
                    <div
                        className={`flex items-center gap-3 p-3 px-4 rounded-xl cursor-pointer transition-all duration-200 mb-2 ${activeView === 'dashboard' ? 'bg-white/5 text-slate-50' : 'text-slate-400 hover:bg-white/5 hover:text-slate-50'
                            }`}
                        onClick={() => { setActiveView('dashboard'); onClose?.(); }}
                    >
                        <LayoutDashboard className="w-5 h-5" />
                        <span>Dashboard</span>
                    </div>
                    <div
                        className={`flex items-center gap-3 p-3 px-4 rounded-xl cursor-pointer transition-all duration-200 mb-2 ${activeView === 'history' ? 'bg-white/5 text-slate-50' : 'text-slate-400 hover:bg-white/5 hover:text-slate-50'
                            }`}
                        onClick={() => { setActiveView('history'); onClose?.(); }}
                    >
                        <History className="w-5 h-5" />
                        <span>History</span>
                    </div>
                    <div
                        className="flex items-center gap-3 p-3 px-4 rounded-xl cursor-pointer transition-all duration-200 mb-2 mt-4 text-red-500/80 hover:bg-white/5 hover:text-red-500"
                        onClick={() => { logout(); onClose?.(); }}
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
                            onClick={() => { setSummary(h); setActiveView('dashboard'); onClose?.(); }}
                        >
                            <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                                {h.generatedAt.toLocaleTimeString()} - {h.handoffSummary.briefOverview}
                            </div>
                        </div>
                    ))}
                </div>
            </aside>
        </>
    );
};
