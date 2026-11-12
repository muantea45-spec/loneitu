import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';
import type { FarmerRecord } from '../types/farmer';
import { resolveImageUrl } from './imageUrlResolver';

export const MFS_CREDENTIALS = {
  organizationName: 'OFFICE OF THE PROJECT DIRECTOR, MIZO FARM SOLUTIONS',
  brandTitle: 'MIZO FARM SOLUTIONS',
  portalTitle: 'LONEITU — MIZORAM TAN',
  regNo: 'MSR 1863 of 07.04.2026',
  darpanId: 'MZ/2026/1116885',
  udyamNo: 'UDYAM-MZ-02-0002682',
  officeAddress: 'Jail Veng, Champhai District, Mizoram - Pin: 796321',
  email: 'contact@loneitu.com',
  publicBaseUrl: 'https://loneitu.com',
} as const;

const COLORS = {
  darkGreen: [20, 53, 32] as [number, number, number],
  midGreen: [37, 107, 58] as [number, number, number],
  lime: [191, 220, 40] as [number, number, number],
  cream: [246, 244, 235] as [number, number, number],
  umber: [111, 91, 60] as [number, number, number],
  border: [215, 206, 184] as [number, number, number],
  slate: [71, 85, 105] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  gold: [179, 132, 36] as [number, number, number],
};

const SENSITIVE_KEY_PATTERN = /aadhaar|uidai|aadhar|pan\b|bank|account\s*no|ifsc|passbook/i;

export function getFarmerVerifyUrl(farmerId: string): string {
  const encodedId = encodeURIComponent(farmerId.trim());
  if (typeof window !== 'undefined' && window.location?.origin) {
    const origin = window.location.origin;
    if (!origin.includes('localhost') && !origin.includes('127.0.0.1')) {
      return `${origin}/verify/${encodedId}`;
    }
  }
  return `${MFS_CREDENTIALS.publicBaseUrl}/verify/${encodedId}`;
}

export async function generateFarmerQrDataUrl(farmerId: string): Promise<string> {
  const url = getFarmerVerifyUrl(farmerId);
  return QRCode.toDataURL(url, {
    width: 260,
    margin: 1,
    errorCorrectionLevel: 'M',
    color: {
      dark: '#143520',
      light: '#FFFFFF',
    },
  });
}

function pickFarmerField(farmer: FarmerRecord, pattern: RegExp): string {
  const entries = Object.entries(farmer.data || {});
  for (const [key, val] of entries) {
    if (pattern.test(key)) {
      const text = String(val ?? '').trim();
      if (text && text !== '-' && text.toLowerCase() !== 'n/a') {
        return text;
      }
    }
  }
  return '';
}

function getSafeDisplayFields(farmer: FarmerRecord): Array<[string, string]> {
  const data = farmer.data || {};
  const orderedKeys =
    Array.isArray(farmer.columns) && farmer.columns.length > 0
      ? farmer.columns
      : Object.keys(data);

  const rows: Array<[string, string]> = [];
  const seen = new Set<string>();

  for (const key of orderedKeys) {
    if (!key || seen.has(key) || SENSITIVE_KEY_PATTERN.test(key)) continue;
    seen.add(key);
    const val = String(data[key] ?? '').trim();
    if (!val) continue;
    rows.push([key, val]);
  }

  for (const [key, rawVal] of Object.entries(data)) {
    if (!key || seen.has(key) || SENSITIVE_KEY_PATTERN.test(key)) continue;
    const val = String(rawVal ?? '').trim();
    if (!val) continue;
    rows.push([key, val]);
  }

  return rows;
}

function sanitizeFileSlug(value: string): string {
  return (value || 'farmer')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'farmer';
}

