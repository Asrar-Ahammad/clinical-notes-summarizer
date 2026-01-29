import { AlertTriangle } from 'lucide-react';

interface FeedbackAreaProps {
    feedback: string | null;
}

export const FeedbackArea = ({ feedback }: FeedbackAreaProps) => {
    if (!feedback) return null;

    return (
        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 shadow-lg backdrop-blur-sm animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-3 text-red-400 font-bold mb-3 uppercase tracking-wider text-sm">
                <AlertTriangle className="w-5 h-5" />
                Summarization Error
            </div>
            <p className="text-slate-200 text-lg mb-2">{feedback}</p>
            <p className="text-slate-400 text-sm">
                Please check your OpenAI API key in the .env file and ensure you have internet access.
            </p>
        </div>
    );
};
