
interface HeaderProps {
    user: {
        name: string;
        role: string;
        avatar?: string;
    } | null;
}

export const Header = ({ user }: HeaderProps) => {
    return (
        <header className="flex justify-between items-center bg-transparent">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Clinical Summarizer</h1>
                <p className="text-slate-400 font-medium">AI-powered patient information synthesis</p>
            </div>
            <div className="flex items-center gap-4 bg-slate-800/40 backdrop-blur-md p-3 px-5 rounded-2xl border border-white/5">
                <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
                    {user?.avatar || 'DR'}
                </div>
                <div>
                    <div className="font-semibold text-slate-100 leading-tight">{user?.name}</div>
                    <div className="text-[0.75rem] text-slate-400 font-medium uppercase tracking-wider">{user?.role}</div>
                </div>
            </div>
        </header>
    );
};
