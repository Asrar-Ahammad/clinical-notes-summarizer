import { motion } from 'framer-motion';
import type { StructuredSummary } from '../../types';
import { ActionButtons } from './ActionButtons';
import { SafetyWarning } from './SafetyWarning';
import { RedFlags } from './RedFlags';
import { Uncertainties } from './Uncertainties';
import { HandoffSynthesis } from './HandoffSynthesis';
import { StructuredFindings } from './StructuredFindings';
import { TechnicalMetadata } from './TechnicalMetadata';

interface SummaryResultsProps {
    summary: StructuredSummary;
    handleExportPDF: () => void;
    handleExportDocx: () => void;
    handleCopy: () => void;
    isCopied: boolean;
}

export const SummaryResults = ({
    summary,
    handleExportPDF,
    handleExportDocx,
    handleCopy,
    isCopied
}: SummaryResultsProps) => {
    return (
        <motion.div
            className="mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-white/5 pb-8">
                <div>
                    <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tightest">Summary Results</h2>
                    <p className="text-slate-400 mt-2 font-medium">Verified clinical synthesis of patient data</p>
                </div>
                <ActionButtons
                    handleExportPDF={handleExportPDF}
                    handleExportDocx={handleExportDocx}
                    handleCopy={handleCopy}
                    isCopied={isCopied}
                />
            </div>

            <div className="space-y-4">
                <SafetyWarning safetyValidation={summary.safetyValidation} />
                <RedFlags redFlags={summary.redFlags} />
                <Uncertainties uncertainties={summary.uncertainties} />
                <HandoffSynthesis handoffSummary={summary.handoffSummary} />
                <StructuredFindings sections={summary.sections} redFlagsCount={summary.redFlags.length} />
                <TechnicalMetadata summary={summary} />
            </div>
        </motion.div>
    );
};
