
import { Menu } from 'lucide-react';

interface HeaderProps {
    user: {
        name: string;
        role: string;
        avatar?: string;
    } | null;
    onMenuClick: () => void;
}

export const Header = ({ user, onMenuClick }: HeaderProps) => {
    return (
        <header className="flex justify-between items-center bg-transparent gap-4">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-1 text-slate-200 hover:text-white transition-colors"
                >
                    <Menu className="w-8 h-8" />
                </button>
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">Clinical Summarizer</h1>
                    <p className="text-slate-400 font-medium text-sm lg:text-base hidden sm:block">AI-powered patient information synthesis</p>
                </div>
            </div>
            <div className="flex items-center gap-4 bg-slate-800/40 backdrop-blur-md p-2 lg:p-3 px-3 lg:px-5 rounded-2xl border border-white/5">
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20 text-sm lg:text-base">
                    {user?.avatar || 'DR'}
                </div>
                <div className="hidden sm:block">
                    <div className="font-semibold text-slate-100 leading-tight">{user?.name}</div>
                    <div className="text-[0.75rem] text-slate-400 font-medium uppercase tracking-wider">{user?.role}</div>
                </div>
            </div>
        </header>
    );
};
