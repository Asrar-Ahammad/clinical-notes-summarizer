
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import type { StructuredSummary } from '../types';

export class ExportService {
    static exportToPDF(summary: StructuredSummary) {
        try {
            console.log("Generating PDF for summary:", summary.id);
            const doc = new jsPDF();
            const margin = 14;
            let yPos = 20;

            // Helper to handle page overflows
            const checkY = (increment: number) => {
                if (yPos + increment > 270) {
                    doc.addPage();
                    yPos = 20;
                    return true;
                }
                return false;
            };

            // Title
            doc.setFontSize(22);
            doc.setTextColor(63, 81, 181); // Indigo color
            doc.text("Clinical Summary Report", margin, yPos);
            yPos += 12;

            doc.setFontSize(10);
            doc.setTextColor(100);
            const dateValue = summary.generatedAt;
            const dateStr = dateValue instanceof Date
                ? dateValue.toLocaleString()
                : new Date(dateValue).toLocaleString();

            doc.text(`Generated on: ${dateStr}`, margin, yPos);
            yPos += 15;

            // Handoff Synthesis
            doc.setFontSize(16);
            doc.setTextColor(0);
            doc.text("Clinical Handoff Synthesis", margin, yPos);
            yPos += 8;

            doc.setFontSize(11);
            doc.setFont("helvetica", "normal");
            const splitOverview = doc.splitTextToSize(summary.handoffSummary.briefOverview, 180);
            doc.text(splitOverview, margin, yPos);
            yPos += (splitOverview.length * 6) + 10;

            // Key Actions
            if (summary.handoffSummary.actionItems && summary.handoffSummary.actionItems.length > 0) {
                checkY(20);
                doc.setFontSize(14);
                doc.setFont("helvetica", "bold");
                doc.text("Key Actions:", margin, yPos);
                yPos += 8;
                doc.setFontSize(10);
                doc.setFont("helvetica", "normal");
                summary.handoffSummary.actionItems.forEach(item => {
                    const bullet = `• ${item}`;
                    const splitBullet = doc.splitTextToSize(bullet, 170);
                    checkY(splitBullet.length * 5 + 2);
                    doc.text(splitBullet, margin + 5, yPos);
                    yPos += (splitBullet.length * 5) + 3;
                });
                yPos += 5;
            }

            // Red Flags
            if (summary.redFlags && summary.redFlags.length > 0) {
                checkY(20);
                doc.setFontSize(14);
                doc.setTextColor(239, 68, 68); // Red
                doc.setFont("helvetica", "bold");
                doc.text("CRITICAL ALERTS", margin, yPos);
                doc.setTextColor(0);
                yPos += 8;

                summary.redFlags.forEach(flag => {
                    doc.setFontSize(11);
                    doc.setFont("helvetica", "bold");
                    const titleText = `${flag.type.replace(/_/g, ' ').toUpperCase()}: ${flag.description}`;
                    const splitTitle = doc.splitTextToSize(titleText, 180);
                    checkY(splitTitle.length * 6 + 10);
                    doc.text(splitTitle, margin, yPos);
                    yPos += (splitTitle.length * 6) + 2;

                    doc.setFontSize(10);
                    doc.setFont("helvetica", "normal");
                    const splitRationale = doc.splitTextToSize(flag.rationale, 170);
                    doc.text(splitRationale, margin + 5, yPos);
                    yPos += (splitRationale.length * 5) + 8;
                });
                yPos += 5;
            }

            // Detailed Sections
            summary.sections.forEach(section => {
                checkY(30);
                doc.setFontSize(14);
                doc.setFont("helvetica", "bold");
                doc.text(section.sectionType.replace(/_/g, ' '), margin, yPos);
                yPos += 8;

                doc.setFontSize(10);
                doc.setFont("helvetica", "normal");
                const splitSummary = doc.splitTextToSize(section.summary, 180);
                checkY(splitSummary.length * 5 + 5);
                doc.text(splitSummary, margin, yPos);
                yPos += (splitSummary.length * 5) + 5;

                if (section.keyPoints && section.keyPoints.length > 0) {
                    section.keyPoints.forEach(kp => {
                        const bullet = `- ${kp}`;
                        const splitKp = doc.splitTextToSize(bullet, 175);
                        checkY(splitKp.length * 5 + 2);
                        doc.text(splitKp, margin + 5, yPos);
                        yPos += (splitKp.length * 5) + 2;
                    });
                    yPos += 5;
                }
            });

            doc.save(`clinical_summary_${summary.id}.pdf`);
        } catch (error) {
            console.error("PDF Export Error:", error);
            alert("Failed to generate PDF. Check console for details.");
        }
    }

    static async exportToDocx(summary: StructuredSummary) {
        try {
            console.log("Generating Word doc for summary:", summary.id);
            const dateValue = summary.generatedAt;
            const dateStr = dateValue instanceof Date
                ? dateValue.toLocaleString()
                : new Date(dateValue).toLocaleString();

            const docChildren: any[] = [
                new Paragraph({
                    text: "Clinical Summary Report",
                    heading: HeadingLevel.TITLE,
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `Generated on: ${dateStr}`,
                            italics: true,
                            size: 20,
                        }),
                    ],
                }),
                new Paragraph({ text: "", spacing: { after: 200 } }),
                new Paragraph({
                    text: "Clinical Handoff Synthesis",
                    heading: HeadingLevel.HEADING_1,
                }),
                new Paragraph({
                    text: summary.handoffSummary.briefOverview,
                    spacing: { after: 200 },
                }),
            ];

            if (summary.handoffSummary.actionItems && summary.handoffSummary.actionItems.length > 0) {
                docChildren.push(new Paragraph({ text: "Key Actions", heading: HeadingLevel.HEADING_2 }));
                summary.handoffSummary.actionItems.forEach(item => {
                    docChildren.push(new Paragraph({ text: item, bullet: { level: 0 } }));
                });
            }

            if (summary.redFlags && summary.redFlags.length > 0) {
                docChildren.push(new Paragraph({ text: "CRITICAL ALERTS", heading: HeadingLevel.HEADING_2 }));
                summary.redFlags.forEach(flag => {
                    docChildren.push(new Paragraph({
                        children: [
                            new TextRun({ text: `${flag.type.replace(/_/g, ' ').toUpperCase()}: `, bold: true, color: "FF0000" }),
                            new TextRun({ text: flag.description, bold: true }),
                        ],
                    }));
                    docChildren.push(new Paragraph({ text: flag.rationale, indent: { left: 720 } }));
                });
            }

            summary.sections.forEach(section => {
                docChildren.push(new Paragraph({ text: section.sectionType.replace(/_/g, ' '), heading: HeadingLevel.HEADING_1 }));
                docChildren.push(new Paragraph({ text: section.summary }));
                section.keyPoints?.forEach(kp => {
                    docChildren.push(new Paragraph({ text: kp, bullet: { level: 0 } }));
                });
            });

            const doc = new Document({
                sections: [{
                    children: docChildren,
                }],
            });

            const blob = await Packer.toBlob(doc);
            saveAs(blob, `clinical_summary_${summary.id}.docx`);
        } catch (error) {
            console.error("Word Export Error:", error);
            alert("Failed to generate Word document. Check console for details.");
        }
    }
}
