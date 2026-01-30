import React from 'react';
import { Upload, Loader2, ArrowRight } from 'lucide-react';

interface InputSectionProps {
    noteText: string;
    setNoteText: (text: string) => void;
    isProcessing: boolean;
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleProcess: () => void;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export const InputSection = ({
    noteText,
    setNoteText,
    isProcessing,
    handleFileUpload,
    handleProcess,
    fileInputRef
}: InputSectionProps) => {
    return (
        <section className="bg-slate-800/40 backdrop-blur-md border border-white/10 rounded-2xl lg:rounded-4xl p-4 lg:p-8 shadow-2xl flex flex-col gap-4 lg:gap-6">
            <div className="relative w-full group">
                <textarea
                    className="w-full min-h-[180px] lg:min-h-[220px] bg-slate-900/50 border border-white/10 rounded-xl lg:rounded-2xl text-slate-100 p-4 lg:p-6 text-base lg:text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300 placeholder:text-slate-500 resize-none"
                    placeholder="Paste clinical notes here or upload a file... (e.g. 'CC: Chest pain. Vitals: BP 140/90, Pulse 110...')"
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                />
                <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity" />
            </div>

            <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center bg-slate-900/20 p-3 lg:p-4 rounded-xl lg:rounded-2xl border border-white/5 gap-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".pdf,.docx,.txt"
                        onChange={handleFileUpload}
                    />
                    <button
                        className="group flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-slate-50 py-3 px-6 rounded-xl font-medium transition-all duration-300 hover:bg-white/10 hover:border-indigo-400/50 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer w-full sm:w-auto"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isProcessing}
                    >
                        <Upload className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
                        Upload File
                    </button>
                    {noteText && (
                        <button
                            className="px-6 py-3 text-red-400 font-medium hover:bg-red-500/10 rounded-xl transition-colors active:scale-95 cursor-pointer w-full sm:w-auto"
                            onClick={() => setNoteText('')}
                        >
                            Clear
                        </button>
                    )}
                </div>
                <button
                    className="group relative flex items-center justify-center gap-2 bg-indigo-500 text-white px-8 py-3 rounded-xl font-bold transition-all duration-300 hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-500/30 active:scale-95 disabled:opacity-50 disabled:pointer-events-none overflow-hidden cursor-pointer w-full lg:w-auto"
                    onClick={handleProcess}
                    disabled={isProcessing || !noteText}
                >
                    {isProcessing ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Processing...</span>
                        </>
                    ) : (
                        <>
                            <span>Generate Summary</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </div>
        </section>
    );
};
