
import { useState } from 'react';
import {
  ClipboardCheck,
  History,
  LayoutDashboard,
  AlertTriangle,
  Activity,
  FileText,
  ArrowRight,
  Loader2,
  CheckCircle2,
  LogOut,
  Upload,
  Download,
  FileDown,
  Copy,
  Check
} from 'lucide-react';
import { useRef } from 'react';
import { DocumentProcessor } from './services/DocumentProcessor';
import { ExportService } from './services/ExportService';
import { motion, AnimatePresence } from 'framer-motion';
import { ClinicalSummarizationAssistant } from './services/ClinicalSummarizationAssistant';
import { SectionType } from './types';
import type { StructuredSummary } from './types';
import { Login } from './components/Login';
import { useAuth } from './context/AuthContext';

import { useEffect } from 'react';

export default function App() {
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const [noteText, setNoteText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [summary, setSummary] = useState<StructuredSummary | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [history, setHistory] = useState<StructuredSummary[]>([]);
  const [activeView, setActiveView] = useState<'dashboard' | 'history'>('dashboard');
  const [isCopied, setIsCopied] = useState(false);
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

  const getSectionIcon = (type: SectionType) => {
    switch (type) {
      case SectionType.VITALS: return <Activity className="w-4 h-4" />;
      case SectionType.MEDICATIONS: return <ClipboardCheck className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const formatSectionHeader = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  };

  if (isLoading) {
    return (
      <div className="app-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 className="w-12 h-12 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          <ClipboardCheck className="w-8 h-8 text-indigo-400" />
          <span>Kiro Clinical</span>
        </div>

        <nav>
          <div
            className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveView('dashboard')}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </div>
          <div
            className={`nav-item ${activeView === 'history' ? 'active' : ''}`}
            onClick={() => setActiveView('history')}
          >
            <History className="w-5 h-5" />
            <span>History</span>
          </div>
          <div
            className="nav-item"
            onClick={logout}
            style={{ marginTop: '1rem', color: 'var(--accent-red)', opacity: 0.8 }}
          >
            <LogOut className="w-5 h-5" />
            <span>Log Out</span>
          </div>
        </nav>

        <div style={{ marginTop: 'auto' }}>
          <div className="section-title">Recent History</div>
          {history.length === 0 && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No recent activity</p>}
          {history.slice(0, 3).map(h => (
            <div
              key={h.id}
              className="nav-item"
              style={{ fontSize: '0.8rem', cursor: 'pointer' }}
              onClick={() => { setSummary(h); setActiveView('dashboard'); }}
            >
              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {h.generatedAt.toLocaleTimeString()} - {h.handoffSummary.briefOverview}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <div>
            <h1>Clinical Summarizer</h1>
            <p style={{ color: 'var(--text-muted)' }}>AI-powered patient information synthesis</p>
          </div>
          <div className="user-profile">
            <div className="avatar">{user?.avatar || 'DR'}</div>
            <div>
              <div style={{ fontWeight: '600' }}>{user?.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.role}</div>
            </div>
          </div>
        </header>

        {activeView === 'dashboard' ? (
          <>
            {/* Input Section */}
            <section className="input-section">
              <textarea
                className="note-input"
                placeholder="Paste clinical notes here or upload a file... (e.g. 'CC: Chest pain. Vitals: BP 140/90, Pulse 110...')"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileUpload}
                  />
                  <button
                    className="button-secondary"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <Upload className="w-4 h-4" />
                    Upload Note
                  </button>
                  {noteText && (
                    <button
                      className="button-secondary"
                      onClick={() => setNoteText('')}
                      style={{ color: 'var(--accent-red)' }}
                    >
                      Clear
                    </button>
                  )}
                </div>
                <button
                  className="button-primary"
                  onClick={handleProcess}
                  disabled={isProcessing || !noteText}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Generate Summary
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </section>

            {/* Feedback Area */}
            {feedback && (
              <div className="summary-card" style={{ border: '1px solid var(--accent-red)', background: 'rgba(239, 68, 68, 0.05)', marginBottom: '1rem' }}>
                <div className="section-title" style={{ color: 'var(--accent-red)' }}>
                  <AlertTriangle className="w-4 h-4" />
                  Summarization Error
                </div>
                <p style={{ fontSize: '0.875rem' }}>{feedback}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  Please check your OpenAI API key in the .env file and ensure you have internet access.
                </p>
              </div>
            )}
          </>
        ) : (
          <section className="history-view">
            <h2 style={{ marginBottom: '1.5rem' }}>Processing History</h2>
            {history.length === 0 ? (
              <div style={{ textAlign: 'center', opacity: 0.5, padding: '4rem 0' }}>
                <History className="w-12 h-12 mb-4 mx-auto" style={{ margin: '0 auto' }} />
                <p>No summarization history yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {history.map((h) => (
                  <div key={h.id} className="summary-card" style={{ cursor: 'pointer' }} onClick={() => { setSummary(h); setActiveView('dashboard'); }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: '600' }}>{h.handoffSummary.briefOverview.slice(0, 80)}...</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {h.generatedAt.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Results Area */}
        <AnimatePresence>
          {summary && (
            <motion.div
              className="results-area"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>Summary Results</h2>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    className="button-secondary"
                    onClick={handleExportPDF}
                    style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <FileDown className="w-4 h-4" />
                    Download PDF
                  </button>
                  <button
                    className="button-secondary"
                    onClick={handleExportDocx}
                    style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <Download className="w-4 h-4" />
                    Download Word
                  </button>
                  <button
                    className="button-secondary"
                    onClick={handleCopy}
                    style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', border: isCopied ? '1px solid var(--accent-green)' : '' }}
                  >
                    {isCopied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    {isCopied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Safety Warning */}
              {!summary.safetyValidation.isCompliant && (
                <div className="summary-card" style={{ border: '1px solid var(--accent-yellow)', background: 'rgba(245, 158, 11, 0.05)', marginBottom: '2rem' }}>
                  <div className="section-title" style={{ color: 'var(--accent-yellow)' }}>
                    <AlertTriangle className="w-5 h-5" />
                    Safety Warning: Potential Prescriptive Language Detected
                  </div>
                  <p style={{ fontSize: '0.875rem' }}>
                    This summary may contain phrases that look like medical advice or specific dosages.
                    Please review carefully against the original note.
                  </p>
                  <ul style={{ fontSize: '0.75rem', marginTop: '0.5rem', listStyle: 'none' }}>
                    {summary.safetyValidation.violations.map((v, i) => (
                      <li key={i} style={{ color: 'var(--text-muted)' }}>• {v.description}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Red Flags Header */}
              {summary.redFlags.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                  <div className="section-title" style={{ color: 'var(--accent-red)' }}>
                    <AlertTriangle className="w-5 h-5" style={{ color: 'var(--accent-red)' }} />
                    Critical Alerts
                  </div>
                  <div className="summary-grid">
                    {summary.redFlags.map((rf, idx) => (
                      <div key={idx} className="summary-card red-flag-card fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span className="badge badge-red">{rf.type.replace('_', ' ')}</span>
                          <span className="badge badge-red" style={{ background: 'transparent' }}>{rf.criticalityLevel.toUpperCase()}</span>
                        </div>
                        <h3 style={{ marginBottom: '0.5rem' }}>{rf.description}</h3>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{rf.rationale}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Uncertainties Area */}
              {summary.uncertainties && summary.uncertainties.length > 0 && (
                <div className="summary-card" style={{ border: '1px solid var(--accent-yellow)', background: 'rgba(245, 158, 11, 0.03)', marginBottom: '2rem' }}>
                  <div className="section-title" style={{ color: 'var(--accent-yellow)' }}>
                    <AlertTriangle className="w-5 h-5" />
                    Ambiguous Information / Uncertainties
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    {summary.uncertainties.map((u, i) => (
                      <div key={i} style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.5rem' }}>
                        <div style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.4rem' }}>{u.description}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          <span style={{ color: 'var(--accent-yellow)', fontWeight: '500' }}>Impact: </span>
                          {u.potentialImpact}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Handoff Summary */}
              <div className="summary-card" style={{ marginBottom: '2rem', border: '1px solid var(--primary)' }}>
                <div className="section-title">
                  <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--accent-green)' }} />
                  Clinical Handoff Synthesis
                </div>
                <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>{summary.handoffSummary.briefOverview}</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div>
                    <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>KEY ACTIONS</h4>
                    <ul className="key-points">
                      {summary.handoffSummary.actionItems.map((item, i) => (
                        <li key={i} className="key-point-item">{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>PENDING</h4>
                    {summary.handoffSummary.pendingActions.map((pa, i) => (
                      <div key={i} style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem', marginBottom: '0.5rem' }}>
                        <div style={{ fontSize: '0.875rem' }}>{pa.description}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--accent-yellow)' }}>Due: {pa.timeframe}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Detailed Sections */}
              <div className="section-title">Structured Findings</div>
              <div className="summary-grid">
                {summary.sections.map((section, idx) => (
                  <div key={idx} className="summary-card fade-in" style={{ animationDelay: `${(idx + summary.redFlags.length) * 0.1}s` }}>
                    <div className="section-title">
                      {getSectionIcon(section.sectionType)}
                      {formatSectionHeader(section.sectionType)}
                    </div>
                    <p style={{ fontSize: '0.9375rem', lineHeight: '1.5' }}>{section.summary}</p>
                    {section.keyPoints.length > 0 && (
                      <ul className="key-points">
                        {section.keyPoints.map((kp, i) => (
                          <li key={i} className="key-point-item">{kp}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
                {/* Technical Metadata & Traceability */}
                <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="section-title" style={{ fontSize: '0.9rem', opacity: 0.7 }}>
                    Technical Metadata & Traceability
                  </div>
                  <div className="summary-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                    <div className="summary-card" style={{ padding: '1rem' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PROCESSING TIME</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: '600' }}>{summary.processingMetadata.processingTime}ms</div>
                    </div>
                    <div className="summary-card" style={{ padding: '1rem' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CONFIDENCE SCORE</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: '600' }}>{(summary.completenessScore * 100).toFixed(0)}%</div>
                    </div>
                    <div className="summary-card" style={{ padding: '1rem' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>COMPONENTS</div>
                      <div style={{ fontSize: '0.75rem' }}>{summary.processingMetadata.componentsUsed.join(', ')}</div>
                    </div>
                  </div>

                  {summary.sections.some(s => s.sourceQuotes && s.sourceQuotes.length > 0) && (
                    <div style={{ marginTop: '1.5rem' }}>
                      <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>EVIDENCE-BASED TRACEABILITY (SOURCE QUOTES)</h4>
                      <div className="summary-grid">
                        {summary.sections.filter(s => s.sourceQuotes && s.sourceQuotes.length > 0).map((s, i) => (
                          <div key={i} className="summary-card" style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.01)' }}>
                            <div style={{ fontSize: '0.7rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary-light)' }}>
                              {formatSectionHeader(s.sectionType)}
                            </div>
                            {s.sourceQuotes?.map((quote, qi) => (
                              <div key={qi} style={{ fontSize: '0.75rem', fontStyle: 'italic', color: 'var(--text-muted)', borderLeft: '2px solid var(--primary)', paddingLeft: '0.5rem', marginBottom: '0.4rem' }}>
                                "{quote}"
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!summary && !isProcessing && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
            <FileText className="w-16 h-16 mb-4" />
            <p>No summary generated yet. Input clinical notes above to begin.</p>
          </div>
        )}
      </main>

      <style>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .results-area {
          margin-bottom: 4rem;
        }
        .button-secondary {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--text-primary);
          padding: 0.6rem 1.2rem;
          border-radius: 0.75rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .button-secondary:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.1);
          border-color: var(--primary-light);
        }
        .button-secondary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div >
  );
}