function getInitials(name: string): string {
  const parts = (name || 'F').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ''}${parts[parts.length - 1][0] || ''}`.toUpperCase();
}

async function tryLoadImageAsDataUrl(rawUrl?: string): Promise<string | null> {
  if (!rawUrl) return null;
  const resolved = resolveImageUrl(rawUrl);
  if (!resolved || resolved.startsWith('data:image/svg')) return null;
  if (resolved.startsWith('data:image/')) return resolved;

  return new Promise((resolve) => {
    let settled = false;
    const done = (result: string | null) => {
      if (!settled) {
        settled = true;
        resolve(result);
      }
    };
    const timer = setTimeout(() => done(null), 2500);
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        clearTimeout(timer);
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || 200;
          canvas.height = img.naturalHeight || 200;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            done(null);
            return;
          }
          ctx.drawImage(img, 0, 0);
          done(canvas.toDataURL('image/jpeg', 0.85));
        } catch {
          done(null);
        }
      };
      img.onerror = () => {
        clearTimeout(timer);
        done(null);
      };
      img.src = resolved;
    } catch {
      clearTimeout(timer);
      done(null);
    }
  });
}

function drawLabeledLine(
  doc: jsPDF,
  x: number,
  y: number,
  label: string,
  value: string,
  maxWidth: number
): number {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.4);
  doc.setTextColor(...COLORS.umber);
  doc.text(label.toUpperCase(), x, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.6);
  doc.setTextColor(...COLORS.darkGreen);
  const lines = doc.splitTextToSize(value || '—', maxWidth) as string[];
  const display = lines.slice(0, 2);
  doc.text(display, x, y + 3.2);
  return y + 3.2 + display.length * 3.4 + 1.1;
}

/**
 * Generates an A4 printable sheet containing Front & Back CR80 (85.6mm x 54mm)
 * Registered Farmer Digital ID Card with Mizo Farm Solutions credentials and a scannable QR code.
 */
export async function generateFarmerIdCardPdf(farmer: FarmerRecord): Promise<void> {
  const [qrDataUrl, avatarDataUrl] = await Promise.all([
    generateFarmerQrDataUrl(farmer.id),
    tryLoadImageAsDataUrl(farmer.avatar),
  ]);

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = 210;

  // Header context on A4 sheet
  doc.setFillColor(...COLORS.cream);
  doc.rect(0, 0, pageWidth, 297, 'F');

  doc.setFillColor(...COLORS.darkGreen);
  doc.rect(0, 0, pageWidth, 24, 'F');
  doc.setFillColor(...COLORS.lime);
  doc.rect(0, 24, pageWidth, 1.8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...COLORS.white);
  doc.text('REGISTERED FARMER DIGITAL ID CARD', 16, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.2);
  doc.setTextColor(...COLORS.lime);
  doc.text(`${MFS_CREDENTIALS.organizationName}  |  Reg: ${MFS_CREDENTIALS.regNo}`, 16, 17.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...COLORS.umber);
  doc.text(
    'Print at 100% actual size (CR80 Standard: 85.6 mm × 54.0 mm) and trim along dashed guides.',
    16,
    33
  );

  // Extract concise card details
  const village = pickFarmerField(farmer, /village|veng|khua|locality|address/i) || 'Champhai / Mizoram';
  const rdBlock = pickFarmerField(farmer, /block|rd\s*block|circle/i) || 'Mizoram RD Block';
  const district = pickFarmerField(farmer, /district/i) || 'Mizoram';
  const crops = pickFarmerField(farmer, /crop|produce|commodity|variety|farming/i) || 'Registered Agri Produce';
  const area = pickFarmerField(farmer, /area|acre|hectare|bigha|land|size/i) || 'Verified Holding';
  const guardian = pickFarmerField(farmer, /father|mother|spouse|husband|wife|guardian|pa\b/i);
  const contact = pickFarmerField(farmer, /contact|phone|mobile|cell|whatsapp/i);
  const status = (farmer.status || 'Active / Verified').toUpperCase();
  const regDate = farmer.registrationDate || '2026';

  const cardW = 85.6;
  const cardH = 54.0;
  const frontX = 16;
  const frontY = 44;
  const backX = 110;
  const backY = 44;

  // Labels above cards
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.darkGreen);
  doc.text('FRONT SIDE', frontX, frontY - 3);
  doc.text('BACK SIDE (VERIFICATION QR)', backX, backY - 3);

  // ===== FRONT CARD =====
  doc.setDrawColor(...COLORS.umber);
  doc.setLineDashPattern([1.2, 1.2], 0);
  doc.roundedRect(frontX - 1.5, frontY - 1.5, cardW + 3, cardH + 3, 2.5, 2.5, 'S');
  doc.setLineDashPattern([], 0);

  doc.setFillColor(...COLORS.white);
  doc.setDrawColor(...COLORS.darkGreen);
  doc.setLineWidth(0.4);
  doc.roundedRect(frontX, frontY, cardW, cardH, 2.2, 2.2, 'FD');

  // Top Header Banner
  doc.setFillColor(...COLORS.darkGreen);
  doc.rect(frontX, frontY, cardW, 11.5, 'F');
  doc.setFillColor(...COLORS.lime);
  doc.rect(frontX, frontY + 11.5, cardW, 1.1, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.6);
  doc.setTextColor(...COLORS.white);
  doc.text(MFS_CREDENTIALS.brandTitle, frontX + 3.2, frontY + 5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.5);
  doc.setTextColor(...COLORS.lime);
  doc.text(`FARMER IDENTITY CARD  •  ${MFS_CREDENTIALS.regNo}`, frontX + 3.2, frontY + 9);

  // Photo box (left)
  const photoX = frontX + 3.5;
  const photoY = frontY + 15;
  const photoW = 19;
  const photoH = 23;
  doc.setFillColor(...COLORS.cream);
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.3);
  doc.roundedRect(photoX, photoY, photoW, photoH, 1.5, 1.5, 'FD');

  if (avatarDataUrl) {
    try {
      const fmt = avatarDataUrl.includes('image/png') ? 'PNG' : 'JPEG';
      doc.addImage(avatarDataUrl, fmt, photoX + 0.4, photoY + 0.4, photoW - 0.8, photoH - 0.8);
    } catch {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(...COLORS.darkGreen);
      doc.text(getInitials(farmer.fullName), photoX + photoW / 2, photoY + 13.5, { align: 'center' });
    }
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...COLORS.darkGreen);
    doc.text(getInitials(farmer.fullName), photoX + photoW / 2, photoY + 13.5, { align: 'center' });
  }

  // Status pill under photo
  doc.setFillColor(...COLORS.midGreen);
  doc.roundedRect(photoX, photoY + photoH + 1.8, photoW, 4.5, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5);
  doc.setTextColor(...COLORS.white);
  doc.text(status.slice(0, 14), photoX + photoW / 2, photoY + photoH + 4.8, { align: 'center' });

  // Farmer primary info (right of photo)
  const infoX = frontX + 25.5;
  const infoMaxW = cardW - 28;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.2);
  doc.setTextColor(...COLORS.darkGreen);
  const nameLines = (doc.splitTextToSize(farmer.fullName.toUpperCase(), infoMaxW) as string[]).slice(0, 2);
  doc.text(nameLines, infoX, frontY + 18);

  let curY = frontY + 18 + nameLines.length * 3.8 + 0.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.6);
  doc.setTextColor(...COLORS.midGreen);
  doc.text(`ID: ${farmer.id}`, infoX, curY);
  curY += 4.2;

  if (guardian) {
    curY = drawLabeledLine(doc, infoX, curY, 'Father / Guardian', guardian, infoMaxW);
  }
  curY = drawLabeledLine(doc, infoX, curY, 'Village / Block', `${village}, ${rdBlock}`, infoMaxW);
  if (curY < frontY + cardH - 8) {
    drawLabeledLine(doc, infoX, curY, 'Primary Produce / Area', `${crops} (${area})`, infoMaxW);
  }

  // Front Bottom Strip
  doc.setFillColor(...COLORS.cream);
  doc.rect(frontX, frontY + cardH - 6.2, cardW, 6.2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.2);
  doc.setTextColor(...COLORS.umber);
  doc.text(`District: ${district}`, frontX + 3.2, frontY + cardH - 2.3);
  doc.text(`DARPAN: ${MFS_CREDENTIALS.darpanId}`, frontX + cardW - 3.2, frontY + cardH - 2.3, {
    align: 'right',
  });

  // ===== BACK CARD =====
  doc.setDrawColor(...COLORS.umber);
  doc.setLineDashPattern([1.2, 1.2], 0);
  doc.roundedRect(backX - 1.5, backY - 1.5, cardW + 3, cardH + 3, 2.5, 2.5, 'S');
  doc.setLineDashPattern([], 0);

  doc.setFillColor(...COLORS.white);
  doc.setDrawColor(...COLORS.darkGreen);
  doc.setLineWidth(0.4);
  doc.roundedRect(backX, backY, cardW, cardH, 2.2, 2.2, 'FD');

  doc.setFillColor(...COLORS.midGreen);
  doc.rect(backX, backY, cardW, 9.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.white);
  doc.text('OFFICIAL FARMER VERIFICATION & CREDENTIALS', backX + cardW / 2, backY + 6, {
    align: 'center',
  });

  // QR Code on left of back card
  const qrSize = 27;
  const qrX = backX + 4;
  const qrY = backY + 12.5;
  doc.setFillColor(...COLORS.white);
  doc.setDrawColor(...COLORS.border);
  doc.roundedRect(qrX - 1, qrY - 1, qrSize + 2, qrSize + 2, 1.2, 1.2, 'FD');
  doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.2);
  doc.setTextColor(...COLORS.darkGreen);
  doc.text('SCAN QR TO VERIFY', qrX + qrSize / 2, qrY + qrSize + 3.8, { align: 'center' });

  // Registry metadata on right of back card
  const backInfoX = backX + 35;
  const backInfoW = cardW - 38.5;
  let bY = backY + 14;
  bY = drawLabeledLine(doc, backInfoX, bY, 'Registered Date', regDate, backInfoW);
  if (contact) {
    bY = drawLabeledLine(doc, backInfoX, bY, 'Contact Number', contact, backInfoW);
  }
  bY = drawLabeledLine(doc, backInfoX, bY, 'UDYAM Reg.', MFS_CREDENTIALS.udyamNo, backInfoW);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.2);
  doc.setTextColor(...COLORS.slate);
  const disclaimer = doc.splitTextToSize(
    `Issued by ${MFS_CREDENTIALS.organizationName}, ${MFS_CREDENTIALS.officeAddress}. Verify online at loneitu.com/verify.`,
    backInfoW
  ) as string[];
  doc.text(disclaimer.slice(0, 4), backInfoX, Math.min(bY + 1, backY + cardH - 12));

  // Back Bottom Strip
  doc.setFillColor(...COLORS.darkGreen);
  doc.rect(backX, backY + cardH - 5.8, cardW, 5.8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.4);
  doc.setTextColor(...COLORS.lime);
  doc.text(`VERIFICATION ID: ${farmer.id}  •  ${MFS_CREDENTIALS.email}`, backX + cardW / 2, backY + cardH - 2, {
    align: 'center',
  });

  // Reference summary box underneath cards on A4 sheet
  doc.setFillColor(...COLORS.white);
  doc.setDrawColor(...COLORS.border);
  doc.roundedRect(16, 112, pageWidth - 32, 34, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...COLORS.darkGreen);
  doc.text('Digital Verification Link', 21, 120);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...COLORS.midGreen);
  doc.text(getFarmerVerifyUrl(farmer.id), 21, 126.5);
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.slate);
  doc.text(
    'Anyone scanning the QR code on the back of this ID card will see live verification status from the Loneitu Farmer Registry (with sensitive financial/UID fields redacted).',
    21,
    133,
    { maxWidth: pageWidth - 42 }
  );

  doc.save(`loneitu-id-card-${sanitizeFileSlug(farmer.id)}-${sanitizeFileSlug(farmer.fullName)}.pdf`);
}

/**
 * Generates a formal A4 Certificate of Farmer Registration for Mizo Farm Solutions
 * with scannable QR verification code and field summary table.
 */
export async function generateFarmerCertificatePdf(farmer: FarmerRecord): Promise<void> {
  const [qrDataUrl, avatarDataUrl] = await Promise.all([
    generateFarmerQrDataUrl(farmer.id),
    tryLoadImageAsDataUrl(farmer.avatar),
  ]);

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = 210;
  const pageHeight = 297;

  // Warm cream parchment background
  doc.setFillColor(...COLORS.cream);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Double ornamental border frame
  doc.setDrawColor(...COLORS.darkGreen);
  doc.setLineWidth(1.2);
  doc.rect(8, 8, pageWidth - 16, pageHeight - 16, 'S');
  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(0.5);
  doc.rect(11, 11, pageWidth - 22, pageHeight - 22, 'S');

  // Official Top Header Banner
  doc.setFillColor(...COLORS.darkGreen);
  doc.rect(12, 12, pageWidth - 24, 34, 'F');
  doc.setFillColor(...COLORS.lime);
  doc.rect(12, 46, pageWidth - 24, 1.8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...COLORS.lime);
  doc.text(MFS_CREDENTIALS.organizationName, pageWidth / 2, 20, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...COLORS.white);
  doc.text('CERTIFICATE OF FARMER REGISTRATION', pageWidth / 2, 30, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(225, 238, 226);
  doc.text(
    `Society Reg: ${MFS_CREDENTIALS.regNo}   |   NITI Aayog DARPAN: ${MFS_CREDENTIALS.darpanId}   |   UDYAM: ${MFS_CREDENTIALS.udyamNo}`,
    pageWidth / 2,
    38,
    { align: 'center' }
  );

  doc.setFontSize(7.5);
  doc.text(`${MFS_CREDENTIALS.officeAddress}   •   ${MFS_CREDENTIALS.email}`, pageWidth / 2, 43, {
    align: 'center',
  });

  // Farmer Profile Strip
  doc.setFillColor(...COLORS.white);
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.35);
  doc.roundedRect(16, 54, pageWidth - 32, 40, 2.5, 2.5, 'FD');

  // Photo box
  const pX = 21;
  const pY = 59;
  const pW = 24;
  const pH = 30;
  doc.setFillColor(...COLORS.cream);
  doc.setDrawColor(...COLORS.border);
  doc.roundedRect(pX, pY, pW, pH, 1.8, 1.8, 'FD');
  if (avatarDataUrl) {
    try {
      const fmt = avatarDataUrl.includes('image/png') ? 'PNG' : 'JPEG';
      doc.addImage(avatarDataUrl, fmt, pX + 0.5, pY + 0.5, pW - 1, pH - 1);
    } catch {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(...COLORS.darkGreen);
      doc.text(getInitials(farmer.fullName), pX + pW / 2, pY + 17, { align: 'center' });
    }
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...COLORS.darkGreen);
    doc.text(getInitials(farmer.fullName), pX + pW / 2, pY + 17, { align: 'center' });
  }

  // Name & Certificate statement
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...COLORS.umber);
  doc.text('THIS IS TO CERTIFY THAT', 50, 63);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.darkGreen);
  doc.text(farmer.fullName.toUpperCase(), 50, 71, { maxWidth: 108 });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.midGreen);
  doc.text(`Registry ID: ${farmer.id}   •   Status: ${farmer.status || 'Active'}`, 50, 79);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.2);
  doc.setTextColor(...COLORS.slate);
  doc.text(
    `is an officially enrolled agricultural producer in the Loneitu (Mizoram Tan) Farmer Registry under ${MFS_CREDENTIALS.brandTitle} (Registered ${farmer.registrationDate || '2026'}).`,
    50,
    85,
    { maxWidth: 108 }
  );

  // Certified Record Fields Table
  const safeRows = getSafeDisplayFields(farmer).slice(0, 14);
  const tableBody =
    safeRows.length > 0
      ? safeRows
      : [
          ['Farmer Full Name', farmer.fullName],
          ['Registry ID', farmer.id],
          ['Registration Status', farmer.status || 'Active'],
        ];

  autoTable(doc, {
    startY: 100,
    margin: { left: 16, right: 16 },
    head: [['VERIFIED REGISTRY ATTRIBUTE', 'RECORDED VALUE']],
    body: tableBody,
    theme: 'grid',
    headStyles: {
      fillColor: COLORS.darkGreen,
      textColor: COLORS.lime,
      fontSize: 8.5,
      fontStyle: 'bold',
      cellPadding: 3,
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [30, 41, 59],
      cellPadding: 2.6,
    },
    alternateRowStyles: {
      fillColor: [250, 249, 244],
    },
    columnStyles: {
      0: { cellWidth: 64, fontStyle: 'bold', textColor: COLORS.umber },
      1: { cellWidth: 'auto' },
    },
  });

  // Footer verification + QR + Signature positioned cleanly above bottom border
  const footerTop = 228;
  doc.setFillColor(...COLORS.white);
  doc.setDrawColor(...COLORS.border);
  doc.roundedRect(16, footerTop, pageWidth - 32, 52, 2.5, 2.5, 'FD');

  // QR block (left)
  doc.addImage(qrDataUrl, 'PNG', 22, footerTop + 5, 36, 36);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(...COLORS.darkGreen);
  doc.text('SCAN TO VERIFY', 40, footerTop + 45.5, { align: 'center' });

  // Center digital seal text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...COLORS.darkGreen);
  doc.text('DIGITAL VERIFICATION SEAL', 64, footerTop + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.6);
  doc.setTextColor(...COLORS.slate);
  doc.text(`Verification URL: ${getFarmerVerifyUrl(farmer.id)}`, 64, footerTop + 18, {
    maxWidth: 72,
  });
  doc.text(
    `Generated on ${new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })}. Sensitive Aadhaar/bank details are intentionally omitted from public verification.`,
    64,
    footerTop + 28,
    { maxWidth: 72 }
  );

  // Right Signature block
  doc.setDrawColor(...COLORS.darkGreen);
  doc.setLineWidth(0.4);
  doc.line(142, footerTop + 31, 188, footerTop + 31);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.2);
  doc.setTextColor(...COLORS.darkGreen);
  doc.text('PROJECT DIRECTOR', 165, footerTop + 36, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(...COLORS.umber);
  doc.text(MFS_CREDENTIALS.brandTitle, 165, footerTop + 40.5, { align: 'center' });
  doc.text(`Reg: ${MFS_CREDENTIALS.regNo}`, 165, footerTop + 44.5, { align: 'center' });

  doc.save(`loneitu-certificate-${sanitizeFileSlug(farmer.id)}-${sanitizeFileSlug(farmer.fullName)}.pdf`);
}
