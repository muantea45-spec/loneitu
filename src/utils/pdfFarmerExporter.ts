import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { FarmerRecord } from '../types/farmer';

export interface ExportFarmerPdfOptions {
  title?: string;
  subtitle?: string;
  includeTimestamp?: boolean;
}

/**
 * Generates and downloads a clean, beautifully formatted official PDF
 * of the Mizoram Farmer Registry.
 */
export function exportFarmersToPdf(
  farmers: FarmerRecord[],
  activeColumns: string[],
  options: ExportFarmerPdfOptions = {}
): void {
  if (!farmers || farmers.length === 0) {
    alert('No farmer records available to export.');
    return;
  }

  // Determine orientation: landscape if more than 4 dynamic columns
  const isLandscape = activeColumns.length > 4;
  const doc = new jsPDF({
    orientation: isLandscape ? 'landscape' : 'portrait',
    unit: 'pt',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Define headers: Sl No, Farmer Name, and all dynamic columns
  const tableHeaders = ['Sl', 'Farmer Name', ...activeColumns];

  // Define rows
  const tableRows = farmers.map((farmer, idx) => {
    const row = [
      String(idx + 1),
      farmer.fullName || '-'
    ];

    activeColumns.forEach(col => {
      const val = farmer.data?.[col];
      row.push(val !== undefined && val !== null && val !== '' ? String(val) : '-');
    });

    return row;
  });

  // Draw Header Banner on the first page
  const drawDocumentHeader = (docInstance: jsPDF) => {
    // Forest Green top header bar
    docInstance.setFillColor(20, 53, 32); // #143520
    docInstance.rect(0, 0, pageWidth, 68, 'F');

    // Title
    docInstance.setTextColor(255, 255, 255);
    docInstance.setFontSize(16);
    docInstance.setFont('helvetica', 'bold');
    docInstance.text(options.title || 'LONEITU — MIZORAM FARMER REGISTRY', 30, 32);

    // Subtitle & Metadata
    docInstance.setFontSize(9);
    docInstance.setFont('helvetica', 'normal');
    docInstance.setTextColor(191, 220, 40); // #BFDC28 lime accent
    docInstance.text('OFFICIAL VERIFIED AGRICULTURAL REGISTRY', 30, 48);

    docInstance.setTextColor(235, 241, 234);
    const dateStr = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    const metaText = `Records: ${farmers.length} | Attributes: ${activeColumns.length} | Date: ${dateStr}`;
    docInstance.text(metaText, pageWidth - 30, 48, { align: 'right' });
  };

  // Render the initial banner
  drawDocumentHeader(doc);

  // AutoTable render
  autoTable(doc, {
    head: [tableHeaders],
    body: tableRows,
    startY: 82,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 5,
      valign: 'middle',
      lineColor: [220, 232, 222],
      lineWidth: 0.5,
      overflow: 'linebreak'
    },
    headStyles: {
      fillColor: [37, 107, 58], // #256B3A
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'left'
    },
    alternateRowStyles: {
      fillColor: [247, 251, 248] // #F7FBF8
    },
    columnStyles: {
      0: { cellWidth: 26, halign: 'center' }, // Sl No
      1: { cellWidth: isLandscape ? 120 : 95, fontStyle: 'bold' } // Farmer Name
    },
    margin: { top: 78, left: 25, right: 25, bottom: 35 },
    didDrawPage: (data) => {
      // Header for pages after page 1
      if (data.pageNumber > 1) {
        doc.setFillColor(20, 53, 32);
        doc.rect(0, 0, pageWidth, 35, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('LONEITU — MIZORAM FARMER REGISTRY (CONTINUED)', 25, 22);
      }

      // Footer
      const totalPages = (doc as any).internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(120, 130, 125);
      doc.setFont('helvetica', 'normal');
      doc.text(
        'Loneitu Agricultural Information System • Official & Confidential',
        25,
        pageHeight - 15
      );
      doc.text(
        `Page ${data.pageNumber} of ${totalPages}`,
        pageWidth - 25,
        pageHeight - 15,
        { align: 'right' }
      );
    }
  });

  const todayStr = new Date().toISOString().split('T')[0];
  doc.save(`Farmer_Registry_Export_${todayStr}.pdf`);
}
