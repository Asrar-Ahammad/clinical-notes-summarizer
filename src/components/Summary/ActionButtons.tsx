import { FileDown, Download, Check, Copy } from 'lucide-react';

interface ActionButtonsProps {
    handleExportPDF: () => void;
    handleExportDocx: () => void;
    handleCopy: () => void;
    isCopied: boolean;
}

export const ActionButtons = ({ handleExportPDF, handleExportDocx, handleCopy, isCopied }: ActionButtonsProps) => {
    return (
        <div className="flex gap-3">
            <button
                className="flex items-center gap-2 bg-slate-800/60 border border-white/10 text-slate-100 py-2.5 px-5 rounded-xl font-semibold text-sm transition-all duration-300 hover:bg-slate-700 hover:border-indigo-500/50 active:scale-95 shadow-sm"
                onClick={handleExportPDF}
            >
                <FileDown className="w-4 h-4 text-indigo-400" />
                PDF
            </button>
            <button
                className="flex items-center gap-2 bg-slate-800/60 border border-white/10 text-slate-100 py-2.5 px-5 rounded-xl font-semibold text-sm transition-all duration-300 hover:bg-slate-700 hover:border-indigo-500/50 active:scale-95 shadow-sm"
                onClick={handleExportDocx}
            >
                <Download className="w-4 h-4 text-indigo-400" />
                Word
            </button>
            <button
                className={`flex items-center gap-2 py-2.5 px-5 rounded-xl font-bold text-sm transition-all duration-300 shadow-lg active:scale-95 ${isCopied
                        ? 'bg-green-500/20 border border-green-500 text-green-400'
                        : 'bg-indigo-500 border border-indigo-400/50 text-white hover:bg-indigo-600 shadow-indigo-500/20'
                    }`}
                onClick={handleCopy}
            >
                {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {isCopied ? 'Copied!' : 'Copy'}
            </button>
        </div>
    );
};
