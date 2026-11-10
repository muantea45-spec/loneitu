import type { jsPDF } from 'jspdf';
import type { FarmerAnalyticsMetrics } from './farmerAnalyticsCalculator';

export interface GovtPresentationPdfOptions {
  organizationName?: string;
  projectDirectorName?: string;
  regNumber?: string;
  darpanId?: string;
  panNumber?: string;
  district?: string;
}

/**
 * Generates an official, high-level Government Progress Presentation PDF
 * suitable for submission to State Government departments, NABARD, KVK,
 * and institutional funding bodies.
 */
export async function generateGovernmentPresentationPdf(
  metrics: FarmerAnalyticsMetrics,
  options: GovtPresentationPdfOptions = {}
): Promise<void> {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 36;
  const contentWidth = pageWidth - margin * 2;

  const orgName = options.organizationName || 'OFFICE OF THE PROJECT DIRECTOR, MIZO FARM SOLUTIONS';
  const regNo = options.regNumber || 'MSR 1863 of 07.04.2026';
  const darpan = options.darpanId || 'MZ/2026/1116885';
  const udyam = 'UDYAM-MZ-02-0002682';
  const address = 'Jail Veng, Champhai District, Mizoram - Pin: 796321';
  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // --- Helper: Draw Top Letterhead Banner ---
  const drawLetterhead = (docInstance: jsPDF, pageNum: number) => {
    // Top primary bar (#143520)
    docInstance.setFillColor(20, 53, 32);
    docInstance.rect(0, 0, pageWidth, 68, 'F');

    // Accent line (#BFDC28)
    docInstance.setFillColor(191, 220, 40);
    docInstance.rect(0, 68, pageWidth, 4, 'F');

    // Organization Name
    docInstance.setTextColor(255, 255, 255);
    docInstance.setFont('helvetica', 'bold');
    docInstance.setFontSize(13);
    docInstance.text(orgName, margin, 26);

    // Official Credentials
    docInstance.setFont('helvetica', 'normal');
    docInstance.setFontSize(8);
    docInstance.setTextColor(223, 237, 227);
    docInstance.text(`REG NO: ${regNo}  |  DARPAN ID: ${darpan}  |  UDYAM: ${udyam}`, margin, 42);
    docInstance.text(`OFFICE: ${address}  |  EMAIL: contact@loneitu.com`, margin, 55);

    // Document Subject Subheader
    docInstance.setFillColor(246, 244, 235);
    docInstance.rect(0, 72, pageWidth, 26, 'F');
    docInstance.setTextColor(37, 107, 58);
    docInstance.setFont('helvetica', 'bold');
    docInstance.setFontSize(9);
    docInstance.text('GOVERNMENT PROGRESS & FIELD VERIFICATION PRESENTATION', margin, 89);

    docInstance.setFont('helvetica', 'normal');
    docInstance.setTextColor(111, 91, 60);
    docInstance.text(`AUDIT DATE: ${dateStr}  |  PAGE ${pageNum} OF 3`, pageWidth - margin, 89, { align: 'right' });
  };

  // --- Helper: Draw Footer ---
  const drawFooter = (docInstance: jsPDF, pageNum: number) => {
    docInstance.setDrawColor(221, 212, 188);
    docInstance.setLineWidth(0.75);
    docInstance.line(margin, pageHeight - 32, pageWidth - margin, pageHeight - 32);

    docInstance.setFontSize(8);
    docInstance.setFont('helvetica', 'normal');
    docInstance.setTextColor(143, 120, 85);
    docInstance.text('Loneitu Agrarian Registry — Confidential Institutional Document for Official Departmental Review', margin, pageHeight - 20);
    docInstance.text(`Page ${pageNum} of 3`, pageWidth - margin, pageHeight - 20, { align: 'right' });
  };

  // =========================================================================
  // PAGE 1: EXECUTIVE BRIEFING & CORE KPIS
  // =========================================================================
  drawLetterhead(doc, 1);

  let cursorY = 114;

  // Title Box
  doc.setFillColor(251, 251, 248);
  doc.setDrawColor(221, 212, 188);
  doc.roundedRect(margin, cursorY, contentWidth, 42, 6, 6, 'FD');

  doc.setTextColor(20, 53, 32);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('EXECUTIVE AGRARIAN CENSUS & ACREAGE BREAKDOWN', margin + 14, cursorY + 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(84, 67, 44);
  doc.text(
    `Comprehensive field audit of ${metrics.totalFarmers.toLocaleString()} registered farming families across ${metrics.totalDistricts} Districts & ${metrics.totalBlocks} Blocks.`,
    margin + 14,
    cursorY + 32
  );

  cursorY += 54;

  // 4 Top KPI Cards
  const cardW = (contentWidth - 18) / 4;
  const cardH = 52;
  const kpiData = [
    { label: 'VERIFIED GROWERS', val: `${metrics.totalFarmers.toLocaleString()}`, sub: 'Active Farming Units', color: [20, 53, 32] },
    { label: 'COMMITTED ACRES', val: `${metrics.totalAcreage.toLocaleString()} Ac`, sub: 'Total Cultivated Area', color: [37, 107, 58] },
    { label: 'WOMEN FARMERS', val: `${metrics.femalePercentage}%`, sub: `${metrics.femaleCount.toLocaleString()} Female Producers`, color: [194, 98, 61] },
    { label: 'AVG LANDHOLDING', val: `${metrics.avgAcreagePerFarmer} Ac`, sub: 'Per Household', color: [111, 91, 60] },
  ];

  kpiData.forEach((kpi, idx) => {
    const x = margin + idx * (cardW + 6);
    doc.setFillColor(242, 247, 243);
    doc.setDrawColor(183, 206, 180);
    doc.roundedRect(x, cursorY, cardW, cardH, 4, 4, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2]);
    doc.text(kpi.label, x + 8, cursorY + 14);

    doc.setFontSize(13);
    doc.text(kpi.val, x + 8, cursorY + 31);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(111, 91, 60);
    doc.text(kpi.sub, x + 8, cursorY + 44);
  });

  cursorY += cardH + 16;

  // Section Heading: 1. District Distribution Summary
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(20, 53, 32);
  doc.text('1. District-Wise Operational Distribution', margin, cursorY);
  cursorY += 6;

  // Table 1: District Table
  const districtRows = metrics.districtBreakdown.map((d, i) => [
    String(i + 1),
    d.district,
    d.blocks.map(b => b.name).join(', '),
    d.totalFarmers.toLocaleString(),
    `${d.totalAcreage.toLocaleString()} Acres`,
    `${((d.totalAcreage / (metrics.totalAcreage || 1)) * 100).toFixed(1)}%`,
    `${d.femaleFarmers.toLocaleString()} (${((d.femaleFarmers / d.totalFarmers) * 100).toFixed(0)}%)`,
    `${d.avgAcreage} Ac`,
  ]);

  autoTable(doc, {
    startY: cursorY,
    head: [['#', 'District', 'Operational Blocks', 'Farmers', 'Total Acreage', 'Acre Share', 'Women Farmers', 'Avg Holding']],
    body: districtRows,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 4.5,
      textColor: [30, 41, 34],
    },
    headStyles: {
      fillColor: [20, 53, 32],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'left',
    },
    columnStyles: {
      0: { cellWidth: 20, halign: 'center' },
      1: { cellWidth: 80, fontStyle: 'bold' },
      2: { cellWidth: 120 },
      3: { halign: 'right' },
      4: { halign: 'right', fontStyle: 'bold' },
      5: { halign: 'right' },
      6: { halign: 'right' },
      7: { halign: 'right' },
    },
    margin: { left: margin, right: margin },
  });

  cursorY = (doc as any).lastAutoTable.finalY + 18;

  // Section Heading: 2. Flagship Agronomic Crop Breakdown (Kiwi vs Dragonfruit vs Terrace Paddy)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(20, 53, 32);
  doc.text('2. Flagship Agronomic Crop Specialization Matrix', margin, cursorY);
  cursorY += 6;

  const cropRows = metrics.cropBreakdown.map((c, i) => [
    String(i + 1),
    c.cropName,
    c.category,
    c.farmersCount.toLocaleString(),
    `${c.totalAcres.toLocaleString()} Acres`,
    `${c.percentage}%`,
    `${c.avgAcrePerFarmer} Ac`,
    c.primaryVillages.join(', ') || 'District-Wide Clusters',
  ]);

  autoTable(doc, {
    startY: cursorY,
    head: [['#', 'Target Crop Category', 'Agronomic Profile', 'Growers', 'Acreage', 'Land Share', 'Avg / Grower', 'Key Cluster Centers']],
    body: cropRows,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 4.5,
      textColor: [30, 41, 34],
    },
    headStyles: {
      fillColor: [37, 107, 58],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'left',
    },
    columnStyles: {
      0: { cellWidth: 20, halign: 'center' },
      1: { cellWidth: 115, fontStyle: 'bold' },
      2: { cellWidth: 85 },
      3: { halign: 'right' },
      4: { halign: 'right', fontStyle: 'bold' },
      5: { halign: 'right' },
      6: { halign: 'right' },
      7: { cellWidth: 110 },
    },
    margin: { left: margin, right: margin },
  });

  drawFooter(doc, 1);

  // =========================================================================
  // PAGE 2: WATER SECURITY, LAND TYPE & BLOCK ANALYTICS
  // =========================================================================
  doc.addPage();
  drawLetterhead(doc, 2);

  cursorY = 114;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(20, 53, 32);
  doc.text('3. Land Classification & Water Security Assessment', margin, cursorY);
  cursorY += 6;

  // Water Security Note Box
  doc.setFillColor(254, 249, 235);
  doc.setDrawColor(221, 212, 188);
  doc.roundedRect(margin, cursorY, contentWidth, 48, 5, 5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(194, 98, 61);
  doc.text('CRITICAL INSTITUTIONAL OBSERVATION — MONSOON WATER DEPENDENCY', margin + 12, cursorY + 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(84, 67, 44);
  doc.text(
    `Field data indicates ${((metrics.rainfedAcreage / (metrics.totalAcreage || 1)) * 100).toFixed(1)}% (${metrics.rainfedAcreage.toLocaleString()} Acres) of registered crop land operates purely on rainfed seasonal precipitation.`,
    margin + 12,
    cursorY + 28
  );
  doc.text(
    'Government intervention for Solar Micro-Irrigation, check-dams, and community rainwater harvesting tanks is strongly recommended.',
    margin + 12,
    cursorY + 39
  );

  cursorY += 58;

  // Land & Irrigation Table
  const landRows = [
    ['1', 'Upland Hill Terraces (Polyhouse & Fruit Orchards)', 'Elevated hill slopes (Kiwi, Dragon Fruit, Orange)', `${metrics.uplandAcreage.toLocaleString()} Ac`, `${((metrics.uplandAcreage / (metrics.totalAcreage || 1)) * 100).toFixed(1)}%`, 'Organic & Controlled'],
    ['2', 'Lowland Terraces & Valley Floor (Wet Rice/Paddy)', 'Terrace paddy fields and stream basins', `${metrics.lowlandAcreage.toLocaleString()} Ac`, `${((metrics.lowlandAcreage / (metrics.totalAcreage || 1)) * 100).toFixed(1)}%`, 'Traditional Wetland Cultivation'],
    ['3', 'Rainfed Production Systems', 'Zero mechanical irrigation infrastructure', `${metrics.rainfedAcreage.toLocaleString()} Ac`, `${((metrics.rainfedAcreage / (metrics.totalAcreage || 1)) * 100).toFixed(1)}%`, 'High Drought Vulnerability'],
    ['4', 'Mechanized / Irrigated Infrastructure', 'Spring water drip, pipes, or canal systems', `${metrics.irrigatedAcreage.toLocaleString()} Ac`, `${((metrics.irrigatedAcreage / (metrics.totalAcreage || 1)) * 100).toFixed(1)}%`, 'Year-Round Stable Yields'],
  ];

  autoTable(doc, {
    startY: cursorY,
    head: [['#', 'Landscape / Water Classification', 'Topographical Profile', 'Total Acreage', 'Percentage', 'Operational Status']],
    body: landRows,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 5,
      textColor: [30, 41, 34],
    },
    headStyles: {
      fillColor: [20, 53, 32],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    margin: { left: margin, right: margin },
  });

  cursorY = (doc as any).lastAutoTable.finalY + 20;

  // Detailed Block Level Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(20, 53, 32);
  doc.text('4. Block-Level Field Deployment Summary', margin, cursorY);
  cursorY += 6;

  const blockRows: string[][] = [];
  metrics.districtBreakdown.forEach((dist) => {
    dist.blocks.forEach((blk) => {
      blockRows.push([
        String(blockRows.length + 1),
        dist.district,
        blk.name,
        blk.farmers.toLocaleString(),
        `${blk.acreage.toLocaleString()} Ac`,
        `${((blk.acreage / (dist.totalAcreage || 1)) * 100).toFixed(1)}%`,
        'Active NGO/Govt Cluster',
      ]);
    });
  });

  autoTable(doc, {
    startY: cursorY,
    head: [['#', 'District', 'Block Name', 'Verified Growers', 'Total Acreage', 'District Share', 'Implementation Status']],
    body: blockRows,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 4.5,
      textColor: [30, 41, 34],
    },
    headStyles: {
      fillColor: [37, 107, 58],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    margin: { left: margin, right: margin },
  });

  drawFooter(doc, 2);

  // =========================================================================
  // PAGE 3: STRATEGIC RECOMMENDATIONS & FORMAL SIGN-OFF
  // =========================================================================
  doc.addPage();
  drawLetterhead(doc, 3);

  cursorY = 114;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(20, 53, 32);
  doc.text('5. Proposed Action Plan for Government Departmental Convergence', margin, cursorY);
  cursorY += 8;

  const recommendations = [
    {
      title: 'A. Establishment of Post-Harvest Cold Chain in Champhai',
      desc: 'Champhai produces premium grade Kiwi and Dragon Fruit, but loses 20-30% of market value due to lack of cold storage during transit to Aizawl and Assam markets. Funding under MOVCDNER / PM-FME is requested.',
    },
    {
      title: 'B. Organic Certification & Vermicompost Hubs',
      desc: 'Transition 3,000+ registered farmers into certified organic clusters. Setting up decentralized vermicompost beds will eliminate reliance on expensive imported chemical inputs and preserve fragile hill topsoils.',
    },
    {
      title: 'C. Solar Micro-Irrigation Kits for Hillside Growers',
      desc: 'With 97% of acreage currently dependent on monsoon rain, small-scale solar drip irrigation kits for polyhouse growers will double vegetable and fruit yields during dry winter months (November to April).',
    },
    {
      title: 'D. Capacity Building & Precision Agriculture Extension',
      desc: 'Empower rural youth with drone spraying, automated soil-testing sensors, and digital pest diagnostics through Loneitu platform integrations.',
    },
  ];

  recommendations.forEach((rec) => {
    doc.setFillColor(242, 247, 243);
    doc.setDrawColor(183, 206, 180);
    doc.roundedRect(margin, cursorY, contentWidth, 38, 4, 4, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(20, 53, 32);
    doc.text(rec.title, margin + 10, cursorY + 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(84, 67, 44);
    doc.text(rec.desc, margin + 10, cursorY + 26, { maxWidth: contentWidth - 20 });

    cursorY += 46;
  });

  cursorY += 20;

  // Formal Submission Block
  doc.setFillColor(251, 251, 248);
  doc.setDrawColor(221, 212, 188);
  doc.roundedRect(margin, cursorY, contentWidth, 140, 6, 6, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(20, 53, 32);
  doc.text('FORMAL SUBMISSION & INSTITUTIONAL DECLARATION', margin + 14, cursorY + 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(84, 67, 44);
  const declarationText =
    'This Progress Presentation and Farmer Demographic Audit has been prepared by the technical and field evaluation team of Mizo Farm Solutions. All statistics regarding farmer identities, GPS land clusters, and crop commitments have been verified against active field records.';
  doc.text(declarationText, margin + 14, cursorY + 34, { maxWidth: contentWidth - 28 });

  // Signature Block
  const sigY = cursorY + 80;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(20, 53, 32);
  doc.text('Submitted by:', margin + 14, sigY);
  doc.text('Verified & Countersigned:', pageWidth - margin - 150, sigY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(84, 67, 44);
  doc.text('Dr. C. Lalhriatpuia', margin + 14, sigY + 15);
  doc.text('Project Director, Mizo Farm Solutions', margin + 14, sigY + 26);
  doc.text('Champhai District, Mizoram', margin + 14, sigY + 37);

  doc.text('Authorized Departmental Signatory', pageWidth - margin - 150, sigY + 15);
  doc.text('Govt of Mizoram / Supporting Agency', pageWidth - margin - 150, sigY + 26);
  doc.text('Official Seal & Stamp', pageWidth - margin - 150, sigY + 37);

  drawFooter(doc, 3);

  // Save the PDF
  const filename = `Mizo_Farm_Solutions_Government_Presentation_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
