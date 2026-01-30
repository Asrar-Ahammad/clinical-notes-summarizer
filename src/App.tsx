import { useState, useEffect, useRef } from 'react';
import { Loader2, FileText } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

import { DocumentProcessor } from './services/DocumentProcessor';
import { ExportService } from './services/ExportService';
import { ClinicalSummarizationAssistant } from './services/ClinicalSummarizationAssistant';
import { useAuth } from './context/AuthContext';
import type { StructuredSummary } from './types';

// Components
import { Login } from './components/Login';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { InputSection } from './components/Dashboard/InputSection';
import { FeedbackArea } from './components/Dashboard/FeedbackArea';
import { HistoryView } from './components/History/HistoryView';
import { SummaryResults } from './components/Summary/SummaryResults';

export default function App() {
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const [noteText, setNoteText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [summary, setSummary] = useState<StructuredSummary | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [history, setHistory] = useState<StructuredSummary[]>([]);
  const [activeView, setActiveView] = useState<'dashboard' | 'history'>('dashboard');
  const [isCopied, setIsCopied] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedHistory = localStorage.getItem('kiro_summary_history');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setHistory(parsed.map((h: any) => ({ ...h, generatedAt: new Date(h.generatedAt) })));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('kiro_summary_history', JSON.stringify(history));
  }, [history]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setFeedback(null);
    try {
      const text = await DocumentProcessor.extractTextFromFile(file);
      setNoteText(text);
    } catch (error: any) {
      setFeedback(`File Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleProcess = async () => {
    if (!noteText.trim()) return;
    setIsProcessing(true);
    setSummary(null);
    setFeedback(null);
    try {
      const result = await ClinicalSummarizationAssistant.processNote(noteText);
      setSummary(result);
      setHistory(prev => [result, ...prev]);
    } catch (error: any) {
      console.error(error);
      setFeedback(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    if (!summary) return;
    const text = `
Clinical Handoff Synthesis:
${summary.handoffSummary.briefOverview}

Key Actions:
${summary.handoffSummary.actionItems.map(i => `• ${i}`).join('\n')}

Red Flags:
${summary.redFlags.map(rf => `[${rf.criticalityLevel.toUpperCase()}] ${rf.description}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleExportPDF = () => {
    if (!summary) return;
    try {
      ExportService.exportToPDF(summary);
    } catch (error: any) {
      setFeedback(`Export Error: ${error.message}`);
    }
  };

  const handleExportDocx = async () => {
    if (!summary) return;
    try {
      await ExportService.exportToDocx(summary);
    } catch (error: any) {
      setFeedback(`Export Error: ${error.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-main">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="flex h-screen w-full bg-bg-main text-slate-50 overflow-hidden font-inter supports-[height:100dvh]:h-dvh">
      {/* Background radial gradient */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,#1e1b4b,#0f172a)] -z-10" />

      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        history={history}
        setSummary={setSummary}
        logout={logout}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <main className="flex-1 overflow-y-auto w-full p-4 lg:p-12 space-y-6 lg:space-y-12 scroll-smooth">
        <Header
          user={user}
          onMenuClick={() => setMobileMenuOpen(true)}
        />

        {activeView === 'dashboard' ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <InputSection
              noteText={noteText}
              setNoteText={setNoteText}
              isProcessing={isProcessing}
              handleFileUpload={handleFileUpload}
              handleProcess={handleProcess}
              fileInputRef={fileInputRef}
            />
            <FeedbackArea feedback={feedback} />
          </div>
        ) : (
          <HistoryView
            history={history}
            setSummary={setSummary}
            setActiveView={setActiveView}
          />
        )}

        <AnimatePresence mode="wait">
          {summary && (
            <SummaryResults
              key={summary.id}
              summary={summary}
              handleExportPDF={handleExportPDF}
              handleExportDocx={handleExportDocx}
              handleCopy={handleCopy}
              isCopied={isCopied}
            />
          )}
        </AnimatePresence>

        {!summary && !isProcessing && activeView === 'dashboard' && (
          <div className="flex flex-col items-center justify-center py-32 opacity-20 animate-in fade-in duration-1000">
            <FileText className="w-24 h-24 mb-6 text-slate-400" />
            <p className="text-2xl font-bold tracking-tight">No summary generated yet</p>
            <p className="mt-2 font-medium">Input clinical notes above to begin your analysis</p>
          </div>
        )}
      </main>
    </div>
  );
}
